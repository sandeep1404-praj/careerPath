import React, { useMemo, useState } from 'react';
import { aiAPI } from '../../services/api.js';

const formatAssistantText = (text = '') => {
	if (typeof text !== 'string') return '';

	return text
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/^#{1,6}\s*/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
};

const AIMentorChat = ({ token, onRoadmapGenerated }) => {
	const [messages, setMessages] = useState([
		{
			role: 'assistant',
			content:
				'Tell me your target role, current level, interests (frontend/backend/AI/etc.), and how many hours/week you can commit.'
		}
	]);
	const [input, setInput] = useState('');
	const [isChatting, setIsChatting] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState('');
	const [mentorContext, setMentorContext] = useState({
		careerGoal: '',
		skillLevel: 'Unknown',
		interests: [],
		timeAvailability: ''
	});

	const lastUserMessage = useMemo(() => {
		const userMessages = messages.filter((message) => message.role === 'user');
		if (userMessages.length === 0) return '';
		return userMessages[userMessages.length - 1].content;
	}, [messages]);

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
			const response = await aiAPI.chatMentor({
				userMessage,
				messages: updatedMessages,
				mentorContext
			}, token);

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
				setMentorContext(response.mentorContext);
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
		<div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
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

			<div className="h-72 overflow-y-auto bg-gray-900/70 rounded-lg p-3 border border-gray-700 space-y-3">
				{messages.map((message, index) => (
					<div
						key={`${message.role}-${index}`}
						className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
							message.role === 'user'
								? 'bg-blue-600 text-white ml-auto'
								: 'bg-gray-700 text-gray-100'
						}`}
					>
						{message.content}
					</div>
				))}
			</div>

			<div className="mt-4 flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') handleSend();
					}}
					placeholder="Type your goal, interests, and availability..."
					className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					disabled={isChatting || isGenerating}
				/>
				<button
					onClick={handleSend}
					disabled={!input.trim() || isChatting || isGenerating}
					className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-60 text-white rounded-lg transition-colors"
				>
					{isChatting ? 'Sending...' : 'Send'}
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
