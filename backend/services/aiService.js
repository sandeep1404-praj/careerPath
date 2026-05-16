import crypto from "node:crypto";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const CACHE_TTL_MS = 10 * 60 * 1000;
const MODEL_CATALOG_TTL_MS = 60 * 60 * 1000;

const roadmapCache = new Map();
const modelCatalogCache = new Map();
const unsupportedGeminiModels = new Set();

/* =========================
   CORE PROMPT
========================= */
const MENTOR_BEHAVIOR_PROMPT = `
You are an AI Career Mentor for IT/Engineering students.

RULES:
- Always respond (even greetings)
- If goal is CLEAR → give roadmap directly
- If CONFUSED → ask 2–3 questions
- If PARTIAL → ask max 1–2 questions

IMPORTANT:
- Understand typos
- Do NOT correct spelling
- Be practical
- When giving advice, include 2-4 high-quality resources with valid URLs
- Prefer official docs and trusted learning platforms
- If exact deep link is uncertain, use the official page instead of guessing

STYLE:
- Short intro (1–2 lines)
- Then Step 1, Step 2 format
- Clear and structured
`;

/* =========================
   HELPERS
========================= */
const clampText = (v, f = "") =>
  typeof v === "string" ? v.trim() : f;

const parseCsv = (value) =>
  clampText(value)
    .split(",")
    .map((item) => clampText(item))
    .filter(Boolean);

const normalizeModelName = (value) => {
  const model = clampText(value);
  if (!model) return "";
  return model.startsWith("models/") ? model.slice(7) : model;
};

const getGeminiKeys = () => {
  const keys = [
    ...parseCsv(process.env.GEMINI_API_KEYS),
    clampText(process.env.GEMINI_API_KEY),
  ].filter(Boolean);

  return Array.from(new Set(keys));
};

const getGeminiModels = () => {
  const models = [
    ...parseCsv(process.env.GEMINI_MODELS).map(normalizeModelName),
    normalizeModelName(GEMINI_MODEL),
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];

  return Array.from(new Set(models));
};

const getAvailableModelsForKey = async (key) => {
  const cached = modelCatalogCache.get(key);
  if (cached && Date.now() - cached.time < MODEL_CATALOG_TTL_MS) {
    return cached.models;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json().catch(() => ({}));
    const models = Array.isArray(data?.models)
      ? data.models
          .filter((item) =>
            Array.isArray(item?.supportedGenerationMethods)
              ? item.supportedGenerationMethods.includes("generateContent")
              : false
          )
          .map((item) => normalizeModelName(item?.name))
          .filter(Boolean)
      : [];

    modelCatalogCache.set(key, {
      models,
      time: Date.now(),
    });

    return models;
  } catch {
    return [];
  }
};

const buildQuotaFallbackReply = (userMessage) => {
  const goal = clampText(userMessage, "your target role");

  return [
    "I can still guide you while AI is rate-limited right now.",
    `Goal noted: ${goal}`,
    "",
    "Step 1: Pick one track (Frontend / Backend / AI) and focus on it for 4 weeks.",
    "Step 2: Study 60-90 minutes daily and build 1 mini-project each week.",
    "Step 3: Share your current level and weekly hours, and I will tailor your next plan.",
  ].join("\n");
};

const extractJson = (text) => {
  if (!text) return null;

  const cleanedText = clampText(text)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {}

  // Try broad slice first.
  const start = cleanedText.indexOf("{");
  const end = cleanedText.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(cleanedText.slice(start, end + 1));
    } catch {}
  }

  // Recover the first balanced JSON object even when trailing characters exist.
  if (start !== -1) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < cleanedText.length; i += 1) {
      const ch = cleanedText[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (ch === "{") depth += 1;
      if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(cleanedText.slice(start, i + 1));
          } catch {}
        }
      }
    }
  }

  return null;
};

const normalizeMentorReply = (value) => {
  const text = clampText(value);
  if (!text) return "";

  const nested = extractJson(text);
  if (nested && typeof nested === "object" && typeof nested.reply === "string") {
    return clampText(nested.reply);
  }

  return text;
};

/* =========================
   GEMINI CALL
========================= */
const callAI = async (prompt) => {
  const keys = getGeminiKeys();
  const models = getGeminiModels();

  if (keys.length === 0) {
    console.error('[AI Service] No Gemini API keys found. Check GEMINI_API_KEY or GEMINI_API_KEYS environment variables.');
    throw new Error("No Gemini API key configured. Contact support if this persists.");
  }

  if (models.length === 0) {
    console.error('[AI Service] No Gemini models available. Check GEMINI_MODELS environment variable.');
    throw new Error("No AI models configured. Contact support if this persists.");
  }

  const errors = [];

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    const availableModels = await getAvailableModelsForKey(key);

    const candidateModels = availableModels.length
      ? Array.from(new Set([
          ...models.filter((model) => availableModels.includes(model)),
          ...availableModels,
        ]))
      : models;

    if (candidateModels.length === 0) {
      errors.push(`key-${keyIndex + 1}: no usable models found`);
      continue;
    }

    for (const model of candidateModels) {
      if (unsupportedGeminiModels.has(model)) {
        continue;
      }

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const detail = clampText(data?.error?.message, `HTTP ${res.status}`);

          if (res.status === 404) {
            unsupportedGeminiModels.add(model);
          }

          errors.push(`key-${keyIndex + 1}/${model}: ${detail}`);
          continue;
        }

        const text = clampText(data?.candidates?.[0]?.content?.parts?.[0]?.text);
        if (text) return text;

        errors.push(`key-${keyIndex + 1}/${model}: empty AI response`);
      } catch (error) {
        errors.push(
          `key-${keyIndex + 1}/${model}: ${clampText(error?.message, "network error")}`
        );
      }
    }
  }

  const errorDetails = errors.join(" | ");
  console.error('[AI Service] All Gemini providers exhausted:', errorDetails);
  throw new Error(
    clampText(errors.join(" | "), "All Gemini providers failed")
  );
};

/* =========================
   CHAT PROMPT
========================= */
const buildChatPrompt = (userMessage, enrichedContext = '') => {
  const contextSection = enrichedContext
    ? `\n=== SESSION CONTEXT ===\n${enrichedContext}\n\n`
    : '';

  return `${MENTOR_BEHAVIOR_PROMPT}

IMPORTANT:
- Handle greetings naturally
- If career-related → guide properly
- If clear goal → roadmap
- If unclear → ask questions
- Remember previous conversation context
- For career guidance, include a "Resources" section in reply with 2-4 items
- Each resource must include title, why it helps, and a valid https URL
- Do not output placeholder or fake links
- TAG each resource link with categories: [Learning] or [Practice], and [Free] or [Paid]
- Example format: "[Learning][Free] https://example.com"
- Include mix of learning (tutorials, courses) and practicing (labs, challenges) resources
- Include both free and paid options when available

${contextSection}Return ONLY JSON:

{
  "reply": "string",
  "needsMoreInfo": false,
  "followUpQuestions": []
}

User:
"${userMessage}"
`;
};

/* =========================
   CHAT FUNCTION
========================= */
export const getMentorChatResponse = async ({ userMessage, enrichedContext = '' }) => {
  // Validate userMessage early
  if (!userMessage || typeof userMessage !== 'string') {
    return {
      reply: "Please share your career goal or what you'd like guidance on.",
      needsMoreInfo: true,
      followUpQuestions: [
        "What role or tech area interests you?",
        "What's your current skill level?",
      ],
    };
  }

  try {
    const aiText = await callAI(buildChatPrompt(userMessage, enrichedContext));
    const parsed = extractJson(aiText);

    if (parsed && typeof parsed === "object") {
      const followUpQuestions = Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.map((q) => clampText(q)).filter(Boolean)
        : [];

      const fallbackFollowUps = Array.isArray(parsed.questions)
        ? parsed.questions.map((q) => clampText(q)).filter(Boolean)
        : [];

      return {
        reply: normalizeMentorReply(parsed.reply || parsed.response || parsed.message),
        needsMoreInfo: Boolean(parsed.needsMoreInfo),
        followUpQuestions: followUpQuestions.length ? followUpQuestions : fallbackFollowUps,
      };
    }

    // Some model responses are plain text even when JSON is requested.
    if (clampText(aiText)) {
      return {
        reply: clampText(aiText),
        needsMoreInfo: false,
        followUpQuestions: [],
      };
    }

    return {
      reply: "I could not generate a response right now. Please try again.",
      needsMoreInfo: false,
      followUpQuestions: [],
    };
  } catch (err) {
    const errorMsg = clampText(err?.message).toLowerCase();
    
    // Check for configuration issues
    const isConfigError = 
      errorMsg.includes("no gemini api key") ||
      errorMsg.includes("api key configured");
    
    // Check for quota/rate limit issues
    const isQuotaIssue =
      errorMsg.includes("quota") ||
      errorMsg.includes("resource_exhausted") ||
      errorMsg.includes("429") ||
      errorMsg.includes("too many requests");

    // Log error for debugging
    console.error('[AI Mentor Error]', err?.message);

    if (isConfigError) {
      return {
        reply: "The AI mentor service is temporarily unavailable. Please try again in a few moments.",
        needsMoreInfo: false,
        followUpQuestions: [],
      };
    }

    return {
      reply: isQuotaIssue
        ? buildQuotaFallbackReply(userMessage)
        : "I had trouble reaching the AI mentor. Please try again.",
      needsMoreInfo: isQuotaIssue,
      followUpQuestions: isQuotaIssue
        ? [
            "What role are you targeting exactly?",
            "How many hours per week can you study?",
          ]
        : [],
    };
  }
};

/* =========================
   ROADMAP PROMPT (FIXED)
========================= */
const buildRoadmapPrompt = (userMessage) => `
${MENTOR_BEHAVIOR_PROMPT}

User wants:
"${userMessage}"

INSTRUCTIONS:
- Assume beginner if not specified
- Do NOT ask questions
- Generate full roadmap
- For each task, include 1-3 relevant resources
- Resource links must be real and start with https://
- Prefer official documentation first, then trusted tutorials
- If unsure of a deep link, use the official docs/course page
- TAG each resource with categories: [Learning] or [Practice], and [Free] or [Paid]
- Example: "[Learning][Free] https://python.org/docs"
- Mix learning resources (courses, docs) with practice resources (labs, challenges)
- Include both free and paid options in resources array

IMPORTANT RULES FOR TIME:
- DO NOT use fixed duration like "3 months"
- Small tasks → hours or days
- Medium → 1–2 weeks
- Big → 2–4 weeks
- Assume 1–2 hrs/day study
- totalEstimatedTime = sum of all tasks

OUTPUT:

1. Short intro
2. Step-by-step roadmap
3. Projects

Then return JSON:

{
  "name": "Career Roadmap",
  "description": "short",
  "tasks": [
    {
      "id": "task-1",
      "name": "Task name",
      "description": "what to do",
      "estimatedTime": "realistic time",
      "difficulty": "Beginner",
      "category": "Fundamentals",
      "resources": [
        {
          "title": "resource",
          "url": "link",
          "type": "video"
        }
      ],
      "order": 1
    }
  ],
  "totalEstimatedTime": "sum of all tasks"
}
`;

/* =========================
   ROADMAP FUNCTION
========================= */
export const generatePersonalizedRoadmap = async ({ userMessage }) => {
  // Validate userMessage early
  if (!userMessage || typeof userMessage !== 'string') {
    return {
      roadmap: null,
      explanation: "Please provide a clear description of your career goal.",
      error: "invalid_input"
    };
  }

  const cacheKey = crypto
    .createHash("sha256")
    .update(userMessage)
    .digest("hex");

  // Cache check
  if (roadmapCache.has(cacheKey)) {
    const entry = roadmapCache.get(cacheKey);
    if (Date.now() - entry.time < CACHE_TTL_MS) {
      return {
        ...entry.data,
        fromCache: true,
      };
    }
  }

  try {
    const text = await callAI(buildRoadmapPrompt(userMessage));
    const json = extractJson(text);

    if (!json) {
      console.warn('[Roadmap Generation] Failed to extract JSON from AI response');
      return {
        roadmap: null,
        explanation: "Failed to generate roadmap. Try again with more specific details about your goal.",
        error: "invalid_json"
      };
    }

    const result = {
      roadmap: json,
      explanation: text,
      fromCache: false,
    };

    roadmapCache.set(cacheKey, {
      data: result,
      time: Date.now(),
    });

    return result;
  } catch (err) {
    const errorMsg = clampText(err?.message).toLowerCase();
    
    // Check for configuration issues
    const isConfigError = 
      errorMsg.includes("no gemini api key") ||
      errorMsg.includes("api key configured");

    console.error('[Roadmap Generation Error]', err?.message);

    return {
      roadmap: null,
      explanation: isConfigError
        ? "The roadmap service is temporarily unavailable. Please try again later."
        : "Failed to generate roadmap. Try again.",
      error: isConfigError ? "service_unavailable" : "generation_failed"
    };
  }
};