import crypto from 'node:crypto';
import UserRoadmap from '../models/UserRoadmap.js';
import ChatSession from '../models/ChatSession.js';
import UserProfileMemory from '../models/UserProfileMemory.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generatePersonalizedRoadmap, getMentorChatResponse } from '../services/aiService.js';
import { summarizeConversation, buildSessionContext } from '../services/conversationSummarizer.js';

const getUserContext = async (userId) => {
	let userRoadmap = await UserRoadmap.findOne({ userId });
	if (!userRoadmap) {
		userRoadmap = new UserRoadmap({
			userId,
			tasks: [],
			roadmaps: [],
			preferences: { defaultTrack: '', showCompleted: true, sortBy: 'order' },
			stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 }
		});
		await userRoadmap.save();
	}

	const completedTasks = userRoadmap.tasks.filter((task) => task.status === 'completed');
	return {
		userRoadmap,
		completedTasks,
		preferences: userRoadmap.preferences || {},
		currentTrack: userRoadmap.preferences?.defaultTrack || ''
	};
};

const getOrCreateChatSession = async (userId, sessionId) => {
	let session = await ChatSession.findOne({ sessionId, userId });
	if (!session) {
		session = new ChatSession({
			userId,
			sessionId,
			messages: [],
			sessionContext: {},
			isActive: true
		});
		await session.save();
	}
	return session;
};

const getSessionContextData = async (userId) => {
	// Get the most recent active session with messages
	const recentSession = await ChatSession.findOne(
		{ userId, isActive: true, messageCount: { $gt: 0 } },
		{},
		{ sort: { updatedAt: -1 } }
	);

	if (!recentSession) {
		return { summary: null, recentMessages: [], pastSummary: null };
	}

	// Get recent messages (last 6 messages for context)
	const recentMessages = recentSession.messages.slice(-6);

	// Get summary if available
	let pastSummary = recentSession.summary;

	// If more than 10 messages and no summary yet, create one
	if (recentSession.messages.length > 10 && !pastSummary) {
		pastSummary = await summarizeConversation(
			recentSession.messages,
			recentSession.sessionContext?.careerGoal
		);
		if (pastSummary) {
			recentSession.summary = pastSummary;
			recentSession.lastSummarizedAt = Date.now();
			await recentSession.save();
		}
	}

	return {
		summary: recentSession,
		recentMessages,
		pastSummary
	};
};

const updateUserProfileMemory = async (userId, mentorContext) => {
	let profileMemory = await UserProfileMemory.findOne({ userId });

	if (!profileMemory) {
		profileMemory = new UserProfileMemory({
			userId,
			careerGoals: [],
			skillLevel: 'Beginner',
			interests: [],
			timeAvailability: '',
			learningPreferences: {
				pace: 'moderate',
				learningStyle: [],
				preferredRoadmapLength: 'medium'
			},
			completedRoadmaps: [],
			preferences: {},
			keyAchievements: []
		});
	}

	// Update profile based on mentor context
	if (mentorContext.careerGoal && !profileMemory.careerGoals.includes(mentorContext.careerGoal)) {
		profileMemory.careerGoals.push(mentorContext.careerGoal);
	}

	if (mentorContext.skillLevel) {
		profileMemory.skillLevel = mentorContext.skillLevel;
	}

	if (mentorContext.interests?.length > 0) {
		profileMemory.interests = [
			...new Set([...profileMemory.interests, ...mentorContext.interests])
		];
	}

	if (mentorContext.timeAvailability) {
		profileMemory.timeAvailability = mentorContext.timeAvailability;
	}

	profileMemory.lastUpdated = Date.now();
	await profileMemory.save();

	return profileMemory;
};

export const chatWithMentor = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const { userMessage, messages = [], mentorContext = {}, sessionId = null } = req.body;
	if (!userMessage || typeof userMessage !== 'string') {
		throw new AppError('userMessage is required', 400);
	}

	const conversationHistory = Array.isArray(messages)
		? messages
				.map((message) => ({
					role: message?.role === 'assistant' ? 'assistant' : 'user',
					content: typeof message?.content === 'string' ? message.content : ''
				}))
				.filter((message) => message.content.trim())
		: [];

	// Get or create session
	const finalSessionId = sessionId || `session-${userId}-${Date.now()}`;
	const chatSession = await getOrCreateChatSession(userId, finalSessionId);

	// Get session context data (past summary + recent messages)
	const { pastSummary } = await getSessionContextData(userId);

	// Update user profile memory
	await updateUserProfileMemory(userId, mentorContext);

	const { completedTasks, preferences, currentTrack } = await getUserContext(userId);

	// Build enriched context with session history
	const enrichedContext = await buildSessionContext(
		conversationHistory.slice(-4), // Recent messages
		pastSummary,
		mentorContext
	);

	const result = await getMentorChatResponse({
		userMessage,
		completedTasks,
		preferences,
		currentTrack,
		conversationHistory,
		mentorContext,
		enrichedContext
	});

	// Store message in chat session
	chatSession.messages.push({
		role: 'user',
		content: userMessage,
		timestamp: new Date()
	});

	chatSession.messages.push({
		role: 'assistant',
		content: result.reply,
		timestamp: new Date()
	});

	chatSession.sessionContext = mentorContext;
	await chatSession.save();

	res.json({
		success: true,
		sessionId: finalSessionId,
		...result
	});
});

export const generateRoadmapPreview = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const {
		userMessage,
		messages = [],
		mentorContext = {},
		preferences: preferenceOverride,
		currentTrack: currentTrackOverride
	} = req.body;

	const conversationHistory = Array.isArray(messages)
		? messages
				.map((message) => ({
					role: message?.role === 'assistant' ? 'assistant' : 'user',
					content: typeof message?.content === 'string' ? message.content : ''
				}))
				.filter((message) => message.content.trim())
		: [];

	const inferredUserMessage = typeof userMessage === 'string' && userMessage.trim()
		? userMessage.trim()
		: conversationHistory
				.filter((message) => message.role === 'user')
				.map((message) => message.content)
				.join('\n')
				.trim();

	if (!inferredUserMessage) {
		throw new AppError('userMessage is required', 400);
	}

	const { completedTasks, preferences, currentTrack } = await getUserContext(userId);

	const result = await generatePersonalizedRoadmap({
		userId: String(userId),
		userMessage: inferredUserMessage,
		completedTasks,
		preferences: preferenceOverride || preferences,
		currentTrack: currentTrackOverride || currentTrack,
		conversationHistory,
		mentorContext
	});

	res.json({
		success: true,
		provider: result.provider,
		fromCache: result.fromCache,
		mentorExplanation: result.mentorExplanation || '',
		roadmap: result.roadmap,
		error: result.error || null
	});
});

export const acceptGeneratedRoadmap = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const { roadmap } = req.body;
	if (!roadmap || typeof roadmap !== 'object' || !Array.isArray(roadmap.tasks) || roadmap.tasks.length === 0) {
		throw new AppError('Valid roadmap with tasks is required', 400);
	}

	let userRoadmap = await UserRoadmap.findOne({ userId });
	if (!userRoadmap) {
		userRoadmap = new UserRoadmap({
			userId,
			tasks: [],
			roadmaps: [],
			preferences: { defaultTrack: '', showCompleted: true, sortBy: 'order' },
			stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 }
		});
	}

	const completedTaskNames = new Set(
		userRoadmap.tasks
			.filter((task) => task.status === 'completed')
			.map((task) => (task.name || '').toLowerCase())
			.filter(Boolean)
	);

	const roadmapId = `ai-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
	const maxOrder = userRoadmap.tasks.length > 0
		? Math.max(...userRoadmap.tasks.map((task) => task.order || 0))
		: 0;

	const tasksToInsert = roadmap.tasks
		.filter((task) => task?.name && !completedTaskNames.has(String(task.name).toLowerCase()))
		.map((task, index) => ({
			taskId: `${roadmapId}_${task.id || index + 1}`,
			name: String(task.name),
			description: task.description ? String(task.description) : '',
			status: 'not-started',
			isCustom: true,
			staticTaskId: undefined,
			roadmapTrack: String(roadmap.track || 'Custom Track'),
			roadmapId,
			estimatedTime: task.estimatedTime ? String(task.estimatedTime) : '1 week',
			difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(task.difficulty)
				? task.difficulty
				: 'Beginner',
			category: task.category ? String(task.category) : 'General',
			resources: Array.isArray(task.resources)
				? task.resources.map((resource) => ({
						title: resource?.title ? String(resource.title) : 'Learning Resource',
						url: resource?.url ? String(resource.url) : '',
						type: ['video', 'article', 'course', 'practice'].includes(resource?.type)
							? resource.type
							: 'article'
					}))
				: [],
			order: maxOrder + index + 1,
			addedAt: new Date(),
			updatedAt: new Date()
		}));

	if (tasksToInsert.length === 0) {
		throw new AppError('All generated tasks are already completed or invalid', 400);
	}

	userRoadmap.tasks.push(...tasksToInsert);
	if (!Array.isArray(userRoadmap.roadmaps)) {
		userRoadmap.roadmaps = [];
	}

	userRoadmap.roadmaps.push({
		roadmapId,
		name: String(roadmap.name || 'AI Personalized Roadmap'),
		track: String(roadmap.track || 'Custom Track'),
		taskCount: tasksToInsert.length,
		dateAdded: new Date()
	});

	userRoadmap.stats = {
		totalTasks: userRoadmap.tasks.length,
		completedTasks: userRoadmap.tasks.filter((task) => task.status === 'completed').length,
		inProgressTasks: userRoadmap.tasks.filter((task) => task.status === 'in-progress').length
	};

	await userRoadmap.save();

	res.status(201).json({
		success: true,
		message: 'AI roadmap accepted and saved successfully',
		roadmapId,
		tasksAdded: tasksToInsert.length,
		stats: userRoadmap.stats
	});
});

export const getSessionContext = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const { pastSummary, recentMessages, summary } = await getSessionContextData(userId);

	res.json({
		success: true,
		sessionContext: {
			pastSummary,
			recentMessages: recentMessages.map((msg) => ({
				role: msg.role,
				content: msg.content
			})),
			lastUpdated: summary?.updatedAt || null,
			messageCount: summary?.messageCount || 0
		}
	});
});

export const getUserProfileMemory = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	let profileMemory = await UserProfileMemory.findOne({ userId });

	if (!profileMemory) {
		profileMemory = new UserProfileMemory({
			userId,
			careerGoals: [],
			skillLevel: 'Beginner',
			interests: [],
			timeAvailability: '',
			learningPreferences: {
				pace: 'moderate',
				learningStyle: [],
				preferredRoadmapLength: 'medium'
			},
			completedRoadmaps: [],
			preferences: {},
			keyAchievements: []
		});
		await profileMemory.save();
	}

	res.json({
		success: true,
		profileMemory
	});
});

export const deleteChatSession = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const { sessionId } = req.params;
	if (!sessionId || typeof sessionId !== 'string') {
		throw new AppError('sessionId is required', 400);
	}

	// Verify the session belongs to the user
	const session = await ChatSession.findOne({ sessionId, userId });
	if (!session) {
		throw new AppError('Chat session not found or unauthorized', 404);
	}

	await ChatSession.deleteOne({ sessionId, userId });

	res.json({
		success: true,
		message: 'Chat session deleted successfully'
	});
});

export const deleteAllChatSessions = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const result = await ChatSession.deleteMany({ userId });

	res.json({
		success: true,
		message: `${result.deletedCount} chat session(s) deleted successfully`,
		deletedCount: result.deletedCount
	});
});
