import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import verificationService from '@/services/verification-service';
import type { VerificationStatus, VerificationTier } from '@/services/verification-service';
import StatCard from '@/components/shared/StatCard';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format-date';

const TIER_LABEL: Record<VerificationTier, string> = {
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
};

const STATUS_FILTERS: { label: string; value: VerificationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const KYCVerificationPage: FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus | 'all'>('all');

  const { data: statsRes } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: () => verificationService.getStats(),
  });

  const { data: listRes, isLoading } = useQuery({
    queryKey: ['verifications', status],
    queryFn: () =>
      verificationService.list({
        limit: 50,
        status: status === 'all' ? undefined : status,
      }),
  });

  const stats = statsRes?.data;
  const users = listRes?.data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">KYC &amp; Verification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review account-tier documents users have submitted and approve or reject each tier.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShieldCheck size={20} className="text-white" />}
          value={String(stats?.total_users ?? 0)}
          label="Users Submitted"
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<Clock size={20} className="text-white" />}
          value={String(stats?.pending ?? 0)}
          label="Pending Review"
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-white" />}
          value={String(stats?.approved ?? 0)}
          label="Approved"
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<XCircle size={20} className="text-white" />}
          value={String(stats?.rejected ?? 0)}
          label="Rejected"
          change=""
          trend="neutral"
        />
      </div>

      {/* Submissions table */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-gray-900">Verification Submissions</h2>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiers Submitted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Highest Approved</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pending</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-gray-400" />
                    Loading submissions...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No verification submissions found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.user_id}
                    onClick={() => navigate(`/kyc-verification/${u.user_id}`)}
                    className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">
                      {u.user_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">{u.user_email || '—'}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {u.tiers.map((t) => (
                          <span
                            key={t}
                            className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                          >
                            {TIER_LABEL[t]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {u.highest_approved_tier ? (
                        <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
                          {TIER_LABEL[u.highest_approved_tier]}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {u.pending_count > 0 ? (
                        <span className="inline-block rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#F59E0B]">
                          {u.pending_count} pending
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {formatDate(u.latest_submitted_at)}
                    </td>
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

export default KYCVerificationPage;
