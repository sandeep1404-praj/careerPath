import { GoogleGenerativeAI } from '@google/generative-ai';

const getWorkingModel = async () => {
  const apiKeys = (process.env.GEMINI_API_KEYS || '').split(',').filter(Boolean);
  const models = (process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-flash-latest')
    .split(',')
    .filter(Boolean);

  if (!apiKeys.length || !models.length) {
    throw new Error('Gemini API keys or models not configured');
  }

  for (const apiKey of apiKeys) {
    try {
      const client = new GoogleGenerativeAI(apiKey);
      for (const model of models) {
        try {
          const genAI = client.getGenerativeModel({ model });
          await genAI.generateContent('ping');
          return { client, model, apiKey };
        } catch (err) {
          if (err.status === 404) continue;
          throw err;
        }
      }
    } catch (err) {
      if (err.status === 429) continue;
      throw err;
    }
  }

  throw new Error('All Gemini API providers exhausted - rate limited or misconfigured');
};

export const summarizeConversation = async (messages, careerGoal = '') => {
  if (!messages || messages.length < 4) {
    return null; // Don't summarize short conversations
  }

  try {
    const { client, model } = await getWorkingModel();
    const genAI = client.getGenerativeModel({ model });

    const conversationText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a career mentoring assistant. Summarize this conversation in 2-3 sentences, focusing on:
1. The user's career goal/aspiration
2. Key skills or areas discussed
3. Main action items or recommendations

Career Goal Context: ${careerGoal || 'Not yet specified'}

Conversation:
${conversationText}

Provide a concise, actionable summary that captures the essence of the guidance given.`;

    const response = await genAI.generateContent(prompt);
    const summary = response.response.text();

    return summary;
  } catch (error) {
    console.error('Summarization error:', error);
    return null;
  }
};

export const buildSessionContext = async (recentMessages, pastSummary, mentorContext) => {
  const contextLines = [];

  if (pastSummary) {
    contextLines.push('=== PRIOR CONVERSATION SUMMARY ===');
    contextLines.push(pastSummary);
    contextLines.push('');
  }

  if (mentorContext.careerGoal) {
    contextLines.push(`Career Goal: ${mentorContext.careerGoal}`);
  }
  if (mentorContext.skillLevel) {
    contextLines.push(`Skill Level: ${mentorContext.skillLevel}`);
  }
  if (mentorContext.interests?.length > 0) {
    contextLines.push(`Interests: ${mentorContext.interests.join(', ')}`);
  }
  if (mentorContext.timeAvailability) {
    contextLines.push(`Availability: ${mentorContext.timeAvailability}`);
  }

  if (contextLines.length > 0) {
    contextLines.push('');
    contextLines.push('=== RECENT CONVERSATION ===');
  }

  recentMessages.forEach((msg) => {
    contextLines.push(`${msg.role.toUpperCase()}: ${msg.content}`);
  });

  return contextLines.join('\n');
};
