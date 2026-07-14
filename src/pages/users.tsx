import { useRef, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import userService from '@/services/user-service';
import type { ListUsersParams, RiskLevel } from '@/services/user-service';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format-date';
import { formatCurrency } from '@/lib/format-currency';

const STATUS_FILTERS: { label: string; value: ListUsersParams['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Flagged', value: 'flagged' },
];

const riskStyle: Record<RiskLevel, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-[#FEF3C7] text-[#F59E0B]',
  low: 'bg-blue-100 text-blue-700',
  none: 'bg-gray-100 text-gray-500',
};

const initialsOf = (name: string | null) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const UsersPage: FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ListUsersParams['status'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<number | undefined>(undefined);

  // Debounce the search box so we don't fire a request per keystroke.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(value.trim()), 350);
  };

  const { data: listRes, isLoading } = useQuery({
    queryKey: ['users', status, debouncedSearch],
    queryFn: () =>
      userService.list({
        limit: 50,
        status: status === 'all' ? undefined : status,
        search: debouncedSearch || undefined,
      }),
  });

  const users = listRes?.data || [];
  const total = listRes?.pagination?.total ?? users.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse platform users and drill into a user's wallet and transactions.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            All Users <span className="text-sm font-normal text-gray-400">({total})</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name, email, phone…"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-green sm:w-64"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    status === f.value
                      ? 'bg-[#020036] text-white'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Wallet Balance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transactions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Volume</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-gray-400" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-xs font-medium text-purple-600">
                            {initialsOf(u.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(u.wallet_balance ?? 0, u.wallet_currency ?? 'GHS')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.total_transactions}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatCurrency(u.total_volume ?? 0, u.wallet_currency ?? 'GHS')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-block rounded-full px-3 py-1 text-xs font-medium',
                            u.is_active ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                        {u.risk_level !== 'none' && (
                          <span
                            className={cn(
                              'inline-block rounded-full px-2 py-1 text-[10px] font-medium uppercase',
                              riskStyle[u.risk_level],
                            )}
                          >
                            {u.risk_level} risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
