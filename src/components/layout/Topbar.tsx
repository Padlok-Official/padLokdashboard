import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const Topbar: FC = () => {
  const admin = useAuthStore((s) => s.admin);

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-gray-100 bg-white px-8">
      {/* Left — Page Title */}
      <div>
        <h1 className="text-lg font-bold text-brand-green">Business Intelligence</h1>
        <p className="text-xs text-brand-green/70">Partner Intelligence Dashboard</p>
      </div>

      {/* Right — User Profile */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          <img
            src={admin?.avatar_url ?? `https://ui-avatars.com/api/?name=${admin?.name ?? 'Admin'}&background=E8EAF0&color=01001c`}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{admin?.name ?? 'Moni Roy'}</p>
          <p className="text-xs text-gray-500">Admin</p>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </header>
  );
};

export default Topbar;
