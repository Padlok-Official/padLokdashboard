import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Users, Scale, Wallet, Pencil, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { initials: 'KA', name: 'Kwame Asante', id: '#ADM001', role: 'Super Admin', roleColor: 'bg-brand-green/15 text-brand-green', email: 'kwame@padlok.com', status: 'Active', lastActive: 'Now', bgColor: 'bg-brand-green' },
  { initials: 'AA', name: 'Abena Adjei', id: '#ADM002', role: 'Super Admin', roleColor: 'bg-brand-green/15 text-brand-green', email: 'abena@padlok.com', status: 'Active', lastActive: '2 hrs ago', bgColor: 'bg-purple-500' },
  { initials: 'JM', name: 'John Mensah', id: '#ADM003', role: 'Operations', roleColor: 'bg-blue-100 text-blue-600', email: 'john.m@padlok.com', status: 'Active', lastActive: '30 min ago', bgColor: 'bg-blue-500' },
  { initials: 'EO', name: 'Efua Owusu', id: '#ADM004', role: 'Dispute Officer', roleColor: 'bg-purple-100 text-purple-600', email: 'efua.o@padlok.com', status: 'Active', lastActive: '1 hr ago', bgColor: 'bg-amber-500' },
  { initials: 'KF', name: 'Kofi Frimpong', id: '#ADM005', role: 'Finance Admin', roleColor: 'bg-red-100 text-red-500', email: 'kofi.f@padlok.com', status: 'Away', lastActive: '5 hrs ago', bgColor: 'bg-brand-green' },
  { initials: 'AS', name: 'Ama Serwaa', id: '#ADM006', role: 'Operations', roleColor: 'bg-blue-100 text-blue-600', email: 'ama.s@padlok.com', status: 'Inactive', lastActive: '3 days ago', bgColor: 'bg-pink-500' },
];

const statusStyle: Record<string, string> = {
  Active: 'text-brand-green',
  Away: 'text-[#F59E0B]',
  Inactive: 'text-[#F44336]',
};

interface Activity {
  title: string;
  time: string;
  dotColor: string;
}

const recentActivity: Activity[] = [
  { title: 'Kwame Asante approved dispute #DSP0124', time: '2 minutes ago', dotColor: 'bg-brand-green' },
  { title: 'John Mensah updated user KYC status', time: '15 minutes ago', dotColor: 'bg-brand-green' },
  { title: 'Efua Owusu resolved dispute #DSP0118', time: '1 hour ago', dotColor: 'bg-brand-green' },
  { title: 'Kofi Frimpong released escrow GHS 4,500', time: '2 hours ago', dotColor: 'bg-[#F59E0B]' },
  { title: 'Abena Adjei flagged user #USR00321', time: '3 hours ago', dotColor: 'bg-[#F59E0B]' },
  { title: 'Ama Serwaa verified 12 transactions', time: '5 hours ago', dotColor: 'bg-blue-500' },
  { title: 'System: Login attempt blocked (ADM006)', time: '6 hours ago', dotColor: 'bg-[#F44336]' },
  { title: 'New admin added: Kofi Boateng (#ADM014)', time: 'Yesterday', dotColor: 'bg-brand-green' },
];

const roleCards = [
  { icon: <Shield size={20} className="text-white" />, title: 'Super Admin', description: 'Full platform access', count: 2 },
  { icon: <Users size={20} className="text-white" />, title: 'Operations Admin', description: 'Manage users, transactions', count: 5 },
  { icon: <Scale size={20} className="text-white" />, title: 'Dispute Officer', description: 'Handle disputes, evidence', count: 3 },
  { icon: <Wallet size={20} className="text-white" />, title: 'Finance Admin', description: 'Monitor escrow, finances', count: 4 },
];

const AdminManagementPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Admin Management</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">
          Admin Management
        </h1>
        <button className="rounded-lg bg-[#020036] px-5 py-2.5 text-sm font-medium text-white">
          + Add New Admin
        </button>
      </div>

      {/* Role Cards + Total */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {roleCards.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl border border-brand-green/40 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#020036]">
                {r.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {r.title}
                </p>
                <p className="text-xs text-gray-500">{r.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-green">
                {r.count}
              </span>
              <span className="text-xs text-gray-500">admins</span>
            </div>
          </div>
        ))}
        {/* Total Admins */}
        <div className="rounded-2xl bg-brand-green/10 p-4 text-center">
          <p className="text-xs text-gray-600">Total Admins</p>
          <p className="mt-1 text-3xl font-bold text-brand-green">14</p>
          <p className="text-xs text-gray-500">Active accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Admin Table */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">
                All Administrators
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-green"
                  />
                </div>
                <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  All Roles
                </button>
                <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Active
                </button>
                <button className="rounded-lg bg-[#020036] px-4 py-2 text-sm font-medium text-white">
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Administrator
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                              a.bgColor,
                            )}
                          >
                            {a.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {a.name}
                            </p>
                            <p className="text-xs text-gray-400">{a.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                            a.roleColor,
                          )}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {a.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            statusStyle[a.status],
                          )}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {a.lastActive}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <Pencil size={16} />
                          </button>
                          <button className="rounded p-1 text-[#F44336] hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Showing 6 of 14 administrators
              </p>
              <div className="flex gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={cn(
                      'h-8 w-8 rounded-lg text-sm font-medium',
                      p === 1
                        ? 'bg-[#020036] text-white'
                        : 'border border-gray-200 text-gray-700',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Permissions Management */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-brand-green" />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Role Permissions Management
                </p>
                <p className="text-xs text-gray-500">
                  Configure what each admin role can access and modify across the
                  platform
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin-management/permissions')}
              className="rounded-lg bg-[#020036] px-5 py-2.5 text-sm font-medium text-white"
            >
              Manage Roles
            </button>
          </div>
        </div>

        {/* Right — Recent Activity */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Recent Activity
              </h2>
              <button className="text-sm font-medium text-brand-green">
                View All
              </button>
            </div>
            <div className="space-y-5">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.dotColor}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagementPage;
