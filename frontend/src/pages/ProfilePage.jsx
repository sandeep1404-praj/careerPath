import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRoadmap } from '../contexts/RoadmapContext.jsx';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Trophy,
  Target
} from 'lucide-react';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Career+Path&background=0F172A&color=fff';

const parseEstimatedHours = (value) => {
  if (!value) return 0;
  const match = String(value).match(/([\d.]+)/);
  return match ? Number(match[1]) : 0;
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getTaskProgress = (task) => {
  if (typeof task?.progress === 'number') {
    return Math.max(0, Math.min(100, Math.round(task.progress)));
  }
  if (task?.status === 'completed') return 100;
  if (task?.status === 'in-progress') return 60;
  return 0;
};

const ProfileRoadmapPage = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    loading: roadmapLoading,
    userRoadmap,
    staticRoadmaps
  } = useRoadmap();

  const tasks = useMemo(() => {
    if (!userRoadmap?.tasks) return [];
    return [...userRoadmap.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [userRoadmap?.tasks]);

  const completedTasks = useMemo(
    () => tasks.filter(task => task.status === 'completed'),
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => tasks.filter(task => task.status === 'in-progress'),
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter(task => task.status !== 'completed' && task.status !== 'in-progress'),
    [tasks]
  );

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const inProgressCount = inProgressTasks.length;
  const pendingCount = pendingTasks.length;

  const completionPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  const dominantTrack = useMemo(() => {
    if (!tasks.length) return null;
    const counts = tasks.reduce((acc, task) => {
      const key = task.roadmapTrack || 'General';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [tasks]);

  const currentTrack = userRoadmap?.preferences?.defaultTrack || dominantTrack;

  const currentRoadmap = useMemo(() => {
    if (!staticRoadmaps?.length) return null;
    if (!currentTrack) return staticRoadmaps[0];
    return (
      staticRoadmaps.find(roadmap => {
        const track = (roadmap.track || '').toLowerCase();
        const name = (roadmap.name || '').toLowerCase();
        const needle = currentTrack.toLowerCase();
        return track === needle || name === needle;
      }) || staticRoadmaps[0]
    );
  }, [staticRoadmaps, currentTrack]);

  const otherRoadmaps = useMemo(() => {
    if (!staticRoadmaps?.length) return [];
    if (!currentRoadmap) return staticRoadmaps;
    return staticRoadmaps.filter(roadmap => roadmap.id !== currentRoadmap.id);
  }, [staticRoadmaps, currentRoadmap]);

  const trackTasks = useMemo(() => {
    if (!currentTrack) return tasks;
    return tasks.filter(task => (task.roadmapTrack || '').toLowerCase() === currentTrack.toLowerCase());
  }, [tasks, currentTrack]);

  const trackCompletedCount = trackTasks.filter(task => task.status === 'completed').length;
  const trackProgressPercent = trackTasks.length ? Math.round((trackCompletedCount / trackTasks.length) * 100) : completionPercent;

  const hoursInvested = completedTasks.reduce((sum, task) => sum + parseEstimatedHours(task.estimatedTime), 0);

  const isLoading = authLoading || roadmapLoading;

  const avatarUrl = user?.avatar || (user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F172A&color=fff` : AVATAR_PLACEHOLDER);
  const joinedDate = formatDate(user?.createdAt);
  const displayName = user?.name || 'Your Profile';
  const displayEmail = user?.email || 'No email available';
  const displayLocation = user?.location || null;
  const displayTrack = currentTrack || 'Track not selected yet';

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Sign in to view your profile</h1>
          <p className="text-gray-300">Your personalized roadmap and tasks will appear here once you are logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-6 md:space-y-0">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full border-4 border-blue-500/30 object-cover"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                <p className="text-sm text-gray-300 mt-1">{displayEmail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                {displayLocation && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{displayLocation}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinedDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{displayTrack}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">
                  {completedCount}/{totalTasks || 0}
                </div>
                <div className="text-sm text-gray-300">Tasks Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Current Roadmap & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                Current Roadmap
              </h2>
              {currentRoadmap ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentRoadmap.name}</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {currentRoadmap.description || 'Keep exploring tasks in this track to progress towards your goals.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-blue-400 font-semibold">{trackProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${trackProgressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{trackCompletedCount} of {trackTasks.length} tasks complete</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentRoadmap.totalEstimatedTime || 'Flexible pace'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">Add a roadmap task to get started.</p>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Completed</span>
                  <span className="text-green-400 font-bold">{completedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">In Progress</span>
                  <span className="text-blue-400 font-bold">{inProgressCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Not Started</span>
                  <span className="text-orange-400 font-bold">{pendingCount}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated Hours Logged</span>
                    <span className="text-purple-400 font-bold">{hoursInvested || 0}h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Available Roadmaps</h2>
              <div className="space-y-3">
                {otherRoadmaps.length === 0 && (
                  <p className="text-gray-400 text-sm">Explore more tracks to expand your learning journey.</p>
                )}
                {otherRoadmaps.map(roadmap => (
                  <div
                    key={roadmap.id}
                    className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-100">{roadmap.name}</h4>
                      <p className="text-xs text-gray-400">
                        {roadmap.tasks?.length || 0} tasks • {roadmap.totalEstimatedTime || 'Custom pace'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* My Roadmap Tasks */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                My Roadmap Tasks
              </h2>
              {totalTasks === 0 ? (
                <p className="text-gray-400">No tasks have been added yet. Explore a static roadmap and add tasks to build your personalized plan.</p>
              ) : (
                <div className="grid gap-3">
                  {tasks.map((task, index) => (
                    <div key={task.taskId || task.id || index} className="bg-blue-900/15 rounded-lg p-4 border border-blue-500/20">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                          {task.description && <p className="text-gray-300 mt-1">{task.description}</p>}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-blue-300 uppercase tracking-wide">
                          {task.status || 'not-started'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.estimatedTime || 'Flexible'}
                        </span>
                        {task.roadmapTrack && <span>{task.roadmapTrack}</span>}
                        {task.difficulty && <span>Difficulty: {task.difficulty}</span>}
                      </div>
                      {task.resources?.length > 0 && (
                        <div className="mt-2 text-xs text-gray-300">
                          <span className="font-semibold">Resources:</span>
                          <ul className="list-disc ml-4 space-y-1">
                            {task.resources.map((resource, resourceIndex) => (
                              <li key={`${task.taskId || task.id}-${resourceIndex}`}>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 underline"
                                >
                                  {resource.title || resource.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Currently Working On */}
            {inProgressTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Currently Working On
                </h2>
                <div className="grid gap-3">
                  {inProgressTasks.map((task, index) => {
                    const progress = getTaskProgress(task);
                    return (
                      <div key={task.taskId || task.id || index} className="bg-blue-900/15 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                            {task.description && <p className="text-gray-300 mt-1">{task.description}</p>}
                          </div>
                          {task.difficulty && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 uppercase tracking-wide">
                              {task.difficulty}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Progress</span>
                            <span className="text-blue-400 font-semibold">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap justify-between text-sm text-gray-400">
                            <span>Estimated: {task.estimatedTime || 'Flexible'}</span>
                            {task.updatedAt && <span>Updated: {formatDate(task.updatedAt)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Completed Tasks ({completedCount})
                </h2>
                <div className="grid gap-3">
                  {completedTasks.map((task, index) => (
                    <div key={task.taskId || task.id || index} className="bg-green-900/15 rounded-lg p-4 border border-green-500/20">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-white">{task.name}</h3>
                          </div>
                          {task.description && <p className="text-gray-300 mt-1 ml-7">{task.description}</p>}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Estimated: {task.estimatedTime || 'Flexible'}</div>
                          {task.completedAt && <div>Completed: {formatDate(task.completedAt)}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Circle className="w-5 h-5 mr-2 text-orange-400" />
                  Remaining Tasks ({pendingCount})
                </h2>
                <div className="grid gap-3">
                  {pendingTasks.map((task, index) => (
                    <div key={task.taskId || task.id || index} className="bg-gray-700/40 rounded-lg p-4 border border-gray-600/40">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-600 text-gray-300 rounded-full text-xs font-bold">
                              {index + 1}
                            </div>
                            <h3 className="font-semibold text-white">{task.name}</h3>
                          </div>
                          {task.description && <p className="text-gray-300 mt-1 ml-8">{task.description}</p>}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Track: {task.roadmapTrack || 'General'}</div>
                          <div>Estimated: {task.estimatedTime || 'Flexible'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Snapshot */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Learning Snapshot</h2>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Joined</span>
                  <span>{joinedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Tasks</span>
                  <span>{totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Overall Progress</span>
                  <span className="text-blue-400 font-semibold">{completionPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Track</span>
                  <span>{displayTrack}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRoadmapPage;