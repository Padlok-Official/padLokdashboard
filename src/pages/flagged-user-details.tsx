import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface FlagEvent {
  title: string;
  severity: 'Critical' | 'Warning';
  description: string;
  date: string;
  dotColor: string;
}

const flagHistory: FlagEvent[] = [
  { title: 'Flag 3 - High Dispute Rate', severity: 'Critical', description: 'User opened 6 disputes in 30 days. Threshold is 5.', date: 'Mar 25, 2026 - Auto-flagged by system', dotColor: 'bg-[#F44336]' },
  { title: 'Flag 2 - Repeated Complaints', severity: 'Warning', description: 'Received 4 buyer complaints about product quality.', date: 'Mar 10, 2026 - Flagged by Admin (Moni Roy)', dotColor: 'bg-[#F59E0B]' },
  { title: 'Flag 1 - Suspicious Behavior', severity: 'Warning', description: 'Unusual login patterns detected from multiple locations.', date: 'Feb 20, 2026 - Auto-flagged by system', dotColor: 'bg-[#F59E0B]' },
];

const relatedDisputes = [
  { id: '#DSP001247', buyer: 'John Mensah', amount: 'GHS 450', status: 'Open', date: 'Mar 25, 2026' },
  { id: '#DSP001198', buyer: 'Ama Serwaa', amount: 'GHS 780', status: 'Resolved', date: 'Mar 18, 2026' },
  { id: '#DSP001156', buyer: 'Kofi Asante', amount: 'GHS 320', status: 'Resolved', date: 'Mar 12, 2026' },
];

const recentActivity = [
  { title: 'New dispute opened (#DSP001247)', date: 'Mar 25, 2026 - 2:34 PM', dotColor: 'bg-[#F44336]' },
  { title: 'Warning issued by Admin', date: 'Mar 20, 2026 - 10:15 AM', dotColor: 'bg-[#F59E0B]' },
  { title: 'Account temporarily frozen', date: 'Mar 15, 2026 - 4:22 PM', dotColor: 'bg-blue-500' },
  { title: 'Account unfrozen after review', date: 'Mar 16, 2026 - 9:00 AM', dotColor: 'bg-brand-green' },
  { title: 'Dispute #DSP001198 resolved', date: 'Mar 18, 2026 - 11:45 AM', dotColor: 'bg-[#F44336]' },
];

const severityStyle: Record<string, string> = {
  Critical: 'bg-[#F44336]/10 text-[#F44336]',
  Warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
};

const disputeStatusColor: Record<string, string> = {
  Open: 'text-[#F59E0B]',
  Resolved: 'text-brand-green',
};

const FlaggedUserDetailsPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-2">
        <button
          onClick={() => navigate('/flags-reports')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Flags and Reports
        </button>
        <span className="ml-6 text-sm text-gray-400">/ #USR00892</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-brand-green">
        Flagged User Details
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Info Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F44336]/10">
                  <span className="text-lg font-bold text-[#F44336]">KF</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Kweku Frimpong
                  </h2>
                  <p className="text-sm text-gray-500">
                    Seller - Registered Jan 15, 2024
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F44336]/10 px-4 py-1.5 text-sm font-medium text-[#F44336]">
                High Risk
              </span>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  #USR00892
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900">
                  kweku.f@email.com
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-900">
                  +233 24 567 8901
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Transactions</p>
                <p className="text-sm font-semibold text-gray-900">147</p>
              </div>
            </div>
          </div>

          {/* Flag History */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-base font-bold text-gray-900">
              Flag History (3 Flags)
            </h2>
            <div className="space-y-6">
              {flagHistory.map((flag, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${flag.dotColor}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {flag.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyle[flag.severity]}`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {flag.description}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{flag.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Disputes */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">
                Related Disputes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Dispute ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatedDisputes.map((d, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {d.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {d.buyer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {d.amount}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium ${disputeStatusColor[d.status]}`}
                      >
                        {d.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {d.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Admin Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Admin Actions
            </h2>

            {/* Warning Banner */}
            <div className="mb-4 rounded-lg bg-[#F44336]/10 p-3">
              <p className="text-sm font-semibold text-[#F44336]">
                User has 3 flags
              </p>
              <p className="text-xs text-[#F44336]/80">
                Eligible for permanent ban per policy
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full rounded-lg bg-[#020036] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#020036]/90">
                Review Account Details
              </button>
              <button className="w-full rounded-lg bg-brand-green py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green/90">
                Freeze Account
              </button>
              <button className="w-full rounded-lg bg-[#F59E0B] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#F59E0B]/90">
                Issue Warning
              </button>
              <button className="w-full rounded-lg bg-[#F44336] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#F44336]/90">
                Permanently Ban User
              </button>
              <button className="w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50">
                Remove Latest Flag
              </button>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Account Statistics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xl font-bold text-[#F44336]">6</p>
                <p className="mt-1 text-xs text-gray-500">Open Disputes</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xl font-bold text-[#F44336]">12</p>
                <p className="mt-1 text-xs text-gray-500">Total Disputes</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xl font-bold text-gray-900">8.2%</p>
                <p className="mt-1 text-xs text-gray-500">Dispute Rate</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xl font-bold text-brand-green">GHS 24.5K</p>
                <p className="mt-1 text-xs text-gray-500">Total Volume</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activity.dotColor}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-400">{activity.date}</p>
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

export default FlaggedUserDetailsPage;
