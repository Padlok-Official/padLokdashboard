import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import PageSkeleton from '@/components/shared/PageSkeleton';
import {
  walletService,
  escrowService,
  type WalletTxType,
  type WalletTxStatus,
} from '@/services/client-service';
import { formatCurrency } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';

const movementLabel: Record<WalletTxType, string> = {
  funding: 'Paystack → Wallet',
  withdrawal: 'Wallet → Bank',
  escrow_lock: 'Buyer → Escrow',
  escrow_release: 'Escrow → Seller',
  escrow_refund: 'Escrow → Buyer',
};

const statusColor: Record<WalletTxStatus, string> = {
  completed: 'text-brand-green',
  pending: 'text-[#F5A623]',
  failed: 'text-[#F44336]',
  reversed: 'text-[#F44336]',
};

const WalletEscrowPage: FC = () => {
  const navigate = useNavigate();

  const transactionsQuery = useQuery({
    queryKey: ['wallet', 'transactions', { page: 1, limit: 50 }],
    queryFn: () => walletService.getTransactionHistory({ page: 1, limit: 50 }),
  });

  const escrowStatsQuery = useQuery({
    queryKey: ['escrow', 'stats', 'GHS'],
    queryFn: () => escrowService.getStats('GHS'),
  });

  const walletStatsQuery = useQuery({
    queryKey: ['wallet', 'stats', 'GHS'],
    queryFn: () => walletService.getStats('GHS'),
  });

  const isLoading =
    transactionsQuery.isLoading || escrowStatsQuery.isLoading || walletStatsQuery.isLoading;
  const hasError =
    transactionsQuery.isError || escrowStatsQuery.isError || walletStatsQuery.isError;

  if (isLoading) return <PageSkeleton />;

  const transactions = transactionsQuery.data?.data ?? [];
  const escrowStats = escrowStatsQuery.data?.data;
  const walletStats = walletStatsQuery.data?.data;

  const currency = transactions[0]?.currency ?? 'GHS';
  const totalInEscrow = Number(escrowStats?.total_in_escrow ?? 0);
  const totalReleased = Number(escrowStats?.total_released ?? 0);
  const fundingPerHour = walletStats?.funding_per_hour ?? '0';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Wallet & Escrow</h1>
        <p className="mt-1 text-sm text-gray-500">
          Predict demand patterns and revenue optimization opportunities
        </p>
      </div>

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load wallet & escrow data. Showing what's available.
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={formatCurrency(totalInEscrow, currency)}
          label="Total Funds in Escrow"
          change="+4.8%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={`${fundingPerHour}/Hour`}
          label="Top-Up Frequency"
          change="+11.2%"
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value={formatCurrency(totalReleased, currency)}
          label="Total Released Funds"
          change="+6.7%"
          trend="up"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Transaction Log</h2>
        </div>

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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                    onClick={() => navigate(`/wallet-escrow/${tx.id}`)}
                  >
                    <td className="px-6 py-5 text-sm font-medium text-brand-green">
                      #{tx.reference ?? tx.id.slice(0, 10).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {movementLabel[tx.type]}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className={`px-6 py-5 text-sm font-medium capitalize ${statusColor[tx.status]}`}>
                      {tx.status}
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

export default WalletEscrowPage;
