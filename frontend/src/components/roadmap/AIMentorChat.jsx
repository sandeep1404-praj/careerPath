import React, { useMemo, useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api.js';
import { FiPaperclip, FiSend } from 'react-icons/fi';

const defaultMentorContext = {
	careerGoal: '',
	skillLevel: 'Unknown',
	interests: [],
	timeAvailability: ''
};

const defaultMessages = [
	{
		role: 'assistant',
		content:
			'Tell me your target role, current level, interests (frontend/backend/AI/etc.), and how many hours/week you can commit.'
	}
];

const formatAssistantText = (text = '') => {
	if (typeof text !== 'string') return '';

	return text
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/^#{1,6}\s*/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
};

const sanitizeMessages = (messages) => {
	if (!Array.isArray(messages)) return defaultMessages;

	const normalizedMessages = messages
		.filter((message) => message && typeof message === 'object')
		.map((message) => ({
			role: message.role,
			content: typeof message.content === 'string' ? message.content.trim() : ''
		}))
		.filter((message) => (message.role === 'user' || message.role === 'assistant') && message.content);

	return normalizedMessages.length > 0 ? normalizedMessages : defaultMessages;
};

const sanitizeMentorContext = (mentorContext) => {
	if (!mentorContext || typeof mentorContext !== 'object') {
		return { ...defaultMentorContext };
	}

	return {
		...defaultMentorContext,
		...mentorContext,
		interests: Array.isArray(mentorContext.interests)
			? mentorContext.interests.filter((interest) => typeof interest === 'string' && interest.trim())
			: []
	};
};

const AIMentorChat = ({ token, onRoadmapGenerated, seedConversation, conversationVersion, onConversationChange, sessionId = null, sessionContext = null }) => {
	const [messages, setMessages] = useState(() => sanitizeMessages(seedConversation?.messages));
	const [input, setInput] = useState('');
	const [isChatting, setIsChatting] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState('');
	const [mentorContext, setMentorContext] = useState(() => sanitizeMentorContext(seedConversation?.mentorContext));

	const lastUserMessage = useMemo(() => {
		const userMessages = messages.filter((message) => message.role === 'user');
		if (userMessages.length === 0) return '';
		return userMessages[userMessages.length - 1].content;
	}, [messages]);

	const messagesRef = useRef(null);

	const hasUserMessages = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);

	useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [messages, isChatting]);

	useEffect(() => {
		setMessages(sanitizeMessages(seedConversation?.messages));
		setMentorContext(sanitizeMentorContext(seedConversation?.mentorContext));
		setInput('');
		setError('');
		setIsChatting(false);
		setIsGenerating(false);
	}, [conversationVersion]);

	useEffect(() => {
		onConversationChange?.({
			messages: sanitizeMessages(messages),
			mentorContext: sanitizeMentorContext(mentorContext),
			updatedAt: Date.now()
		});
	}, [messages, mentorContext, onConversationChange]);

	const combinedContext = useMemo(() => {
		return messages
			.filter((message) => message.role === 'user')
			.map((message) => message.content)
			.join('\n');
	}, [messages]);

	const handleSend = async () => {
		const userMessage = input.trim();
		if (!userMessage || isChatting || !token) return;

		setError('');
		const updatedMessages = [...messages, { role: 'user', content: userMessage }];
		setMessages(updatedMessages);
		setInput('');
		setIsChatting(true);

		try {
			const chatPayload = {
				userMessage,
				messages: updatedMessages,
				mentorContext,
				sessionId: sessionId || undefined
			};

			// Add session context if available
			if (sessionContext?.pastSummary) {
				chatPayload.pastSummary = sessionContext.pastSummary;
			}

			const response = await aiAPI.chatMentor(chatPayload, token);

			const followUps = Array.isArray(response.followUpQuestions)
				? response.followUpQuestions
						.map((question, index) => `${index + 1}. ${question}`)
						.join('\n')
				: '';

			const assistantText = formatAssistantText(
				[
					response.reply,
					followUps ? `Next questions:\n${followUps}` : ''
				].filter(Boolean).join('\n\n')
			);

			if (response.mentorContext && typeof response.mentorContext === 'object') {
				setMentorContext(sanitizeMentorContext(response.mentorContext));
			}

			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: assistantText || 'Share more details and I will personalize your roadmap.'
				}
			]);
		} catch (apiError) {
			setError(apiError.message || 'Failed to send message to AI mentor');
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'I had trouble responding. Please try again with your goal and weekly availability.'
				}
			]);
		} finally {
			setIsChatting(false);
		}
	};

	const handleGenerateRoadmap = async () => {
		if (isGenerating || !token) return;

		const userMessage = (combinedContext || lastUserMessage || '').trim();
		if (!userMessage) {
			setError('Please describe your goal before generating a roadmap.');
			return;
		}

		setError('');
		setIsGenerating(true);

		try {
			const response = await aiAPI.generateRoadmap({
				userMessage,
				messages,
				mentorContext
			}, token);
			if (response?.roadmap) {
				onRoadmapGenerated?.({
					roadmap: response.roadmap,
					mentorExplanation: response.mentorExplanation,
					provider: response.provider,
					fromCache: response.fromCache,
					error: response.error
				});
			}
		} catch (apiError) {
			setError(apiError.message || 'Failed to generate roadmap');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 flex flex-col h-[calc(100vh-240px)] min-h-[1060px]">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-white">AI Career Mentor</h3>
				<button
					onClick={handleGenerateRoadmap}
					disabled={isGenerating || isChatting}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white text-sm rounded-lg transition-colors"
				>
					{isGenerating ? 'Generating...' : 'Generate Roadmap'}
				</button>
			</div>

			<div ref={messagesRef} className="flex-1 overflow-y-auto bg-gray-900/70 rounded-lg p-4 border border-gray-700 space-y-4">
				{messages.map((message, index) =>
					message.role === 'assistant' ? (
						<div key={`assistant-${index}`} className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-200">🤖</div>
							<div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-xl max-w-[75%] whitespace-pre-wrap text-sm">{message.content}</div>
						</div>
					) : (
						<div key={`user-${index}`} className="flex items-start gap-3 justify-end">
							<div className="max-w-[75%] bg-blue-600 text-white px-4 py-3 rounded-xl whitespace-pre-wrap text-sm">{message.content}</div>
							<div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs text-white">You</div>
						</div>
					)
					)}

					{isChatting && (
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-200">🤖</div>
							<div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-xl max-w-[50%] text-sm">
								<div className="flex items-center gap-2">
									<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
									<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.12s' }} />
									<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.24s' }} />
								</div>
							</div>
						</div>
					)}
			</div>

			<div className={`mt-4 flex items-center gap-2 ${!hasUserMessages ? 'justify-center' : ''}`}>
				<div className={`${hasUserMessages ? 'flex-1' : 'w-3/4'} relative`}>
					<textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && !event.shiftKey) {
								event.preventDefault();
								handleSend();
							}
						}}
						placeholder="Type your goal, interests, and availability... (Shift+Enter for newline)"
						className="w-full resize-none bg-gray-900 text-white rounded-full px-4 py-3 pr-12 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isChatting || isGenerating}
					/>
					<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
						<FiPaperclip />
					</button>
				</div>

				<button
					onClick={handleSend}
					disabled={!input.trim() || isChatting || isGenerating}
					className="p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 disabled:opacity-60 text-white rounded-full transition-colors"
				>
					{isChatting ? '...' : <FiSend />}
				</button>
			</div>

			<div className="mt-3 text-xs text-gray-400">
				<span>Context: </span>
				<span>{mentorContext.careerGoal ? 'Goal ✓' : 'Goal ○'}</span>
				<span className="mx-2">•</span>
				<span>{mentorContext.skillLevel && mentorContext.skillLevel !== 'Unknown' ? 'Level ✓' : 'Level ○'}</span>
				<span className="mx-2">•</span>
				<span>{mentorContext.interests?.length ? 'Interests ✓' : 'Interests ○'}</span>
				<span className="mx-2">•</span>
				<span>{mentorContext.timeAvailability ? 'Time ✓' : 'Time ○'}</span>
			</div>

			{error && <p className="mt-3 text-sm text-red-400">{error}</p>}
		</div>
	);
};

export default AIMentorChat;
