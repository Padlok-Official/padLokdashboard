import { type FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Phone, Mail, Bell, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  escrowService,
  type DisputeDetail,
  type DisputeTimelineEvent,
  type DisputeTimelineKind,
} from '@/services/client-service';
import { formatCurrency } from '@/lib/format-currency';
import { formatDate, formatDateTime } from '@/lib/format-date';

/** Pretty display text for each timeline event kind. */
const kindTitle: Record<DisputeTimelineKind, string> = {
  escrow_created: 'Escrow Created',
  funded: 'Escrow Funded by Buyer',
  delivery_confirmed: 'Item Marked as Delivered (Seller)',
  buyer_confirmed: 'Delivery Confirmed by Buyer',
  dispute_raised: 'Dispute Raised',
  dispute_resolved: 'Dispute Resolved',
};

const kindColor: Record<DisputeTimelineKind, string> = {
  escrow_created: 'bg-gray-400',
  funded: 'bg-brand-green',
  delivery_confirmed: 'bg-blue-500',
  buyer_confirmed: 'bg-brand-green',
  dispute_raised: 'bg-red-500',
  dispute_resolved: 'bg-purple-500',
};

const initialsOf = (name: string | null | undefined): string => {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface ContactPanelProps {
  label: string;
  name: string | null;
  role: string;
  email: string | null;
  phone?: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const ContactPanel: FC<ContactPanelProps> = ({ label, name, role, email, phone, isOpen, onToggle }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!message.trim()) return;
    setSending(true);
    // Placeholder — /notifications/send integration lands with the Notifications Center task.
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setMessage('');
    toast.success(`Push notification sent to ${name ?? role}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
      >
        {label}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <span className="text-xs font-medium text-purple-600">{initialsOf(name)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{name ?? '—'}</p>
              <p className="text-xs text-gray-400">{role}</p>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone size={13} className="text-gray-400" />
                {phone}
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail size={13} className="text-gray-400" />
                {email}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Bell size={13} className="text-brand-green" />
              <span className="text-xs font-medium text-gray-700">Send In-App Push Notification</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green resize-none"
            />
            <button
              onClick={handleSendNotification}
              disabled={sending || !message.trim()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#020036] py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              <Send size={12} />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TimelineListProps {
  events: DisputeTimelineEvent[];
  disputeReason: string;
}

const TimelineList: FC<TimelineListProps> = ({ events, disputeReason }) => {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500">No timeline events recorded yet.</p>
    );
  }
  return (
    <div className="relative space-y-8">
      <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />
      {events.map((event, i) => {
        const title = kindTitle[event.kind];
        const color = kindColor[event.kind];
        const isDispute = event.kind === 'dispute_raised';
        const description = isDispute
          ? `${event.detail} — Reason: ${disputeReason}`
          : event.detail;
        return (
          <div key={`${event.kind}-${i}`} className="relative flex gap-4 pl-6">
            <div className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ${color} ring-2 ring-white`} />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <span className="ml-4 shrink-0 text-xs text-gray-400">
                  {formatDateTime(event.at)}
                </span>
              </div>
              <p className={cn('mt-1 text-sm', isDispute ? 'font-semibold text-gray-900' : 'text-gray-600')}>
                {description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EvidencePanelPage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { disputeId = '' } = useParams<{ disputeId: string }>();

  const [buyerOpen, setBuyerOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const disputeQuery = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: () => escrowService.getDisputeById(disputeId),
    enabled: Boolean(disputeId),
  });

  const timelineQuery = useQuery({
    queryKey: ['dispute', disputeId, 'timeline'],
    queryFn: () => escrowService.getDisputeTimeline(disputeId),
    enabled: Boolean(disputeId),
  });

  const resolveMutation = useMutation({
    mutationFn: async (resolution: 'refund' | 'release') =>
      escrowService.resolveDispute(disputeId, { resolution }),
    onSuccess: (res, resolution) => {
      if (res.success) {
        toast.success(
          resolution === 'refund'
            ? `Refund of ${formatCurrency(Number(res.data?.amount ?? 0), res.data?.currency ?? 'NGN')} issued to ${dispute?.buyer_name ?? 'buyer'}`
            : `Seller payout of ${formatCurrency(Number(res.data?.amount ?? 0), res.data?.currency ?? 'NGN')} approved`,
        );
        setShowPayoutConfirm(false);
        setShowRefundConfirm(false);
        queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
        queryClient.invalidateQueries({ queryKey: ['disputes'] });
      } else {
        toast.error(res.message ?? 'Failed to resolve dispute');
      }
    },
    onError: () => toast.error('Failed to resolve dispute'),
  });

  const dispute: DisputeDetail | undefined = disputeQuery.data?.data;
  const events = timelineQuery.data?.data ?? [];
  const isLoading = disputeQuery.isLoading || timelineQuery.isLoading;
  const hasError = disputeQuery.isError;

  const amount = Number(dispute?.escrow_amount ?? 0);
  const currency = dispute?.escrow_currency ?? 'NGN';
  const alreadyResolved = dispute?.status === 'resolved_refund'
    || dispute?.status === 'resolved_release'
    || dispute?.status === 'closed';

  const daysSinceFiled = dispute
    ? Math.max(0, Math.floor((Date.now() - new Date(dispute.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div>
      {/* Payout Confirmation Modal */}
      {showPayoutConfirm && dispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !resolveMutation.isPending && setShowPayoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Approve Seller Payout</h3>
            <p className="mt-2 text-sm text-gray-600">
              Release <span className="font-semibold">{formatCurrency(amount, currency)}</span> from escrow to{' '}
              <span className="font-semibold">{dispute.seller_name ?? 'seller'}</span>?
            </p>
            <p className="mt-1 text-xs text-gray-400">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowPayoutConfirm(false)}
                disabled={resolveMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveMutation.mutate('release')}
                disabled={resolveMutation.isPending}
                className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {resolveMutation.isPending ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundConfirm && dispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !resolveMutation.isPending && setShowRefundConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Refund Buyer</h3>
            <p className="mt-2 text-sm text-gray-600">
              Refund <span className="font-semibold">{formatCurrency(amount, currency)}</span> from escrow to{' '}
              <span className="font-semibold">{dispute.buyer_name ?? 'buyer'}</span>?
            </p>
            <p className="mt-1 text-xs text-gray-400">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowRefundConfirm(false)}
                disabled={resolveMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveMutation.mutate('refund')}
                disabled={resolveMutation.isPending}
                className="rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {resolveMutation.isPending ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/disputes')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Disputes
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-green">Evidence Panel</h1>
            <p className="mt-1 text-base font-semibold text-gray-700">
              Dispute / #{disputeId.slice(0, 10).toUpperCase()}
            </p>
          </div>
          {hasError && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
              <AlertTriangle size={12} />
              Offline
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading dispute details…
        </div>
      ) : !dispute ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Dispute not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Dispute Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">Dispute Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Escrow Reference</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {dispute.escrow_reference ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Escrow Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(amount, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Filed Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(dispute.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {dispute.buyer_name ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {dispute.seller_name ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {dispute.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Timeline */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-6 text-base font-bold text-gray-900">Evidence Timeline</h2>
              <TimelineList events={events} disputeReason={dispute.reason} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Admin Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">Admin Actions</h2>
              <div className="space-y-3">
                <ContactPanel
                  label="Communicate with Buyer"
                  name={dispute.buyer_name}
                  role="Buyer"
                  email={dispute.buyer_email}
                  isOpen={buyerOpen}
                  onToggle={() => setBuyerOpen(!buyerOpen)}
                />
                <ContactPanel
                  label="Communicate with Seller"
                  name={dispute.seller_name}
                  role="Seller"
                  email={dispute.seller_email}
                  isOpen={sellerOpen}
                  onToggle={() => setSellerOpen(!sellerOpen)}
                />
                <button
                  onClick={() => setShowPayoutConfirm(true)}
                  disabled={alreadyResolved}
                  className="w-full rounded-lg bg-[#7C3AED] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-40"
                >
                  Approve Seller Payout
                </button>
                <button
                  onClick={() => setShowRefundConfirm(true)}
                  disabled={alreadyResolved}
                  className="w-full rounded-lg bg-brand-green py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:opacity-40"
                >
                  Refund Buyer
                </button>
                {alreadyResolved && (
                  <p className="text-center text-xs text-gray-500">
                    Already resolved — no further actions available.
                  </p>
                )}
              </div>
            </div>

            {/* Involved Parties */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">Involved Parties</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-sm font-medium text-purple-600">
                      {initialsOf(dispute.buyer_name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {dispute.buyer_name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500">Buyer</p>
                    {dispute.buyer_email && (
                      <p className="text-xs text-gray-500">{dispute.buyer_email}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-sm font-medium text-purple-600">
                      {initialsOf(dispute.seller_name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {dispute.seller_name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500">Seller</p>
                    {dispute.seller_email && (
                      <p className="text-xs text-gray-500">{dispute.seller_email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dispute Stats */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">Dispute Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{daysSinceFiled}</p>
                  <p className="mt-1 text-xs text-gray-500">Days Since Filed</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  <p className="mt-1 text-xs text-gray-500">Timeline Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidencePanelPage;
