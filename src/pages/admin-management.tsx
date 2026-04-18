import { type FC, useState } from 'react';
import { Users, UserCheck, UserX, Mail, Pencil, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StatCard from '@/components/shared/StatCard';
import AddAdminModal from '@/components/shared/AddAdminModal';
import CreateRoleModal from '@/components/shared/CreateRoleModal';
import type { RoleData } from '@/components/shared/CreateRoleModal';

type Tab = 'users' | 'roles' | 'invitations';

// --- Admin Users Data ---
interface Admin {
  initials: string;
  name: string;
  id: string;
  role: string;
  roleColor: string;
  email: string;
  status: 'Active' | 'Away' | 'Inactive';
  lastActive: string;
  bgColor: string;
}

const admins: Admin[] = [
  { initials: 'KA', name: 'Kwame Asante', id: '#ADM001', role: 'Branch Supervisor', roleColor: 'bg-brand-green/15 text-brand-green', email: 'kwame@padlok.com', status: 'Active', lastActive: 'Now', bgColor: 'bg-brand-green' },
  { initials: 'AA', name: 'Abena Adjei', id: '#ADM002', role: 'Branch Supervisor', roleColor: 'bg-brand-green/15 text-brand-green', email: 'abena@padlok.com', status: 'Active', lastActive: '2 hrs ago', bgColor: 'bg-purple-500' },
  { initials: 'JM', name: 'John Mensah', id: '#ADM003', role: 'Clerk', roleColor: 'bg-blue-100 text-blue-600', email: 'john.m@padlok.com', status: 'Active', lastActive: '30 min ago', bgColor: 'bg-blue-500' },
  { initials: 'EO', name: 'Efua Owusu', id: '#ADM004', role: 'Clerk', roleColor: 'bg-blue-100 text-blue-600', email: 'efua.o@padlok.com', status: 'Active', lastActive: '1 hr ago', bgColor: 'bg-amber-500' },
  { initials: 'KF', name: 'Kofi Frimpong', id: '#ADM005', role: 'Branch Supervisor', roleColor: 'bg-brand-green/15 text-brand-green', email: 'kofi.f@padlok.com', status: 'Away', lastActive: '5 hrs ago', bgColor: 'bg-brand-green' },
  { initials: 'AS', name: 'Ama Serwaa', id: '#ADM006', role: 'Clerk', roleColor: 'bg-blue-100 text-blue-600', email: 'ama.s@padlok.com', status: 'Inactive', lastActive: '3 days ago', bgColor: 'bg-pink-500' },
];

const statusStyle: Record<string, string> = {
  Active: 'text-brand-green',
  Away: 'text-[#F59E0B]',
  Inactive: 'text-[#F44336]',
};

// --- Invitations Data ---
interface Invitation {
  email: string;
  role: string;
  sentAt: string;
  status: 'Pending' | 'Accepted' | 'Expired';
}

const initialInvitations: Invitation[] = [
  { email: 'kofi.boateng@gmail.com', role: 'Branch Supervisor', sentAt: '2 hours ago', status: 'Pending' },
];

const invitationStatusStyle: Record<string, string> = {
  Pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Accepted: 'bg-brand-green/10 text-brand-green',
  Expired: 'bg-gray-100 text-gray-500',
};

// --- Default Roles ---
const defaultRoles: RoleData[] = [
  {
    name: 'Branch Supervisor',
    description: 'Manage all branches',
    permissions: [
      'view_activity_log', 'create_branch', 'delete_branch', 'manage_branches',
      'view_users', 'edit_users', 'view_transactions', 'view_analytics',
      'view_revenue', 'view_forecasts', 'export_financials',
      'view_disputes', 'resolve_disputes', 'review_evidence',
      'send_messages', 'view_messages', 'send_notifications',
      'suspend_users', 'verify_kyc', 'flag_users',
      'manage_escrow', 'release_funds', 'process_refunds',
    ],
  },
  {
    name: 'Clerk',
    description: 'Manage Job',
    permissions: [
      'send_messages', 'view_messages', 'create_orders', 'delete_orders',
      'update_orders', 'view_transactions',
    ],
  },
];

const AdminManagementPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>(defaultRoles);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);

  const handleCreateRole = (role: RoleData) => {
    if (editingRole) {
      setRoles((prev) => prev.map((r) => (r.name === editingRole.name ? role : r)));
      toast.success(`Role "${role.name}" updated`);
    } else {
      setRoles((prev) => [...prev, role]);
      toast.success(`Role "${role.name}" created with ${role.permissions.length} permissions`);
    }
    setShowCreateRoleModal(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleName: string) => {
    setRoles((prev) => prev.filter((r) => r.name !== roleName));
    toast.success(`Role "${roleName}" deleted`);
  };

  const handleInviteSubmit = (email: string, role: string) => {
    setShowInviteModal(false);
    setInvitations((prev) => [
      { email, role, sentAt: 'Just now', status: 'Pending' },
      ...prev,
    ]);
    toast.success(`Invitation sent to ${email} as ${role}`);
  };

  const tabs: { key: Tab; label: string; count: number; icon: FC<{ size?: number; className?: string }> }[] = [
    { key: 'users', label: 'Users', count: admins.length, icon: Users },
    { key: 'roles', label: 'Roles', count: roles.length, icon: UserCheck },
    { key: 'invitations', label: 'Invitations', count: invitations.length, icon: Mail },
  ];

  return (
    <div>
      {/* Modals */}
      <AddAdminModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteSubmit}
        roles={roles}
      />
      <CreateRoleModal
        isOpen={showCreateRoleModal}
        onClose={() => {
          setShowCreateRoleModal(false);
          setEditingRole(null);
        }}
        onSubmit={handleCreateRole}
        editRole={editingRole}
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
          className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Invite User
        </button>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={20} className="text-white" />}
          value={String(admins.length)}
          label="Total Users"
          change="+2"
          trend="up"
        />
        <StatCard
          icon={<UserCheck size={20} className="text-white" />}
          value={String(admins.filter((a) => a.status === 'Active').length)}
          label="Active"
          change="+1"
          trend="up"
        />
        <StatCard
          icon={<UserX size={20} className="text-white" />}
          value={String(admins.filter((a) => a.status === 'Inactive').length)}
          label="Inactive"
          change="0"
          trend="down"
        />
        <StatCard
          icon={<Mail size={20} className="text-white" />}
          value={String(invitations.filter((i) => i.status === 'Pending').length)}
          label="Pending Invites"
          change="+1"
          trend="up"
        />
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

      {/* Tab Content */}
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
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">All Roles</button>
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Active</button>
              <button className="rounded-lg bg-[#020036] px-4 py-2 text-sm font-medium text-white">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Administrator</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Active</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white', a.bgColor)}>
                          {a.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', a.roleColor)}>{a.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className={cn('text-sm font-medium', statusStyle[a.status])}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={16} /></button>
                        <button className="rounded p-1 text-[#F44336] hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div>
          {/* Create Role Button */}
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

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {roles.map((role) => (
              <div key={role.name} className="rounded-2xl border border-gray-200 bg-white p-5">
                {/* Role Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setShowCreateRoleModal(true);
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.name)}
                      className="rounded p-1.5 text-[#F44336] hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>{role.permissions.length} permissions</span>
                  <span>{admins.filter((a) => a.role === role.name).length} users</span>
                </div>

                {/* Permission Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 6).map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {p.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  ))}
                  {role.permissions.length > 6 && (
                    <span className="rounded-md bg-brand-green/10 px-2 py-1 text-xs text-brand-green">
                      +{role.permissions.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                      No invitations sent yet. Click "Invite User" to send one.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{inv.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="whitespace-nowrap rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{inv.sentAt}</td>
                      <td className="px-6 py-4">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', invitationStatusStyle[inv.status])}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm font-medium text-brand-green hover:underline">Resend</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;
