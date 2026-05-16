import React from 'react';

export const RoadmapCardSkeleton = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-64">
      {/* Badge */}
      <div className="mb-3">
        <div className="h-6 w-20 bg-gray-700 rounded inline-block"></div>
      </div>

      {/* Title */}
      <div className="mb-3 h-6 bg-gray-700 rounded w-3/4"></div>

      {/* Description lines */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Task info */}
      <div className="flex justify-between mb-4">
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </div>

      {/* Button */}
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </div>
  );
};

export const RoadmapListSkeleton = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <RoadmapCardSkeleton key={i} />
      ))}
    </div>
  );
};
