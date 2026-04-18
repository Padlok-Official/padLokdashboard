import { type FC, useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

interface Permission {
  key: string;
  label: string;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

const permissionCategories: PermissionCategory[] = [
  {
    name: 'Financial Analysis',
    permissions: [
      { key: 'view_revenue', label: 'View Revenue Reports' },
      { key: 'view_forecasts', label: 'View Financial Forecasts' },
      { key: 'export_financials', label: 'Export Financial Data' },
      { key: 'manage_escrow', label: 'Manage Escrow Funds' },
      { key: 'release_funds', label: 'Release Funds' },
      { key: 'process_refunds', label: 'Process Refunds' },
    ],
  },
  {
    name: 'User Management',
    permissions: [
      { key: 'view_users', label: 'View User Profiles' },
      { key: 'edit_users', label: 'Edit User Information' },
      { key: 'suspend_users', label: 'Suspend / Ban Users' },
      { key: 'verify_kyc', label: 'Verify KYC Documents' },
      { key: 'flag_users', label: 'Flag Users' },
    ],
  },
  {
    name: 'Transaction Management',
    permissions: [
      { key: 'view_transactions', label: 'View Transactions' },
      { key: 'create_orders', label: 'Create Orders' },
      { key: 'update_orders', label: 'Update Orders' },
      { key: 'delete_orders', label: 'Delete Orders' },
      { key: 'view_analytics', label: 'View Analytics' },
    ],
  },
  {
    name: 'Dispute Management',
    permissions: [
      { key: 'view_disputes', label: 'View Disputes' },
      { key: 'resolve_disputes', label: 'Resolve Disputes' },
      { key: 'review_evidence', label: 'Review Evidence' },
      { key: 'apply_flags', label: 'Apply Dispute Flags' },
    ],
  },
  {
    name: 'Communication',
    permissions: [
      { key: 'send_messages', label: 'Send Messages' },
      { key: 'view_messages', label: 'View Messages' },
      { key: 'send_notifications', label: 'Send Push Notifications' },
      { key: 'send_sms', label: 'Send SMS' },
      { key: 'send_email', label: 'Send Emails' },
    ],
  },
  {
    name: 'Administration',
    permissions: [
      { key: 'view_activity_log', label: 'View Activity Log' },
      { key: 'manage_branches', label: 'Manage Branches' },
      { key: 'create_branch', label: 'Create Branch' },
      { key: 'delete_branch', label: 'Delete Branch' },
      { key: 'manage_admins', label: 'Manage Admin Accounts' },
    ],
  },
];

export interface RoleData {
  /** UUID when editing an existing role; omitted when creating. */
  id?: string;
  name: string;
  description: string;
  /** Permission KEYS (e.g. "view_revenue") not UUIDs. */
  permissions: string[];
}

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: RoleData) => void;
  editRole?: RoleData | null;
  /** Controlled from the page — shows a spinner + blocks close while true. */
  isSubmitting?: boolean;
}

const CreateRoleModal: FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editRole,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(editRole?.name ?? '');
  const [description, setDescription] = useState(editRole?.description ?? '');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(editRole?.permissions ?? []),
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(permissionCategories.map((c) => c.name)),
  );
  const [error, setError] = useState('');

  // Sync state when editRole changes (opening modal for a different role)
  useEffect(() => {
    setName(editRole?.name ?? '');
    setDescription(editRole?.description ?? '');
    setSelectedPerms(new Set(editRole?.permissions ?? []));
    setError('');
  }, [editRole, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const togglePerm = (key: string) => {
    const next = new Set(selectedPerms);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedPerms(next);
  };

  const toggleAllInCategory = (cat: PermissionCategory) => {
    const allSelected = cat.permissions.every((p) => selectedPerms.has(p.key));
    const next = new Set(selectedPerms);
    if (allSelected) {
      cat.permissions.forEach((p) => next.delete(p.key));
    } else {
      cat.permissions.forEach((p) => next.add(p.key));
    }
    setSelectedPerms(next);
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter a role name');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a role description');
      return;
    }
    if (selectedPerms.size === 0) {
      setError('Please select at least one permission');
      return;
    }

    // Delegate to the parent — the mutation hook owns async state.
    onSubmit({
      id: editRole?.id,
      name: name.trim(),
      description: description.trim(),
      permissions: Array.from(selectedPerms),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Define role name, description, and permissions
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Role Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Role Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Branch Supervisor"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Manage all branches"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
          />
        </div>

        {/* Permissions */}
        <div className="mb-5">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Permissions ({selectedPerms.size} selected)
          </label>
          <div className="space-y-3">
            {permissionCategories.map((cat) => {
              const isExpanded = expandedCategories.has(cat.name);
              const allSelected = cat.permissions.every((p) => selectedPerms.has(p.key));
              const someSelected = cat.permissions.some((p) => selectedPerms.has(p.key));

              return (
                <div key={cat.name} className="rounded-xl border border-gray-200">
                  {/* Category Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between px-4 py-3"
                    onClick={() => toggleCategory(cat.name)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleAllInCategory(cat);
                        }}
                        className="h-4 w-4 rounded border-gray-300 accent-brand-green"
                      />
                      <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-400">
                        {cat.permissions.filter((p) => selectedPerms.has(p.key)).length}/{cat.permissions.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>

                  {/* Sub-permissions */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        {cat.permissions.map((perm) => (
                          <label
                            key={perm.key}
                            className={cn(
                              'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                              selectedPerms.has(perm.key)
                                ? 'bg-brand-green/10 text-brand-green'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPerms.has(perm.key)}
                              onChange={() => togglePerm(perm.key)}
                              className="h-3.5 w-3.5 rounded border-gray-300 accent-brand-green"
                            />
                            {perm.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : editRole ? (
              'Update Role'
            ) : (
              'Create Role'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { permissionCategories };
export default CreateRoleModal;
