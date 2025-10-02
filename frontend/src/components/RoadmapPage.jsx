import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRoadmap } from '../contexts/RoadmapContext.jsx';
import StaticRoadmapCard from './roadmap/StaticRoadmapCard.jsx';
import UserRoadmapCard from './roadmap/UserRoadmapCard.jsx';
import CustomTaskForm from './roadmap/CustomTaskForm.jsx';

function RoadmapPage() {
  const { user } = useAuth();
  const { 
    loading, 
    error, 
    staticRoadmaps, 
    loadStaticRoadmaps 
  } = useRoadmap();

  const [selectedTrack, setSelectedTrack] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load static roadmaps on component mount
  useEffect(() => {
    if (!loading && staticRoadmaps.length === 0) {
      loadStaticRoadmaps();
    }
  }, [loading, staticRoadmaps.length, loadStaticRoadmaps]);

  // Filter roadmaps based on selected track and search query
  const filteredRoadmaps = staticRoadmaps.filter(roadmap => {
    const matchesTrack = selectedTrack === 'all' || roadmap.track === selectedTrack;
    const matchesSearch = searchQuery === '' || 
      roadmap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roadmap.description && roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  // Get unique tracks for filter
  const availableTracks = ['all', ...new Set(staticRoadmaps.map(roadmap => roadmap.track))];

  if (loading && staticRoadmaps.length === 0) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Roadmaps</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={loadStaticRoadmaps}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* User's personal roadmap */}
        {user && (
          <div className="mb-8">
            <UserRoadmapCard />
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
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {filteredRoadmaps.map((roadmap) => (
                <StaticRoadmapCard
                  key={roadmap.id}
                  roadmap={roadmap}
                />
              ))}
            </div>
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

        {/* Footer info */}
        <div className="mt-16 text-center text-gray-500">
          <p className="mb-2">
            💡 <strong>Tip:</strong> Click on a roadmap to explore its tasks and add them to your personal roadmap
          </p>
          {user && (
            <p>
              🎯 Track your progress and customize your learning journey with your personal roadmap above
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoadmapPage;
