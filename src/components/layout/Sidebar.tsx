import type { FC } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  Monitor,
  TrendingUp,
  CreditCard,
  Zap,
  DollarSign,
  Wallet,
  AlertTriangle,
  Flag,
  Bell,
  UserCog,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  label: string;
  path: string;
  icon: FC<{ size?: number; className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: 'BI Overview', path: '/', icon: Monitor },
  { label: 'Financial Forecast', path: '/financial-forecast', icon: TrendingUp },
  { label: 'Payment Behavior', path: '/payment-behavior', icon: CreditCard },
  { label: 'Integration Insights', path: '/integration-insights', icon: Zap },
  { label: 'Revenue Analytics', path: '/revenue-analytics', icon: DollarSign },
  { label: 'Wallet & Escrow', path: '/wallet-escrow', icon: Wallet },
  { label: 'Disputes', path: '/disputes', icon: AlertTriangle },
  { label: 'Flags & Reports', path: '/flags-reports', icon: Flag },
];

const bottomNavItems: NavItem[] = [
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Admin Management', path: '/admin-management', icon: UserCog },
];

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-deep-navy">
          <span className="text-sm font-bold text-white">P</span>
        </div>
        <span className="text-sm font-semibold text-brand-deep-navy">PadLok</span>
      </div>

      {/* Main Nav */}
      <nav className="mt-8 flex-1 space-y-1 px-3">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-700 hover:bg-gray-50',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="space-y-1 border-t border-gray-100 px-3 py-4">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-700 hover:bg-gray-50',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <LogOut size={18} className="text-gray-500" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
