import crypto from 'node:crypto';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const CACHE_TTL_MS = 10 * 60 * 1000;
const roadmapCache = new Map();
const modelCatalogCache = new Map();

const SYSTEM_PROMPT = `You are an expert career mentor AI.
You guide students step-by-step based on their goals, interests, and current level.
You generate structured, realistic, and practical learning roadmaps.`;

const clampText = (value, fallback = '') => {
	if (typeof value !== 'string') return fallback;
	return value.trim();
};

const normalizeModelName = (value = '') => {
	const clean = clampText(value);
	if (!clean) return '';
	return clean.startsWith('models/') ? clean.slice('models/'.length) : clean;
};

const getConfiguredModelCandidates = () => {
	const configuredList = clampText(process.env.GEMINI_MODELS);
	const fromList = configuredList
		? configuredList
				.split(',')
				.map((item) => normalizeModelName(item))
				.filter(Boolean)
		: [];

	const fromSingle = normalizeModelName(GEMINI_MODEL);
	const defaults = [
		'gemini-2.0-flash',
		'gemini-2.0-flash-lite',
		'gemini-1.5-flash-latest',
		'gemini-1.5-flash-8b',
		'gemini-1.5-pro-latest',
		'gemini-pro'
	];

	return Array.from(new Set([...fromList, fromSingle, ...defaults].filter(Boolean)));
};

const normalizeDifficulty = (value = 'Beginner') => {
	const allowed = ['Beginner', 'Intermediate', 'Advanced'];
	return allowed.includes(value) ? value : 'Beginner';
};

const normalizeResourceType = (value = 'article') => {
	const allowed = ['video', 'article', 'course', 'practice'];
	return allowed.includes(value) ? value : 'article';
};

const normalizeSkillLevel = (value = 'Unknown') => {
	const allowed = ['Beginner', 'Intermediate', 'Advanced', 'Unknown'];
	return allowed.includes(value) ? value : 'Unknown';
};

const sanitizeConversationHistory = (messages = []) => {
	if (!Array.isArray(messages)) return [];

	return messages
		.filter((message) => message && typeof message === 'object')
		.map((message) => ({
			role: message.role === 'assistant' ? 'assistant' : 'user',
			content: clampText(message.content)
		}))
		.filter((message) => message.content)
		.slice(-20);
};

const mergeMentorContext = (baseContext = {}, detected = {}) => {
	const baseInterests = Array.isArray(baseContext?.interests)
		? baseContext.interests.map((item) => clampText(item)).filter(Boolean)
		: [];

	const detectedInterests = Array.isArray(detected?.interests)
		? detected.interests.map((item) => clampText(item)).filter(Boolean)
		: [];

	const mergedInterests = Array.from(new Set([...baseInterests, ...detectedInterests]));

	return {
		careerGoal: clampText(detected?.careerGoal || baseContext?.careerGoal),
		skillLevel: normalizeSkillLevel(clampText(detected?.skillLevel || baseContext?.skillLevel, 'Unknown')),
		interests: mergedInterests,
		timeAvailability: clampText(detected?.timeAvailability || baseContext?.timeAvailability)
	};
};

const getMissingProfileFields = (context = {}) => {
	const missing = [];
	if (!clampText(context.careerGoal)) missing.push('careerGoal');
	if (normalizeSkillLevel(context.skillLevel) === 'Unknown') missing.push('skillLevel');
	if (!Array.isArray(context.interests) || context.interests.length === 0) missing.push('interests');
	if (!clampText(context.timeAvailability)) missing.push('timeAvailability');
	return missing;
};

const buildTargetedFollowUps = (missingFields = []) => {
	const map = {
		careerGoal: 'What exact role do you want (for example Frontend Developer, Backend Engineer, AI Engineer)?',
		skillLevel: 'What is your current level right now (Beginner, Intermediate, or Advanced)?',
		interests: 'Which areas interest you most (frontend, backend, AI/ML, DevOps, data, mobile)?',
		timeAvailability: 'How many hours per week can you realistically study and practice?'
	};

	return missingFields.map((field) => map[field]).filter(Boolean);
};

const isAbsoluteBeginnerIntent = (text = '') => {
	const value = clampText(text).toLowerCase();
	if (!value) return false;

	const beginnerPatterns = [
		"don't know",
		'dont know',
		'from scratch',
		'beginner',
		'biggineer',
		'start from zero',
		'no coding',
		'new to coding',
		'where i start',
		'where do i start'
	];

	return beginnerPatterns.some((pattern) => value.includes(pattern));
};

const buildBeginnerGuidanceReply = () => {
	return `Summary: Start with one beginner-friendly language, learn core programming concepts, practice consistently, then move into projects and a specialization. Below is a clear, step-by-step roadmap.

1) Choose Your First Language
- Python -> easiest for beginners and widely used
- JavaScript -> best if you want web development
Recommendation: Start with Python if you're unsure.

2) Learn the Basics (2-4 weeks)
- Variables and data types
- Conditions (if/else)
- Loops (for/while)
- Functions
- Basic input/output
Goal: Understand logic, not only syntax.

3) Practice Small Programs (2-3 weeks)
- Calculator
- Number guessing game
- Basic to-do list
Use HackerRank or LeetCode (easy problems).

4) Learn Core Concepts (3-5 weeks)
- Data structures (lists, arrays, dictionaries)
- Algorithms basics (sorting, searching)
- Problem-solving approach

5) Start Mini Projects (4-6 weeks)
- CLI tools
- Simple website (if JavaScript track)
- File organizer script
Goal: Build while learning.

6) Pick a Direction
- Web Development
- App Development
- Data / AI
- Software Development

7) Build Real Projects (ongoing)
- Portfolio website
- Blog app
- Chat app
- API projects

8) Learn Developer Tools
- Git
- GitHub
- VS Code

9) Stay Consistent
- Practice daily (1-2 hours)
- Build regularly
- Avoid jumping between too many languages

Simple 3-Month Plan:
- Month 1: Python basics + easy problems
- Month 2: Data structures + small projects
- Month 3: Build 2-3 projects and publish on GitHub

Final Advice: Start now, expect confusion, and stay consistent. Consistency beats speed every time.`;
};

const extractJsonFromText = (text) => {
	if (!text || typeof text !== 'string') return null;

	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch (error) {
	}

	const firstBrace = trimmed.indexOf('{');
	const lastBrace = trimmed.lastIndexOf('}');
	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		const possibleJson = trimmed.slice(firstBrace, lastBrace + 1);
		try {
			return JSON.parse(possibleJson);
		} catch (error) {
			return null;
		}
	}

	return null;
};

const extractRoadmapJsonAndNarrative = (text) => {
	if (!text || typeof text !== 'string') {
		return { roadmapJson: null, mentorExplanation: '' };
	}

	const trimmed = text.trim();

	const codeBlockMatches = [...trimmed.matchAll(/```json\s*([\s\S]*?)```/gi)];
	if (codeBlockMatches.length > 0) {
		for (let i = codeBlockMatches.length - 1; i >= 0; i -= 1) {
			const jsonCandidate = clampText(codeBlockMatches[i][1]);
			const parsed = extractJsonFromText(jsonCandidate);
			if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tasks)) {
				const mentorExplanation = clampText(trimmed.replace(codeBlockMatches[i][0], '').trim());
				return { roadmapJson: parsed, mentorExplanation };
			}
		}
	}

	let start = trimmed.indexOf('{');
	while (start !== -1) {
		for (let end = trimmed.length - 1; end > start; end -= 1) {
			if (trimmed[end] !== '}') continue;
			const candidate = trimmed.slice(start, end + 1);
			const parsed = extractJsonFromText(candidate);
			if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tasks)) {
				const explanation = clampText(`${trimmed.slice(0, start)} ${trimmed.slice(end + 1)}`.trim());
				return { roadmapJson: parsed, mentorExplanation: explanation };
			}
		}
		start = trimmed.indexOf('{', start + 1);
	}

	const parsedWhole = extractJsonFromText(trimmed);
	if (parsedWhole && typeof parsedWhole === 'object' && Array.isArray(parsedWhole.tasks)) {
		return { roadmapJson: parsedWhole, mentorExplanation: '' };
	}

	return { roadmapJson: null, mentorExplanation: trimmed };
};

const sanitizeRoadmap = (rawRoadmap = {}, completedTaskNames = []) => {
	const completedSet = new Set(
		(completedTaskNames || [])
			.map((name) => clampText(name).toLowerCase())
			.filter(Boolean)
	);

	const inputTasks = Array.isArray(rawRoadmap.tasks) ? rawRoadmap.tasks : [];
	const dedupe = new Set();

	const tasks = inputTasks
		.map((task, index) => {
			const taskName = clampText(task?.name, `Task ${index + 1}`);
			const normalizedNameKey = taskName.toLowerCase();
			if (!taskName || completedSet.has(normalizedNameKey) || dedupe.has(normalizedNameKey)) {
				return null;
			}

			dedupe.add(normalizedNameKey);

			const resources = Array.isArray(task?.resources)
				? task.resources
						.map((resource) => ({
							title: clampText(resource?.title, 'Learning Resource'),
							url: clampText(resource?.url, ''),
							type: normalizeResourceType(resource?.type)
						}))
						.filter((resource) => resource.title)
				: [];

			return {
				id: clampText(task?.id, `task-${index + 1}`),
				name: taskName,
				description: clampText(task?.description, 'Complete this milestone and build a small deliverable.'),
				estimatedTime: clampText(task?.estimatedTime, '1 week'),
				difficulty: normalizeDifficulty(task?.difficulty),
				category: clampText(task?.category, 'General'),
				resources,
				order: Number.isFinite(task?.order) ? Number(task.order) : index + 1
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.order - b.order)
		.map((task, index) => ({ ...task, order: index + 1, id: `task-${index + 1}` }));

	return {
		name: clampText(rawRoadmap.name, 'Personalized Career Roadmap'),
		track: clampText(rawRoadmap.track, 'Custom Track'),
		description: clampText(rawRoadmap.description, 'A personalized roadmap tailored to your goals, skills, and availability.'),
		tasks,
		totalEstimatedTime: clampText(rawRoadmap.totalEstimatedTime, `${Math.max(tasks.length, 1)}-${Math.max(tasks.length * 2, 2)} weeks`)
	};
};

const buildFallbackRoadmap = ({ userMessage, preferences = {}, currentTrack = '', completedTasks = [] }) => {
	const goalText = clampText(userMessage, 'Career growth');
	const preferredTrack = clampText(currentTrack || preferences?.defaultTrack, 'Programming');
	const completedTaskNames = (completedTasks || []).map((task) => clampText(task?.name)).filter(Boolean);

	const raw = {
		name: 'Beginner Programming Roadmap',
		track: preferredTrack,
		description: `Complete beginner roadmap generated for: ${goalText}`,
		tasks: [
			{
				id: 'task-1',
				name: 'Choose first language and setup',
				description: 'Install Python and VS Code, then run your first basic scripts.',
				estimatedTime: '1 week',
				difficulty: 'Beginner',
				category: 'Getting Started',
				resources: [
					{ title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'article' }
				],
				order: 1
			},
			{
				id: 'task-2',
				name: 'Learn programming basics',
				description: 'Study variables, loops, conditions, functions, and practice daily with simple exercises.',
				estimatedTime: '3 weeks',
				difficulty: 'Beginner',
				category: 'Fundamentals',
				resources: [
					{ title: 'freeCodeCamp Python Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', type: 'video' }
				],
				order: 2
			},
			{
				id: 'task-3',
				name: 'Build small practice apps',
				description: 'Create a calculator, guessing game, and basic to-do app to reinforce fundamentals.',
				estimatedTime: '2 weeks',
				difficulty: 'Beginner',
				category: 'Practice',
				resources: [
					{ title: 'HackerRank Practice', url: 'https://www.hackerrank.com/domains/python', type: 'practice' }
				],
				order: 3
			},
			{
				id: 'task-4',
				name: 'Build beginner projects and publish',
				description: 'Build 2-3 beginner projects and publish them on GitHub portfolio.',
				estimatedTime: '6 weeks',
				difficulty: 'Beginner',
				category: 'Projects',
				resources: [
					{ title: 'Git & GitHub Crash Course', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', type: 'video' }
				],
				order: 4
			}
		],
		totalEstimatedTime: '3 months'
	};

	return sanitizeRoadmap(raw, completedTaskNames);
};

const hashPayload = (payload) =>
	crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const getGeminiKeys = () => {
	const rawKeys = process.env.GEMINI_API_KEYS;

	if (rawKeys && rawKeys.trim()) {
		if (rawKeys.trim().startsWith('[')) {
			try {
				const parsed = JSON.parse(rawKeys);
				if (Array.isArray(parsed)) {
					const keys = parsed.map((item) => clampText(item)).filter(Boolean);
					if (keys.length > 0) return keys;
				}
			} catch (error) {
			}
		}

		const csvKeys = rawKeys
			.split(',')
			.map((item) => clampText(item))
			.filter(Boolean);

		if (csvKeys.length > 0) return csvKeys;
	}

	const singleKey = clampText(process.env.GEMINI_API_KEY);
	return singleKey ? [singleKey] : [];
};

const getAvailableModelsForKey = async (geminiKey) => {
	const cached = modelCatalogCache.get(geminiKey);
	const now = Date.now();
	if (cached && now - cached.cachedAt < 60 * 60 * 1000) {
		return cached.models;
	}

	try {
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
		if (!response.ok) {
			return [];
		}

		const data = await response.json();
		const models = Array.isArray(data?.models)
			? data.models
					.filter((model) => Array.isArray(model?.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent'))
					.map((model) => normalizeModelName(model?.name))
					.filter(Boolean)
			: [];

		modelCatalogCache.set(geminiKey, { cachedAt: now, models });
		return models;
	} catch (error) {
		return [];
	}
};

const getCachedRoadmap = (key) => {
	const entry = roadmapCache.get(key);
	if (!entry) return null;
	if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
		roadmapCache.delete(key);
		return null;
	}
	return entry.data;
};

const setCachedRoadmap = (key, data) => {
	roadmapCache.set(key, { createdAt: Date.now(), data });
	if (roadmapCache.size > 100) {
		const now = Date.now();
		for (const [cacheKey, entry] of roadmapCache.entries()) {
			if (now - entry.createdAt > CACHE_TTL_MS) {
				roadmapCache.delete(cacheKey);
			}
		}
	}
};

const callWithFallback = async (prompt, options = {}) => {
	const { jsonMode = true } = options;
	const geminiKeys = getGeminiKeys();

	if (geminiKeys.length === 0) {
		throw new Error('No Gemini API keys configured. Set GEMINI_API_KEYS or GEMINI_API_KEY.');
	}

	const errors = [];
	const configuredCandidates = getConfiguredModelCandidates();

	for (let index = 0; index < geminiKeys.length; index += 1) {
		const geminiKey = geminiKeys[index];
		const availableModels = await getAvailableModelsForKey(geminiKey);
		const candidateModels = availableModels.length > 0
			? Array.from(new Set([...configuredCandidates, ...availableModels].filter((model) => availableModels.includes(model))))
			: configuredCandidates;

		for (let modelIndex = 0; modelIndex < candidateModels.length; modelIndex += 1) {
			const modelName = candidateModels[modelIndex];
			try {
				const response = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							contents: [{ role: 'user', parts: [{ text: prompt }] }],
							generationConfig: {
								temperature: 0.4,
								...(jsonMode ? { responseMimeType: 'application/json' } : {})
							}
						})
					}
				);

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Gemini key ${index + 1}, model ${modelName} failed: ${response.status} ${errorText}`);
				}

				const data = await response.json();
				const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
				if (!text) {
					throw new Error(`Gemini key ${index + 1}, model ${modelName} returned empty response`);
				}

				return { provider: `gemini-key-${index + 1}:${modelName}`, text };
			} catch (error) {
				errors.push(error.message);
			}
		}

		if (candidateModels.length === 0) {
			errors.push(`Gemini key ${index + 1} has no available generateContent models.`);
		}
	}

	throw new Error(errors.join(' | '));
};

const buildRoadmapPrompt = ({
	userMessage,
	completedTasks = [],
	preferences = {},
	currentTrack = '',
	conversationHistory = [],
	mentorContext = {}
}) => {
	const completedTaskNames = completedTasks.map((task) => task?.name).filter(Boolean);
	const cleanHistory = sanitizeConversationHistory(conversationHistory);

	const finalPrompt = `
You are an expert career mentor AI.

A beginner student says:
"${userMessage}"

IMPORTANT INSTRUCTIONS:

- Do NOT ask questions.
- Do NOT request more information.
- Assume the student is a COMPLETE BEGINNER.
- Make reasonable assumptions if data is missing.
- Always provide a FULL roadmap immediately.

----------------------------------

OUTPUT FORMAT:

Summary:
(Give a simple 2-3 line explanation of where to start)

1) Choose Direction
Explain what the student should start with and why

2) Learn Basics (2-4 weeks)
Explain fundamentals:
- variables
- loops
- conditions
- functions

3) Practice Small Programs (2-3 weeks)
Give examples:
- calculator
- guessing game
- to-do list

4) Learn Core Concepts (3-5 weeks)
- data structures
- problem solving

5) Build Projects (4-6 weeks)
Give examples

6) Choose Specialization
Explain options:
- frontend
- backend
- AI
- etc.

7) Tools to Learn
- Git
- GitHub
- VS Code

8) 3-Month Plan
Month-wise breakdown

Final Advice:
Motivational + practical tips

----------------------------------

RULES:
- Use simple English
- Be structured and clean
- Be beginner-friendly
- Be practical (no theory overload)
- DO NOT ask questions

----------------------------------

AT THE END:

Return a VALID JSON roadmap like this:

{
  "name": "Beginner Programming Roadmap",
  "track": "Programming",
  "description": "Complete beginner roadmap",
  "tasks": [
    {
      "id": "task-1",
      "name": "Learn Basics",
      "description": "...",
      "estimatedTime": "2 weeks",
      "difficulty": "Beginner | Intermediate | Advanced",
      "category": "Fundamentals",
      "resources": [],
      "order": 1
    }
  ],
  "totalEstimatedTime": "3 months"
}

IMPORTANT:
- First give human-readable roadmap
- Then JSON
- JSON must be valid
- No extra text inside JSON

Additional constraints:
- Create a fully personalized roadmap from scratch (not static templates)
- Build step-by-step progression from beginner to advanced
- Exclude tasks already completed by the user

Dynamic input:
${JSON.stringify(
		{
			userMessage,
			conversationHistory: cleanHistory,
			mentorContext,
			completedTasks: completedTaskNames,
			preferences,
			currentTrack
		},
		null,
		2
	)}
`;

	return `${SYSTEM_PROMPT}\n\n${finalPrompt}`;
};

const buildChatPrompt = ({
	userMessage,
	completedTasks = [],
	preferences = {},
	currentTrack = '',
	conversationHistory = [],
	mentorContext = {}
}) => {
	const completedTaskNames = completedTasks.map((task) => task?.name).filter(Boolean);
	const cleanHistory = sanitizeConversationHistory(conversationHistory);

	return `${SYSTEM_PROMPT}

Return JSON only in this exact schema:
{
	"reply": "string",
	"needsMoreInfo": true,
	"followUpQuestions": ["string"],
	"detected": {
		"careerGoal": "string",
		"skillLevel": "Beginner | Intermediate | Advanced | Unknown",
		"interests": ["string"],
		"timeAvailability": "string"
	}
}

Rules:
- Be concise and actionable
- Ask follow-up questions when critical details are missing
- Consider completed tasks and preferences
- Ask only the most relevant next 1-3 questions based on what the student already shared
- Give practical guidance on what the student should do next
- If the user is a beginner/from scratch, provide a structured beginner path with clear numbered steps and an initial 3-month plan
- Return valid JSON only (no markdown, no extra text)

Dynamic input:
${JSON.stringify(
		{
			userMessage,
			conversationHistory: cleanHistory,
			mentorContext,
			completedTasks: completedTaskNames,
			preferences,
			currentTrack
		},
		null,
		2
	)}`;
};

export const getMentorChatResponse = async ({
	userMessage,
	completedTasks = [],
	preferences = {},
	currentTrack = '',
	conversationHistory = [],
	mentorContext = {}
}) => {
	const prompt = buildChatPrompt({
		userMessage,
		completedTasks,
		preferences,
		currentTrack,
		conversationHistory,
		mentorContext
	});

	try {
		const { provider, text } = await callWithFallback(prompt);
		const parsed = extractJsonFromText(text);

		if (!parsed || typeof parsed !== 'object') {
			throw new Error('Invalid AI chat JSON response');
		}

		const detected = {
			careerGoal: clampText(parsed?.detected?.careerGoal, ''),
			skillLevel: normalizeSkillLevel(clampText(parsed?.detected?.skillLevel, 'Unknown')),
			interests: Array.isArray(parsed?.detected?.interests)
				? parsed.detected.interests.map((item) => clampText(item)).filter(Boolean)
				: [],
			timeAvailability: clampText(parsed?.detected?.timeAvailability, '')
		};

		const mergedContext = mergeMentorContext(mentorContext, detected);
		const missingFields = getMissingProfileFields(mergedContext);
		const aiFollowUps = Array.isArray(parsed.followUpQuestions)
			? parsed.followUpQuestions.map((question) => clampText(question)).filter(Boolean)
			: [];
		const targetedFollowUps = buildTargetedFollowUps(missingFields);
		const mergedFollowUps = Array.from(new Set([...aiFollowUps, ...targetedFollowUps])).slice(0, 3);
		const beginnerIntent = isAbsoluteBeginnerIntent(userMessage);
		const finalReply = beginnerIntent
			? buildBeginnerGuidanceReply()
			: clampText(parsed.reply, 'Thanks for sharing. Tell me your target role and weekly time availability so I can personalize better.');

		return {
			provider,
			reply: finalReply,
			needsMoreInfo: missingFields.length > 0 || Boolean(parsed.needsMoreInfo),
			followUpQuestions: mergedFollowUps,
			detected,
			mentorContext: mergedContext,
			missingFields
		};
	} catch (error) {
		const mergedContext = mergeMentorContext(mentorContext, {});
		const missingFields = getMissingProfileFields(mergedContext);
		const beginnerIntent = isAbsoluteBeginnerIntent(userMessage);
		return {
			provider: 'fallback',
			reply: beginnerIntent
				? buildBeginnerGuidanceReply()
				: 'I can help. Please share your target role, current skill level, key interests, and weekly study hours so I can generate a personalized roadmap.',
			needsMoreInfo: true,
			followUpQuestions: buildTargetedFollowUps(missingFields),
			detected: {
				careerGoal: '',
				skillLevel: 'Unknown',
				interests: [],
				timeAvailability: ''
			},
			mentorContext: mergedContext,
			missingFields,
			error: error.message
		};
	}
};

export const generatePersonalizedRoadmap = async ({
	userMessage,
	completedTasks = [],
	preferences = {},
	currentTrack = '',
	conversationHistory = [],
	mentorContext = {},
	userId = ''
}) => {
	const completedTaskNames = completedTasks.map((task) => task?.name).filter(Boolean);
	const cleanHistory = sanitizeConversationHistory(conversationHistory);
	const dedupePayload = {
		userId,
		userMessage,
		conversationHistory: cleanHistory,
		mentorContext,
		completedTaskNames,
		preferences,
		currentTrack
	};

	const cacheKey = hashPayload(dedupePayload);
	const cached = getCachedRoadmap(cacheKey);
	if (cached) {
		return { ...cached, fromCache: true };
	}

	const prompt = buildRoadmapPrompt({
		userMessage,
		completedTasks,
		preferences,
		currentTrack,
		conversationHistory: cleanHistory,
		mentorContext
	});

	try {
		const { provider, text } = await callWithFallback(prompt, { jsonMode: false });
		const { roadmapJson, mentorExplanation } = extractRoadmapJsonAndNarrative(text);
		if (!roadmapJson || typeof roadmapJson !== 'object') {
			throw new Error('Invalid AI roadmap JSON response');
		}

		const roadmap = sanitizeRoadmap(roadmapJson, completedTaskNames);
		const payload = {
			provider,
			roadmap,
			mentorExplanation,
			fromCache: false
		};
		setCachedRoadmap(cacheKey, payload);
		return payload;
	} catch (error) {
		const fallbackRoadmap = buildFallbackRoadmap({ userMessage, preferences, currentTrack, completedTasks });
		const payload = {
			provider: 'fallback',
			roadmap: fallbackRoadmap,
			mentorExplanation: buildBeginnerGuidanceReply(),
			fromCache: false,
			error: error.message
		};
		setCachedRoadmap(cacheKey, payload);
		return payload;
	}
};
