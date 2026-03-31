import type { FC } from 'react';

const PageSkeleton: FC = () => {
  return (
    <div className="animate-pulse">
      {/* Title */}
      <div className="mb-2 h-8 w-64 rounded-lg bg-gray-200" />
      <div className="mb-8 h-4 w-96 rounded bg-gray-100" />

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-100" />
            </div>
            <div className="mt-4">
              <div className="h-7 w-28 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Block */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
          <div className="h-4 w-4/6 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
