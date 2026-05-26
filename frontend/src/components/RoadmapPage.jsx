import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRoadmap } from '../contexts/RoadmapContext.jsx';
import { roadmapAPI } from '../services/api.js';
import StaticRoadmapCard from './roadmap/StaticRoadmapCard.jsx';
import CustomTaskForm from './roadmap/CustomTaskForm.jsx';
import RoadmapFlow from './roadmap/RoadmapFlow.jsx';
import { RoadmapListSkeleton } from './SkeletonLoaders/RoadmapCardSkeleton.jsx';
import { DetailRoadmapSkeleton } from './SkeletonLoaders/DetailRoadmapSkeleton.jsx';
import { scrollToTop } from '@/utils/lenis';

import {
  FaPalette, FaCog, FaSyncAlt, FaMobileAlt, FaWrench, FaChartBar, FaRobot,
  FaLock, FaLaptopCode, FaExclamationTriangle, FaRocket, FaSearch, FaFilter
} from 'react-icons/fa';

function RoadmapPage() {
  const { user, token } = useAuth();
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
  const [showFilters, setShowFilters] = useState(false);
  const [detailRoadmapData, setDetailRoadmapData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load roadmaps on component mount only once
  useEffect(() => {
    loadStaticRoadmaps(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch specific roadmap if not found in loaded list
  useEffect(() => {
    if (!detailId) {
      setDetailRoadmapData(null);
      return;
    }

    // First, check if it's already in the loaded list
    const foundInList = staticRoadmaps.find(r => String(r.id) === detailId || String(r._id) === detailId);
    
    if (foundInList) {
      console.log('Found roadmap in list:', foundInList);
      setDetailRoadmapData(foundInList);
      setDetailLoading(false);
      return;
    }

    // If not found in list, fetch it directly
    // (even if page 1 is still loading, we want to fetch the specific roadmap)
    if (!detailRoadmapData) {
      setDetailLoading(true);
      roadmapAPI.getStaticRoadmap(detailId)
        .then(response => {
          console.log('API response:', response);
          // Handle both wrapped and direct responses
          const roadmap = response.roadmap || response;
          console.log('Extracted roadmap:', roadmap);
          console.log('Tasks:', roadmap.tasks);
          setDetailRoadmapData(roadmap);
          setDetailLoading(false);
        })
        .catch(err => {
          console.error('Error fetching roadmap:', err);
          setDetailRoadmapData(null);
          setDetailLoading(false);
        });
    }
  }, [detailId, staticRoadmaps]);

  // Handle page changes
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    loadStaticRoadmaps(newPage, 10);
    scrollToTop({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    });
  }, [loadStaticRoadmaps]);

  const detailRoadmap = useMemo(() => 
    detailId ? detailRoadmapData : null,
    [detailId, detailRoadmapData]
  );

  // Track recently opened roadmap when detail view is opened
  useEffect(() => {
    if (detailId && detailRoadmap && user && token) {
      try {
        const roadmapId = detailRoadmap.id || detailRoadmap._id;
        const roadmapName = detailRoadmap.name;
        roadmapAPI.trackRecentlyOpened(token, roadmapId, roadmapName).catch(err => {
          console.warn('Failed to track recently opened roadmap:', err);
        });
      } catch (error) {
        console.warn('Error tracking recently opened roadmap:', error);
      }
    }
  }, [detailId, detailRoadmap, user, token]);

  const filteredRoadmaps = useMemo(() => {
    if (detailId) return [];
    return staticRoadmaps.filter(roadmap => {
      const matchesTrack = selectedTrack === 'all' || roadmap.track === selectedTrack;
      const matchesSearch = searchQuery === '' ||
        roadmap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (roadmap.description && roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTrack && matchesSearch;
    });
  }, [detailId, staticRoadmaps, selectedTrack, searchQuery]);

  const availableTracks = useMemo(() => 
    detailId ? [] : ['all', ...new Set(staticRoadmaps.map(roadmap => roadmap.track))],
    [detailId, staticRoadmaps]
  );

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
          {/* Header loading skeleton */}
          <div className="mb-8 space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
          </div>
          {/* Filter/search skeleton */}
          <div className="mb-6 h-10 bg-gray-800 rounded w-1/2 animate-pulse"></div>
          {/* Roadmaps grid skeleton */}
          <RoadmapListSkeleton count={9} />
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
    if (detailLoading && !detailRoadmap) {
      return <DetailRoadmapSkeleton />;
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
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-6 sm:py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
              <div className="flex flex-col min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 break-words">{detailRoadmap.name}</h1>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-2xl mb-2">{detailRoadmap.description}</p>
                <p className="text-gray-400 text-xs">Track: {detailRoadmap.track} • {detailRoadmap.tasks?.length || 0} tasks {detailRoadmap.totalEstimatedTime && `• ${detailRoadmap.totalEstimatedTime}`}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                <a href="/roadmaps" className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs sm:text-sm transition-colors flex-1 sm:flex-initial text-center">
                  <span className="hidden sm:inline">← All Roadmaps</span>
                  <span className="sm:hidden">← All</span>
                </a>
                {user && (
                  <button
                    onClick={handleAddRoadmap}
                    disabled={isAddingRoadmap}
                    className="px-3 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors flex-1 sm:flex-initial justify-center"
                  >
                    {isAddingRoadmap && (
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">{isAddingRoadmap ? 'Adding...' : 'Add Roadmap'}</span>
                    <span className="sm:hidden">{isAddingRoadmap ? '...' : 'Add'}</span>
                  </button>
                )}
              </div>
            </div>

            {detailRoadmap.prerequisites?.length > 0 && (
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {detailRoadmap.prerequisites.map((p, i) => (
                  <span key={i} className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-800/40 text-blue-200 text-xs rounded">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          {/* Graph */}
          <div className="mb-6 sm:mb-8 md:mb-10 bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">Roadmap Graph <span className="text-xs text-gray-400 font-normal">(auto-generated)</span></h2>
            <div className="h-[280px] sm:h-[320px] md:h-[420px] rounded-lg overflow-hidden border border-gray-700">
              {detailRoadmap?.tasks && detailRoadmap.tasks.length > 0 ? (
                <RoadmapFlow tasks={detailSortedTasks} roadmap={detailRoadmap} />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                  <p>No tasks available for this roadmap.</p>
                </div>
              )}
            </div>
          </div>

            {/* Category Filter */}
            {detailCategories.length > 2 && (
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-1.5 sm:gap-2">
                {detailCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {cat === 'all' ? 'All Tasks' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Tasks ({detailSortedTasks.length})</h2>
              {detailSortedTasks.length === 0 && (
                <p className="text-gray-400 text-sm">No tasks for this category.</p>
              )}
              <div className="grid gap-3 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {detailSortedTasks.map(task => {
                  const already = isTaskAdded(task.id);
                  return (
                    <div key={task.id} className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-gray-600 transition-colors flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1 sm:mb-2 flex items-start justify-between gap-2">
                          <span className="text-sm sm:text-base break-words">{task.name}</span>
                          {task.difficulty && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 whitespace-nowrap flex-shrink-0">{task.difficulty}</span>
                          )}
                        </h3>
                        {task.description && (
                          <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-4">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-400 mb-2 sm:mb-3">
                          {task.estimatedTime && <span className="whitespace-nowrap">⏱ {task.estimatedTime}</span>}
                          {task.category && <span className="whitespace-nowrap">📁 {task.category}</span>}
                          {task.resources?.length > 0 && <span className="whitespace-nowrap">🔗 {task.resources.length}</span>}
                        </div>
                        {task.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            {task.resources.slice(0,3).map((r, i) => (
                              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded">
                                {r.type === 'video' && '🎥 '}
                                {r.type === 'article' && '📖 '}
                                {r.type === 'course' && '🎓 '}
                                {r.title || 'Resource'}
                              </a>
                            ))}
                            {task.resources.length > 3 && (
                              <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 bg-gray-700 text-gray-300 rounded">+{task.resources.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between">
                        {/* <span className="text-xs text-gray-500">Order: {task.order || '-'}</span> */}
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
                          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs rounded transition-colors ${already ? 'bg-green-700/40 text-green-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      {/* Header with gradient and improved design */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 py-8 md:py-12 lg:py-16 overflow-hidden">
        {/* Animated background pattern - hidden on mobile */}
        <div className="absolute inset-0 opacity-10 hidden md:block">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-200 text-xs sm:text-sm mb-4 sm:mb-6">
              <FaRocket className="animate-bounce text-sm sm:text-base" />
              <span className="hidden sm:inline">Your Career Journey Starts Here</span>
              <span className="sm:hidden">Career Journey</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Career <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Roadmaps</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
              Discover curated learning paths and build your personalized roadmap to success
            </p>

            {/* Search and filter with improved design */}
            <div className="flex flex-col gap-3 sm:gap-4 max-w-4xl mx-auto px-2 sm:px-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                {/* Enhanced search bar */}
                <div className="relative flex-1 w-full group">
                  <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors text-sm sm:text-base" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roadmaps..."
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-gray-800/60 backdrop-blur-sm text-sm sm:text-base text-white rounded-lg sm:rounded-xl border border-gray-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg focus:shadow-blue-500/20 placeholder-gray-500 transition-all"
                  />
                </div>
                
                {/* Improved filter button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-gray-700/60 to-gray-800/60 backdrop-blur-sm hover:from-gray-700 hover:to-gray-800 text-white text-sm sm:text-base rounded-lg sm:rounded-xl transition-all border border-gray-600/60 hover:border-gray-500/80 flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg hover:shadow-lg hover:shadow-gray-600/20 group"
                >
                  <FaFilter className="group-hover:rotate-12 transition-transform" />
                  <span>Filters</span>
                  <span className="text-xs opacity-60">{showFilters ? '▲' : '▼'}</span>
                </button>

                {/* Improved custom task button */}
                {user && (
                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40 flex items-center gap-2 w-full md:w-auto justify-center font-semibold group"
                  >
                    <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
                    <span>{showCustomForm ? 'Cancel' : 'Custom Task'}</span>
                  </button>
                )}
              </div>

              {/* Improved track filter */}
              {showFilters && (
                <div className="flex flex-wrap gap-2 justify-center animate-fadeIn p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
                  {availableTracks.map(track => (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                        selectedTrack === track
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/40'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/60 border border-gray-600/40'
                      }`}
                    >
                      {track === 'all' ? '🌐 All Tracks' : track}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User not logged in message */}
        {!user && (
          <div className="mb-6 sm:mb-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-300 mb-2">
              🚀 Unlock Your Personal Roadmap
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4">
              Sign in to add tasks to your personal roadmap, track your progress, and customize your learning journey!
            </p>
            <a 
              href="/login" 
              className="inline-block px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-colors"
            >
              Sign In to Get Started
            </a>
          </div>
        )}

        {/* Custom task form */}
        {user && showCustomForm && (
          <div className="mb-6 sm:mb-8">
            <CustomTaskForm onClose={() => setShowCustomForm(false)} />
          </div>
        )}

        {/* Static roadmaps section */}
        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          {/* Section header */}
          <div className="flex justify-between items-start sm:items-center gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                Available Roadmaps
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                {filteredRoadmaps.length > 0 ? `${filteredRoadmaps.length} roadmap${filteredRoadmaps.length !== 1 ? 's' : ''} available` : 'No roadmaps found'}
              </p>
            </div>
          </div>

          {filteredRoadmaps.length > 0 ? (
            <>
              {loading ? (
                <RoadmapListSkeleton count={9} />
              ) : (
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                  {filteredRoadmaps.map((roadmap) => (
                    <StaticRoadmapCard
                      key={roadmap.id}
                      roadmap={roadmap}
                    />
                  ))}
                </div>
              )}

              {/* Enhanced Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 font-medium shadow-lg hover:shadow-lg hover:shadow-gray-600/20 group"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">← Prev</span>
                  </button>

                  {/* Page indicator */}
                  <div className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-700/50 text-xs sm:text-sm">
                    <span className="text-gray-400 hidden sm:inline">
                      Page
                    </span>
                    <span className="text-white font-bold">
                      {pagination.currentPage}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">
                      of
                    </span>
                    <span className="text-gray-400 sm:hidden">/</span>
                    <span className="text-white font-bold">
                      {pagination.totalPages}
                    </span>
                    <span className="text-gray-500 text-xs ml-1 hidden sm:inline">
                      ({pagination.totalCount} total)
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 font-medium shadow-lg hover:shadow-lg hover:shadow-gray-600/20 group"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next →</span>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No roadmaps found
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTrack('all');
                }}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
