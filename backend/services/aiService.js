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

  try {
    return JSON.parse(text);
  } catch {}

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return null;
};

/* =========================
   GEMINI CALL
========================= */
const callAI = async (prompt) => {
  const keys = getGeminiKeys();
  const models = getGeminiModels();

  if (keys.length === 0) {
    throw new Error("No Gemini API key configured");
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

  throw new Error(
    clampText(errors.join(" | "), "All Gemini providers failed")
  );
};

/* =========================
   CHAT PROMPT
========================= */
const buildChatPrompt = (userMessage) => `
${MENTOR_BEHAVIOR_PROMPT}

IMPORTANT:
- Handle greetings naturally
- If career-related → guide properly
- If clear goal → roadmap
- If unclear → ask questions

Return ONLY JSON:

{
  "reply": "string",
  "needsMoreInfo": false,
  "followUpQuestions": []
}

User:
"${userMessage}"
`;

/* =========================
   CHAT FUNCTION
========================= */
export const getMentorChatResponse = async ({ userMessage }) => {
  try {
    const aiText = await callAI(buildChatPrompt(userMessage));
    const parsed = extractJson(aiText);

    if (parsed && typeof parsed === "object") {
      const followUpQuestions = Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.map((q) => clampText(q)).filter(Boolean)
        : [];

      return {
        reply: clampText(parsed.reply),
        needsMoreInfo: Boolean(parsed.needsMoreInfo),
        followUpQuestions,
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
    const lowerError = clampText(err?.message).toLowerCase();
    const isQuotaIssue =
      lowerError.includes("quota") ||
      lowerError.includes("resource_exhausted") ||
      lowerError.includes("429");

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
  const cacheKey = crypto
    .createHash("sha256")
    .update(userMessage)
    .digest("hex");

  // Cache check
  if (roadmapCache.has(cacheKey)) {
    const entry = roadmapCache.get(cacheKey);
    if (Date.now() - entry.time < CACHE_TTL_MS) {
      return entry.data;
    }
  }

  try {
    const text = await callAI(buildRoadmapPrompt(userMessage));
    const json = extractJson(text);

    if (!json) throw new Error("Invalid JSON");

    const result = {
      roadmap: json,
      explanation: text,
    };

    roadmapCache.set(cacheKey, {
      data: result,
      time: Date.now(),
    });

    return result;
  } catch (err) {
    return {
      roadmap: null,
      explanation: "Failed to generate roadmap. Try again.",
    };
  }
};