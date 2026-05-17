# RENDER EMAIL TIMEOUT FIX - May 17, 2026

## Problem Reported
```
⚠️ Connection issue - will try next port
📤 Attempting to send email via SSL (port 465)...
   ❌ [Attempt 1/3] Failed: Connection timeout (ETIMEDOUT)
   ⚠️ Connection issue - will try next port
❌ Email sending failed after all retry attempts
```

Both port 587 (STARTTLS) and port 465 (SSL) timing out when sending OTP emails on Render.

---

## Root Causes

### 1. **Timeouts Too Short for Render's Slow Network**
- Connection timeout: 15 seconds (too short)
- Socket timeout: 30 seconds (too short)
- Render has slower network than local development

### 2. **Connection Pooling Causing Issues**
- `pool: true` with `maxConnections: 5` was problematic on Render
- Connection pool not properly released, causing cascading timeouts

### 3. **Retry Logic Breaking on Timeouts**
- When ETIMEDOUT error occurred, code immediately broke and tried next port
- Never retried the same port, just gave up
- No wait time between failures

### 4. **Port Order Wrong**
- Tried port 587 (STARTTLS) first - less reliable on Render
- Only if that failed, tried port 465 (SSL) - more reliable
- Better to try SSL first since it's more stable

---

## Fixes Implemented

### 1️⃣ Increased Timeouts for Render
```javascript
// BEFORE
config.connectionTimeout = 15000;  // 15 seconds
config.socketTimeout = 30000;      // 30 seconds

// AFTER
config.connectionTimeout = 60000;  // 60 seconds (4x longer)
config.socketTimeout = 90000;      // 90 seconds (3x longer)
```

**Why:** Render's network is slower. Need longer wait for connection to establish and socket operations to complete.

---

### 2️⃣ Disabled Connection Pooling
```javascript
// BEFORE
pool: true,
maxConnections: 5,
maxMessages: 20,

// AFTER
pool: false,
maxConnections: 1,
maxMessages: 1,
```

**Why:** Pooling was causing connection reuse issues on Render. Better to use fresh connection for each email (simpler, more reliable).

---

### 3️⃣ Improved TLS Configuration
```javascript
// BEFORE
tls: {
  rejectUnauthorized: false,
  minVersion: 'TLSv1.2'
}

// AFTER
tls: {
  rejectUnauthorized: false,
  minVersion: 'TLSv1.2',
  ciphers: 'DEFAULT'
}
```

**Why:** Explicitly set ciphers to DEFAULT for better compatibility on restricted networks.

---

### 4️⃣ Reversed Port Order
```javascript
// BEFORE
const ports = [
  { port: 587, ssl: false, name: 'STARTTLS' },  // Tried first
  { port: 465, ssl: true, name: 'SSL' }         // Tried second
]

// AFTER
const ports = [
  { port: 465, ssl: true, name: 'SSL' },         // Try first (more reliable)
  { port: 587, ssl: false, name: 'STARTTLS' }   // Fallback
]
```

**Why:** SSL (465) is more direct and reliable on restrictive networks. STARTTLS (587) requires more negotiation.

---

### 5️⃣ Fixed Retry Logic for Timeouts
```javascript
// BEFORE
if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
  console.warn(`Connection issue - will try next port`);
  break; // Immediately broke - never retried same port!
}

// AFTER
if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
  if (attempt < maxRetries) {
    const waitTimes = [2, 5, 10, 15];
    const waitTime = waitTimes[attempt - 1] || 15;
    console.log(`Connection timeout - Retrying in ${waitTime}s (Attempt ${attempt + 1}/${maxRetries})...`);
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    // Don't break - continue retrying same port
  } else {
    console.warn(`Max retries reached for ${portConfig.name} - trying next port`);
    break; // Only break after all retries exhausted
  }
}
```

**Why:** Timeouts are transient on Render. Should retry same port with increasing wait times before giving up.

---

### 6️⃣ Increased Max Retries
```javascript
// BEFORE
maxRetries = 3

// AFTER
maxRetries = 4
```

**Why:** With longer timeouts and better retry logic, can attempt 4 times per port.

---

## Retry Strategy Now

### With 4 retries per port and 2 ports:
1. **Port 465 (SSL)** - 4 attempts:
   - Attempt 1: Immediate
   - Attempt 2: Wait 2 seconds
   - Attempt 3: Wait 5 seconds
   - Attempt 4: Wait 10 seconds

2. **Port 587 (STARTTLS)** - 4 attempts:
   - Attempt 1: Immediate
   - Attempt 2: Wait 2 seconds
   - Attempt 3: Wait 5 seconds
   - Attempt 4: Wait 15 seconds

**Total max wait time:** ~37 seconds across all retries

---

## Timeline of Email Send on Render

```
[T+0s]   Start SSL (465) Attempt 1
[T+60s]  Timeout if not connected (60s timeout)
[T+62s]  Wait 2s before retry
[T+62s]  Start SSL (465) Attempt 2
[T+122s] Timeout
[T+127s] Wait 5s before retry
[T+127s] Start SSL (465) Attempt 3
[T+187s] Timeout
[T+197s] Wait 10s before retry
[T+197s] Start SSL (465) Attempt 4
[T+257s] Timeout OR SUCCESS
         If success: Return email sent
         If timeout: Try next port
```

---

## Configuration Summary

| Parameter | Before | After | Reason |
|-----------|--------|-------|--------|
| Connection Timeout | 15s | 60s | Render network slower |
| Socket Timeout | 30s | 90s | Operations take longer |
| Connection Pool | true | false | Pooling caused issues |
| Max Connections | 5 | 1 | Simpler, more reliable |
| Max Messages | 20 | 1 | One email per connection |
| Port Order | 587→465 | 465→587 | SSL more reliable |
| Max Retries | 3 | 4 | More attempts |
| Retry Logic | Break immediately | Retry with waits | Better resilience |

---

## Testing

Deploy to Render and check logs:
```
📧 Creating transporter: smtp.gmail.com:465 (SSL, timeout: 60s)
   [Attempt 1/4] Verifying credentials...
   ✅ Credentials verified
   [Attempt 1/4] Sending email...
   ✅ Email sent successfully: messageId: <...>
```

If still timing out, add more retries or consider alternative email service.

---

## Expected Behavior

### ✅ Success (Email Sends)
```
📤 Attempting to send email via SSL (port 465)...
   [Attempt 1/4] Verifying credentials...
   ✅ Credentials verified
   [Attempt 1/4] Sending email...
   ✅ Email sent successfully via SSL:465
```

### ⚠️ Timeout + Retry (First Eventually Works)
```
📤 Attempting to send email via SSL (port 465)...
   [Attempt 1/4] Verifying credentials...
   ❌ [Attempt 1/4] Failed: Connection timeout (ETIMEDOUT)
   ⏳ Connection timeout - Retrying in 2s (Attempt 2/4)...
   [Attempt 2/4] Verifying credentials...
   ✅ Credentials verified
   ✅ Email sent successfully via SSL:465 (Attempt 2)
```

### 🔄 Timeout + Fallback (Tries second port)
```
📤 Attempting to send email via SSL (port 465)...
   [Attempt 1/4] Failed: Connection timeout
   [Attempt 2/4] Failed: Connection timeout
   [Attempt 3/4] Failed: Connection timeout
   [Attempt 4/4] Failed: Connection timeout
   ⚠️ Max retries reached for SSL - trying next port

📤 Attempting to send email via STARTTLS (port 587)...
   [Attempt 1/4] Verifying credentials...
   ✅ Credentials verified
   ✅ Email sent successfully via STARTTLS:587
```

---

## Files Modified
- `backend/utils/emailService.js` - Updated `createTransporter()` and `sendEmailWithRetry()`

## Deployment Notes
1. After deploying to Render, restart the app
2. Monitor logs for email send attempts
3. If still timing out, may need to use different email service (SendGrid, Mailgun, etc.)
4. If SSL times out consistently, enable more debug logging

---

## Alternative Solutions (if this doesn't work)

If timeouts persist, consider:
1. **SendGrid** - Professional email service, better for transactional emails
2. **Mailgun** - Reliable, good performance on Render
3. **AWS SES** - Powerful, scalable email service
4. **Resend** - Modern email service for developers

But try these Render fixes first!
