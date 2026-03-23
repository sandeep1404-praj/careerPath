import crypto from 'node:crypto';
import UserRoadmap from '../models/UserRoadmap.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generatePersonalizedRoadmap, getMentorChatResponse } from '../services/aiService.js';

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

export const chatWithMentor = asyncHandler(async (req, res) => {
	const userId = req.user?._id || req.user?.id;
	if (!userId) {
		throw new AppError('User authentication failed', 401);
	}

	const { userMessage, messages = [], mentorContext = {} } = req.body;
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

	const { completedTasks, preferences, currentTrack } = await getUserContext(userId);

	const result = await getMentorChatResponse({
		userMessage,
		completedTasks,
		preferences,
		currentTrack,
		conversationHistory,
		mentorContext
	});

	res.json({
		success: true,
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
