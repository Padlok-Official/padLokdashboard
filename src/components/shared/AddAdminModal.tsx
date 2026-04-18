import { type FC, useState } from 'react';
import { X, Mail, Send, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';
import type { RoleData } from './CreateRoleModal';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: string) => void;
  roles: RoleData[];
}

const AddAdminModal: FC<AddAdminModalProps> = ({ isOpen, onClose, onSubmit, roles }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedRoleData = roles.find((r) => r.name === selectedRole);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!selectedRole) {
      setError('Please select a role for the new admin');
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSubmit(email, selectedRole);
    setSending(false);
    setEmail('');
    setSelectedRole('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invite New Admin</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Send an email invitation with role-based access
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Email Input */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the new admin's email..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Role Selection Dropdown */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Assign Role</label>
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm',
                selectedRole ? 'border-brand-green text-gray-900' : 'border-gray-200 text-gray-400',
              )}
            >
              {selectedRole || 'Select a role...'}
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {roles.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-gray-400">No roles created yet. Create a role first.</p>
                ) : (
                  roles.map((role) => (
                    <button
                      key={role.name}
                      onClick={() => {
                        setSelectedRole(role.name);
                        setShowRoleDropdown(false);
                      }}
                      className={cn(
                        'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50',
                        selectedRole === role.name && 'bg-brand-green/5',
                      )}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Role Permissions Preview */}
        {selectedRoleData && (
          <div className="mb-5 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
            <p className="mb-2 text-xs font-semibold text-brand-green">
              Permissions for {selectedRoleData.name} ({selectedRoleData.permissions.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedRoleData.permissions.slice(0, 8).map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-700 border border-gray-200"
                >
                  {p.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              ))}
              {selectedRoleData.permissions.length > 8 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 border border-gray-200">
                  +{selectedRoleData.permissions.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="mb-4 text-sm text-[#F44336]">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-[#020036] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {sending ? (
              <>
                <Spinner size="sm" /> Sending Invite...
              </>
            ) : (
              <>
                <Send size={16} /> Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
