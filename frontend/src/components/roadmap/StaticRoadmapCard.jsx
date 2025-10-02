import React, { useState } from 'react';
import TaskItem from './TaskItem.jsx';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const StaticRoadmapCard = ({ roadmap, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingRoadmap, setIsAddingRoadmap] = useState(false);
  const { addRoadmapToUser } = useRoadmap();

  if (!roadmap) return null;

  // Get unique categories from tasks
  const categories = ['all', ...new Set(roadmap.tasks?.map(task => task.category).filter(Boolean))];

  // Filter tasks by selected category
  const filteredTasks = selectedCategory === 'all' 
    ? roadmap.tasks || []
    : (roadmap.tasks || []).filter(task => task.category === selectedCategory);

  // Sort tasks by order
  const sortedTasks = filteredTasks.sort((a, b) => (a.order || 0) - (b.order || 0));

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

  const handleAddRoadmap = async (e) => {
    e.stopPropagation(); // Prevent expanding/collapsing the card
    
    if (!addRoadmapToUser) {
      console.error('addRoadmapToUser function not available');
      return;
    }

    setIsAddingRoadmap(true);
    try {
      await addRoadmapToUser(roadmap);
    } catch (error) {
      console.error('Failed to add roadmap:', error);
    } finally {
      setIsAddingRoadmap(false);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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

          <div className="flex items-center space-x-3">
            {/* Quick stats */}
            <div className="text-right text-sm text-gray-400">
              <div>Tasks: {roadmap.tasks?.length || 0}</div>
              {roadmap.totalEstimatedTime && (
                <div>Time: {roadmap.totalEstimatedTime}</div>
              )}
            </div>
            
            {/* Add Roadmap button */}
            <button
              onClick={handleAddRoadmap}
              disabled={isAddingRoadmap}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
            >
              {isAddingRoadmap ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Roadmap</span>
                </>
              )}
            </button>
            
            {/* Expand/collapse button */}
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg 
                className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Category filter */}
          {categories.length > 2 && (
            <div className="p-4 bg-gray-750">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category);
                    }}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'All Tasks' : category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks list */}
          <div className="p-4 space-y-4">
            {sortedTasks.length > 0 ? (
              <>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{sortedTasks.length} tasks</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: '0%' }} // Will be updated based on user progress
                    />
                  </div>
                </div>

                {/* Task grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {sortedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={{...task, roadmapTrack: roadmap.track}}
                      showAddButton={true}
                      className="h-full"
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks found for this category.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticRoadmapCard;