import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import {
  walletService,
  escrowService,
  type WalletTxType,
  type WalletTxStatus,
} from '@/services/client-service';

const movementLabel: Record<WalletTxType, string> = {
  funding: 'Paystack → Wallet',
  withdrawal: 'Wallet → Bank',
  escrow_lock: 'Buyer → Escrow',
  escrow_release: 'Escrow → Seller',
  escrow_refund: 'Escrow → Buyer',
};

const txStatusStyle: Record<WalletTxStatus, string> = {
  completed: 'bg-brand-green/10 text-brand-green',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  reversed: 'bg-red-100 text-red-700',
};

const escrowStatusStyle: Record<string, string> = {
  initiated: 'bg-gray-100 text-gray-700',
  funded: 'bg-blue-100 text-blue-700',
  delivery_confirmed: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-brand-green/10 text-brand-green',
  disputed: 'bg-red-100 text-red-700',
  refunded: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : '—';

// Cloudinary delivery URLs get f_auto,q_auto injected so the dashboard pulls
// optimized renditions instead of the full-size originals.
const toDisplayImageUrl = (url: string): string => {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const after = url.slice(idx + marker.length);
  if (after.startsWith('f_auto') || /^[^/]*\bf_/.test(after)) return url;
  return `${url.slice(0, idx + marker.length)}f_auto,q_auto/${after}`;
};

const Field: FC<{ label: string; value: React.ReactNode; className?: string }> = ({
  label,
  value,
  className,
}) => (
  <div className={className}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
  </div>
);

const TransactionDetailPage: FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  const { data: txRes, isLoading: loadingTx } = useQuery({
    queryKey: ['wallet', 'transaction', transactionId],
    queryFn: () => walletService.getTransactionById(transactionId!),
    enabled: !!transactionId,
  });

  const tx = txRes?.data;

  // Escrow movements carry escrow_transaction_id; pull the underlying escrow so
  // we can show the item details and seller-submitted photos for this trade.
  const { data: escrowRes, isLoading: loadingEscrow } = useQuery({
    queryKey: ['escrow', tx?.escrow_transaction_id],
    queryFn: () => escrowService.getEscrowById(tx!.escrow_transaction_id!),
    enabled: !!tx?.escrow_transaction_id,
  });

  const escrow = escrowRes?.data;

  if (loadingTx) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">Transaction not found</p>
        <button
          onClick={() => navigate('/wallet-escrow')}
          className="mt-4 text-brand-green hover:underline"
        >
          Back to Wallet &amp; Escrow
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/wallet-escrow')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Wallet &amp; Escrow
        </button>
        <h1 className="text-2xl font-bold text-brand-green">Transaction Details</h1>
        <p className="mt-1 text-base font-semibold text-gray-700">
          #{tx.reference ?? tx.id.slice(0, 10).toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Wallet Movement */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Wallet Movement</h2>
              <span className={cn(
                'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                txStatusStyle[tx.status] || 'bg-gray-100 text-gray-700'
              )}>
                {formatLabel(tx.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Movement" value={movementLabel[tx.type]} />
              <Field label="Type" value={formatLabel(tx.type)} />
              <Field label="Amount" value={formatCurrency(tx.amount, tx.currency)} />
              <Field label="Fee" value={formatCurrency(tx.fee ?? 0, tx.currency)} />
              <Field
                label="Balance Before"
                value={tx.balance_before != null ? formatCurrency(tx.balance_before, tx.currency) : '—'}
              />
              <Field
                label="Balance After"
                value={tx.balance_after != null ? formatCurrency(tx.balance_after, tx.currency) : '—'}
              />
              <Field label="Reference" value={tx.reference || 'N/A'} />
              <Field label="Paystack Ref" value={tx.paystack_reference || '—'} />
              <Field label="Date" value={formatDate(tx.created_at)} />
            </div>
            {tx.description && (
              <div className="mt-4">
                <p className="mb-1 text-xs text-gray-500">Description</p>
                <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
                  {tx.description}
                </p>
              </div>
            )}
          </div>

          {/* Escrow Transaction Details — only for escrow-linked movements */}
          {tx.escrow_transaction_id && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Escrow Transaction Details</h2>
                {escrow && (
                  <span className={cn(
                    'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                    escrowStatusStyle[escrow.status] || 'bg-gray-100 text-gray-700'
                  )}>
                    {formatLabel(escrow.status)}
                  </span>
                )}
              </div>

              {loadingEscrow ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : !escrow ? (
                <p className="text-sm text-gray-500">Escrow transaction details are unavailable.</p>
              ) : (
                <>
                  {escrow.item_title && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Item</p>
                      <p className="text-sm font-semibold text-gray-900">{escrow.item_title}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Field label="Reference" value={escrow.reference || 'N/A'} />
                    <Field label="Amount" value={`${escrow.currency} ${Number(escrow.amount).toFixed(2)}`} />
                    <Field label="Fee" value={`${escrow.currency} ${Number(escrow.fee ?? 0).toFixed(2)}`} />
                    <Field label="Buyer" value={escrow.buyer_name || 'Unknown'} />
                    <Field label="Seller" value={escrow.seller_name || 'Unknown'} />
                    <Field
                      label="Delivery Window"
                      value={escrow.delivery_window ? formatLabel(escrow.delivery_window) : '—'}
                    />
                    <Field label="Delivery Deadline" value={formatDateTime(escrow.delivery_deadline)} />
                    <Field label="Delivery Confirmed" value={formatDateTime(escrow.delivery_confirmed_at)} />
                    <Field label="Buyer Confirmed" value={formatDateTime(escrow.buyer_confirmed_at)} />
                  </div>

                  {escrow.item_description && (
                    <div className="mt-4">
                      <p className="mb-1 text-xs text-gray-500">Item Description</p>
                      <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
                        {escrow.item_description}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="mb-2 text-xs text-gray-500">Item Photos</p>
                    {escrow.item_photos && escrow.item_photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {escrow.item_photos.map((url, i) => (
                          <a
                            key={i}
                            href={toDisplayImageUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <img
                              src={toDisplayImageUrl(url)}
                              alt={`Item ${i + 1}`}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No item photos were provided for this transaction.</p>
                    )}
                  </div>

                  {escrow.dispute && (
                    <button
                      onClick={() => navigate(`/disputes/${escrow.dispute!.id}`)}
                      className="mt-5 w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                    >
                      View Related Dispute
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right column — parties */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Account</h2>
            <div className="space-y-3">
              <Field label="User" value={tx.user_name || 'Unknown'} />
              <Field label="Email" value={tx.user_email || '—'} />
              <Field label="Wallet ID" value={tx.wallet_id} />
            </div>
          </div>

          {escrow && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">Involved Parties</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{escrow.buyer_name || 'Buyer'}</p>
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-xs text-gray-500">{escrow.buyer_email || '—'}</p>
                </div>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{escrow.seller_name || 'Seller'}</p>
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-xs text-gray-500">{escrow.seller_email || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;
