import React, { useState } from 'react';
import { useRoadmap } from '../../contexts/RoadmapContext.jsx';
import deleteIcon from '../../assets/delete.svg';
import deleteIcongif from '../../assets/delete.gif';
const TaskItem = ({ task, isUserTask = false, showAddButton = false, className = '' }) => {
  const { addTaskToUser, updateTask, isTaskAdded } = useRoadmap();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  // Icon swap: show static image by default, animated gif on hover/focus/touch
  const staticIcon = '/note.svg';
  const gifIcon = '/note.gif';
  const [iconSrc, setIconSrc] = useState(staticIcon);

  const handleIconEnter = () => setIconSrc(gifIcon);
  const handleIconLeave = () => setIconSrc(staticIcon);
  //delete icon
  const staticIconDelete = deleteIcon;
  const gifIconDelete = deleteIcongif;
  const [iconDeleteSrc, setIconDeleteSrc] = useState(staticIconDelete);
  const handleIconDeleteEnter = () => setIconDeleteSrc(gifIconDelete);
  const handleIconDeleteLeave = () => setIconDeleteSrc(staticIconDelete);

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
      case 'completed': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' };
      case 'in-progress': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-500' };
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
      case 'Intermediate': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'Advanced': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  const statusColor = getStatusColor(task.status);

  return (
    <div className={`group bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-700/60 hover:border-gray-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 ${className}`}>
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3 mb-2 flex-wrap">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-blue-300 transition-colors break-words">
              {task.name}
            </h3>
            {isUserTask && (
              <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor.bg} border ${statusColor.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                <span className={`${statusColor.text} hidden sm:inline`}>
                  {task.status === 'not-started' ? 'Not Started' :
                   task.status === 'in-progress' ? 'In Progress' : 'Completed'}
                </span>
                <span className={`${statusColor.text} sm:hidden`}>
                  {task.status === 'not-started' ? 'Started' :
                   task.status === 'in-progress' ? 'In Prog' : 'Done'}
                </span>
              </span>
            )}
          </div>

          {/* Metadata badges - responsive */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
            {task.difficulty && (
              <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium border ${getDifficultyColor(task.difficulty).bg} ${getDifficultyColor(task.difficulty).text} ${getDifficultyColor(task.difficulty).border}`}>
                <span className="text-sm">⚡</span>
                <span className="hidden sm:inline">{task.difficulty}</span>
                <span className="sm:hidden">{task.difficulty.substring(0, 3)}</span>
              </span>
            )}
            {task.estimatedTime && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <span className="text-sm">⏱️</span>
                <span className="hidden sm:inline">{task.estimatedTime}</span>
                <span className="sm:hidden text-xs">{task.estimatedTime}</span>
              </span>
            )}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <span className="text-sm">📁</span>
                <span className="hidden sm:inline">{task.category}</span>
                <span className="sm:hidden text-xs">{task.category.substring(0, 6)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action buttons - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto">
          {showAddButton && !isAdded && (
            <button
              onClick={handleAddTask}
              disabled={isUpdating}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto"
            >
              {isUpdating ? '⏳' : '+ Add'}
            </button>
          )}

          {isUserTask && (
            <div className="flex gap-1 bg-gray-700/40 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-600/40 rounded flex-1 sm:flex-none"
                title="Toggle notes"
                aria-pressed={showNotes}
              >
                <img
                  src={iconSrc}
                  alt="toggle notes"
                  className="w-4 h-4 object-contain"
                  onMouseEnter={handleIconEnter}
                  onMouseLeave={handleIconLeave}
                  onFocus={handleIconEnter}
                  onBlur={handleIconLeave}
                  onTouchStart={handleIconEnter}
                  onTouchEnd={handleIconLeave}
                />
              </button>
              <button
                onClick={handleRemoveTask}
                disabled={isUpdating}
                className="p-2 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20 rounded"
                title="Remove task"
              >
                <img
                  src={iconDeleteSrc}
                  alt="remove task"
                  className="w-4 h-4 object-contain"
                  onMouseEnter={handleIconDeleteEnter}
                  onMouseLeave={handleIconDeleteLeave}
                  onFocus={handleIconDeleteEnter}
                  onBlur={handleIconDeleteLeave}
                  onTouchStart={handleIconDeleteEnter}
                  onTouchEnd={handleIconDeleteLeave}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{task.description}</p>
      )}

      {/* Status controls for user tasks */}
      {isUserTask && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {['not-started', 'in-progress', 'completed'].map((status) => {
            const colors = getStatusColor(status);
            const isActive = task.status === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border} shadow-lg shadow-blue-500/20`
                    : 'bg-gray-700/40 text-gray-400 border-gray-600/40 hover:bg-gray-700/60 hover:border-gray-600/60'
                }`}
              >
                <span className="hidden sm:inline">{status === 'not-started' ? '⭕ Not Started' : 
                 status === 'in-progress' ? '🔄 In Progress' : '✅ Completed'}</span>
                <span className="sm:hidden">{status === 'not-started' ? '⭕' : 
                 status === 'in-progress' ? '🔄' : '✅'}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notes section */}
      {isUserTask && showNotes && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide block mb-2">Add Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your thoughts, progress, or resources here..."
            className="w-full bg-gray-800/50 text-white text-xs sm:text-sm resize-none border border-gray-700/50 outline-none p-2.5 sm:p-3 rounded-lg focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
            rows={3}
          />
          <div className="flex gap-2 mt-2.5 sm:mt-3">
            <button
              onClick={handleNotesUpdate}
              disabled={isUpdating}
              className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 flex-1 sm:flex-initial"
            >
              {isUpdating ? '...' : '💾 Save'}
            </button>
            <button
              onClick={() => {
                setNotes(task.notes || '');
                setShowNotes(false);
              }}
              className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-gray-700/60 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      {task.resources && task.resources.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700/50">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2 sm:mb-2.5">📚 Resources</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {task.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-600/40 to-blue-700/40 hover:from-blue-600/60 hover:to-blue-700/60 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {resource.type === 'video' && '🎥'}
                {resource.type === 'article' && '📖'}
                {resource.type === 'course' && '🎓'}
                {resource.type === 'practice' && '💻'}
                {resource.type === 'documentation' && '📚'}
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{resource.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* User task metadata */}
      {isUserTask && (
        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-700/30 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
          <span>📅 Added {new Date(task.addedAt).toLocaleDateString()}</span>
          {task.completedAt && (
            <span className="text-green-600">✨ Completed {new Date(task.completedAt).toLocaleDateString()}</span>
          )}
        </div>
      )}

      {/* Added indicator */}
      {isAdded && !isUserTask && (
        <div className="mt-2 sm:mt-3 flex items-center gap-2 text-green-400 text-xs sm:text-sm font-medium">
          <span className="text-lg sm:text-xl">✅</span>
          <span>Already in your roadmap</span>
        </div>
      )}
    </div>
  );
};

export default TaskItem;