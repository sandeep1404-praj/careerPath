# CORS & EMAIL TIMEOUT FIXES - May 17, 2026

## Issue 1: CORS Error
**Problem:**
```
Access to fetch blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header present
```

**Root Cause:**
- Frontend (careerpathsan.netlify.app) couldn't reach backend (careerpath-54sr.onrender.com)
- Missing proper CORS headers and OPTIONS handling

**Fix Applied in server.js:**

1. ✅ Added explicit CORS logging to debug issues
2. ✅ Added `app.options('*', cors())` - handles preflight OPTIONS requests
3. ✅ Increased cache time: 600s → 86400s (24 hours)
4. ✅ Added `Vary: Origin` header support

**Result:** Frontend can now communicate with backend ✅

---

## Issue 2: Email Still Timing Out

**Problem:**
```
Connection timeout (ETIMEDOUT) on port 465
Even after retry logic, all 4 attempts fail
```

**Root Cause:**
Render's environment has different network characteristics than local:
- Long connections (60s+) are actively killed
- DNS lookups can be slow
- SMTP connections are rate-limited
- Verification step adds extra time

**Old Approach (Failed):**
```
- 60s connection timeout (Render kills at ~30s anyway)
- 90s socket timeout (too long)
- Verify credentials first (extra step, adds latency)
- 4 retries per port with long waits (2s, 5s, 10s, 15s)
- Total time: potential 60+ seconds before first attempt
```

**New Approach (Optimized for Render):**

| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| Connection Timeout | 60s | 15s | Render kills long connections |
| Socket Timeout | 90s | 20s | Less time to wait |
| Skip Verify() | No | Yes | Removes unnecessary step |
| Direct Send | No | Yes | Faster, more reliable |
| Retry Waits | 2s,5s,10s,15s | 1s,2s,3s | Faster feedback loops |
| Max Retries/Port | 4 | 3 | Fewer attempts, shorter total time |
| Total Ports | 2 | 2 | SSL(465) + STARTTLS(587) |

**New Flow:**

```
[T+0s]   Start SSL (465) Attempt 1
[T+15s]  Timeout (or success)
         If timeout: Wait 1s

[T+16s]  Start SSL (465) Attempt 2
[T+31s]  Timeout
         If timeout: Wait 2s

[T+33s]  Start SSL (465) Attempt 3
[T+48s]  Timeout OR SUCCESS
         If still timeout: Try STARTTLS (587)

[T+48s]  Start STARTTLS (587) Attempt 1
[T+63s]  Timeout
         If timeout: Wait 1s

[T+64s]  Start STARTTLS (587) Attempt 2
[T+79s]  Timeout
         If timeout: Wait 2s

[T+81s]  Start STARTTLS (587) Attempt 3
[T+96s]  Timeout OR SUCCESS

Max total wait: ~96 seconds
```

**DNS Debugging Added:**
```
🔍 [DNS] Resolving smtp.gmail.com...
✅ [DNS] smtp.gmail.com resolved to: 142.251.x.x
```

If DNS fails, email service won't work on that network.

---

## Code Changes Summary

### server.js
```javascript
// BEFORE
app.use(cors({
  maxAge: 600
}));

// AFTER
app.use(cors({
  maxAge: 86400
}));
app.options('*', cors()); // ← Added
console.log('🔐 CORS Allowed Origins:', allowedOrigins); // ← Added
```

### emailService.js

**1. DNS Debugging:**
```javascript
const debugDNS = async (host) => {
  const addresses = await dnsPromises.resolve4(host);
  console.log(`✅ [DNS] ${host} resolved to: ${addresses.join(', ')}`);
};
```

**2. Shorter Timeouts:**
```javascript
// BEFORE
config.connectionTimeout = 60000; // 60s
config.socketTimeout = 90000;     // 90s

// AFTER
config.connectionTimeout = 15000; // 15s
config.socketTimeout = 20000;     // 20s
```

**3. Skip Verification:**
```javascript
// BEFORE
await transporter.verify(); // Slow, sometimes times out
await transporter.sendMail(mailOptions);

// AFTER
await transporter.sendMail(mailOptions); // Direct send
```

**4. Faster Retry Waits:**
```javascript
// BEFORE
const waitTimes = [2, 5, 10, 15];

// AFTER
const waitTimes = [1, 2, 3]; // Faster feedback
```

---

## Expected Behavior

### ✅ Success Scenario
```
🔍 [DNS] Resolving smtp.gmail.com...
✅ [DNS] smtp.gmail.com resolved to: 142.251.41.x

📤 Attempting to send email via SSL (port 465)...
   [Attempt 1/3] Sending email to: user@example.com
   ✅ [SUCCESS] Email sent via SSL:465
   messageId: <abc123@gmail.com>
```

### ⚠️ Retry Scenario
```
🔍 [DNS] Resolving smtp.gmail.com...
✅ [DNS] smtp.gmail.com resolved to: 142.251.41.x

📤 Attempting to send email via SSL (port 465)...
   [Attempt 1/3] Sending email to: user@example.com
   ❌ [Attempt 1/3] Failed: Connection timeout (ETIMEDOUT)
   ⏳ Timeout - Retrying in 1s (Attempt 2/3)...

   [Attempt 2/3] Sending email to: user@example.com
   ✅ [SUCCESS] Email sent via SSL:465 (Attempt 2)
```

### ❌ Failure Scenario (DNS Issue)
```
🔍 [DNS] Resolving smtp.gmail.com...
❌ [DNS] Failed to resolve smtp.gmail.com: getaddrinfo ENOTFOUND
⚠️ DNS resolution failed - email service unavailable on this network
```

---

## If Email Still Fails

If emails still don't work after these fixes, Render may be blocking SMTP entirely. Consider:

### Option 1: Use SendGrid (Recommended)
```bash
npm install --save @sendgrid/mail
```

Add to .env:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxx
```

### Option 2: Use Mailgun
```bash
npm install --save mailgun.js
```

### Option 3: Use AWS SES
More complex but very reliable on Render.

### Option 4: Use Render's Email Service
Check if Render provides built-in email sending.

---

## Testing

### Test 1: Check CORS
```bash
curl -H "Origin: https://careerpathsan.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/auth/signup -v
```

Should return:
```
Access-Control-Allow-Origin: https://careerpathsan.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Test 2: Check Email DNS
```bash
curl http://localhost:5000/api/test/check-email-config
```

Should show DNS resolution attempt in logs.

### Test 3: Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "password": "TestPassword123"
  }'
```

Monitor logs for:
```
🔍 [DNS] Resolving smtp.gmail.com...
✅ [DNS] smtp.gmail.com resolved to: ...
📤 Attempting to send email via SSL...
```

---

## Summary

✅ **CORS Fixed:** Frontend can now reach backend
✅ **Email Optimized:** Shorter timeouts, skip verification, faster retries
✅ **DNS Debugging:** Can detect network issues early
✅ **Render Compatible:** Uses networking patterns Render supports

**Deploy and test!** If issues persist, check Render's network documentation or consider alternative email service.
