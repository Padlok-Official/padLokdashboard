import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import authService from '@/services/auth-service';
import Spinner from './Spinner';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

const LogoutModal: FC<LogoutModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogout = async () => {
    setLoading(true);

    // Best-effort server-side revoke — don't block logout on API failure.
    const refreshToken = useAuthStore.getState().refreshToken ?? undefined;
    try {
      await authService.logout(refreshToken);
    } catch {
      // Ignore — we'll still clear local state below
    }

    logout();
    toast.success('You have been logged out successfully');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F44336]/10">
          <LogOut size={28} className="text-[#F44336]" />
        </div>

        {/* Content */}
        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Logout Confirmation
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to log out of your account? You will need to
            sign in again to access the dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#F44336] py-3 text-sm font-medium text-white transition-colors hover:bg-[#D32F2F] disabled:opacity-80"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={16} />
                Yes, Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
