import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const getTrackIcon = (track) => {
  const icons = {
    'Frontend': '🎨',
    'Backend': '⚙️',
    'Full Stack': '🚀',
    'Mobile': '📱',
    'DevOps': '🔧',
    'Data Science': '📊',
    'AI/ML': '🤖',
    'Cloud': '☁️',
    'Security': '🔐',
    'QA': '✅',
  };
  return icons[track] || '📚';
};

const StaticRoadmapCard = ({ roadmap, className = '' }) => {
  const navigate = useNavigate();
  const { addRoadmapToUser } = useRoadmap();

  if (!roadmap) return null;

  const handleCardClick = () => {
    const id = roadmap.id || roadmap._id;
    navigate(`/roadmap/${id}`);
  };

  const colors = {
    'Frontend': 'from-pink-600 to-rose-800',
    'Backend': 'from-blue-600 to-blue-800',
    'Full Stack': 'from-purple-600 to-purple-800',
    'Mobile': 'from-green-600 to-green-800',
    'DevOps': 'from-orange-600 to-orange-800',
    'Data Science': 'from-indigo-600 to-indigo-800',
    'AI/ML': 'from-cyan-600 to-cyan-800',
    'Cloud': 'from-sky-600 to-sky-800',
    'Security': 'from-red-600 to-red-800',
    'QA': 'from-yellow-600 to-yellow-800',
  };

  const gradient = colors[roadmap.track] || 'from-gray-600 to-gray-800';
  const taskCount = roadmap.tasks?.length || 0;
  const completedCount = roadmap.tasks?.filter(t => t.status === 'completed')?.length || 0;
  const progressPercent = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div
      className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 ${className}`}
      onClick={handleCardClick}
    >
      {/* Gradient background effect */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6 relative z-10">
        {/* Header with title and badge */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex-1 min-w-0">
            {/* Title and track */}
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
              {roadmap.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              {roadmap.track}
            </p>
          </div>

          {/* Track badge */}
          <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider px-2 sm:px-3 py-1 bg-gray-700/60 rounded-full whitespace-nowrap">
            {taskCount} tasks
          </div>
        </div>

        {/* Description */}
        {roadmap.description && (
          <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors">
            {roadmap.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            {roadmap.totalEstimatedTime && (
              <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-300 transition-colors whitespace-nowrap">
                <span>⏱️</span>
                <span>{roadmap.totalEstimatedTime}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-300 transition-colors whitespace-nowrap">
              <span>📋</span>
              <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
            </div>
          </div>
          <div className="text-blue-400 font-medium text-xs uppercase tracking-wide hidden sm:block">
            View Details →
          </div>
        </div>

        {/* Prerequisites */}
        {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
          <div className="border-t border-gray-700/50 pt-2 sm:pt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">Prerequisites</p>
            <div className="flex flex-wrap gap-2">
              {roadmap.prerequisites.slice(0, 3).map((prereq, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-gray-700/40 to-gray-700/20 text-gray-300 text-xs rounded-lg border border-gray-600/30 hover:border-gray-600/60 transition-colors"
                >
                  {prereq}
                </span>
              ))}
              {roadmap.prerequisites.length > 3 && (
                <span className="px-2 py-1 text-gray-400 text-xs">
                  +{roadmap.prerequisites.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default StaticRoadmapCard;