import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Activity,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Receipt,
  Percent,
} from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import PageSkeleton from '@/components/shared/PageSkeleton';
import { useCashFlow, useTakeRate } from '@/hooks/useAnalytics';
import {
  walletService,
  escrowService,
  type WalletTxType,
  type WalletTxStatus,
} from '@/services/client-service';
import { formatCurrency } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';

const movementLabel: Record<WalletTxType, string> = {
  funding: 'Moolre → Wallet',
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

  const cashFlowQuery = useCashFlow('GHS');
  const takeRateQuery = useTakeRate('GHS');

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

  const cashFlow = cashFlowQuery.data;
  const takeRate = takeRateQuery.data;

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

      {/* Cash flow & economics — money in/out, float, Moolre fees, take rate */}
      <div className="mb-2 mt-2">
        <h2 className="text-lg font-bold text-gray-900">Cash Flow &amp; Economics</h2>
        <p className="text-sm text-gray-500">
          Real money movement through the platform. Moolre fees are paid by customers
          (estimated at Ghana rates — ~2% deposits, 1% transfers, with a per-transaction
          min and cap) so they are shown for visibility, not as a PadLok cost. Our income
          is the service fee.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<ArrowDownToLine size={20} className="text-white" />}
          value={formatCurrency(cashFlow?.inflow ?? 0, currency)}
          label={`Money In · ${cashFlow?.inflowCount ?? 0} deposits`}
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<ArrowUpFromLine size={20} className="text-white" />}
          value={formatCurrency(cashFlow?.outflow ?? 0, currency)}
          label={`Money Out · ${cashFlow?.outflowCount ?? 0} withdrawals`}
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value={formatCurrency(cashFlow?.netFlow ?? 0, currency)}
          label="Net Cash Flow (in − out)"
          change=""
          trend={
            cashFlow && cashFlow.netFlow !== 0
              ? cashFlow.netFlow > 0
                ? 'up'
                : 'down'
              : 'neutral'
          }
        />
        <StatCard
          icon={<Wallet size={20} className="text-white" />}
          value={formatCurrency(cashFlow?.float.total ?? 0, currency)}
          label="Float Held (wallets + escrow)"
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<Receipt size={20} className="text-white" />}
          value={formatCurrency(cashFlow?.providerFees.total ?? 0, currency)}
          label="Moolre Fees (paid by customers, est.)"
          change=""
          trend="neutral"
        />
        <StatCard
          icon={<Percent size={20} className="text-white" />}
          value={`${takeRate?.configuredFeePct ?? 0}%`}
          label={`Service Fee / Deal · eff. ${takeRate?.effectiveFeePct ?? 0}%`}
          change=""
          trend="neutral"
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
