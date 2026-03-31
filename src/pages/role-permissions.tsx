import { useState, Fragment } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Users, Scale, Wallet, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Access = 'full' | 'none' | 'limited';

const roles = ['Super Admin', 'Operations', 'Dispute Officer', 'Finance Admin'] as const;

const roleCards = [
  { icon: <Shield size={20} className="text-white" />, title: 'Super Admin', description: 'Full platform access', bg: 'bg-brand-green text-white' },
  { icon: <Users size={20} className="text-white" />, title: 'Operations Admin', description: 'User and transaction mgmt', bg: 'border border-[#020036] bg-white text-gray-900' },
  { icon: <Scale size={20} className="text-white" />, title: 'Dispute Officer', description: 'Disputes and evidence', bg: 'border border-gray-200 bg-white text-gray-900' },
  { icon: <Wallet size={20} className="text-white" />, title: 'Finance Admin', description: 'Escrow and finances', bg: 'border border-gray-200 bg-white text-gray-900' },
];

interface PermissionRow {
  name: string;
  access: [Access, Access, Access, Access];
  description: string;
}

interface PermissionGroup {
  category: string;
  permissions: PermissionRow[];
}

const permissionGroups: PermissionGroup[] = [
  {
    category: 'User Management',
    permissions: [
      { name: 'View user profiles', access: ['full', 'full', 'full', 'none'], description: 'Access user details' },
      { name: 'Edit user information', access: ['full', 'full', 'none', 'none'], description: 'Modify user data' },
      { name: 'Suspend / Ban users', access: ['full', 'full', 'none', 'none'], description: 'Account restrictions' },
      { name: 'Verify KYC documents', access: ['full', 'full', 'none', 'none'], description: 'ID verification' },
    ],
  },
  {
    category: 'Transaction Management',
    permissions: [
      { name: 'View transactions', access: ['full', 'full', 'full', 'full'], description: 'Read-only access' },
      { name: 'Release escrow funds', access: ['full', 'none', 'none', 'full'], description: 'Approve fund release' },
      { name: 'Refund transactions', access: ['full', 'none', 'none', 'full'], description: 'Process refunds' },
    ],
  },
  {
    category: 'Dispute Management',
    permissions: [
      { name: 'View disputes', access: ['full', 'full', 'full', 'none'], description: 'Read-only access' },
      { name: 'Resolve disputes', access: ['full', 'none', 'full', 'none'], description: 'Make decisions' },
      { name: 'Review evidence', access: ['full', 'full', 'full', 'none'], description: 'Access attachments' },
      { name: 'Manage admin accounts', access: ['full', 'none', 'none', 'none'], description: 'Super Admin only' },
    ],
  },
];

const accessDot = (a: Access) => {
  if (a === 'full') return <div className="mx-auto h-4 w-4 rounded-full bg-brand-green" />;
  if (a === 'limited') return <div className="mx-auto h-4 w-4 rounded-full bg-[#F59E0B]" />;
  return <div className="mx-auto h-4 w-4 rounded-full bg-gray-200" />;
};

const RolePermissionsPage: FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(0);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span> Admin Management{' '}
        <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Role Permissions</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">
          Role Permissions
        </h1>
        <button
          onClick={() => navigate('/admin-management')}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900"
        >
          Back
        </button>
      </div>

      {/* Role Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {roleCards.map((r, i) => (
          <button
            key={r.title}
            onClick={() => setSelectedRole(i)}
            className={cn(
              'rounded-2xl p-4 text-left transition-colors',
              selectedRole === i ? r.bg : 'border border-gray-200 bg-white',
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#020036]">
                {r.icon}
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    selectedRole === i && i === 0
                      ? 'text-white'
                      : 'text-gray-900',
                  )}
                >
                  {r.title}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    selectedRole === i && i === 0
                      ? 'text-white/80'
                      : 'text-gray-500',
                  )}
                >
                  {r.description}
                </p>
              </div>
            </div>
          </button>
        ))}
        {/* Create New Role */}
        <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 text-gray-400 hover:border-brand-green hover:text-brand-green">
          <Plus size={24} />
          <span className="mt-1 text-xs font-medium">Create New Role</span>
        </button>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Permissions Matrix
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Configure access levels for each administrator role
            </p>
          </div>
          <button className="rounded-lg bg-[#020036] px-5 py-2.5 text-sm font-medium text-white">
            Save Changes
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Permission
                </th>
                {roles.map((r) => (
                  <th
                    key={r}
                    className="px-4 py-3 text-center text-sm font-semibold text-brand-green"
                  >
                    {r}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-sm text-gray-500">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {permissionGroups.map((group) => (
                <Fragment key={group.category}>
                  {/* Category Header */}
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-brand-green/5 px-6 py-2 text-sm font-semibold text-brand-green"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.permissions.map((perm) => (
                    <tr
                      key={perm.name}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {perm.name}
                      </td>
                      {perm.access.map((a, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {accessDot(a)}
                        </td>
                      ))}
                      <td className="px-6 py-3 text-right text-xs text-gray-400">
                        {perm.description}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-brand-green" />
            <span className="text-xs text-gray-600">Has Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-600">No Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
            <span className="text-xs text-gray-600">Limited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsPage;
