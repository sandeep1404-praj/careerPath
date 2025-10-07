import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRoadmap } from '../contexts/RoadmapContext.jsx';
import TaskItem from '../components/roadmap/TaskItem.jsx';
import RoadmapFlow from '../components/roadmap/RoadmapFlow.jsx';
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
    staticRoadmaps,
    deleteRoadmapFromUser
  } = useRoadmap();

  const [collapsedRoadmaps, setCollapsedRoadmaps] = useState(new Set());
  const [deletingRoadmap, setDeletingRoadmap] = useState(null);
  const [graphView, setGraphView] = useState(false);

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

            
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* My Roadmap Tasks (Grouped & Collapsible) */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                  My Roadmap Tasks
                </h2>
                {totalTasks > 0 && (
                  <div className="flex gap-2 text-sm">
                    <button
                      onClick={() => setGraphView(false)}
                      className={`px-3 py-1 rounded ${!graphView ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >List</button>
                    <button
                      onClick={() => setGraphView(true)}
                      className={`px-3 py-1 rounded ${graphView ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >Graph</button>
                  </div>
                )}
              </div>
              {totalTasks === 0 ? (
                <div className="p-6 text-gray-400">
                  No tasks have been added yet. Explore a static roadmap and add tasks to build your personalized plan.
                </div>
              ) : graphView ? (
                <div className="p-4">
                  <RoadmapFlow tasks={tasks} />
                  <p className="text-xs text-gray-500 mt-2">Status columns: Not Started • In Progress • Completed</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {(() => {
                    const grouped = {}; const individual = [];
                    tasks.forEach(t => { if (t.roadmapId) { if (!grouped[t.roadmapId]) grouped[t.roadmapId] = { tasks: [], info: { name: t.roadmapTrack || 'Unknown Roadmap', roadmapId: t.roadmapId } }; grouped[t.roadmapId].tasks.push(t); } else { individual.push(t); } });
                    const entries = Object.entries(grouped);
                    return (<>
                      {entries.map(([rid, data]) => {
                        const isCollapsed = collapsedRoadmaps.has(rid);
                        const completedWithin = data.tasks.filter(t => t.status === 'completed').length;
                        const percent = data.tasks.length ? Math.round((completedWithin / data.tasks.length) * 100) : 0;
                        const deleting = deletingRoadmap === rid;
                        return (
                          <div key={rid} className="bg-gray-800">
                            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-750" onClick={() => { const next = new Set(collapsedRoadmaps); if (next.has(rid)) next.delete(rid); else next.add(rid); setCollapsedRoadmaps(next); }}>
                              <div className="flex items-center gap-3">
                                <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                                <span className="font-semibold text-white">{data.info.name}</span>
                                <span className="text-xs text-gray-400">{completedWithin}/{data.tasks.length} • {percent}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={(e) => { e.stopPropagation(); if (!confirm('Delete this roadmap and all its tasks?')) return; setDeletingRoadmap(rid); deleteRoadmapFromUser(rid, data.info.name).finally(()=>setDeletingRoadmap(null)); }} disabled={deleting} className={`text-xs px-3 py-1 rounded ${deleting ? 'bg-gray-600 text-gray-300' : 'bg-red-600 hover:bg-red-700 text-white'}`}>{deleting ? 'Deleting...' : 'Delete'}</button>
                              </div>
                            </div>
                            {!isCollapsed && (
                              <div className="px-4 pb-4 pt-2 space-y-3">
                                {data.tasks.map(task => (
                                  <TaskItem key={task.taskId} task={task} isUserTask={true} className={`border-l-4 ${task.status === 'completed' ? 'border-green-500' : task.status === 'in-progress' ? 'border-yellow-500' : 'border-gray-500'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {individual.length > 0 && (
                        <div className="bg-gray-800">
                          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-750" onClick={() => { const key='__individual__'; const next=new Set(collapsedRoadmaps); if (next.has(key)) next.delete(key); else next.add(key); setCollapsedRoadmaps(next); }}>
                            <div className="flex items-center gap-3">
                              <span className={`transition-transform ${collapsedRoadmaps.has('__individual__') ? '' : 'rotate-90'}`}>▶</span>
                              <span className="font-semibold text-white">Individual Tasks</span>
                              <span className="text-xs text-gray-400">{individual.filter(t=>t.status==='completed').length}/{individual.length}</span>
                            </div>
                          </div>
                          {!collapsedRoadmaps.has('__individual__') && (
                            <div className="px-4 pb-4 pt-2 space-y-3">
                              {individual.map(task => (
                                <TaskItem key={task.taskId} task={task} isUserTask={true} className={`border-l-4 ${task.status === 'completed' ? 'border-green-500' : task.status === 'in-progress' ? 'border-yellow-500' : 'border-gray-500'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>);
                  })()}
                </div>
              )}
            </div>

            {/* Currently Working On */}
            {!graphView && inProgressTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Currently Working On
                </h2>
                <div className="grid gap-3">
                  {inProgressTasks.map((task, index) => (
                    <TaskItem
                      key={task.taskId || task.id || index}
                      task={task}
                      isUserTask={true}
                      className="border-l-4 border-yellow-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {!graphView && completedTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Completed Tasks ({completedCount})
                </h2>
                <div className="grid gap-3">
                  {completedTasks.map((task, index) => (
                    <TaskItem
                      key={task.taskId || task.id || index}
                      task={task}
                      isUserTask={true}
                      className="border-l-4 border-green-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Tasks */}
            {!graphView && pendingTasks.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Circle className="w-5 h-5 mr-2 text-orange-400" />
                  Remaining Tasks ({pendingCount})
                </h2>
                <div className="grid gap-3">
                  {pendingTasks.map((task, index) => (
                    <TaskItem
                      key={task.taskId || task.id || index}
                      task={task}
                      isUserTask={true}
                      className="border-l-4 border-gray-500"
                    />
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