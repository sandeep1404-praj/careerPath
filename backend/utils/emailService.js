/**
 * EMAIL SERVICE - RESEND API (May 17, 2026)
 * 
 * Replaces Gmail SMTP with Resend API
 * Benefits:
 * - No SMTP port blocking issues on Render
 * - Reliable, fast email delivery
 * - Built-in retry logic
 * - Works reliably in all environments
 * 
 * Setup:
 * 1. Install: npm install resend
 * 2. Add to .env: RESEND_API_KEY=re_xxxxx
 * 3. Set sender: RESEND_FROM_EMAIL=onboarding@resend.dev (or your custom domain)
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email validation
const validateEmailConfig = () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env');
    return false;
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ RESEND_FROM_EMAIL is not set in .env');
    console.log('   Default: onboarding@resend.dev');
    return false;
  }
  return true;
};

const motivationalLines = [
  "You can do it!",
  "Every step counts!",
  "Keep pushing forward!",
  "Success is near!",
  "One step at a time."
];

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {boolean} - True if sent successfully
 */
export const sendOtpEmail = async (email, otp) => {
  try {
    if (!validateEmailConfig()) {
      return false;
    }

    console.log(`\n📨 [OTP] Sending OTP to: ${email}`);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
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
          <p style="color:#888; font-size:14px;">CareerPath Team</p>
        </div>
      </body>
      </html>
      `
    });

    if (result.error) {
      console.error('❌ OTP Email Failed:', result.error);
      return false;
    }

    console.log(`✅ [SUCCESS] OTP email sent`, {
      to: email,
      id: result.data?.id
    });
    return true;
  } catch (error) {
    console.error('❌ OTP Email Exception:', {
      email,
      error: error.message
    });
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @returns {boolean} - True if sent successfully
 */
export const sendPasswordResetEmail = async (email, token) => {
  try {
    if (!validateEmailConfig()) {
      return false;
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    console.log(`\n📨 [PASSWORD RESET] Sending reset email to: ${email}`);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - CareerPath',
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
          <p style="word-break:break-word; color:#3498db;"><small>${resetUrl}</small></p>
          <p style="color:#555;">This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="color:#888; font-size:14px;">CareerPath Team</p>
        </div>
      </body>
      </html>
      `
    });

    if (result.error) {
      console.error('❌ Password Reset Email Failed:', result.error);
      return false;
    }

    console.log(`✅ [SUCCESS] Password reset email sent`, {
      to: email,
      id: result.data?.id
    });
    return true;
  } catch (error) {
    console.error('❌ Password Reset Email Exception:', {
      email,
      error: error.message
    });
    return false;
  }
};

/**
 * Send task motivation email (fire-and-forget)
 * @param {object} options - { to, task }
 */
export function sendTaskMotivationEmail({ to, task }) {
  if (!to || !task || !validateEmailConfig()) {
    return Promise.resolve();
  }

  // Fire-and-forget: don't wait for response
  (async () => {
    try {
      const randomLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
      const title = task.title || task.name || 'Untitled Task';
      const description = task.description || '';
      const estimated = task.estimatedTime || '';

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
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
            <p style="color:#888; font-size:14px;">CareerPath Team</p>
          </div>
        </body>
        </html>
        `
      });

      if (result.error) {
        console.error('Task motivation email failed:', result.error);
      } else {
        console.log('✅ Task motivation email sent to:', to, 'ID:', result.data?.id);
      }
    } catch (err) {
      console.error('Error sending task motivation email:', err.message);
    }
  })();

  return Promise.resolve();
}

/**
 * Send roadmap motivation email (fire-and-forget)
 * @param {object} options - { to, roadmapName, tasks }
 */
export function sendRoadmapMotivationEmail({ to, roadmapName, tasks = [] }) {
  if (!to || !roadmapName || !validateEmailConfig()) {
    return Promise.resolve();
  }

  // Fire-and-forget: don't wait for response
  (async () => {
    try {
      const randomLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];

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

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
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
              <p style="color:#888; font-size:14px;">CareerPath Team</p>
            </div>
          </body>
          </html>
        `
      });

      if (result.error) {
        console.error('Roadmap motivation email failed:', result.error);
      } else {
        console.log('✅ Roadmap motivation email sent to:', to, 'Roadmap:', roadmapName, 'ID:', result.data?.id);
      }
    } catch (err) {
      console.error('Error sending roadmap motivation email:', err.message);
    }
  })();

  return Promise.resolve();
}

/**
 * Send verification email (for backward compatibility)
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {boolean} - True if sent successfully
 */
export const sendVerificationEmail = async (email, token) => {
  try {
    if (!validateEmailConfig()) {
      return false;
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    console.log(`\n📨 [VERIFICATION] Sending verification email to: ${email}`);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - CareerPath',
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Segoe UI', sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <h2 style="color:#2c3e50;">👋 Welcome to CareerPath!</h2>
          <p>Click the button below to verify your email address:</p>
          <div style="text-align:center; margin:25px 0;">
            <a href="${verificationUrl}" style="background:#3498db; color:#fff; padding:12px 25px; text-decoration:none; border-radius:6px;">Verify Email</a>
          </div>
          <p style="word-break:break-word; color:#3498db;"><small>${verificationUrl}</small></p>
          <p style="color:#888;">This link will expire in 24 hours.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="color:#888; font-size:14px;">CareerPath Team</p>
        </div>
      </body>
      </html>
      `
    });

    if (result.error) {
      console.error('❌ Verification Email Failed:', result.error);
      return false;
    }

    console.log(`✅ [SUCCESS] Verification email sent`, {
      to: email,
      id: result.data?.id
    });
    return true;
  } catch (error) {
    console.error('❌ Verification Email Exception:', {
      email,
      error: error.message
    });
    return false;
  }
};
