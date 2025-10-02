import { useState, useEffect } from 'react';
import TaskItem from './TaskItem.jsx';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const UserRoadmapCard = ({ className = '' }) => {
  const { 
    userRoadmap, 
    preferences, 
    updatePreferences
  } = useRoadmap();

  const [sortBy, setSortBy] = useState(preferences.sortBy || 'order');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [showCompleted, setShowCompleted] = useState(preferences.showCompleted ?? true);

  // Update preferences when local state changes
  useEffect(() => {
    if (sortBy !== preferences.sortBy || showCompleted !== preferences.showCompleted) {
      updatePreferences({ sortBy, showCompleted });
    }
  }, [sortBy, showCompleted, preferences.sortBy, preferences.showCompleted, updatePreferences]);

  if (!userRoadmap) {
    return (
      <div className={`bg-gray-800 rounded-xl border border-gray-700 p-8 text-center ${className}`}>
        <div className="text-gray-400">
          <h2 className="text-xl font-bold text-white mb-2">Your Personal Roadmap</h2>
          <p>Start building your learning path by adding tasks from the roadmaps above!</p>
        </div>
      </div>
    );
  }

  // Get all unique tracks from user tasks
  const tracks = ['all', ...new Set(userRoadmap.tasks.map(task => task.roadmapTrack).filter(Boolean))];

  // Filter tasks
  let filteredTasks = userRoadmap.tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const trackMatch = filterTrack === 'all' || task.roadmapTrack === filterTrack;
    const showMatch = showCompleted || task.status !== 'completed';
    return statusMatch && trackMatch && showMatch;
  });

  // Sort tasks
  filteredTasks = filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case 'addedAt':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'difficulty': {
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
      }
      case 'track':
        return (a.roadmapTrack || '').localeCompare(b.roadmapTrack || '');
      case 'order':
      default:
        return (a.order || 0) - (b.order || 0);
    }
  });

  const stats = userRoadmap.stats || {};
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Your Personal Roadmap
            </h2>
            <p className="text-gray-400">
              {stats.totalTasks} tasks • {stats.completedTasks} completed • {stats.inProgressTasks} in progress
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              {completionRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-lg font-semibold text-white">{stats.totalTasks}</div>
            <div className="text-xs text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-400">{stats.completedTasks}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="bg-yellow-600/20 rounded-lg p-3">
            <div className="text-lg font-semibold text-yellow-400">{stats.inProgressTasks}</div>
            <div className="text-xs text-gray-400">In Progress</div>
          </div>
        </div>
      </div>

      {/* Filters and controls */}
      <div className="p-4 bg-gray-750 border-b border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort by */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border-none"
            >
              <option value="order">Order</option>
              <option value="addedAt">Date Added</option>
              <option value="difficulty">Difficulty</option>
              <option value="track">Track</option>
            </select>
          </div>

          {/* Filter by status */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border-none"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Filter by track */}
          {tracks.length > 2 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Track:</label>
              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded px-3 py-1 border-none"
              >
                {tracks.map(track => (
                  <option key={track} value={track}>
                    {track === 'all' ? 'All Tracks' : track}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show completed toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700"
            />
            <span className="text-sm text-gray-400">Show completed</span>
          </label>
        </div>
      </div>

      {/* Tasks list */}
      <div className="p-4">
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.taskId}
                task={task}
                isUserTask={true}
                className={`border-l-4 ${
                  task.status === 'completed' ? 'border-green-500' :
                  task.status === 'in-progress' ? 'border-yellow-500' : 'border-gray-500'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {userRoadmap.tasks.length === 0 ? (
              <div>
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
                <p>Start by adding some tasks from the roadmaps above!</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-white mb-2">No matching tasks</h3>
                <p>Try adjusting your filters to see more tasks.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      {userRoadmap.tasks.length > 0 && (
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>
              Showing {filteredTasks.length} of {userRoadmap.tasks.length} tasks
            </span>
            <span>
              Last updated: {new Date(userRoadmap.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoadmapCard;