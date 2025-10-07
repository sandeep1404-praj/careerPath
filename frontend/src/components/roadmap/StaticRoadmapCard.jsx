import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const StaticRoadmapCard = ({ roadmap, className = '' }) => {
  const navigate = useNavigate();
  const { addRoadmapToUser } = useRoadmap();

  if (!roadmap) return null;

  // Get unique categories from tasks
  // (list card view no longer uses categories/tasks inline)

  // Filter tasks by selected category
  // Removed inline tasks/graph; navigation pattern instead

  const getTrackIcon = (track) => {
    const trackLower = track?.toLowerCase() || '';
    if (trackLower.includes('frontend')) return '🎨';
    if (trackLower.includes('backend')) return '⚙️';
    if (trackLower.includes('fullstack') || trackLower.includes('full-stack')) return '🔄';
    if (trackLower.includes('mobile')) return '📱';
    if (trackLower.includes('devops')) return '🔧';
    if (trackLower.includes('data')) return '📊';
    if (trackLower.includes('ai') || trackLower.includes('ml')) return '🤖';
    if (trackLower.includes('security')) return '🔒';
    return '💻';
  };

  const handleCardClick = () => {
    const id = roadmap.id || roadmap._id;
    navigate(`/roadmap/${id}`);
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors ${className}`} onClick={handleCardClick}>
      {/* Header (entire card clickable) */}
      <div className="p-6 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: roadmap.color || '#3B82F6' }}
            >
              {roadmap.icon || getTrackIcon(roadmap.track)}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {roadmap.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {roadmap.track} • {roadmap.tasks?.length || 0} tasks
                {roadmap.totalEstimatedTime && ` • ${roadmap.totalEstimatedTime}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div>Tasks: {roadmap.tasks?.length || 0}</div>
            {roadmap.totalEstimatedTime && <div>Time: {roadmap.totalEstimatedTime}</div>}
            <div className="flex items-center text-blue-400">
              <span className="text-xs uppercase tracking-wide">View</span>
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        {roadmap.description && (
          <p className="mt-3 text-gray-300 text-sm">
            {roadmap.description}
          </p>
        )}

        {/* Prerequisites */}
        {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-400">Prerequisites: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {roadmap.prerequisites.map((prereq, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticRoadmapCard;