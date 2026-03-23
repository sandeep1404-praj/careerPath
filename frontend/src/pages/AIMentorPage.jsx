import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import AIMentorChat from '@/components/roadmap/AIMentorChat';
import RoadmapPreview from '@/components/roadmap/RoadmapPreview';
import { aiAPI } from '@/services/api';
import toast from '@/utils/toast';

const formatMentorGuidance = (text = '') => {
  if (typeof text !== 'string') return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AIMentorPage = () => {
  const { token } = useAuth();
  const { loadUserRoadmap } = useRoadmap();
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [mentorExplanation, setMentorExplanation] = useState('');
  const [aiMeta, setAiMeta] = useState({ provider: '', fromCache: false, error: '' });
  const [isAcceptingAiRoadmap, setIsAcceptingAiRoadmap] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Career Mentor</h1>
            <p className="text-gray-300 mt-1">Chat with AI, generate a personalized roadmap, and accept it into your profile tasks.</p>
          </div>
          <Link
            to="/roadmaps"
            className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Back to Roadmaps
          </Link>
        </div>

        <AIMentorChat token={token} onRoadmapGenerated={handleGeneratedRoadmap} />

        {mentorExplanation && (
          <div className="mt-6 bg-gray-800/70 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Mentor Guidance</h3>
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-6">{formatMentorGuidance(mentorExplanation)}</pre>
          </div>
        )}

        {generatedRoadmap && (
          <RoadmapPreview
            roadmap={generatedRoadmap}
            provider={aiMeta.provider}
            fromCache={aiMeta.fromCache}
            accepting={isAcceptingAiRoadmap}
            onAccept={handleAcceptAiRoadmap}
          />
        )}

        {aiMeta.error && (
          <p className="mt-4 text-sm text-yellow-300">
            AI providers failed, fallback roadmap used: {aiMeta.error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIMentorPage;
