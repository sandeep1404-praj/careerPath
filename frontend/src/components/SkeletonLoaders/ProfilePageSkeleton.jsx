import React from 'react';

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
            
            <div className="flex-1">
              {/* Name */}
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-3"></div>
              
              {/* Email/info */}
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded p-4">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="h-10 bg-gray-800 rounded w-32"></div>
          <div className="h-10 bg-gray-800 rounded w-32"></div>
          <div className="h-10 bg-gray-800 rounded w-32"></div>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-2 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>

            {/* Tasks list */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-700 rounded">
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sidebar card 1 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>

            {/* Sidebar card 2 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
