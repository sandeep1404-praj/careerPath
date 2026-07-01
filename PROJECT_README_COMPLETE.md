# CareerCompass / CareerPath — Complete Project README (Data Flow + Feature/Flow Analysis)

> This document describes the **complete feature set**, **data model**, and **end-to-end flow of data** between:
> - React frontend (`frontend/`)
> - Node/Express backend (`backend/`)
> - MongoDB models (persisted user/roadmap/chat state)
> - Redis (optional caching for roadmaps + recently opened)
> - External AI provider (Gemini via `generativelanguage.googleapis.com`)
> - Email provider (Resend API)

---

## 1) High-level architecture

### Frontend (React + Vite)
- Runs in browser.
- Uses React Router (`createBrowserRouter`) for navigation.
- Uses React Query (`@tanstack/react-query`) for caching/staleness rules.
- Stores auth token in `localStorage` (token is read by `frontend/src/services/api.js`).
- Uses UI contexts:
  - `AuthContext` (`frontend/src/contexts/AuthContext.jsx`)
  - `RoadmapContext` (`frontend/src/contexts/RoadmapContext.jsx`)

### Backend (Node + Express)
- Entry: `backend/server.js`
- Responsibilities:
  - Security middleware: `helmet`
  - Compression: `compression`
  - CORS allowlist for known frontend origins + localhost dev
  - JSON parsing + extra body parsing for legacy content-types
  - Connect to MongoDB (via `backend/config/db.js`)
  - Initialize Redis caching (optional)
  - Route mounting:
    - `/api/auth` → `backend/routes/auth.js`
    - `/api/user` → `backend/routes/user.js`
    - `/api/roadmaps` → `backend/routes/roadmap.js`
    - `/api/tasks` → `backend/routes/tasks.js`
    - `/api/resumes` → `backend/routes/resumeRoutes.js`
    - `/api/ai` → `backend/routes/aiRoutes.js`

---

## 2) Runtime dependencies & subsystems

### MongoDB (persistent state)
Used via Mongoose models in `backend/models/`.

Known models (from code you have):
- `User` (`backend/models/User.js`)
- `OTP` (`backend/models/OTP.js`)
- `UserRoadmap` (`backend/models/UserRoadmap.js`)
- `StaticRoadmap` (`backend/models/StaticRoadmap.js`)
- AI chat persistence:
  - `ChatSession` (`backend/models/ChatSession.js`)
  - `UserProfileMemory` (`backend/models/UserProfileMemory.js`)
- Resume-related models are present (ex: `backend/models/resume.js`, `backend/models/UserProfileMemory.js` exists for AI memory)

### Redis (optional)
Initialized in `backend/config/redis.js`.
- If Redis is unavailable, backend continues without caching.
- Used for:
  - Caching static roadmap lists/pages (`getCachedRoadmapsList`, `cacheRoadmapsList`)
  - Caching specific static roadmaps (`getCachedRoadmap`, `cacheRoadmap`)
  - Recently-opened roadmaps per-user (Redis sorted set)

### Email provider: Resend API
Implemented in `backend/utils/emailService.js`.
- OTP email
- Password reset email
- Task motivation email (fire-and-forget)
- Roadmap motivation email (fire-and-forget)
- Verification email (backward compatibility helper)

### AI provider: Gemini
Implemented in `backend/services/aiService.js`.
- Builds prompts for:
  - Mentor chat (`buildChatPrompt`)
  - Roadmap generation (`buildRoadmapPrompt`)
- Uses Gemini key rotation:
  - `GEMINI_API_KEY` and/or `GEMINI_API_KEYS` (comma-separated)
  - It also performs model catalog discovery per key.
- Maintains an in-memory `roadmapCache` (TTL-based) inside AI service.

---

## 3) Repository structure (relevant files)

### Backend
- `backend/server.js` — Express app setup
- `backend/routes/auth.js` — OTP-based signup verification + login, password reset
- `backend/routes/aiRoutes.js` — AI mentor chat + roadmap generate/accept + session endpoints
- `backend/routes/roadmap.js` — static roadmap listing + user roadmap operations
- `backend/controllers/aiController.js` — request handling for AI endpoints
- `backend/controllers/roadmapController.js` — request handling for roadmap endpoints
- `backend/services/aiService.js` — prompt building + Gemini calls + parsing
- `backend/config/redis.js` — Redis connection + caching helpers
- `backend/middleware/auth.js` — JWT authenticate middleware + verification guard
- `backend/utils/emailService.js` — Resend email helpers

### Frontend
- `frontend/src/App.jsx` — router + providers
- `frontend/src/services/api.js` — `fetch()` wrapper + typed API methods
- `frontend/src/pages/Index.jsx` — landing page
- `frontend/src/components/RoadmapPage.jsx` — static roadmaps list + detail view + task add UI
- `frontend/src/components/roadmap/AIMentorChat.jsx` — AI mentor chat UI + generate roadmap action
- `frontend/src/pages/Dashboard.jsx` — legacy/example dashboard page (uses direct `/api/roadmaps` fetch)

---

## 4) Environment variables

### Backend (`backend/.env`)
The backend README (`backend/README.md`) mentions typical variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`

AI env:
- `GEMINI_API_KEY`
- `GEMINI_API_KEYS` (comma-separated)
- `AI_PROVIDER` (example `gemini`)
- `GEMINI_MODEL`
- `GEMINI_MODELS`

Redis env (optional):
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`

Email env (Resend):
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Frontend (`frontend/.env`)
Frontend uses Vite env:
- `VITE_API_BASE_URL`
  - default in code: `https://careerpath-54sr.onrender.com/api`

---

## 5) Backend middleware + request pipeline

### Express global configuration (`backend/server.js`)
Order (important):
1. `helmet(...)` security headers (CSP currently disabled)
2. `compression({ level: 6, threshold: 1024 })`
3. CORS allowlist:
   - Allows origins in `allowedOrigins`
   - Allows requests with no `Origin` header (REST tools/same-origin)
4. `express.json({ limit: '10mb' })`
5. `express.urlencoded(...)`
6. `express.text({ type: 'text/plain', limit: '10mb' })`
7. Extra middleware: if body arrives as string that looks like JSON, it attempts `JSON.parse`.
8. `connectDB()` to Mongo
9. `initRedis()` (optional; failures are swallowed)
10. Mount route groups under `/api/*`
11. `notFoundHandler` then `errorHandler`
12. Starts background task scheduler: `startTaskEmailScheduler()`

---

## 6) Authentication & user lifecycle (OTP + JWT)

### Backend auth endpoints
All live under `/api/auth` (from `server.js` mount).

#### 6.1 Signup (OTP initiation)
- **Route:** `POST /api/auth/signup`
- **Timeout:** extended (90s)
- **Input:** `{ name, email, password }`
- **Processing (data flow):**
  1. Validate required fields.
  2. Check if `User` already exists for `email`.
  3. Generate 6-digit OTP valid for 3 minutes.
  4. Remove previous OTP for email/purpose=`signup`.
  5. Hash password (`bcrypt.hash(password, 10)`).
  6. Store in `OTP` collection:
     - `email`, `otp`, `expiry`, `purpose='signup'`, `signupName`, `signupPasswordHash`
  7. Send OTP email using `sendOtpEmail(email, otp)`.
  8. Return:
     - `201` + message + email
     - In development mode, OTP is returned for testing.

#### 6.2 Verify OTP and create account
- **Route:** `POST /api/auth/verify-signup-otp`
- **Input:** `{ email, otp }`
- **Processing:**
  1. Find OTP record by `{ email, otp, purpose: 'signup' }`.
  2. Reject if not found.
  3. Reject if expired (and delete record).
  4. Ensure temporary signup data exists (`signupName`, `signupPasswordHash`).
  5. Reject if user already exists.
  6. Create `User`:
     - `name`, `email`, `password` (hash), `isVerified: true`.
  7. Delete OTP record.

#### 6.3 Login (email + password)
- **Route:** `POST /api/auth/login`
- **Input:** `{ email, password }`
- **Processing:**
  1. Find `User` by email.
  2. Reject if user not found.
  3. Reject if user has no `password` field (the code suggests password login might be disabled for some accounts).
  4. Verify password via bcrypt.
  5. Require `user.isVerified === true`.
  6. Sign JWT:
     - payload: `{ id: user._id }`
     - expires in `1d`
  7. Return `token` + user fields (no password).

#### 6.4 OTP resend for login (2nd-factor flow in this codebase)
- **Route:** `POST /api/auth/resend-otp`
- **Input:** `{ email, password }`
- **Important:** this endpoint creates OTP with `purpose: 'login'` and sends it.
- It is guarded by password validation.

> Note: Frontend `api.js` references `/auth/send-otp` and `/auth/verify-otp`, but backend file you opened shows `/signup`, `/verify-signup-otp`, `/login`, `/resend-otp`, `/forgot-password`, `/reset-password`, etc. If those routes exist elsewhere in your backend, ensure they match.

#### 6.5 Password reset
- **Request reset:** `POST /api/auth/forgot-password`
  - Input: `{ email }`
  - Generates `resetToken` + expiry=1h, stores on `User`, sends email via Resend.
- **Reset password:** `POST /api/auth/reset-password`
  - Input: `{ token, password }`
  - Finds user by token + non-expired expiry
  - Hashes password and clears token fields.

#### 6.6 Authenticated user profile
- **Get profile:** `GET /api/auth/profile`
  - Middleware: `authenticateToken`
  - Returns `User` minus `password`.
- **Update profile:** `PUT /api/auth/profile`
  - Middleware: `authenticateToken`
  - Updates `name`, `email` (uniqueness enforced), `track` (optional).

### JWT verification middleware
`backend/middleware/auth.js`:
- `authenticateToken`:
  - Reads `Authorization: Bearer <token>`
  - `jwt.verify(token, process.env.JWT_SECRET)`
  - Uses in-memory cache for 5 minutes (Map): key = decoded.id
  - Fetches `User` by ID using `lean()`
  - Sets `req.user`
- `requireVerification`:
  - blocks if `req.user.isVerified` is false

Routes use:
- `authenticateToken` (most protected endpoints)
- some routes may use `requireAuthAndVerification` as composition (not shown in the files read, but available).

---

## 7) Roadmaps feature (static templates → user tasks)

### Data models
#### 7.1 Static roadmaps
- Model: `backend/models/StaticRoadmap.js`
- Contains template roadmap definitions (tracks, tasks list, durations etc.)

#### 7.2 User roadmap (personal plan)
- Model: `backend/models/UserRoadmap.js`

Key embedded schemas inside `UserRoadmap`:
- `tasks[]`:
  - `taskId` (unique string per user task)
  - `name`, `description`
  - `status`: `not-started` | `in-progress` | `completed`
  - `isCustom` boolean (copied static vs AI/custom)
  - `staticTaskId` (if copied from a static task)
  - `roadmapTrack`, `roadmapId`
  - `estimatedTime`, `difficulty` (enum)
  - `category`
  - `resources[]` each: `{ title, url, type: video|article|course|practice }`
  - `notes`, `order`, timestamps
- `roadmaps[]`:
  - `{ roadmapId, name, track, taskCount, dateAdded }`
- `preferences`:
  - `defaultTrack` (string)
  - `showCompleted` (bool)
  - `sortBy`: `order` | `addedAt` | `difficulty` | `track`
- `stats`:
  - `totalTasks`, `completedTasks`, `inProgressTasks`

Pre-save behavior (in model):
- `userRoadmapSchema.pre('save')` updates `updatedAt` + recomputes stats.

### Backend roadmap routes (`backend/routes/roadmap.js`)
Mounted under `/api/roadmaps`.

#### 7.3 Debug endpoints
- `GET /api/roadmaps/debug` — checks mongoose connection + counts `StaticRoadmap`.

#### 7.4 Static roadmaps
1. **List static roadmaps**
   - `GET /api/roadmaps/static?page=<p>&limit=<l>`
   - Controller: `getStaticRoadmaps`
   - Flow:
     - If Redis ready, try `getCachedRoadmapsList(page, limit)`
     - Else query `StaticRoadmap.find().sort({track:1}).skip().limit().lean()`
     - Compute pagination metadata
     - Cache in Redis for page/limit

2. **Get static roadmap by id/track**
   - `GET /api/roadmaps/static/:id`
   - Controller: `getStaticRoadmap`
   - Flow:
     - If Redis ready, try `getCachedRoadmap(id)`
     - Query `StaticRoadmap.findOne({ id })`
     - If not found, fallback to `findOne({ track: { $regex: new RegExp(id, 'i') }})`
     - Cache the roadmap by `roadmap.id || roadmap._id`

#### 7.5 User roadmap (protected)
All require JWT via `authenticateToken`.

1. **Get/create user roadmap document**
   - `GET /api/roadmaps/user`
   - Controller: `getUserRoadmap`
   - If no `UserRoadmap` exists, it creates one with empty tasks and default preferences/stats.

2. **Add a task from a static roadmap**
   - `POST /api/roadmaps/user/add`
   - Controller: `addTaskToUserRoadmap`
   - Input includes:
     - `taskId`, `name`, `description`
     - `staticTaskId`, `roadmapTrack`, `estimatedTime`, `difficulty`, `category`, `resources[]`
     - `isCustom` (default false)
   - Flow:
     - Load (or create) `UserRoadmap` for user
     - Prevent duplicates: checks `userRoadmap.tasks.find(task => task.taskId === taskId)`
     - Compute next `order` = max existing order + 1
     - Push new embedded task with `status='not-started'`
     - Save.
     - Fire-and-forget email if `user.notificationEnabled`:
       - `sendTaskMotivationEmail({ to: user.email, task: {...} })`

3. **Update roadmap (status, notes, reorder, remove)**
   - `PATCH /api/roadmaps/user/update`
   - Controller: `updateUserRoadmap`
   - Input:
     - `{ action, taskId, updates, newOrder }`
   - Actions:
     - `update-status`: updates `status` + sets timestamps
     - `update-notes`
     - `reorder`: sets order + sorts by order
     - `remove`: deletes embedded task
     - `update-details`: allowed only if `isCustom`

4. **Update user preferences**
   - `PATCH /api/roadmaps/user/preferences`
   - Controller: `updateUserPreferences`
   - Input can be nested:
     - `{ preferences: { defaultTrack, showCompleted, sortBy } }` OR direct preferences object.
   - Sanitizes allowed fields and validates `sortBy` enum.

5. **Add entire roadmap to user collection**
   - `POST /api/roadmaps/user/add-roadmap`
   - Controller: `addRoadmapToUser`
   - Input:
     - `{ roadmapId, roadmapName, roadmapTrack, tasks: [] }`
   - Flow:
     - Load/create `UserRoadmap`
     - Prevent duplicate roadmap by `roadmapId` in `userRoadmap.roadmaps[]`
     - Create `taskId` per task:
       - `${roadmapId}_${task.id || task.taskId || index}`
     - Filter out tasks already present in user tasks
     - Push roadmap metadata into `userRoadmap.roadmaps[]`
     - Push tasks into `userRoadmap.tasks[]`
     - Recompute stats
     - Fire-and-forget roadmap motivation email (`sendRoadmapMotivationEmail`)

6. **Delete roadmap from user collection**
   - `DELETE /api/roadmaps/user/delete-roadmap/:roadmapId`
   - Controller: `deleteRoadmapFromUser`
   - Flow:
     - Remove roadmap metadata
     - Remove tasks where `task.roadmapId !== roadmapId`
     - Update stats

7. **Recently opened tracking**
   - `POST /api/roadmaps/user/recently-opened`
     - Body: `{ roadmapId, roadmapName }`
     - Controller: `trackRecentlyOpened`
     - If Redis ready: adds to sorted set `recently_opened:<userId>`
   - `GET /api/roadmaps/user/recently-opened`
     - Controller: `getRecentlyOpenedRoadmaps`
     - Returns ordered recently opened list from Redis.

### Frontend roadmap data flow
#### 7.6 API client functions
`frontend/src/services/api.js` defines:
- `roadmapAPI.getStaticRoadmaps(page, limit)`
  - calls `/roadmaps/static?page=...&limit=...`
- `roadmapAPI.getStaticRoadmap(id)`
  - calls `/roadmaps/static/${id}`
- `roadmapAPI.addTaskToUserRoadmap(token, taskData)`
  - calls `/roadmaps/user/add`
- `roadmapAPI.addRoadmapToUser(token, roadmapData)`
  - calls `/roadmaps/user/add-roadmap`
- `roadmapAPI.updateUserRoadmap(token, updateData)`
  - calls `/roadmaps/user/update`
- `roadmapAPI.trackRecentlyOpened(token, roadmapId, roadmapName)`
  - calls `/roadmaps/user/recently-opened`

#### 7.7 Roadmap page UI
`frontend/src/components/RoadmapPage.jsx`:
- Loads static roadmaps on mount: `loadStaticRoadmaps(1, 10)` (from `RoadmapContext`)
- If user navigates to `/roadmap/:id` or `/roadmaps` detail route:
  - It tries to find the roadmap in loaded list
  - If not found, calls `roadmapAPI.getStaticRoadmap(detailId)`
- Tracks recently opened in a `useEffect`:
  - `roadmapAPI.trackRecentlyOpened(token, roadmapId, roadmapName)`
- Adds tasks:
  - Clicking “Add Task” calls `addTaskToUser` from RoadmapContext
  - It constructs payload with:
    - `taskId`, `name`, `description`, `staticTaskId`, `roadmapTrack`, `estimatedTime`, `difficulty`, `category`, `resources`

---

## 8) AI Mentor feature (chat + generate + accept)

### Backend AI routes (`backend/routes/aiRoutes.js`)
Mounted under `/api/ai`.

1. **Chat with mentor**
   - `POST /api/ai/chat`
   - Auth required
   - Controller: `chatWithMentor`

2. **Generate roadmap preview**
   - `POST /api/ai/generate-roadmap`
   - Auth required
   - Controller: `generateRoadmapPreview`

3. **Accept roadmap and save into user roadmap**
   - `POST /api/ai/accept-roadmap`
   - Auth required
   - Controller: `acceptGeneratedRoadmap`

4. **Get session context**
   - `GET /api/ai/session-context`
   - Auth required
   - Controller: `getSessionContext`

5. **Get user profile memory**
   - `GET /api/ai/user-profile-memory`
   - Auth required
   - Controller: `getUserProfileMemory`

6. **Delete chat session(s)**
   - `DELETE /api/ai/session/:sessionId`
   - `DELETE /api/ai/sessions`

### AI controller data flow (`backend/controllers/aiController.js`)

#### 8.1 Chat with mentor
**Route:** `POST /api/ai/chat`

**Input body:**
- `userMessage` (string)
- optional `messages` array (role/content pairs)
- optional `mentorContext` object
- optional `sessionId`

**Processing pipeline:**
1. Determine `userId` from `req.user`.
2. Validate `userMessage` exists.
3. Normalize `conversationHistory` from `messages` (convert role to `user`/`assistant`).
4. Get/create chat session in Mongo:
   - `ChatSession` identified by `{ sessionId, userId }`
   - If absent, create with empty messages and active=true.
5. Get session context:
   - Find most recent active session with messages.
   - Extract `recentMessages = last 6 messages`
   - If messages > 10 and no summary, call `summarizeConversation(...)`.
6. Update user profile memory with mentor context:
   - `UserProfileMemory` stores:
     - careerGoals, skillLevel, interests, timeAvailability, learningPreferences, etc.
7. Load user roadmap context from Mongo `UserRoadmap`:
   - completed task names (used by AI persona)
   - preferences (defaultTrack/showCompleted/sortBy)
   - currentTrack
8. Build enriched context:
   - `buildSessionContext(conversationHistory.slice(-4), pastSummary, mentorContext)`
9. Call AI service:
   - `getMentorChatResponse({ userMessage, completedTasks, preferences, currentTrack, conversationHistory, mentorContext, enrichedContext })`
10. Append new messages to Mongo session:
   - `{ role:'user', content:userMessage }`
   - `{ role:'assistant', content: result.reply }`
   - store `chatSession.sessionContext = mentorContext`

**Response:**
- `{ success:true, sessionId, reply, needsMoreInfo, followUpQuestions, ... }` (from AI service)

#### 8.2 Generate roadmap preview
**Route:** `POST /api/ai/generate-roadmap`

**Input:**
- `userMessage` or inferred from `messages`
- `messages` array (chat messages for inference)
- optional `mentorContext`
- optional `preferences` override
- optional `currentTrack` override

**Processing:**
1. Normalize `conversationHistory`.
2. Compute `inferredUserMessage`:
   - prefer `userMessage` else gather last user messages.
3. Load completed tasks + preferences + current track from Mongo `UserRoadmap`.
4. Call AI service:
   - `generatePersonalizedRoadmap({ userId, userMessage: inferredUserMessage, completedTasks, preferences, currentTrack, conversationHistory, mentorContext })`

**Response:**
- `{ success:true, provider, fromCache, mentorExplanation, roadmap, error }`

> Note: the `aiService.js` function shown returns `{ roadmap, explanation, error, fromCache }`.
> `aiController` maps that into `mentorExplanation`.

#### 8.3 Accept AI roadmap
**Route:** `POST /api/ai/accept-roadmap`

**Input:**
- `{ roadmap }`
- expected structure: `roadmap.tasks` array

**Processing:**
1. Ensure user exists; load/create `UserRoadmap` doc.
2. Build `completedTaskNames` set from already completed tasks.
3. Generate new `roadmapId = ai-<timestamp>-<random>`.
4. Convert AI tasks into embedded user tasks:
   - `taskId: ${roadmapId}_${task.id || index+1}`
   - set `status='not-started'`
   - `isCustom=true`
   - `roadmapTrack = roadmap.track || 'Custom Track'`
   - normalize difficulty into allowed enum.
   - resources mapping:
     - expects AI resources already as `{title,url,type}`
     - filters type to allowed list; defaults to article.
   - assign `order` after existing max.
   - set `addedAt` and `updatedAt`.
5. Filter out tasks whose names match already completed tasks.
6. Push tasks and roadmap metadata into user document.
7. Save and return stats.

### AI prompt + parsing behavior (`backend/services/aiService.js`)

#### 8.4 Mentor chat prompt
- Uses `MENTOR_BEHAVIOR_PROMPT` rules.
- Chat prompt instructs AI to return **ONLY JSON**:
  - `{ reply: string, needsMoreInfo: boolean, followUpQuestions: [] }`
- Response parsing:
  - extracts JSON object from within any wrapper (code block/text).
  - normalizes reply.

#### 8.5 Roadmap generation prompt
- Uses fixed “roadmap JSON schema” instructions.
- Uses `extractJson()` to locate JSON.
- Uses an in-memory `roadmapCache` keyed by sha256(userMessage).
  - TTL controlled by `CACHE_TTL_MS`.

#### 8.6 Gemini call + key rotation
- `callAI(prompt)`:
  1. Build keys list from env.
  2. Build candidate models list from env.
  3. For each key:
     - Discover supported generation models via `/v1beta/models?key=<key>`
     - Filter candidate models accordingly.
     - Call generateContent for each candidate model.
     - Parse first successful response with text.
  4. If all fail, throw an error with joined details.

---

## 9) Frontend AI mentor UI flow

### AI mentor chat component
`frontend/src/components/roadmap/AIMentorChat.jsx`

Props (from usage in your codebase):
- `token`
- `sessionId` (optional)
- `seedConversation` (optional)
- `seedConversation.messages` / `seedConversation.mentorContext`
- `sessionContext` (optional)
- callbacks:
  - `onRoadmapGenerated`
  - `onConversationChange`
  - `conversationVersion`

Internal state:
- `messages[]` with roles
- `mentorContext` extracted/sanitized
- `input`, `isChatting`, `isGenerating`, `error`

#### 9.1 Sending a chat message
1. User types and clicks send.
2. UI constructs `updatedMessages = [...messages, {role:'user', content:userMessage}]`.
3. It calls:
   - `aiAPI.chatMentor(chatPayload, token)`
   - where `chatPayload` includes `userMessage`, `messages`, and `mentorContext`, plus `sessionId`.
4. On response:
   - Parses reply
   - Appends assistant message to `messages` state
   - updates mentorContext if `response.mentorContext` is provided.

#### 9.2 Generating a roadmap
1. UI calls `aiAPI.generateRoadmap({ userMessage, messages, mentorContext }, token)`.
2. On success:
   - calls `onRoadmapGenerated({ roadmap: response.roadmap, mentorExplanation, provider, fromCache, error })`.

---

## 10) Data flow diagrams (summary)

### A) Signup → verify → login
1. Frontend `/signup` (not shown in files read but routes exist)
2. `POST /api/auth/signup`
   - OTP record created in Mongo + OTP email sent
3. Frontend `/verify` (or verify page)
4. `POST /api/auth/verify-signup-otp`
   - OTP validated and deleted
   - User created in Mongo with `isVerified: true`
5. `POST /api/auth/login`
   - JWT issued
6. Frontend stores token
7. Protected routes require `Authorization: Bearer <token>`

### B) Roadmaps
1. Frontend loads static roadmaps:
   - `GET /api/roadmaps/static?page&limit`
   - optional Redis acceleration
2. User opens detail view:
   - `GET /api/roadmaps/static/:id` (if not already loaded)
3. User clicks Add Task:
   - `POST /api/roadmaps/user/add`
   - embedded task inserted into `UserRoadmap.tasks[]`
4. Recent tracking:
   - `POST /api/roadmaps/user/recently-opened` writes into Redis

### C) AI Mentor Chat
1. UI sends `POST /api/ai/chat` with `userMessage`, `messages`, `mentorContext`
2. Backend:
   - fetch/create `ChatSession` document
   - builds enriched context with past summary + recent messages
   - updates `UserProfileMemory` from mentorContext
   - calls Gemini and parses JSON
   - appends assistant reply to session
3. UI displays mentor reply + optional follow-up questions

### D) AI Roadmap Generate → Accept
1. UI calls `POST /api/ai/generate-roadmap`
2. AI service calls Gemini and returns roadmap JSON
3. UI (typically in Roadmap preview UI) calls `POST /api/ai/accept-roadmap`
4. Backend converts roadmap tasks into `UserRoadmap.tasks[]` and marks them `isCustom=true`.

---

## 11) Known backward compatibility / legacy notes

### Roadmap routes include legacy handlers
In `backend/routes/roadmap.js`:
- `/api/roadmaps/legacy` GET/POST exist (simple Roadmap model operations)
- Parameterized legacy `GET /api/roadmaps/:id` is last and may catch many requests.

### Frontend Dashboard page is legacy-ish
`frontend/src/pages/Dashboard.jsx` fetches:
- `https://careerpath-54sr.onrender.com/api/roadmaps` (note: backend uses `/api/roadmaps/*`, so this may rely on legacy route mapping).

---

## 12) Operational notes (performance & deployment)

### Backend performance improvements
`backend/PERFORMANCE_OPTIMIZATIONS.md` documents:
- removed console logging (claims)
- Mongo optimizations: connection pooling, shorter timeouts, `.lean()` usage
- compression settings
- in-memory auth caching

### Redis optional behavior
If Redis cannot connect:
- AI + roadmap generation still works.
- caching and recently-opened feature via Redis may degrade.

### Email sending
- Task/roadmap motivation emails are fire-and-forget.
- OTP/password reset are awaited and can fail request with email config issues.

---

## 13) Endpoint reference (compact)

### Health
- `GET /health`

### Auth (`/api/auth`)
- `POST /signup`
- `POST /verify-signup-otp`
- `POST /login`
- `POST /resend-otp`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /profile` (auth)
- `PUT /profile` (auth)
- `GET /test`

### Roadmaps (`/api/roadmaps`)
- `GET /debug`
- `GET /static?page&limit`
- `GET /static/:id`
- `GET /user` (auth)
- `POST /user/add` (auth)
- `PATCH /user/update` (auth)
- `PATCH /user/preferences` (auth)
- `POST /user/add-roadmap` (auth)
- `DELETE /user/delete-roadmap/:roadmapId` (auth)
- `POST /user/recently-opened` (auth)
- `GET /user/recently-opened` (auth)
- legacy:
  - `GET /legacy`, `POST /legacy`, `GET /:id`

### Tasks (`/api/tasks`)
- As implemented in your code snippet: task email endpoint example exists.

### AI (`/api/ai`)
- `POST /chat` (auth)
- `POST /generate-roadmap` (auth)
- `POST /accept-roadmap` (auth)
- `GET /session-context` (auth)
- `GET /user-profile-memory` (auth)
- `DELETE /session/:sessionId` (auth)
- `DELETE /sessions` (auth)

---

## 14) What this README covers
- Architecture: frontend → backend → DB/Redis/AI/email
- Data model: `User`, `UserRoadmap`, embedded tasks/roadmaps/preferences/stats
- Roadmap flow: templates → add tasks → update status/preferences → recently opened
- AI flow: chat sessions + summary + profile memory → Gemini parsing → roadmap acceptance
- Auth flow: OTP verification → verified user → JWT-protected routes

---

## 15) Notes on completeness
This document is based on the exact code contents inspected in your environment (server, route files, controllers, AI service, Redis config, auth middleware, AI chat UI, roadmap UI, and performance/email docs).

If you want the README to also include:
- every remaining route/controller not read here (resumes/task scheduler endpoints)
- exact JSON response schemas for every error case

…run a full repo scan and update the README with those missing pieces.

