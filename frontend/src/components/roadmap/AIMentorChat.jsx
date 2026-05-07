import React, { useMemo, useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api.js';
import { FiPaperclip, FiSend, FiExternalLink } from 'react-icons/fi';

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
	return text.replace(/\n{3,}/g, '\n\n').trim();
};

const unwrapReplyBlob = (value) => {
	if (typeof value !== 'string') return '';
	const trimmed = value.trim();
	if (!trimmed.startsWith('{')) return trimmed;

	try {
		const parsed = JSON.parse(trimmed);
		if (parsed && typeof parsed.reply === 'string') {
			return parsed.reply.trim();
		}
	} catch {
		// Keep original text if parsing fails.
	}

	return trimmed;
};

const renderMarkdownLine = (text, index) => {
	if (!text || typeof text !== 'string') return null;

	// Empty lines create spacing
	if (!text.trim()) {
		return <div key={index} className="h-2" />;
	}

	// Heading styles with generous spacing
	if (text.match(/^### /)) {
		return (
			<h3 key={index} className="text-lg font-bold text-cyan-300 mt-4 mb-3 pt-2">
				{renderInlineMarkdown(text.replace(/^### /, ''))}
			</h3>
		);
	}
	if (text.match(/^## /)) {
		return (
			<h2 key={index} className="text-xl font-bold text-cyan-200 mt-5 mb-3 pt-3 border-t border-gray-600">
				{renderInlineMarkdown(text.replace(/^## /, ''))}
			</h2>
		);
	}
	if (text.match(/^# /)) {
		return (
			<h1 key={index} className="text-2xl font-bold text-white mt-6 mb-4 pt-4 border-t border-gray-500">
				{renderInlineMarkdown(text.replace(/^# /, ''))}
			</h1>
		);
	}

	// Bullet points with better spacing
	if (text.match(/^[\s]*[-*+] /)) {
		return (
			<div key={index} className="flex gap-3 ml-2 my-1.5">
				<span className="text-cyan-400 font-bold flex-shrink-0 text-lg">•</span>
				<p className="text-gray-100 leading-relaxed">{renderInlineMarkdown(text.replace(/^[\s]*[-*+] /, ''))}</p>
			</div>
		);
	}

	// Numbered lists with better spacing
	if (text.match(/^[\s]*\d+\. /)) {
		const match = text.match(/^([\s]*)(\d+)\. (.*)/);
		if (match) {
			return (
				<div key={index} className="flex gap-3 ml-2 my-1.5">
					<span className="text-cyan-400 font-bold flex-shrink-0 w-8 text-base">{match[2]}.</span>
					<p className="text-gray-100 leading-relaxed">{renderInlineMarkdown(match[3])}</p>
				</div>
			);
		}
	}

	// Code block (inline)
	if (text.match(/^`[^`]/) && text.match(/[^`]`$/)) {
		return (
			<div key={index} className="my-3 p-3 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-sm font-mono text-green-400 overflow-x-auto">
				{text.replace(/`/g, '')}
			</div>
		);
	}

	// Regular paragraph with good spacing
	if (text.trim()) {
		return (
			<p key={index} className="text-gray-100 leading-relaxed my-1.5">
				{renderInlineMarkdown(text)}
			</p>
		);
	}

	return null;
};

const renderInlineMarkdown = (text) => {
	if (!text || typeof text !== 'string') return text;

	const parts = [];
	let lastIndex = 0;
	let partIndex = 0;

	// Bold text
	const boldRegex = /\*\*([^*]+)\*\*/g;
	const boldMatches = [...text.matchAll(boldRegex)];

	if (boldMatches.length > 0) {
		let tempText = text;
		let offset = 0;

		for (const match of boldMatches) {
			const beforeBold = tempText.substring(0, match.index - offset);
			if (beforeBold) {
				parts.push(
					<span key={`part-${partIndex++}`}>
						{beforeBold}
					</span>
				);
			}

			parts.push(
				<strong key={`bold-${partIndex++}`} className="text-white font-bold">
					{match[1]}
				</strong>
			);

			tempText = tempText.substring(match.index - offset + match[0].length);
		}

		if (tempText) {
			return [...parts, renderMessageWithLinks(tempText)];
		}

		return parts;
	}

	return renderMessageWithLinks(text);
};

const renderMessageWithLinks = (text) => {
	if (typeof text !== 'string') return text;

	// URL regex pattern - matches http, https, and common TLDs
	const urlRegex = /(https?:\/\/[^\s\])\)]+)/g;
	
	const parts = [];
	let lastIndex = 0;
	let matchIndex = 0;

	text.replace(urlRegex, (url, offset) => {
		// Add text before URL
		if (offset > lastIndex) {
			parts.push(
				<span key={`text-${matchIndex}`}>
					{text.substring(lastIndex, offset)}
				</span>
			);
		}

		// Add URL as clickable link
		const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
		parts.push(
			<a
				key={`link-${matchIndex}`}
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline transition-colors break-all"
				title={url}
			>
				{displayUrl}
				<FiExternalLink className="w-3 h-3 flex-shrink-0" />
			</a>
		);

		lastIndex = offset + url.length;
		matchIndex += 1;
		return url;
	});

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(
			<span key={`text-${matchIndex}`}>
				{text.substring(lastIndex)}
			</span>
		);
	}

	return parts.length > 0 ? parts : text;
};

const ResourcesCard = ({ url, tags = [] }) => {
	const displayTitle = url.replace(/https?:\/\//, '').split('/')[0];
	const isLearning = tags.includes('Learning');
	const isPractice = tags.includes('Practice');
	const isFree = tags.includes('Free');
	const isPaid = tags.includes('Paid');
	
	const typeIcon = isLearning ? '📚' : isPractice ? '🎯' : '🌐';
	const priceIcon = isFree ? '✨' : isPaid ? '💳' : '';
	
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-start gap-3 p-3 bg-gray-800 border border-cyan-500/30 rounded-lg hover:bg-gray-750 hover:border-cyan-400 transition-all group"
		>
			<div className="flex gap-1 text-lg flex-shrink-0">
				<span>{typeIcon}</span>
				{priceIcon && <span>{priceIcon}</span>}
			</div>
			<div className="flex-1 min-w-0">
				<div className="text-cyan-400 font-medium text-sm truncate group-hover:text-cyan-300 transition-colors">
					{displayTitle}
				</div>
				<div className="text-gray-400 text-xs truncate">{url}</div>
				<div className="flex gap-2 mt-2 flex-wrap">
					{isLearning && <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">Learning</span>}
					{isPractice && <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded">Practice</span>}
					{isFree && <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">Free</span>}
					{isPaid && <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded">Paid</span>}
				</div>
			</div>
			<FiExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
		</a>
	);
};

const parseResourcesWithTags = (text) => {
	const resourceRegex = /Resources?\s*:?\s*\n([\s\S]*?)(?:\n\n|Step \d|$)/i;
	const match = text.match(resourceRegex);
	
	if (!match) return null;
	
	const resourceText = match[1];
	const urlWithTagsRegex = /(\[(\w+)\]\[?(\w+)?\]?\s*)?\s*(https?:\/\/[^\s)\]]+)/g;
	const resources = [];
	let urlMatch;
	
	while ((urlMatch = urlWithTagsRegex.exec(resourceText)) !== null) {
		const tag1 = urlMatch[2];
		const tag2 = urlMatch[3];
		const url = urlMatch[4];
		
		const tags = [];
		if (tag1) tags.push(tag1);
		if (tag2) tags.push(tag2);
		
		if (tags.length === 0) {
			if (url.includes('github') || url.includes('lab') || url.includes('challenge')) {
				tags.push('Practice');
			} else {
				tags.push('Learning');
			}
			if (!url.includes('paid') && !url.includes('premium')) {
				tags.push('Free');
			}
		}
		
		resources.push({ url, tags });
	}
	
	return resources.length > 0 ? resources : null;
};

const ResourcesSection = ({ resources }) => {
	if (!resources || resources.length === 0) return null;
	
	const learning = resources.filter(r => r.tags.includes('Learning'));
	const practicing = resources.filter(r => r.tags.includes('Practice'));
	const free = resources.filter(r => r.tags.includes('Free'));
	const paid = resources.filter(r => r.tags.includes('Paid'));
	
	return (
		<div className="space-y-5">
			<div className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-4">
				📚 Learning & Practice Resources
			</div>
			
			{learning.length > 0 && (
				<div className="space-y-3">
					<div className="text-xs font-medium text-blue-300 mb-3 flex items-center gap-1.5">
						📖 Learning Resources
					</div>
					<div className="space-y-3 ml-1">
						{learning.map((resource, idx) => (
							<ResourcesCard key={`learn-${idx}`} url={resource.url} tags={resource.tags} />
						))}
					</div>
				</div>
			)}
			
			{practicing.length > 0 && (
				<div className="space-y-3">
					<div className="text-xs font-medium text-green-300 mb-3 flex items-center gap-1.5">
						🎯 Practice Resources
					</div>
					<div className="space-y-3 ml-1">
						{practicing.map((resource, idx) => (
							<ResourcesCard key={`prac-${idx}`} url={resource.url} tags={resource.tags} />
						))}
					</div>
				</div>
			)}
			
			{free.length > 0 && paid.length > 0 && (
				<div className="text-xs text-gray-400 flex items-center gap-3 pt-3 border-t border-gray-600 mt-4">
					<span>✨ {free.length} free</span>
					<span>•</span>
					<span>💳 {paid.length} paid option</span>
				</div>
			)}
		</div>
	);
};

const MessageContent = ({ text, role }) => {
	if (role !== 'assistant') {
		return <p className="text-gray-100 leading-relaxed">{text}</p>;
	}

	const resources = parseResourcesWithTags(text);
	const lines = text.split('\n');
	
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				{lines.map((line, index) => renderMarkdownLine(line, index)).filter(Boolean)}
			</div>
			
			{resources && (
				<div className="mt-4 pt-4 border-t border-gray-600">
					<ResourcesSection resources={resources} />
				</div>
			)}
		</div>
	);
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
					unwrapReplyBlob(response.reply),
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

<div ref={messagesRef} className="flex-1 overflow-y-auto bg-gray-900/70 rounded-lg p-5 border border-gray-700 space-y-5 scroll-smooth">
			{messages.map((message, index) =>
				message.role === 'assistant' ? (
					<div key={`assistant-${index}`} className="flex items-start gap-4 animate-fadeIn">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">🤖</div>
						<div className="bg-gray-800 border border-gray-600 text-gray-100 px-5 py-4 rounded-xl max-w-[75%] text-sm shadow-lg hover:border-cyan-500/50 transition-colors">
							<MessageContent text={message.content} role="assistant" />
						</div>
					</div>
				) : (
					<div key={`user-${index}`} className="flex items-start gap-4 justify-end">
						<div className="max-w-[75%] bg-gradient-to-br from-blue-600 to-blue-700 text-white px-5 py-4 rounded-xl text-sm shadow-lg">{message.content}</div>
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 shadow-lg">👤</div>
					</div>
				)
			)}

			{isChatting && (
				<div className="flex items-start gap-4 animate-fadeIn">
					<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">🤖</div>
					<div className="bg-gray-800 border border-gray-600 text-gray-100 px-5 py-4 rounded-xl max-w-[50%] text-sm">
						<div className="flex items-center gap-3">
								<span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
								<span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.12s' }} />
								<span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.24s' }} />
							</div>
						</div>
					</div>
				)}
			</div>

<div className={`mt-5 flex items-center gap-3 ${!hasUserMessages ? 'justify-center' : ''}`}>
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
					className="w-full resize-none bg-gray-900 text-white rounded-full px-5 py-3 pr-12 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					disabled={isChatting || isGenerating}
				/>
				<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors" aria-hidden>
					<FiPaperclip />
				</button>
			</div>

			<button
				onClick={handleSend}
				disabled={!input.trim() || isChatting || isGenerating}
				className="p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 disabled:opacity-60 text-white rounded-full transition-colors shadow-lg hover:shadow-cyan-500/50"
			>
				{isChatting ? '...' : <FiSend />}
			</button>
		</div>

		<div className="mt-5 pt-4 border-t border-gray-600 text-xs text-gray-400 space-y-2">
			<div className="flex items-center gap-3 flex-wrap">
				<span className="font-medium text-gray-300">Context:</span>
				<span className="px-2 py-1 bg-gray-700/50 rounded">{mentorContext.careerGoal ? '✓ Goal' : '○ Goal'}</span>
				<span className="px-2 py-1 bg-gray-700/50 rounded">{mentorContext.skillLevel && mentorContext.skillLevel !== 'Unknown' ? '✓ Level' : '○ Level'}</span>
				<span className="px-2 py-1 bg-gray-700/50 rounded">{mentorContext.interests?.length ? '✓ Interests' : '○ Interests'}</span>
				<span className="px-2 py-1 bg-gray-700/50 rounded">{mentorContext.timeAvailability ? '✓ Time' : '○ Time'}</span>
			</div>
			</div>

			{error && <p className="mt-3 text-sm text-red-400">{error}</p>}
		</div>
	);
};

export default AIMentorChat;
