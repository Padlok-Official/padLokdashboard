import { Suspense } from 'react';
import type { FC } from 'react';
import { Outlet, useNavigation } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageSkeleton from '@/components/shared/PageSkeleton';

const DashboardLayout: FC = () => {
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Route transition progress bar */}
        {isNavigating && (
          <div className="absolute left-60 right-0 top-0 z-50 h-1">
            <div className="h-full animate-pulse bg-brand-green" />
          </div>
        )}
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
