import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="space-y-6">
        {/* Title skeleton */}
        <div>
          <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse mb-6"></div>
        </div>

        {/* Grid of roadmap cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-6 animate-pulse"
            >
              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-10 bg-gray-700 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
