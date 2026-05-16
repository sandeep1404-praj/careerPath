import React from 'react';

export const DetailRoadmapSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 animate-pulse">
      <div className="max-w-6xl mx-auto">
        {/* Back button skeleton */}
        <div className="mb-6 h-10 w-20 bg-gray-800 rounded"></div>

        {/* Header section */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          {/* Badge */}
          <div className="mb-3">
            <div className="h-6 w-24 bg-gray-700 rounded inline-block"></div>
          </div>

          {/* Title */}
          <div className="mb-4 h-8 bg-gray-700 rounded w-2/3"></div>

          {/* Description lines */}
          <div className="mb-6 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-4/5"></div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded p-4">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <div className="h-11 bg-gray-700 rounded flex-1"></div>
            <div className="h-11 bg-gray-700 rounded flex-1"></div>
          </div>
        </div>

        {/* Tasks section */}
        <div>
          {/* Section title */}
          <div className="mb-4 h-6 bg-gray-800 rounded w-1/4"></div>

          {/* Task items */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
