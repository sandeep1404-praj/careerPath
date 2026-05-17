import nodemailer from 'nodemailer';

/**
 * EMAIL SERVICE - RENDER OPTIMIZED (May 17, 2026 - FINAL)
 * 
 * FIXES FOR RENDER DEPLOYMENT:
 * 1. Added DNS logging to detect network issues early
 * 2. Reduced timeout to 20s (Render kills long connections)
 * 3. Skip credential verification (slow on Render)
 * 4. Direct send with faster timeout
 * 5. Aggressive port fallback strategy
 * 
 * If SMTP fails, consider:
 * - Using SendGrid API (set EMAIL_SERVICE=sendgrid, SENDGRID_API_KEY)
 * - Using Mailgun API
 * - Using AWS SES
 */

import { promises as dnsPromises } from 'dns';

// Email queue for async/non-blocking sends
const emailQueue = [];
let isProcessing = false;

// DNS debug helper
const debugDNS = async (host) => {
  try {
    console.log(`🔍 [DNS] Resolving ${host}...`);
    const addresses = await dnsPromises.resolve4(host);
    console.log(`✅ [DNS] ${host} resolved to: ${addresses.join(', ')}`);
    return true;
  } catch (error) {
    console.error(`❌ [DNS] Failed to resolve ${host}:`, error.message);
    return false;
  }
};

// Process email queue with timeout protection
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  
  isProcessing = true;
  while (emailQueue.length > 0) {
    const emailTask = emailQueue.shift();
    try {
      // Timeout protection: 45 seconds max per email (Render times out long requests)
      await Promise.race([
        emailTask(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Email queue timeout after 45s')), 45000))
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

// Create transporter - OPTIMIZED FOR RENDER (short timeouts, no pooling)
const createTransporter = (useSSL = false) => {
  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    pool: false, // Render doesn't like connection pooling
    maxConnections: 1,
    maxMessages: 1,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      ciphers: 'DEFAULT'
    }
  };

  if (useSSL) {
    // Port 465 with SSL
    config.host = 'smtp.gmail.com';
    config.port = 465;
    config.secure = true;
    // **RENDER FIX**: Very short timeouts - Render kills long connections anyway
    config.connectionTimeout = 15000; // 15 seconds (Render times out at ~30s)
    config.socketTimeout = 20000; // 20 seconds
  } else {
    // Port 587 with STARTTLS
    config.host = 'smtp.gmail.com';
    config.port = 587;
    config.secure = false;
    // **RENDER FIX**: Very short timeouts
    config.connectionTimeout = 15000; // 15 seconds
    config.socketTimeout = 20000; // 20 seconds
  }

  console.log(`📧 [TRANSPORTER] Creating: smtp.gmail.com:${config.port} (${useSSL ? 'SSL' : 'STARTTLS'}, timeout: ${config.connectionTimeout / 1000}s)`);
  return nodemailer.createTransport(config);
};

const motivationalLines = [
  "You can do it!",
  "Every step counts!",
  "Keep pushing forward!",
  "Success is near!",
  "One step at a time."
];

// Retry email sending - OPTIMIZED FOR RENDER
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError;
  
  // Check DNS first
  const dnsOk = await debugDNS('smtp.gmail.com');
  if (!dnsOk) {
    console.error('⚠️ DNS resolution failed - email service unavailable on this network');
  }
  
  // Try SSL (465) first, then STARTTLS (587)
  const ports = [
    { port: 465, ssl: true, name: 'SSL' },
    { port: 587, ssl: false, name: 'STARTTLS' }
  ];

  for (const portConfig of ports) {
    console.log(`\n📤 Attempting to send email via ${portConfig.name} (port ${portConfig.port})...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const transporter = createTransporter(portConfig.ssl);
        
        console.log(`   [Attempt ${attempt}/${maxRetries}] Sending email to: ${mailOptions.to}`);
        
        // **RENDER FIX**: Skip verify() - it's slow and times out
        // Just send directly
        const result = await transporter.sendMail(mailOptions);
        
        console.log(`   ✅ [SUCCESS] Email sent via ${portConfig.name}:${portConfig.port}`, {
          messageId: result.messageId,
          to: mailOptions.to,
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
        
        // Auth errors = don't retry this port
        if (error.code === 'EAUTH' || error.message?.includes('Invalid login') || error.message?.includes('Invalid credentials')) {
          console.warn(`   ⚠️ Authentication error - skipping to next port`);
          break;
        }
        
        // Timeout errors - retry with short waits
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EHOSTUNREACH') {
          if (attempt < maxRetries) {
            // Short waits: 1s, 2s, 3s
            const waitTimes = [1, 2, 3];
            const waitTime = waitTimes[attempt - 1] || 3;
            console.log(`   ⏳ Timeout - Retrying in ${waitTime}s (Attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          } else {
            console.warn(`   ⚠️ Max retries exhausted for ${portConfig.name}`);
            break;
          }
        } else {
          // Other errors - retry same port
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) - 1;
            console.log(`   ⏳ Error - Retrying in ${waitTime}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          }
        }
      }
    }
  }
  
  // All attempts failed
  console.error(`\n❌ Email sending failed after all retry attempts (${maxRetries * 2} total)`);
  throw lastError || new Error('Email sending failed - no response from server');
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
