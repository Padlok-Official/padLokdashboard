import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { escrowService, type DisputeStatus } from '@/services/client-service';
import { formatDate } from '@/lib/format-date';

const statusStyle: Record<DisputeStatus, string> = {
  open: 'text-[#F59E0B] bg-[#FEF3C7]',
  under_review: 'text-blue-600 bg-blue-50',
  resolved_refund: 'text-brand-green bg-brand-green/10',
  resolved_release: 'text-brand-green bg-brand-green/10',
  closed: 'text-gray-500 bg-gray-100',
};

const statusLabel: Record<DisputeStatus, string> = {
  open: 'Open',
  under_review: 'Under Review',
  resolved_refund: 'Resolved',
  resolved_release: 'Resolved',
  closed: 'Closed',
};

const DisputesPage: FC = () => {
  const navigate = useNavigate();

  const listQuery = useQuery({
    queryKey: ['disputes', 'list', { page: 1, limit: 20 }],
    queryFn: () => escrowService.getDisputes({ page: 1, limit: 20 }),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const statsQuery = useQuery({
    queryKey: ['disputes', 'stats'],
    queryFn: () => escrowService.getDisputeStats(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const disputes = listQuery.data?.data ?? [];
  const stats = statsQuery.data?.data;
  const hasError = listQuery.isError || statsQuery.isError;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">Disputes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and resolve transaction disputes between buyers and sellers
          </p>
        </div>
        {hasError && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.open ?? 0)}
          label="Open disputes"
          change={statsQuery.isLoading ? '' : 'Live'}
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.resolved_this_month ?? 0)}
          label="Resolved this month"
          change={statsQuery.isLoading ? '' : 'MTD'}
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value={
            statsQuery.isLoading ? '…' : `${stats?.avg_resolution_days ?? '0.0'} days`
          }
          label="Average resolution time"
          change={statsQuery.isLoading ? '' : 'All time'}
          trend="up"
        />
      </div>

      {/* Disputes Table */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Recent Disputes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dispute ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Raised by</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No disputes yet.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                    onClick={() => navigate(`/disputes/${d.id}`)}
                  >
                    <td className="px-6 py-5 text-sm font-medium text-brand-green">
                      #{d.id.slice(0, 10).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {d.raised_by_name ?? d.raised_by_email ?? '—'}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 truncate max-w-xs">
                      {d.reason}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatDate(d.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyle[d.status]}`}
                      >
                        {statusLabel[d.status]}
                      </span>
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

export default DisputesPage;
