import { useState, useEffect } from 'react';
import TaskItem from './TaskItem.jsx';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const UserRoadmapCard = ({ className = '' }) => {
  const { 
    userRoadmap, 
    preferences, 
    updatePreferences,
    deleteRoadmapFromUser
  } = useRoadmap();

  const [sortBy, setSortBy] = useState(preferences.sortBy || 'order');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [showCompleted, setShowCompleted] = useState(preferences.showCompleted ?? true);
  const [collapsedRoadmaps, setCollapsedRoadmaps] = useState(new Set());
  const [deletingRoadmap, setDeletingRoadmap] = useState(null);

  // Update preferences when local state changes
  useEffect(() => {
    if (sortBy !== preferences.sortBy || showCompleted !== preferences.showCompleted) {
      updatePreferences({ sortBy, showCompleted });
    }
  }, [sortBy, showCompleted, preferences.sortBy, preferences.showCompleted, updatePreferences]);

  // Handle roadmap deletion
  const handleDeleteRoadmap = async (roadmapId, roadmapName) => {
    if (!confirm(`Are you sure you want to delete the "${roadmapName}" roadmap? This will remove all tasks associated with this roadmap.`)) {
      return;
    }

    setDeletingRoadmap(roadmapId);
    try {
      await deleteRoadmapFromUser(roadmapId, roadmapName);
    } finally {
      setDeletingRoadmap(null);
    }
  };

  // Toggle roadmap collapse state
  const toggleRoadmapCollapse = (roadmapId) => {
    const newCollapsed = new Set(collapsedRoadmaps);
    if (newCollapsed.has(roadmapId)) {
      newCollapsed.delete(roadmapId);
    } else {
      newCollapsed.add(roadmapId);
    }
    setCollapsedRoadmaps(newCollapsed);
  };

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

  // Group tasks by roadmap
  const groupedTasks = {};
  const individualTasks = [];

  userRoadmap.tasks.forEach(task => {
    if (task.roadmapId) {
      if (!groupedTasks[task.roadmapId]) {
        // Find roadmap info from userRoadmap.roadmaps array
        const roadmapInfo = userRoadmap.roadmaps?.find(rm => rm.roadmapId === task.roadmapId);
        groupedTasks[task.roadmapId] = {
          roadmapInfo: roadmapInfo || {
            roadmapId: task.roadmapId,
            name: task.roadmapTrack || 'Unknown Roadmap',
            track: task.roadmapTrack
          },
          tasks: []
        };
      }
      groupedTasks[task.roadmapId].tasks.push(task);
    } else {
      individualTasks.push(task);
    }
  });

  // Filter tasks function
  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const trackMatch = filterTrack === 'all' || task.roadmapTrack === filterTrack;
      const showMatch = showCompleted || task.status !== 'completed';
      return statusMatch && trackMatch && showMatch;
    });
  };

  // Sort tasks function
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
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
  };

  // Get all unique tracks from user tasks
  const tracks = ['all', ...new Set(userRoadmap.tasks.map(task => task.roadmapTrack).filter(Boolean))];

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

      {/* Roadmaps and Tasks */}
      <div className="p-4">
        {Object.keys(groupedTasks).length === 0 && individualTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
            <p>Start by adding some tasks from the roadmaps above!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grouped Roadmaps */}
            {Object.entries(groupedTasks).map(([roadmapId, { roadmapInfo, tasks }]) => {
              const filteredTasks = sortTasks(filterTasks(tasks));
              const isCollapsed = collapsedRoadmaps.has(roadmapId);
              const isDeleting = deletingRoadmap === roadmapId;

              if (filteredTasks.length === 0 && (filterStatus !== 'all' || filterTrack !== 'all' || !showCompleted)) {
                return null; // Hide roadmap if no tasks match filters
              }

              return (
                <div key={roadmapId} className="border border-gray-600 rounded-lg overflow-hidden">
                  {/* Roadmap Header */}
                  <div className="bg-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleRoadmapCollapse(roadmapId)}
                          className="text-gray-400 hover:text-white transition-colors"
                          disabled={isDeleting}
                        >
                          {isCollapsed ? '▶️' : '🔽'}
                        </button>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {roadmapInfo.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {tasks.length} tasks • {tasks.filter(t => t.status === 'completed').length} completed
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRoadmap(roadmapId, roadmapInfo.name)}
                        disabled={isDeleting}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          isDeleting 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isDeleting ? 'Deleting...' : '🗑️ Delete Roadmap'}
                      </button>
                    </div>
                  </div>

                  {/* Roadmap Tasks */}
                  {!isCollapsed && (
                    <div className="p-4 bg-gray-750">
                      {filteredTasks.length > 0 ? (
                        <div className="space-y-3">
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
                        <div className="text-center py-8 text-gray-400">
                          <p>No tasks match the current filters</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Individual Tasks (not part of any roadmap) */}
            {individualTasks.length > 0 && (
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-700 p-4">
                  <h3 className="text-lg font-semibold text-white">Individual Tasks</h3>
                  <p className="text-sm text-gray-400">
                    {individualTasks.length} tasks • {individualTasks.filter(t => t.status === 'completed').length} completed
                  </p>
                </div>
                <div className="p-4 bg-gray-750">
                  {(() => {
                    const filteredIndividualTasks = sortTasks(filterTasks(individualTasks));
                    return filteredIndividualTasks.length > 0 ? (
                      <div className="space-y-3">
                        {filteredIndividualTasks.map((task) => (
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
                      <div className="text-center py-8 text-gray-400">
                        <p>No individual tasks match the current filters</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with summary */}
      {userRoadmap.tasks.length > 0 && (
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>
              {Object.keys(groupedTasks).length} roadmaps • {individualTasks.length} individual tasks
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