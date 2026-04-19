import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Flag, ShieldAlert, Snowflake, Ban, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { flagService, type FlagSeverity } from '@/services/flag-service';
import { formatRelative } from '@/lib/format-date';

const severityLabel: Record<FlagSeverity, string> = {
  critical: 'High',
  warning: 'Medium',
  info: 'Low',
};

const severityColor: Record<FlagSeverity, string> = {
  critical: 'text-[#F44336]',
  warning: 'text-[#F59E0B]',
  info: 'text-brand-green',
};

const severityDot: Record<FlagSeverity, string> = {
  critical: 'bg-[#F44336]',
  warning: 'bg-[#F59E0B]',
  info: 'bg-brand-green',
};

const FlagsReportsPage: FC = () => {
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ['flags', 'stats'],
    queryFn: () => flagService.getStats(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const flagsQuery = useQuery({
    queryKey: ['flags', 'list', { resolved: false, page: 1, limit: 20 }],
    queryFn: () => flagService.listFlags({ resolved: false, page: 1, limit: 20 }),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const alertsQuery = useQuery({
    queryKey: ['flags', 'alerts', { acknowledged: false, page: 1, limit: 3 }],
    queryFn: () => flagService.listAlerts({ acknowledged: false, page: 1, limit: 3 }),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const stats = statsQuery.data?.data;
  const flags = flagsQuery.data?.data ?? [];
  const alerts = alertsQuery.data?.data ?? [];
  const totalFlags = flagsQuery.data?.pagination?.total ?? 0;

  const offline = statsQuery.isError || flagsQuery.isError || alertsQuery.isError;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">Flags and Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor flagged accounts and manage risk alerts
          </p>
        </div>
        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Stat Cards — 4 columns */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Flag size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.flagged_users ?? 0)}
          label="Flagged Users"
          change={statsQuery.isLoading ? '' : 'Unresolved'}
          trend="up"
        />
        <StatCard
          icon={<ShieldAlert size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.active_alerts ?? 0)}
          label="Active Risk Alerts"
          change={statsQuery.isLoading ? '' : 'Unacknowledged'}
          trend="up"
        />
        <StatCard
          icon={<Snowflake size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.accounts_frozen ?? 0)}
          label="Accounts Frozen"
          change={statsQuery.isLoading ? '' : 'Inactive'}
          trend="down"
        />
        <StatCard
          icon={<Ban size={20} className="text-white" />}
          value={statsQuery.isLoading ? '…' : String(stats?.accounts_banned ?? 0)}
          label="Permanently Banned"
          change={statsQuery.isLoading ? '' : 'Critical'}
          trend="up"
        />
      </div>

      {/* Flagged Users Table */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Flagged Users</h2>
          <div className="flex gap-3">
            <button className="rounded-lg bg-[#020036] px-5 py-2 text-sm font-medium text-white">
              Filter
            </button>
            <button className="rounded-lg bg-[#020036] px-5 py-2 text-sm font-medium text-white">
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Flag ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Severity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Raised</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Flagged By</th>
              </tr>
            </thead>
            <tbody>
              {flagsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No active flags.
                  </td>
                </tr>
              ) : (
                flags.map((f) => (
                  <tr
                    key={f.id}
                    className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                    onClick={() => navigate(`/flags-reports/${f.user_id}`)}
                  >
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">
                      #{f.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {f.user_name ?? f.user_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 truncate max-w-xs">
                      {f.reason}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {f.category ?? '—'}
                    </td>
                    <td className={`px-6 py-5 text-sm font-medium ${severityColor[f.severity]}`}>
                      {severityLabel[f.severity]}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {formatRelative(f.created_at)}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {f.flagged_by_name ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            Showing {flags.length} of {totalFlags} unresolved {totalFlags === 1 ? 'flag' : 'flags'}
          </p>
        </div>
      </div>

      {/* Recent Risk Alerts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Recent Risk Alerts</h2>
        {alertsQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No active risk alerts — automated scoring workers aren't running yet.
          </p>
        ) : (
          <div className="space-y-5">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${severityDot[alert.severity]}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {alert.title}
                      {alert.user_name && (
                        <span className="ml-2 font-normal text-gray-500">
                          — {alert.user_name}
                        </span>
                      )}
                    </h3>
                    <span className="ml-4 shrink-0 text-xs text-gray-400">
                      {formatRelative(alert.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlagsReportsPage;
