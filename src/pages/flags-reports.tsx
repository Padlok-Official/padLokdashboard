import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Flag, ShieldAlert, Snowflake, Ban } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

interface FlaggedUser {
  userId: string;
  name: string;
  type: string;
  flagReason: string;
  flags: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: string;
}

const flaggedUsers: FlaggedUser[] = [
  { userId: '#USR00892', name: 'Kweku Frimpong', type: 'Seller', flagReason: 'High dispute rate', flags: 3, riskLevel: 'High', status: 'Pending Ban' },
  { userId: '#USR00745', name: 'Abena Osei', type: 'Buyer', flagReason: 'Fraud report', flags: 2, riskLevel: 'Medium', status: 'Under Review' },
  { userId: '#USR00623', name: 'Yaw Mensah', type: 'Seller', flagReason: 'Suspicious behavior', flags: 2, riskLevel: 'Medium', status: 'Warning Issued' },
  { userId: '#USR00512', name: 'Ama Asantewaa', type: 'Buyer', flagReason: 'Unusual transactions', flags: 1, riskLevel: 'Low', status: 'Under Review' },
  { userId: '#USR00489', name: 'Kofi Adjei', type: 'Seller', flagReason: 'Repeated complaints', flags: 3, riskLevel: 'High', status: 'Banned' },
  { userId: '#USR00401', name: 'Efua Nyarko', type: 'Buyer', flagReason: 'Fraud report', flags: 2, riskLevel: 'Medium', status: 'Frozen' },
];

const riskColor: Record<string, string> = {
  High: 'text-[#F44336]',
  Medium: 'text-[#F59E0B]',
  Low: 'text-brand-green',
};

const statusColor: Record<string, string> = {
  'Pending Ban': 'text-[#F44336]',
  'Under Review': 'text-[#F59E0B]',
  'Warning Issued': 'text-[#F59E0B]',
  Banned: 'text-[#F44336]',
  Frozen: 'text-[#F44336]',
};

interface RiskAlert {
  title: string;
  description: string;
  time: string;
  dotColor: string;
}

const riskAlerts: RiskAlert[] = [
  { title: 'High Dispute Rate Detected - Kweku Frimpong (#USR00892)', description: 'User has exceeded 5 disputes in the last 30 days. Recommend account review.', time: '2 hours ago', dotColor: 'bg-[#F44336]' },
  { title: 'Unusual Transaction Pattern - Abena Osei (#USR00745)', description: 'Multiple high-value transactions in short timeframe detected.', time: '5 hours ago', dotColor: 'bg-[#F59E0B]' },
  { title: 'Repeated Complaints - Yaw Mensah (#USR00623)', description: 'Seller has received 4 buyer complaints this week.', time: '1 day ago', dotColor: 'bg-[#F59E0B]' },
];


const FlagsReportsPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Flags and Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor flagged accounts and manage risk alerts</p>
      </div>

      {/* Stat Cards — 4 columns */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Flag size={20} className="text-white" />}
          value="18"
          label="Flagged Users"
          change="+5.2%"
          trend="up"
        />
        <StatCard
          icon={<ShieldAlert size={20} className="text-white" />}
          value="42"
          label="Active Risk Alerts"
          change="+3.1%"
          trend="up"
        />
        <StatCard
          icon={<Snowflake size={20} className="text-white" />}
          value="7"
          label="Accounts Frozen"
          change="-2.4%"
          trend="down"
        />
        <StatCard
          icon={<Ban size={20} className="text-white" />}
          value="3"
          label="Permanently Banned"
          change="+1"
          trend="up"
        />
      </div>

      {/* Flagged Users Table */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Flagged Users</h2>
          <div className="flex gap-3">
            <button className="rounded-lg bg-[#020036] px-5 py-2 text-sm font-medium text-white">Filter</button>
            <button className="rounded-lg bg-[#020036] px-5 py-2 text-sm font-medium text-white">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Flag Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Flags</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Risk Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {flaggedUsers.map((u, i) => (
                <tr
                  key={i}
                  className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                  onClick={() => navigate(`/flags-reports/${u.userId.replace('#', '')}`)}
                >
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{u.userId}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{u.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{u.type}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{u.flagReason}</td>
                  <td className={`px-6 py-5 text-sm font-medium ${riskColor[u.riskLevel]}`}>{u.flags}</td>
                  <td className={`px-6 py-5 text-sm font-medium ${riskColor[u.riskLevel]}`}>{u.riskLevel}</td>
                  <td className={`px-6 py-5 text-sm font-medium ${statusColor[u.status] || 'text-gray-700'}`}>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">Showing 1-6 of 18 flagged users</p>
          <div className="flex gap-3">
            <button className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-900">Previous</button>
            <button className="rounded-lg bg-[#020036] px-5 py-2 text-sm font-medium text-white">Next</button>
          </div>
        </div>
      </div>

      {/* Recent Risk Alerts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Recent Risk Alerts</h2>
        <div className="space-y-5">
          {riskAlerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${alert.dotColor}`} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                  <span className="ml-4 shrink-0 text-xs text-gray-400">{alert.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlagsReportsPage;
