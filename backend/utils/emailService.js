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
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS instead of TLS
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 20,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000, // 15 seconds (increased for production)
    socketTimeout: 30000 // 30 seconds (increased for production)
  });
};

const motivationalLines = [
  "You can do it!",
  "Every step counts!",
  "Keep pushing forward!",
  "Success is near!",
  "One step at a time."
];

// Retry email sending with exponential backoff
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully on attempt ${attempt}:`, {
        to: mailOptions.to,
        messageId: result.messageId
      });
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Email send failed on attempt ${attempt}:`, {
        to: mailOptions.to,
        error: error.message,
        code: error.code,
        attempt
      });
      
      // Don't retry on auth errors
      if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
        throw error;
      }
      
      // Wait before retry (exponential backoff: 1s, 3s, 7s)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) - 1;
        console.warn(`⏳ Retrying in ${waitTime}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  }
  
  throw lastError;
};

// Send OTP email
export const sendOtpEmail = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email credentials not configured: EMAIL_USER or EMAIL_PASSWORD missing');
      return false;
    }

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
    console.error('❌ Error sending OTP email after all retries:', {
      email,
      error: error.message,
      code: error.code,
      command: error.command
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

  const transporter = createTransporter();
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

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email, 'MessageId:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', {
      email,
      error: error.message,
      code: error.code
    });
    return false;
  }
};
