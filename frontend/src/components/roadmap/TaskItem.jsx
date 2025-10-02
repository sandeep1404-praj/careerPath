import React, { useState } from 'react';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';

const TaskItem = ({ task, isUserTask = false, showAddButton = false, className = '' }) => {
  const { addTaskToUser, updateTask, isTaskAdded } = useRoadmap();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');

  const isAdded = isUserTask || isTaskAdded(task.id || task.taskId);

  const handleAddTask = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const taskData = {
      taskId: task.id || task.taskId,
      name: task.name,
      description: task.description,
      staticTaskId: task.id,
      roadmapTrack: task.roadmapTrack || 'General',
      estimatedTime: task.estimatedTime,
      difficulty: task.difficulty,
      category: task.category,
      resources: task.resources || []
    };

    await addTaskToUser(taskData);
    setIsUpdating(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!isUserTask || isUpdating) return;
    setIsUpdating(true);
    
    await updateTask(task.taskId, 'update-status', { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : null
    });
    setIsUpdating(false);
  };

  const handleNotesUpdate = async () => {
    if (!isUserTask || isUpdating) return;
    setIsUpdating(true);
    
    await updateTask(task.taskId, 'update-notes', { notes });
    setIsUpdating(false);
    setShowNotes(false);
  };

  const handleRemoveTask = async () => {
    if (!isUserTask || isUpdating) return;
    if (!confirm('Are you sure you want to remove this task?')) return;
    
    setIsUpdating(true);
    await updateTask(task.taskId, 'remove');
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {task.name}
            {isUserTask && (
              <span className={`inline-block w-3 h-3 rounded-full ml-2 ${getStatusColor(task.status)}`} />
            )}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {task.difficulty && (
              <span className={`text-sm ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty}
              </span>
            )}
            {task.estimatedTime && (
              <span className="text-sm text-gray-400">
                ⏱️ {task.estimatedTime}
              </span>
            )}
            {task.category && (
              <span className="text-sm text-blue-400">
                📁 {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 ml-4">
          {showAddButton && !isAdded && (
            <button
              onClick={handleAddTask}
              disabled={isUpdating}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {isUpdating ? '...' : 'Add to My Profile'}
            </button>
          )}
          
          {isUserTask && (
            <>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Toggle notes"
              >
                📝
              </button>
              <button
                onClick={handleRemoveTask}
                disabled={isUpdating}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Remove task"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-300 text-sm mb-3">{task.description}</p>
      )}

      {/* Status controls for user tasks */}
      {isUserTask && (
        <div className="flex flex-wrap gap-2 mb-3">
          {['not-started', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                task.status === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'not-started' ? 'Not Started' : 
               status === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      )}

      {/* Notes section */}
      {isUserTask && showNotes && (
        <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-600">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes..."
            className="w-full bg-transparent text-white text-sm resize-none border-none outline-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleNotesUpdate}
              disabled={isUpdating}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Save Notes
            </button>
            <button
              onClick={() => {
                setNotes(task.notes || '');
                setShowNotes(false);
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      {task.resources && task.resources.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Resources:</h4>
          <div className="flex flex-wrap gap-2">
            {task.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                {resource.type === 'video' && '🎥 '}
                {resource.type === 'article' && '📖 '}
                {resource.type === 'course' && '🎓 '}
                {resource.type === 'practice' && '💻 '}
                {resource.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* User task metadata */}
      {isUserTask && (
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Added: {new Date(task.addedAt).toLocaleDateString()}</span>
            {task.completedAt && (
              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Added indicator */}
      {isAdded && !isUserTask && (
        <div className="mt-3 flex items-center text-green-400 text-sm">
          ✅ Already in your roadmap
        </div>
      )}
    </div>
  );
};

export default TaskItem;