import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "../components/SkeletonLoaders/DashboardSkeleton.jsx";

export default function Dashboard() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/roadmaps");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setRoadmaps(data);
        console.log("Roadmaps fetched successfully:", data);
      } catch (err) {
        console.error("Error fetching roadmaps:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  const gradients = [
    'from-blue-600 to-blue-800',
    'from-purple-600 to-purple-800',
    'from-pink-600 to-pink-800',
    'from-green-600 to-green-800',
    'from-indigo-600 to-indigo-800',
    'from-cyan-600 to-cyan-800',
  ];

  const icons = ['🚀', '💻', '📊', '🎨', '⚙️', '🔐', '📱', '🌟', '🎯'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3">
            Explore Learning Paths
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            Discover curated roadmaps to master your desired skills and advance your career
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {roadmaps.map((r, index) => (
              <div
                key={r._id}
                onClick={() => navigate(`/roadmap/${r._id}`)}
                className="group relative cursor-pointer h-60 sm:h-64"
              >
                {/* Background gradient card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                
                {/* Main card */}
                <div className="relative h-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-gray-600/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden">
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">{icons[(index * 7) % icons.length]}</div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 bg-gray-700/50 rounded-full">
                      Learning Path
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {r.title}
                  </h2>

                  {/* Description if available */}
                  {r.description && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors">
                      {r.description}
                    </p>
                  )}

                  {/* Footer with arrow */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800/80 to-transparent p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-blue-400 text-xs sm:text-sm font-semibold group-hover:text-blue-300 transition-colors">
                      <span>Explore</span>
                      <svg className="w-3 sm:w-4 h-3 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {roadmaps.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-400 text-base sm:text-lg">No roadmaps available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

