import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

const disputes = [
  { id: '#DPOQ22332', buyer: 'John Mensah', seller: 'Kwame Electronics', amount: 'GHS 2,450.00', status: 'Open', date: 'Mar 24, 2026' },
  { id: '#DPOQ22333', buyer: 'Ama Serwaa', seller: 'TechHub GH', amount: 'GHS 1,200.00', status: 'Resolved', date: 'Mar 22, 2026' },
  { id: '#DPOQ22334', buyer: 'Kofi Asante', seller: 'PhoneCity', amount: 'GHS 3,100.00', status: 'Open', date: 'Mar 20, 2026' },
];

const statusStyle: Record<string, string> = {
  Open: 'text-[#F59E0B] bg-[#FEF3C7]',
  Resolved: 'text-brand-green bg-brand-green/10',
};

const DisputesPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Disputes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and resolve transaction disputes between buyers and sellers
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value="24"
          label="Open disputes"
          change="+4.8%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value="156"
          label="Resolved this month"
          change="+11.2%"
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value="1.2 days"
          label="Average resolution time"
          change="+6.7%"
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Seller</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d, i) => (
                <tr
                  key={i}
                  className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                  onClick={() => navigate(`/disputes/${d.id.replace('#', '')}`)}
                >
                  <td className="px-6 py-5 text-sm font-medium text-brand-green">{d.id}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{d.buyer}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{d.seller}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{d.amount}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{d.date}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyle[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;
