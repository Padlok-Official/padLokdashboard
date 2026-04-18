import { createBrowserRouter, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import type { FC, ReactNode } from 'react';

import LoginPage from '@/pages/login';
import AcceptInvitePage from '@/pages/accept-invite';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/dashboard';
import FinancialForecastPage from '@/pages/financial-forecast';
import PaymentBehaviorPage from '@/pages/payment-behavior';
import IntegrationInsightsPage from '@/pages/integration-insights';
import RevenueAnalyticsPage from '@/pages/revenue-analytics';
import WalletEscrowPage from '@/pages/wallet-escrow';
import DisputesPage from '@/pages/disputes';
import EvidencePanelPage from '@/pages/evidence-panel';
import FlagsReportsPage from '@/pages/flags-reports';
import FlaggedUserDetailsPage from '@/pages/flagged-user-details';
import NotificationsPage from '@/pages/notifications';
import AdminManagementPage from '@/pages/admin-management';
import RolePermissionsPage from '@/pages/role-permissions';
import NotFoundPage from '@/pages/not-found';

interface GuardProps {
  children: ReactNode;
}

const AuthGuard: FC<GuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const GuestGuard: FC<GuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};


export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    // Public — guest-only. Existing admins get redirected home because
    // re-accepting would try to create a duplicate account.
    path: '/accept-invite',
    element: (
      <GuestGuard>
        <AcceptInvitePage />
      </GuestGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'financial-forecast', element: <FinancialForecastPage /> },
      { path: 'payment-behavior', element: <PaymentBehaviorPage /> },
      { path: 'integration-insights', element: <IntegrationInsightsPage /> },
      { path: 'revenue-analytics', element: <RevenueAnalyticsPage /> },
      { path: 'wallet-escrow', element: <WalletEscrowPage /> },
      { path: 'disputes', element: <DisputesPage /> },
      { path: 'disputes/:disputeId', element: <EvidencePanelPage /> },
      { path: 'flags-reports', element: <FlagsReportsPage /> },
      { path: 'flags-reports/:userId', element: <FlaggedUserDetailsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'admin-management', element: <AdminManagementPage /> },
      { path: 'admin-management/permissions', element: <RolePermissionsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
