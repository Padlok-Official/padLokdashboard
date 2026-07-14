import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Wallet, Mail, Phone, Star, ShieldAlert } from 'lucide-react';
import userService from '@/services/user-service';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';

const txStatusStyle: Record<string, string> = {
  completed: 'bg-brand-green/10 text-brand-green',
  funded: 'bg-blue-100 text-blue-700',
  delivery_confirmed: 'bg-indigo-100 text-indigo-700',
  initiated: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  disputed: 'bg-red-100 text-red-700',
  refunded: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-500',
  failed: 'bg-red-100 text-red-700',
};

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const initialsOf = (name: string | null) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const StatusPill: FC<{ value: string }> = ({ value }) => (
  <span
    className={cn(
      'inline-block rounded-full px-3 py-1 text-xs font-medium',
      txStatusStyle[value] || 'bg-gray-100 text-gray-600',
    )}
  >
    {formatLabel(value)}
  </span>
);

const UserDetailPage: FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const { data: userRes, isLoading: loadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });

  const { data: txRes, isLoading: loadingTx } = useQuery({
    queryKey: ['user', userId, 'transactions'],
    queryFn: () => userService.getUserTransactions(userId!, { page: 1, limit: 50 }),
    enabled: !!userId,
  });

  const { data: disputeRes, isLoading: loadingDisputes } = useQuery({
    queryKey: ['user', userId, 'disputes'],
    queryFn: () => userService.getUserDisputes(userId!, { page: 1, limit: 50 }),
    enabled: !!userId,
  });

  const user = userRes?.data;
  const transactions = txRes?.data || [];
  const disputes = disputeRes?.data || [];

  if (loadingUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">User not found</p>
        <button onClick={() => navigate('/users')} className="mt-4 text-brand-green hover:underline">
          Back to Users
        </button>
      </div>
    );
  }

  const currency = user.wallet_currency ?? 'GHS';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/users')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-purple-600">{initialsOf(user.name)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-green">{user.name || 'Unknown'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail size={13} /> {user.email || '—'}</span>
              <span className="flex items-center gap-1"><Phone size={13} /> {user.phone_number || '—'}</span>
              <span
                className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                  user.is_active ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500',
                )}
              >
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — wallet + transactions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Wallet card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-brand-green" />
                <h2 className="text-base font-bold text-gray-900">Wallet</h2>
              </div>
              {user.wallet_status && (
                <span
                  className={cn(
                    'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                    user.wallet_status === 'active'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-amber-100 text-amber-700',
                  )}
                >
                  {user.wallet_status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Available Balance</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(user.wallet_balance ?? 0, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">In Escrow</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(user.wallet_escrow_balance ?? 0, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Lifetime Volume</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(user.total_volume ?? 0, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">
                Transactions{' '}
                <span className="text-sm font-normal text-gray-400">
                  ({txRes?.pagination?.total ?? transactions.length})
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Counterparty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTx ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-400" />
                        Loading transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        No transactions for this user.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-gray-50 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{t.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatLabel(t.type)}</td>
                        <td className="px-6 py-4 text-sm capitalize text-gray-500">{t.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{t.counterparty_name || '—'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(t.amount, t.currency)}
                        </td>
                        <td className="px-6 py-4"><StatusPill value={t.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disputes */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">
                Disputes{' '}
                <span className="text-sm font-normal text-gray-400">
                  ({disputeRes?.pagination?.total ?? disputes.length})
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Dispute</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDisputes ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-400" />
                        Loading disputes...
                      </td>
                    </tr>
                  ) : disputes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        No disputes for this user.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => navigate(`/disputes/${d.id}`)}
                        className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-brand-green">
                          #{d.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-700">{d.reason}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {d.amount ? formatCurrency(d.amount, d.currency ?? currency) : '—'}
                        </td>
                        <td className="px-6 py-4"><StatusPill value={d.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(d.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right — account summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-900">{formatDate(user.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {user.last_login_at ? formatDate(user.last_login_at) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium text-gray-900">{user.total_transactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-500">
                  <Star size={13} /> Rating
                </span>
                <span className="font-medium text-gray-900">
                  {user.avg_rating ? `${user.avg_rating} / 5` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Open Disputes</span>
                <span className="font-medium text-gray-900">{user.open_disputes}</span>
              </div>
            </div>
          </div>

          {(user.flag_count > 0 || user.risk_level !== 'none') && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600" />
                <h2 className="text-base font-bold text-amber-800">Risk & Flags</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">Risk Level</span>
                  <span className="font-semibold uppercase text-amber-800">{user.risk_level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">Active Flags</span>
                  <span className="font-semibold text-amber-800">{user.flag_count}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
