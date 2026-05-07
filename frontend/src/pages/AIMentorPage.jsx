import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import AIMentorChat from '@/components/roadmap/AIMentorChat';
import RoadmapPreview from '@/components/roadmap/RoadmapPreview';
import { aiAPI } from '@/services/api';
import toast from '@/utils/toast';

const CHAT_HISTORY_STORAGE_KEY = 'careerpath.ai-mentor.chat-history.v1';
const SESSION_ID_STORAGE_KEY = 'careerpath.ai-mentor.session-id.v1';
const SESSION_CONTEXT_STORAGE_KEY = 'careerpath.ai-mentor.session-context.v1';
const MAX_CHAT_HISTORY = 12;

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && typeof message === 'object')
    .map((message) => ({
      role: message.role,
      content: typeof message.content === 'string' ? message.content.trim() : ''
    }))
    .filter((message) => (message.role === 'assistant' || message.role === 'user') && message.content);
};

const sanitizeMentorContext = (mentorContext) => {
  if (!mentorContext || typeof mentorContext !== 'object') {
    return {
      careerGoal: '',
      skillLevel: 'Unknown',
      interests: [],
      timeAvailability: ''
    };
  }

  return {
    careerGoal: typeof mentorContext.careerGoal === 'string' ? mentorContext.careerGoal : '',
    skillLevel: typeof mentorContext.skillLevel === 'string' ? mentorContext.skillLevel : 'Unknown',
    interests: Array.isArray(mentorContext.interests)
      ? mentorContext.interests.filter((interest) => typeof interest === 'string' && interest.trim())
      : [],
    timeAvailability: typeof mentorContext.timeAvailability === 'string' ? mentorContext.timeAvailability : ''
  };
};

const buildHistoryTitle = (messages) => {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content || '';
  if (!firstUserMessage) return 'Career mentoring chat';
  if (firstUserMessage.length <= 56) return firstUserMessage;
  return `${firstUserMessage.slice(0, 56).trimEnd()}...`;
};

const formatHistoryTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Recently updated';

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const loadCachedHistory = () => {
  if (typeof window === 'undefined') return [];

  try {
    const rawHistory = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!rawHistory) return [];

    const parsedHistory = JSON.parse(rawHistory);
    if (!Array.isArray(parsedHistory)) return [];

    return parsedHistory
      .map((session) => {
        const messages = sanitizeMessages(session?.messages);
        if (messages.length === 0) return null;

        return {
          id: typeof session.id === 'string' && session.id ? session.id : createSessionId(),
          title: typeof session.title === 'string' && session.title ? session.title : buildHistoryTitle(messages),
          updatedAt: typeof session.updatedAt === 'number' ? session.updatedAt : Date.now(),
          messages,
          mentorContext: sanitizeMentorContext(session?.mentorContext)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CHAT_HISTORY);
  } catch (error) {
    return [];
  }
};

const formatMentorGuidance = (text = '') => {
  if (typeof text !== 'string') return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const starterPrompts = [
  'I want a frontend developer roadmap',
  'I want guidance for AI/ML vs web development',
  'I am a beginner and do not know what to do'
];

const mentorHighlights = [
  {
    title: 'Direct guidance',
    description: 'Get clear advice on career direction, skill gaps, and next steps without long theory.'
  },
  {
    title: 'Structured roadmap',
    description: 'Receive step-by-step learning plans with tools, projects, and weekly progression.'
  },
  {
    title: 'Minimal questions',
    description: 'The mentor only asks follow-ups when your goal, level, or availability is unclear.'
  }
];

const AIMentorPage = () => {
  const { token } = useAuth();
  const { loadUserRoadmap } = useRoadmap();
  const [activeSessionId, setActiveSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
      if (stored) return stored;
    }
    return createSessionId();
  });
  const [chatSeed, setChatSeed] = useState(null);
  const [chatVersion, setChatVersion] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [expandedHistorySessionId, setExpandedHistorySessionId] = useState(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [mentorExplanation, setMentorExplanation] = useState('');
  const [aiMeta, setAiMeta] = useState({ provider: '', fromCache: false, error: '' });
  const [isAcceptingAiRoadmap, setIsAcceptingAiRoadmap] = useState(false);
  const [sessionContext, setSessionContext] = useState(null);

  useEffect(() => {
    const cachedHistory = loadCachedHistory();
    if (cachedHistory.length === 0) return;

    const latestSession = cachedHistory[0];
    setChatHistory(cachedHistory);
    setActiveSessionId(latestSession.id);
    setChatSeed({
      messages: latestSession.messages,
      mentorContext: latestSession.mentorContext
    });
    setChatVersion((previousVersion) => previousVersion + 1);
  }, []);

  // Fetch session context from server
  useEffect(() => {
    if (!token) return;

    const fetchSessionContext = async () => {
      try {
        const response = await aiAPI.getSessionContext(token);
        if (response.success && response.sessionContext) {
          setSessionContext(response.sessionContext);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(SESSION_CONTEXT_STORAGE_KEY, JSON.stringify(response.sessionContext));
          }
        }
      } catch (error) {
        console.error('Failed to fetch session context:', error);
        // Try to load from localStorage as fallback
        if (typeof window !== 'undefined') {
          const cached = window.localStorage.getItem(SESSION_CONTEXT_STORAGE_KEY);
          if (cached) {
            try {
              setSessionContext(JSON.parse(cached));
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    };

    fetchSessionContext();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSessionContext, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
      window.localStorage.setItem(SESSION_ID_STORAGE_KEY, activeSessionId);
    } catch (error) {
      // Ignore storage write failures (private mode, quota limits, etc.)
    }
  }, [chatHistory, activeSessionId]);

  const handleGeneratedRoadmap = ({ roadmap, mentorExplanation: readablePlan, provider, fromCache, error }) => {
    setGeneratedRoadmap(roadmap || null);
    setMentorExplanation(readablePlan || '');
    setAiMeta({
      provider: provider || '',
      fromCache: Boolean(fromCache),
      error: error || ''
    });
  };

  const handleAcceptAiRoadmap = async () => {
    if (!token || !generatedRoadmap) return;

    setIsAcceptingAiRoadmap(true);
    try {
      const response = await aiAPI.acceptRoadmap({ roadmap: generatedRoadmap }, token);
      await loadUserRoadmap();
      toast.success(response.message || 'AI roadmap saved successfully');
      setGeneratedRoadmap(null);
      setMentorExplanation('');
    } catch (acceptError) {
      toast.error(acceptError.message || 'Failed to save AI roadmap');
    } finally {
      setIsAcceptingAiRoadmap(false);
    }
  };

  const handleNewSession = () => {
    setGeneratedRoadmap(null);
    setMentorExplanation('');
    setAiMeta({ provider: '', fromCache: false, error: '' });
    setActiveSessionId(createSessionId());
    setChatSeed(null);
    setChatVersion((previousVersion) => previousVersion + 1);
    setExpandedHistorySessionId(null);
    setIsHistoryOpen(false);
  };

  const handleConversationChange = useCallback(({ messages, mentorContext, updatedAt }) => {
    const sanitizedMessages = sanitizeMessages(messages);
    const hasUserMessage = sanitizedMessages.some((message) => message.role === 'user');

    if (!hasUserMessage) {
      setChatHistory((previousHistory) => previousHistory.filter((session) => session.id !== activeSessionId));
      return;
    }

    const nextSession = {
      id: activeSessionId,
      title: buildHistoryTitle(sanitizedMessages),
      updatedAt: typeof updatedAt === 'number' ? updatedAt : Date.now(),
      messages: sanitizedMessages,
      mentorContext: sanitizeMentorContext(mentorContext)
    };

    setChatHistory((previousHistory) => {
      const filteredHistory = previousHistory.filter((session) => session.id !== activeSessionId);
      return [nextSession, ...filteredHistory].slice(0, MAX_CHAT_HISTORY);
    });
  }, [activeSessionId]);

  const handleSelectHistorySession = (session) => {
    if (!session) return;

    setExpandedHistorySessionId((previousSessionId) => (previousSessionId === session.id ? null : session.id));
    setActiveSessionId(session.id);
    setChatSeed({
      messages: session.messages,
      mentorContext: sanitizeMentorContext(session.mentorContext)
    });
    setChatVersion((previousVersion) => previousVersion + 1);
    setGeneratedRoadmap(null);
    setMentorExplanation('');
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();

    if (!window.confirm('Delete this chat session?')) return;

    try {
      // Remove from local state immediately
      setChatHistory((prev) => prev.filter((session) => session.id !== sessionId));
      
      // Remove from localStorage immediately
      const cachedHistory = loadCachedHistory().filter((session) => session.id !== sessionId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(cachedHistory));
      }

      // If deleted session was active, create new session
      if (activeSessionId === sessionId) {
        handleNewSession();
      }

      toast.success('Chat session deleted');

      // Sync with backend asynchronously (non-blocking)
      if (token) {
        try {
          await aiAPI.deleteChatSession(sessionId, token);
        } catch (backendError) {
          // Silently ignore backend errors since localStorage is primary storage
          console.warn('Backend sync failed:', backendError);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete session');
    }
  };

  const handleDeleteAllSessions = async () => {
    if (!window.confirm('Delete ALL chat sessions? This cannot be undone.')) return;

    try {
      // Clear local state immediately
      setChatHistory([]);
      
      // Remove from localStorage immediately
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      }
      
      // Create new session
      handleNewSession();
      
      toast.success('All chat sessions deleted');

      // Sync with backend asynchronously (non-blocking)
      if (token) {
        try {
          await aiAPI.deleteAllChatSessions(token);
        } catch (backendError) {
          // Silently ignore backend errors since localStorage is primary storage
          console.warn('Backend sync failed:', backendError);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete sessions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 w-full py-3 md:py-4">
      <div className="w-full px-3 md:px-4 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)]">
        <aside className="w-full lg:w-80 flex lg:flex-col justify-between text-gray-200 bg-gray-900/70 border border-gray-700 rounded-2xl p-4">
          <div className="w-full">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">AI Career Mentor</h2>
              <p className="text-xs text-gray-400">Career clarity for IT and engineering students</p>
            </div>

            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
              <button
                onClick={handleNewSession}
                className="w-full text-left px-4 py-3 rounded-lg border border-dashed  text-blue-200 bg-transparent hover:bg-blue-900/10 transition-colors"
              >
                New Session
              </button>
              <button
                onClick={() => setIsHistoryOpen((previousOpenState) => !previousOpenState)}
                className={`w-full text-left px-4 py-3 rounded-lg border border-dashed transition-colors ${isHistoryOpen
                  ? 'border-cyan-600 text-cyan-200 bg-cyan-900/10'
                  : 'border-transparent text-gray-200 hover:bg-gray-800'
                }`}
              >
                History ({chatHistory.length})
              </button>
              {/* <button className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-transparent text-gray-200 hover:bg-gray-800">Resources</button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-transparent text-gray-200 hover:bg-gray-800">Mock Interview</button> */}
            </nav>

            {isHistoryOpen ? (
              <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {chatHistory.length > 0 && (
                  <button
                    onClick={handleDeleteAllSessions}
                    className="w-full text-center px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors border border-red-600/30 font-medium"
                  >
                    Delete All Chats
                  </button>
                )}
                {chatHistory.length === 0 ? (
                  <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                    <h3 className="text-sm font-semibold text-white">No cached chats yet</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-5">
                      Send at least one message to store this session in local cache.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((session) => {
                    const latestMessages = sanitizeMessages(session.messages).slice(-5);
                    const isExpanded = expandedHistorySessionId === session.id;
                    const isActive = activeSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`rounded-xl border overflow-hidden transition-colors ${isActive
                          ? 'border-cyan-700 bg-cyan-950/10'
                          : 'border-gray-800 bg-gray-950/60'
                        }`}
                      >
                        <button
                          onClick={() => handleSelectHistorySession(session)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white truncate">{session.title}</p>
                            <span className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">
                              {isExpanded ? 'open' : 'view'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">{formatHistoryTimestamp(session.updatedAt)}</p>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="border-t border-gray-800 px-3 py-3 space-y-2 max-h-64 overflow-y-auto">
                            {latestMessages.map((message, index) => (
                              <div
                                key={`${session.id}-${index}`}
                                className={`rounded-lg px-2.5 py-2 text-xs leading-5 whitespace-pre-wrap ${message.role === 'user'
                                  ? 'ml-5 bg-blue-600/20 text-blue-100'
                                  : 'mr-5 bg-gray-800 text-gray-200'
                                }`}
                              >
                                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">
                                  {message.role === 'user' ? 'You' : 'Mentor'}
                                </p>
                                <p>{message.content}</p>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-800 px-3 py-2 flex gap-2">
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="flex-1 text-xs px-2 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors border border-red-600/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {mentorHighlights.map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-5">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* <div className="hidden lg:grid gap-3 mt-6">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-dashed text-gray-200">Settings</button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-dashed text-gray-200">Log Out</button>
          </div> */}
        </aside>

        <main className="flex-1 flex justify-center min-h-0">
          <div className="w-full bg-gray-800/60 rounded-3xl border-gray-700 min-h-0">
            {/* <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Get a clear career path in a few messages</h1>
                <p className="text-gray-300 mt-1">Choose a direction, share your level and availability, then get practical steps, tools, and mini-projects.</p>
              </div>

              <Link
                to="/roadmaps"
                className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
              >
                Back to Roadmaps
              </Link>
            </div> */}

            {/* <div className="mb-6 grid gap-3 md:grid-cols-3">
              {starterPrompts.map((prompt) => (
                <div key={prompt} className="rounded-2xl border border-gray-700 bg-gray-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Quick start</p>
                  <p className="mt-2 text-sm text-gray-100 leading-6">{prompt}</p>
                </div>
              ))}
            </div> */}

            <AIMentorChat
              token={token}
              onRoadmapGenerated={handleGeneratedRoadmap}
              starterPrompts={starterPrompts}
              seedConversation={chatSeed}
              conversationVersion={chatVersion}
              onConversationChange={handleConversationChange}
              sessionId={activeSessionId}
              sessionContext={sessionContext}
            />

            {mentorExplanation && (
              <div className="mt-6 bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-3">Mentor Guidance</h3>
                <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-6">{formatMentorGuidance(mentorExplanation)}</pre>
              </div>
            )}

            {generatedRoadmap && (
              <div className="mt-6">
                <RoadmapPreview
                  roadmap={generatedRoadmap}
                  provider={aiMeta.provider}
                  fromCache={aiMeta.fromCache}
                  accepting={isAcceptingAiRoadmap}
                  onAccept={handleAcceptAiRoadmap}
                />
              </div>
            )}

            {aiMeta.error && (
              <p className="mt-4 text-sm text-yellow-300">
                AI providers failed, fallback roadmap used: {aiMeta.error}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIMentorPage;
