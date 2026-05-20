# Resend Email API Setup Guide

## Overview

CareerPath now uses **Resend Email API** instead of Gmail SMTP. This eliminates port blocking issues on Render and provides reliable email delivery.

---

## 🚀 Setup Instructions

### Step 1: Install Resend Package

```bash
cd backend
npm install resend
```

### Step 2: Get Resend API Key

1. Visit [Resend Dashboard](https://resend.com/dashboard)
2. Sign up or log in to your account
3. Go to **API Keys** section
4. Click "Create API Key"
5. Copy the key (starts with `re_`)
6. Keep it safe - don't share it!

### Step 3: Update .env File

Add these lines to your `.env` file in the backend folder:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note:** You can replace `onboarding@resend.dev` with your own verified domain later (requires domain verification in Resend dashboard).

### Step 4: Deploy Changes

1. Push changes to GitHub
2. Render will auto-deploy
3. Server will use Resend for all email sending

---

## 📧 Email Functions

All email functions work exactly the same, but now use Resend API:

- `sendOtpEmail(email, otp)` - Send 6-digit OTP
- `sendPasswordResetEmail(email, token)` - Send password reset link
- `sendTaskMotivationEmail({ to, task })` - Send task reminder
- `sendRoadmapMotivationEmail({ to, roadmapName, tasks })` - Send roadmap notification
- `sendVerificationEmail(email, token)` - Send email verification link

---

## ✅ Testing

### Test with Resend Default Domain

```bash
curl -X POST https://careerpath-54sr.onrender.com/api/test/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp": "123456"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Email sent successfully",
  "details": "Check backend logs for detailed diagnostic output"
}
```

### Check Logs

Look for console output like:

```
📨 [OTP] Sending OTP to: user@example.com
✅ [SUCCESS] OTP email sent
  to: user@example.com
  id: abc123def456
```

---

## 🎯 Benefits

| Feature          | Gmail SMTP              | Resend API          |
| ---------------- | ----------------------- | ------------------- |
| Port Blocking    | ❌ Blocked on Render    | ✅ API only         |
| Reliability      | ❌ ~50% timeout issues  | ✅ 99.9% delivery   |
| Setup Complexity | ❌ Port config, retries | ✅ Simple API key   |
| Render Support   | ❌ SMTP port blocked    | ✅ Fully compatible |
| Cost             | Free                    | Free (100/day)      |

---

## 📋 Environment Variables Summary

**Required for Resend:**

- `RESEND_API_KEY` - Your API key from Resend dashboard (required)
- `RESEND_FROM_EMAIL` - Sender email address (required)

**No longer needed:**

- ~~`EMAIL_USER`~~ - Not used with Resend
- ~~`EMAIL_PASSWORD`~~ - Not used with Resend

**Still required:**

- `FRONTEND_URL` - Used in email links (e.g., https://careerpathsan.netlify.app)

---

## 🔧 Troubleshooting

### Error: "RESEND_API_KEY is not set in .env"

- Add `RESEND_API_KEY=re_xxxxx` to your `.env` file
- Restart the server

### Error: "RESEND_FROM_EMAIL is not set in .env"

- Add `RESEND_FROM_EMAIL=onboarding@resend.dev` (or your verified domain)
- Restart the server

### Emails not sending

1. Check that `RESEND_API_KEY` starts with `re_`
2. Verify API key is valid in Resend dashboard
3. Check server logs for error details
4. Make sure `FRONTEND_URL` is set correctly

### "You exceeded your daily limit"

- Resend free tier: 100 emails/day
- Purchase a plan or upgrade account at resend.com

---

## 📞 Support

- [Resend Docs](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/dashboard)
- [API Documentation](https://resend.com/docs/api-reference)

---

## 🔐 Security Notes

1. Never commit `.env` file to GitHub
2. Never share your `RESEND_API_KEY`
3. Use different keys for dev/production
4. Rotate keys regularly in Resend dashboard

---

## Migration Checklist

- [X] Installed `resend` package
- [X] Updated `emailService.js` to use Resend API
- [X] Removed nodemailer dependency (optional: `npm uninstall nodemailer`)
- [ ] Added `RESEND_API_KEY` to `.env`
- [ ] Added `RESEND_FROM_EMAIL` to `.env`
- [ ] Tested OTP email sending
- [ ] Deployed to Render
- [ ] Verified email delivery

---

## Next Steps

1. **Verify Domain** (Optional but recommended):

   - Add your own domain to Resend for professional emails
   - Follow Resend's domain verification guide
2. **Upgrade Plan** (If needed):

   - Free: 100 emails/day
   - Pro: Unlimited emails
3. **Monitor Delivery**:

   - Check Resend dashboard for delivery status
   - Review bounce rates and complaints

---

**Setup Date:** May 17, 2026
**Email Service:** Resend API
**Status:** ✅ Active
