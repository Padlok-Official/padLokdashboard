import type { FC } from 'react';
import { DollarSign, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

interface Transaction {
  id: string;
  movementPath: string;
  amount: string;
  date: string;
  status: 'Released' | 'Refunded';
}

const transactions: Transaction[] = [
  { id: '#SEC11122773', movementPath: 'Buyer Escrow', amount: '¢500', date: 'Oct, 11,2026', status: 'Released' },
  { id: '#SEC11122773', movementPath: 'Escrow Buyer', amount: '¢500', date: 'Oct, 11,2026', status: 'Refunded' },
  { id: '#SEC11122773', movementPath: 'Buyer Escrow', amount: '¢500', date: 'Oct, 11,2026', status: 'Released' },
  { id: '#SEC11122773', movementPath: 'Buyer Escrow', amount: '¢500', date: 'Oct, 11,2026', status: 'Released' },
  { id: '#SEC11122773', movementPath: 'Buyer Escrow', amount: '¢500', date: 'Oct, 11,2026', status: 'Released' },
];

const statusColor: Record<Transaction['status'], string> = {
  Released: 'text-brand-green',
  Refunded: 'text-[#F44336]',
};

const WalletEscrowPage: FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">
          Wallet & Escrow
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Predict demand patterns and revenue optimization opportunities
        </p>
      </div>

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="¢68k.30"
          label="Total Funds in Escrow"
          change="+4.8%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value="50.3/Hour"
          label="Top-Up Frequency"
          change="+11.2%"
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value="¢8k.30"
          label="Total Released funds"
          change="+6.7%"
          trend="up"
        />
      </div>

      {/* Transaction Log */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Log Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Transaction Log</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Movement Path
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <td className="px-6 py-5 text-sm text-gray-700">{tx.id}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {tx.movementPath}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">{tx.date}</td>
                  <td className={`px-6 py-5 text-sm font-medium ${statusColor[tx.status]}`}>
                    {tx.status}
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

export default WalletEscrowPage;
