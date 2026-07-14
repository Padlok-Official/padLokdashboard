import { type FC, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Pencil,
  Trash2,
  Search,
  Plus,
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StatCard from '@/components/shared/StatCard';
import Spinner from '@/components/shared/Spinner';
import AddAdminModal from '@/components/shared/AddAdminModal';
import CreateRoleModal from '@/components/shared/CreateRoleModal';
import type { RoleData } from '@/components/shared/CreateRoleModal';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import {
  useAdmins,
  useAuditLogs,
  useInvitations,
  useInviteAdmin,
  useResendInvitation,
  useRevokeInvitation,
} from '@/hooks/useAdmins';
import type { Invitation } from '@/services/admin-service';

type Tab = 'users' | 'roles' | 'invitations' | 'audit';

const statusStyle: Record<string, string> = {
  active: 'text-brand-green',
  away: 'text-[#F59E0B]',
  inactive: 'text-[#F44336]',
  suspended: 'text-[#F44336]',
};

const invitationStatusStyle: Record<Invitation['status'], string> = {
  pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  accepted: 'bg-brand-green/10 text-brand-green',
  expired: 'bg-gray-100 text-gray-500',
  revoked: 'bg-gray-100 text-gray-500',
};

/** Badge color for an audit action, keyed on its category (first segment). */
const auditCategoryStyle: Record<string, string> = {
  auth: 'bg-blue-500/10 text-blue-600',
  admin: 'bg-brand-green/10 text-brand-green',
  role: 'bg-purple-500/10 text-purple-600',
  notification: 'bg-[#F59E0B]/10 text-[#F59E0B]',
};

/** Deterministic avatar color based on the admin's id/initials. */
const avatarColorFor = (seed: string): string => {
  const colors = [
    'bg-brand-green',
    'bg-purple-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('') || '??';

const friendly = (t: string) =>
  t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const formatRelative = (iso: string): string => {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} hr ago`;
  return `${Math.round(diff / 86_400_000)} day${
    Math.round(diff / 86_400_000) === 1 ? '' : 's'
  } ago`;
};

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

const AdminManagementPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState('');

  // Queries
  const rolesQuery = useRoles();
  const adminsQuery = useAdmins({ page: 1, limit: 20 });
  const invitationsQuery = useInvitations('pending');
  const auditQuery = useAuditLogs({
    page: auditPage,
    limit: 20,
    search: auditSearch.trim() || undefined,
  });

  // Mutations
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const inviteAdmin = useInviteAdmin();
  const resendInvitation = useResendInvitation();
  const revokeInvitation = useRevokeInvitation();

  const isCreatingOrUpdatingRole =
    createRole.isPending || updateRole.isPending;

  // Map the role list for the Invite modal (it wants {id, name, description, permissions[]}
  // keys). We pull key strings from the detail endpoint on-demand in a
  // future iteration — for now the modal just shows name + description.
  const rolesForInviteModal: RoleData[] = useMemo(
    () =>
      (rolesQuery.data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        permissions: [], // fetched lazily in edit flow; unused in invite UI
      })),
    [rolesQuery.data],
  );

  // Stats
  const totalUsers = adminsQuery.data?.pagination.total ?? 0;
  const activeCount =
    adminsQuery.data?.items.filter((a) => a.status === 'active').length ?? 0;
  const inactiveCount =
    adminsQuery.data?.items.filter((a) => a.status === 'inactive').length ?? 0;
  const pendingInvites = invitationsQuery.data?.pagination.total ?? 0;

  // --- Handlers --------------------------------------------------------------

  const handleCreateOrUpdateRole = (role: RoleData) => {
    if (role.id) {
      updateRole.mutate(
        {
          id: role.id,
          payload: {
            name: role.name,
            description: role.description || null,
            permissionKeys: role.permissions,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Role "${role.name}" updated`);
            setShowCreateRoleModal(false);
            setEditingRole(null);
          },
          onError: (err: Error) => toast.error(err.message),
        },
      );
      return;
    }

    createRole.mutate(
      {
        name: role.name,
        description: role.description || null,
        permissionKeys: role.permissions,
      },
      {
        onSuccess: (created) => {
          toast.success(`Role "${created.name}" created`);
          setShowCreateRoleModal(false);
          setEditingRole(null);
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  const handleDeleteRole = (id: string, name: string) => {
    if (!window.confirm(`Delete the "${name}" role? This cannot be undone.`)) {
      return;
    }
    deleteRole.mutate(id, {
      onSuccess: () => toast.success(`Role "${name}" deleted`),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const handleInvite = (email: string, roleId: string) => {
    inviteAdmin.mutate(
      { email, roleId },
      {
        onSuccess: (result) => {
          toast.success(`Invitation sent to ${email} as ${result.roleName}`);
          if (result.emailResult.devToken) {
            // Handy for testing without real email delivery.
            console.info(
              '%c[dev] accept invite URL →',
              'color:#2DB52D',
              result.emailResult.inviteUrl,
            );
          }
          setShowInviteModal(false);
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  const tabs: {
    key: Tab;
    label: string;
    count: number;
    icon: FC<{ size?: number; className?: string }>;
  }[] = [
    { key: 'users', label: 'Users', count: totalUsers, icon: Users },
    { key: 'roles', label: 'Roles', count: rolesQuery.data?.length ?? 0, icon: UserCheck },
    { key: 'invitations', label: 'Invitations', count: pendingInvites, icon: Mail },
    { key: 'audit', label: 'Audit Log', count: auditQuery.data?.pagination.total ?? 0, icon: History },
  ];

  return (
    <div>
      {/* Modals */}
      <AddAdminModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInvite}
        roles={rolesForInviteModal}
        isSubmitting={inviteAdmin.isPending}
      />
      <CreateRoleModal
        isOpen={showCreateRoleModal}
        onClose={() => {
          setShowCreateRoleModal(false);
          setEditingRole(null);
        }}
        onSubmit={handleCreateOrUpdateRole}
        editRole={editingRole}
        isSubmitting={isCreatingOrUpdatingRole}
      />

      {/* Header */}
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Admin Management</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users, roles, and invitations across all branches
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={rolesQuery.data?.length === 0}
          className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Plus size={16} />
          Invite User
        </button>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={20} className="text-white" />} value={String(totalUsers)} label="Total Users" change="" trend="up" />
        <StatCard icon={<UserCheck size={20} className="text-white" />} value={String(activeCount)} label="Active" change="" trend="up" />
        <StatCard icon={<UserX size={20} className="text-white" />} value={String(inactiveCount)} label="Inactive" change="" trend="down" />
        <StatCard icon={<Mail size={20} className="text-white" />} value={String(pendingInvites)} label="Pending Invites" change="" trend="up" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                activeTab === tab.key
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'bg-gray-100 text-gray-500',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ---- USERS TAB ---- */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {adminsQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : adminsQuery.error ? (
            <ErrorState onRetry={() => adminsQuery.refetch()} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Administrator', 'Role', 'Email', 'Status', 'Last Active'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminsQuery.data?.items.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                              avatarColorFor(a.id),
                            )}
                          >
                            {initialsFor(a.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{a.name}</p>
                            <p className="text-xs text-gray-400">#{a.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="whitespace-nowrap rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                          {a.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{a.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm font-medium capitalize', statusStyle[a.status])}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {a.lastActiveAt ? formatRelative(a.lastActiveAt) : '—'}
                      </td>
                    </tr>
                  ))}
                  {adminsQuery.data?.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                        No admins yet. Invite one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---- ROLES TAB ---- */}
      {activeTab === 'roles' && (
        <div>
          <div className="mb-5 flex justify-end">
            <button
              onClick={() => {
                setEditingRole(null);
                setShowCreateRoleModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Create Role
            </button>
          </div>

          {rolesQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : rolesQuery.error ? (
            <ErrorState onRetry={() => rolesQuery.refetch()} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {rolesQuery.data?.map((role) => (
                <div key={role.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                        {role.name}
                        {role.isSystem && (
                          <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-green">
                            System
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{role.description ?? '—'}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {!role.isSystem && (
                        <>
                          <button
                            onClick={() => {
                              // Loading the full role is handled inside the modal through editRole.
                              setEditingRole({
                                id: role.id,
                                name: role.name,
                                description: role.description ?? '',
                                permissions: [], // populated from API on open
                              });
                              setShowCreateRoleModal(true);
                            }}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            disabled={deleteRole.isPending}
                            className="rounded p-1.5 text-[#F44336] hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{role.permissionCount} permissions</span>
                    <span>{role.userCount} users</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- INVITATIONS TAB ---- */}
      {activeTab === 'invitations' && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Email', 'Role', 'Sent', 'Expires', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invitationsQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Spinner size="md" />
                    </td>
                  </tr>
                ) : invitationsQuery.error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-500">
                      Failed to load invitations.
                    </td>
                  </tr>
                ) : invitationsQuery.data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      No invitations sent yet. Click &ldquo;Invite User&rdquo; to send one.
                    </td>
                  </tr>
                ) : (
                  invitationsQuery.data?.items.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{inv.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="whitespace-nowrap rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                          {inv.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelative(inv.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {friendly(new Date(inv.expiresAt).toDateString())}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                            invitationStatusStyle[inv.status],
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inv.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                resendInvitation.mutate(inv.id, {
                                  onSuccess: () =>
                                    toast.success('Invitation resent'),
                                  onError: (err: Error) =>
                                    toast.error(err.message),
                                })
                              }
                              disabled={resendInvitation.isPending}
                              className="text-sm font-medium text-brand-green hover:underline disabled:opacity-50"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() =>
                                revokeInvitation.mutate(inv.id, {
                                  onSuccess: () =>
                                    toast.success('Invitation revoked'),
                                  onError: (err: Error) =>
                                    toast.error(err.message),
                                })
                              }
                              disabled={revokeInvitation.isPending}
                              className="text-sm font-medium text-[#F44336] hover:underline disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ---- AUDIT LOG TAB ---- */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }}
                placeholder="Search by action, name or email..."
                className="w-72 rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {auditQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : auditQuery.error ? (
            <ErrorState onRetry={() => auditQuery.refetch()} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Administrator', 'Action', 'Target', 'Details', 'IP Address', 'When'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditQuery.data?.items.map((log) => {
                      const category = log.action.split('.')[0];
                      const detailEntries = Object.entries(log.details).slice(0, 2);
                      return (
                        <tr key={log.id} className="border-b border-gray-50 last:border-b-0">
                          <td className="px-6 py-4">
                            {log.admin ? (
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                                    avatarColorFor(log.admin.id),
                                  )}
                                >
                                  {initialsFor(log.admin.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{log.admin.name}</p>
                                  <p className="text-xs text-gray-400">{log.admin.email}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">System</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                                auditCategoryStyle[category] ?? 'bg-gray-100 text-gray-500',
                              )}
                            >
                              {friendly(log.action.split('.').slice(1).join(' ') || log.action)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {log.entityType ? (
                              <div>
                                <p className="capitalize">{log.entityType}</p>
                                {log.entityId && (
                                  <p className="text-xs text-gray-400">#{log.entityId.slice(0, 8)}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="max-w-[220px] px-6 py-4 text-sm text-gray-500">
                            {detailEntries.length > 0 ? (
                              <div className="space-y-0.5">
                                {detailEntries.map(([k, v]) => (
                                  <p key={k} className="truncate text-xs" title={`${k}: ${String(v)}`}>
                                    <span className="font-medium text-gray-600">{friendly(k)}:</span>{' '}
                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.ipAddress ?? '—'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <p>{formatRelative(log.createdAt)}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                    {auditQuery.data?.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                          {auditSearch
                            ? 'No audit entries match your search.'
                            : 'No admin activity recorded yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(auditQuery.data?.pagination.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                  <p className="text-sm text-gray-500">
                    Page {auditQuery.data?.pagination.page} of{' '}
                    {auditQuery.data?.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                      disabled={auditPage <= 1}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <button
                      onClick={() => setAuditPage((p) => p + 1)}
                      disabled={auditPage >= (auditQuery.data?.pagination.totalPages ?? 1)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ErrorState: FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-sm text-gray-500">
    <AlertTriangle size={24} className="text-[#F59E0B]" />
    <p>Couldn&apos;t reach the API.</p>
    <button
      onClick={onRetry}
      className="rounded-lg bg-brand-green px-4 py-2 text-xs font-medium text-white"
    >
      Retry
    </button>
  </div>
);

export default AdminManagementPage;
