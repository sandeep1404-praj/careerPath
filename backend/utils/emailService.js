import nodemailer from 'nodemailer';

// Email queue for async/non-blocking sends
const emailQueue = [];
let isProcessing = false;

// Process email queue with timeout protection
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  
  isProcessing = true;
  while (emailQueue.length > 0) {
    const emailTask = emailQueue.shift();
    try {
      // Timeout protection: 10 seconds max per email (increased from 5s)
      await Promise.race([
        emailTask(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout after 10s')), 10000))
      ]);
    } catch (err) {
      console.error('Queue email error:', err.message);
    }
  }
  isProcessing = false;
};

// Queue email for async sending (fire-and-forget)
const queueEmail = (emailFunction) => {
  emailQueue.push(emailFunction);
  // Process queue after small delay to batch if multiple emails
  setTimeout(processEmailQueue, 100);
};

// Create transporter with connection pooling
const createTransporter = (useSSL = false) => {
  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 20,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  };

  if (useSSL) {
    // Port 465 with SSL (more reliable on restricted networks like Render)
    config.host = 'smtp.gmail.com';
    config.port = 465;
    config.secure = true;
    config.connectionTimeout = 15000;
    config.socketTimeout = 30000;
  } else {
    // Port 587 with STARTTLS (fallback)
    config.host = 'smtp.gmail.com';
    config.port = 587;
    config.secure = false;
    config.connectionTimeout = 15000;
    config.socketTimeout = 30000;
  }

  console.log(`📧 Creating transporter: smtp.gmail.com:${config.port} (${useSSL ? 'SSL' : 'STARTTLS'})`);
  return nodemailer.createTransport(config);
};

const motivationalLines = [
  "You can do it!",
  "Every step counts!",
  "Keep pushing forward!",
  "Success is near!",
  "One step at a time."
];

// Retry email sending with exponential backoff and port fallback
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError;
  
  // Try with STARTTLS first (port 587), then fallback to SSL (port 465)
  const ports = [
    { port: 587, ssl: false, name: 'STARTTLS' },
    { port: 465, ssl: true, name: 'SSL' }
  ];

  for (const portConfig of ports) {
    console.log(`\n📤 Attempting to send email via ${portConfig.name} (port ${portConfig.port})...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const transporter = createTransporter(portConfig.ssl);
        
        // Check credentials first
        console.log(`   [Attempt ${attempt}/${maxRetries}] Verifying credentials...`);
        await transporter.verify();
        console.log(`   ✅ Credentials verified`);
        
        console.log(`   [Attempt ${attempt}/${maxRetries}] Sending email...`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`   ✅ Email sent successfully:`, {
          to: mailOptions.to,
          messageId: result.messageId,
          via: `${portConfig.name}:${portConfig.port}`,
          attempt
        });
        return result;
      } catch (error) {
        lastError = error;
        console.error(`   ❌ [Attempt ${attempt}/${maxRetries}] Failed:`, {
          error: error.message,
          code: error.code,
          to: mailOptions.to,
          via: `${portConfig.name}:${portConfig.port}`
        });
        
        // Auth errors = don't retry with this port
        if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
          console.warn(`   ⚠️ Authentication failed - skipping to next port`);
          break; // Break inner loop, try next port
        }
        
        // Network errors might work with next port
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn(`   ⚠️ Connection issue - will try next port`);
          break; // Break inner loop, try next port
        }
        
        // For other errors, retry same port
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) - 1;
          console.log(`   ⏳ Retrying in ${waitTime}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error(`\n❌ Email sending failed after all retry attempts`);
  throw lastError || new Error('Unknown email sending error');
};

// Send OTP email
export const sendOtpEmail = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing:');
      console.error('   EMAIL_USER:', process.env.EMAIL_USER ? '✅' : '❌ MISSING');
      console.error('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅' : '❌ MISSING');
      return false;
    }

    console.log(`\n📨 [OTP] Sending OTP to: ${email}`);
    console.log(`   Sender: ${process.env.EMAIL_USER}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login Verification',
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f5f6fa; margin:0; padding:0;">
        <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color:#2c3e50; margin-bottom:20px;">🔐 Login Verification</h2>
          <p>Hello,</p>
          <p>Your OTP for login verification is:</p>
          <div style="font-size:26px; font-weight:bold; text-align:center; background:#f0f0f0; padding:15px; border-radius:8px; margin:20px 0;">
            ${otp}
          </div>
          <p style="color:#555;">This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="color:#888; font-size:14px;">CareerCompass Team</p>
        </div>
      </body>
      </html>
      `
    };

    await sendEmailWithRetry(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ OTP Email Failed:', {
      email,
      error: error.message,
      code: error.code,
      command: error.command,
      errno: error.errno
    });
    return false;
  }
};


export function sendTaskMotivationEmail({ to, task }) {
  // Fire-and-forget: queue email, don't wait
  if (!to || !task || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return Promise.resolve();
  }

  queueEmail(async () => {
    try {
      const randomLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
      const transporter = createTransporter();

      const title = task.title || task.name || 'Untitled Task';
      const description = task.description || '';
      const estimated = task.estimatedTime || '';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Reminder: ${title}`,
        html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:'Segoe UI', sans-serif; background:#f4f6f8; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="color:#2c3e50;">📌 ${title}</h2>
            <p style="color:#555;">${description}</p>
            <p><strong>Estimated Time:</strong> ${estimated}</p>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
            <p style="color:green; font-style:italic;">💡 ${randomLine}</p>
            <p style="color:#888; font-size:14px;">CareerCompass Team</p>
          </div>
        </body>
        </html>
      `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Task motivation email sent to:', to, 'MessageId:', result.messageId);
    } catch (err) {
      console.error('Error sending task motivation email:', {
        to,
        error: err.message,
        code: err.code
      });
    }
  });
  
  return Promise.resolve();
}

// Send a motivational email summarizing a roadmap and its tasks
export function sendRoadmapMotivationEmail({ to, roadmapName, tasks = [] }) {
  // Fire-and-forget: queue email, don't wait
  if (!to || !roadmapName || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return Promise.resolve();
  }

  queueEmail(async () => {
    try {
      const randomLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
      const transporter = createTransporter();

      const tasksHtml = tasks.map(t => {
        const title = t.name || t.title || 'Untitled Task';
        const desc = t.description || '';
        const est = t.estimatedTime || '';
        return `
          <li style="margin-bottom:8px;">
            <strong>${title}</strong>
            ${desc ? `<div style="color:#555;margin-top:4px;">${desc}</div>` : ''}
            ${est ? `<div style="color:#777;font-size:13px;margin-top:2px;">Estimated: ${est}</div>` : ''}
          </li>
        `;
      }).join('');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `New roadmap added: ${roadmapName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:'Segoe UI', sans-serif; background:#f4f6f8; padding:20px;">
            <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
              <h2 style="color:#2c3e50;">📚 ${roadmapName} added to your collection</h2>
              <p style="color:#555;">Here are the tasks that were added with this roadmap:</p>
              <ul style="color:#333;">${tasksHtml}</ul>
              <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
              <p style="color:green; font-style:italic;">💡 ${randomLine}</p>
              <p style="color:#888; font-size:14px;">CareerCompass Team</p>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Roadmap motivation email sent to:', to, 'Roadmap:', roadmapName, 'MessageId:', result.messageId);
    } catch (err) {
      console.error('Error sending roadmap motivation email:', {
        to,
        roadmapName,
        error: err.message,
        code: err.code
      });
    }
  });
  
  return Promise.resolve();
}

// Send verification email (for backward compatibility)
export const sendVerificationEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured for verification email');
      return false;
    }

    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - CareerCompass',
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Segoe UI', sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <h2 style="color:#2c3e50;">👋 Welcome to CareerCompass!</h2>
          <p>Click the button below to verify your email address:</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${verificationUrl}" style="background:#3498db; color:#fff; padding:12px 25px; text-decoration:none; border-radius:6px;">Verify Email</a>
          </div>
          <p style="word-break:break-word; color:#3498db;">${verificationUrl}</p>
          <p style="color:#888;">This link will expire in 24 hours.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="color:#888; font-size:14px;">CareerCompass Team</p>
        </div>
      </body>
      </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email, 'MessageId:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', {
      email,
      error: error.message,
      code: error.code
    });
    return false;
  }
};


// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured for password reset');
    return false;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - CareerCompass',
    html: `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'Segoe UI', sans-serif; background:#f4f6f8; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color:#2c3e50;">🔑 Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <div style="text-align:center; margin:25px 0;">
          <a href="${resetUrl}" style="background:#e74c3c; color:#fff; padding:12px 25px; text-decoration:none; border-radius:6px;">Reset Password</a>
        </div>
        <p style="word-break:break-word; color:#3498db;">${resetUrl}</p>
        <p style="color:#555;">This link will expire in 1 hour. If you didn’t request this, ignore this email.</p>
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        <p style="color:#888; font-size:14px;">CareerCompass Team</p>
      </div>
    </body>
    </html>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured for password reset');
      return false;
    }

    console.log(`\n📨 [PASSWORD RESET] Sending password reset email to: ${email}`);
    await sendEmailWithRetry(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', {
      email,
      error: error.message,
      code: error.code
    });
    return false;
  }
};
