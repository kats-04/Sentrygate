import React from 'react';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-4 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-white/20 rounded w-3/4" />
        <div className="h-3 bg-white/20 rounded w-1/2" />
        <div className="h-3 bg-white/20 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonUserRow() {
  return (
    <div className="p-4 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-white/20 rounded w-1/3 mb-2" />
          <div className="h-3 bg-white/20 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-white/20 rounded w-16" />
          <div className="h-8 bg-white/20 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonUserRow key={i} />
      ))}
    </div>
  );
}

export default { SkeletonCard, SkeletonGrid, SkeletonUserRow, SkeletonList };
