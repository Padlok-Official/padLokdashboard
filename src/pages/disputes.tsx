import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Activity, ArrowLeftRight, Loader2 } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import disputeService from '@/services/dispute-service';
import { cn } from '@/lib/utils';

const statusStyle: Record<string, string> = {
  open: 'text-[#F59E0B] bg-[#FEF3C7]',
  under_review: 'text-[#3B82F6] bg-[#DBEAFE]',
  resolved_refund: 'text-brand-green bg-brand-green/10',
  resolved_release: 'text-brand-green bg-brand-green/10',
  closed: 'text-gray-600 bg-gray-100',
};

const formatStatus = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

const DisputesPage: FC = () => {
  const navigate = useNavigate();

  // const { data: statsRes, isLoading: loadingStats } = useQuery({
  //   queryKey: ['dispute-stats'],
  //   queryFn: () => disputeService.getDisputeStats(),
  // });

  const { data: disputesRes, isLoading: loadingDisputes } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => disputeService.listDisputes({ limit: 50 }),
  });


  const disputes = disputesRes?.data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Disputes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and resolve transaction disputes between buyers and sellers
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Disputes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dispute ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Seller</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingDisputes ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
                    Loading disputes...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No disputes found.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                    onClick={() => navigate(`/disputes/${d.id}`)}
                  >
                    <td className="px-6 py-5 text-sm font-medium text-brand-green uppercase">
                      #{d.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">{d.buyer_name || 'Unknown'}</td>
                    <td className="px-6 py-5 text-sm text-gray-700">{d.seller_name || 'Unknown'}</td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">
                      {d.escrow_currency} {Number(d.escrow_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {new Date(d.created_at)?.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-medium',
                        statusStyle[d.status] || 'text-gray-600 bg-gray-100'
                      )}>
                        {formatStatus(d.status)}
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
