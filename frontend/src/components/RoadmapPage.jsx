import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRoadmap } from '../contexts/RoadmapContext.jsx';
import StaticRoadmapCard from './roadmap/StaticRoadmapCard.jsx';
import CustomTaskForm from './roadmap/CustomTaskForm.jsx';
import RoadmapFlow from './roadmap/RoadmapFlow.jsx';

import {
  FaPalette, FaCog, FaSyncAlt, FaMobileAlt, FaWrench, FaChartBar, FaRobot,
  FaLock, FaLaptopCode, FaExclamationTriangle, FaClock, FaFolder, FaLink,
  FaVideo, FaBook, FaGraduationCap, FaRocket, FaSearch, FaLightbulb, FaBullseye
} from 'react-icons/fa';

function RoadmapPage() {
  const { user } = useAuth();
  const {
    loading,
    error,
    staticRoadmaps,
    pagination,
    loadStaticRoadmaps,
    addRoadmapToUser,
    addTaskToUser,
    isTaskAdded
  } = useRoadmap();

  const { id: detailId } = useParams();

  const [selectedTrack, setSelectedTrack] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingRoadmap, setIsAddingRoadmap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load roadmaps on component mount only once
  useEffect(() => {
    loadStaticRoadmaps(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadStaticRoadmaps(newPage, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const detailRoadmap = detailId
    ? staticRoadmaps.find(r => String(r.id) === detailId || String(r._id) === detailId)
    : null;

  const filteredRoadmaps = detailId ? [] : staticRoadmaps.filter(roadmap => {
    const matchesTrack = selectedTrack === 'all' || roadmap.track === selectedTrack;
    const matchesSearch = searchQuery === '' ||
      roadmap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roadmap.description && roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  const availableTracks = detailId ? [] : ['all', ...new Set(staticRoadmaps.map(roadmap => roadmap.track))];

  const detailCategories = detailRoadmap ? ['all', ...new Set((detailRoadmap.tasks || []).map(t => t.category).filter(Boolean))] : [];
  const detailFilteredTasks = detailRoadmap ? (
    selectedCategory === 'all'
      ? (detailRoadmap.tasks || [])
      : (detailRoadmap.tasks || []).filter(t => t.category === selectedCategory)
  ) : [];
  const detailSortedTasks = detailFilteredTasks.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAddRoadmap = async () => {
    if (!detailRoadmap) return;
    setIsAddingRoadmap(true);
    try {
      await addRoadmapToUser(detailRoadmap);
    } finally {
      setIsAddingRoadmap(false);
    }
  };

  const getTrackIcon = (track) => {
    const trackLower = track?.toLowerCase() || '';
    if (trackLower.includes('frontend')) return <FaPalette />;
    if (trackLower.includes('backend')) return <FaCog />;
    if (trackLower.includes('fullstack') || trackLower.includes('full-stack')) return <FaSyncAlt />;
    if (trackLower.includes('mobile')) return <FaMobileAlt />;
    if (trackLower.includes('devops')) return <FaWrench />;
    if (trackLower.includes('data')) return <FaChartBar />;
    if (trackLower.includes('ai') || trackLower.includes('ml')) return <FaRobot />;
    if (trackLower.includes('security')) return <FaLock />;
    return <FaLaptopCode />;
  };

  // Shared loading state
  if (!detailId && loading && staticRoadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !detailId) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-400 text-6xl mb-4"><FaExclamationTriangle /></div>
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Roadmaps</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => loadStaticRoadmaps(currentPage, 10)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detail view rendering
  if (detailId) {
    if (loading && !detailRoadmap) {
      return (
        <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading roadmap...</p>
          </div>
        </div>
      );
    }

    if (!detailRoadmap) {
      return (
        <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
          <div className="max-w-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Roadmap Not Found</h2>
            <p className="text-gray-400 mb-6">We couldn't find this roadmap. It may have been removed or the link is incorrect.</p>
            <a href="/roadmaps" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Back to Roadmaps</a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-900">
        {/* Hero / Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-5">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: detailRoadmap.color || '#3B82F6' }}
                >
                  {detailRoadmap.icon || getTrackIcon(detailRoadmap.track)}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{detailRoadmap.name}</h1>
                  <p className="text-gray-300 text-sm md:text-base max-w-2xl">{detailRoadmap.description}</p>
                  <p className="mt-2 text-gray-400 text-xs">Track: {detailRoadmap.track} • {detailRoadmap.tasks?.length || 0} tasks {detailRoadmap.totalEstimatedTime && `• ${detailRoadmap.totalEstimatedTime}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href="/roadmaps" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm">← All Roadmaps</a>
                {user && (
                  <button
                    onClick={handleAddRoadmap}
                    disabled={isAddingRoadmap}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
                  >
                    {isAddingRoadmap && (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {isAddingRoadmap ? 'Adding...' : 'Add Roadmap'}
                  </button>
                )}
              </div>
            </div>

            {detailRoadmap.prerequisites?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {detailRoadmap.prerequisites.map((p, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-800/40 text-blue-200 text-xs rounded">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Graph */}
          <div className="mb-10 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">Roadmap Graph <span className="text-xs text-gray-400 font-normal">(auto-generated)</span></h2>
            <div className="h-[420px] rounded-lg overflow-hidden border border-gray-700">
              <RoadmapFlow tasks={detailSortedTasks} roadmap={detailRoadmap} />
            </div>
          </div>

            {/* Category Filter */}
            {detailCategories.length > 2 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {detailCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {cat === 'all' ? 'All Tasks' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Tasks ({detailSortedTasks.length})</h2>
              {detailSortedTasks.length === 0 && (
                <p className="text-gray-400 text-sm">No tasks for this category.</p>
              )}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
                {detailSortedTasks.map(task => {
                  const already = isTaskAdded(task.id);
                  return (
                    <div key={task.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1 flex items-center justify-between">
                          <span>{task.name}</span>
                          {task.difficulty && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{task.difficulty}</span>
                          )}
                        </h3>
                        {task.description && (
                          <p className="text-gray-300 text-sm mb-2 line-clamp-4">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                          {task.estimatedTime && <span>⏱ {task.estimatedTime}</span>}
                          {task.category && <span>📁 {task.category}</span>}
                          {task.resources?.length > 0 && <span>🔗 {task.resources.length} resources</span>}
                        </div>
                        {task.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {task.resources.slice(0,3).map((r, i) => (
                              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded">
                                {r.type === 'video' && '🎥 '}
                                {r.type === 'article' && '📖 '}
                                {r.type === 'course' && '🎓 '}
                                {r.title || 'Resource'}
                              </a>
                            ))}
                            {task.resources.length > 3 && (
                              <span className="text-[10px] px-2 py-1 bg-gray-700 text-gray-300 rounded">+{task.resources.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Order: {task.order || '-'}</span>
                        <button
                          disabled={already}
                          onClick={async () => {
                            await addTaskToUser({
                              taskId: task.id,
                              name: task.name,
                              description: task.description,
                              staticTaskId: task.id,
                              roadmapTrack: detailRoadmap.track,
                              estimatedTime: task.estimatedTime,
                              difficulty: task.difficulty,
                              category: task.category,
                              resources: task.resources || []
                            });
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${already ? 'bg-green-700/40 text-green-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                          {already ? 'Added' : 'Add Task'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
    );
  }

  // LIST VIEW (no detailId)
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Career Roadmaps
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover learning paths and build your personalized roadmap
            </p>

            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roadmaps..."
                className="w-full md:flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {availableTracks.map(track => (
                  <option key={track} value={track}>
                    {track === 'all' ? 'All Tracks' : track}
                  </option>
                ))}
              </select>

              {user && (
                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {showCustomForm ? 'Cancel' : 'Add Custom Task'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User not logged in message */}
        {!user && (
          <div className="mb-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-blue-300 mb-2">
              🚀 Unlock Your Personal Roadmap
            </h2>
            <p className="text-gray-300 mb-4">
              Sign in to add tasks to your personal roadmap, track your progress, and customize your learning journey!
            </p>
            <a 
              href="/login" 
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sign In to Get Started
            </a>
          </div>
        )}

        {/* Custom task form */}
        {user && showCustomForm && (
          <div className="mb-8">
            <CustomTaskForm onClose={() => setShowCustomForm(false)} />
          </div>
        )}

        {/* Notice directing user to Profile for personal roadmap */}
        {user && (
          <div className="mb-8 bg-purple-900/20 border border-purple-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-300 mb-2">Your Personal Roadmap Has Moved</h2>
            <p className="text-gray-300 mb-4">Manage your added tasks, update statuses, notes, and progress in your profile page now.</p>
            <a
              href="/profile"
              className="inline-block px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Go to Profile
            </a>
          </div>
        )}

        {/* Static roadmaps */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Available Roadmaps
            </h2>
            <span className="text-gray-400">
              {filteredRoadmaps.length} roadmap{filteredRoadmaps.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {filteredRoadmaps.length > 0 ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {filteredRoadmaps.map((roadmap) => (
                  <StaticRoadmapCard
                    key={roadmap.id}
                    roadmap={roadmap}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      Page <span className="text-white font-semibold">{pagination.currentPage}</span> of{' '}
                      <span className="text-white font-semibold">{pagination.totalPages}</span>
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({pagination.totalCount} total)
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No roadmaps found
              </h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTrack('all');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}

export default RoadmapPage;
