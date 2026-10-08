import React from 'react';
import { motion } from 'framer-motion';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 pb-12 animate-pulse">
      {/* Welcome Header Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3 w-full max-w-md">
            <div className="w-24 h-4 bg-gray-200 rounded-full" />
            <div className="w-64 h-6 bg-gray-200 rounded-lg" />
            <div className="w-full h-4 bg-gray-100 rounded-full" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-32 h-10 bg-gray-200 rounded-lg" />
            <div className="w-24 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Fraud Loss Prevention Live Counter Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-28 rounded-2xl bg-gray-100 border-2 border-gray-50" />
        <div className="h-28 rounded-2xl bg-gray-100 border-2 border-gray-50" />
      </div>

      {/* KPI Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>

      {/* Main Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-80 bg-gray-100 rounded-xl" />
        <div className="h-80 bg-gray-100 rounded-xl" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
};
