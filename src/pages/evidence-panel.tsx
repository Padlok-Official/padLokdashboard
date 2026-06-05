import { type FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Phone, Mail, Bell, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import disputeService from '@/services/dispute-service';
import { escrowService } from '@/services/client-service';


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

const toDisplayImageUrl = (url: string): string => {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const after = url.slice(idx + marker.length);
  if (after.startsWith('f_auto') || /^[^/]*\bf_/.test(after)) return url;
  return `${url.slice(0, idx + marker.length)}f_auto,q_auto/${after}`;
};

interface ContactPanelProps {
  label: string;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    initials: string;
    userId: string;
  };
  isOpen: boolean;
  onToggle: () => void;
  disputeId: string;
}

const ContactPanel: FC<ContactPanelProps> = ({ label, contact, isOpen, onToggle, disputeId }) => {
  const [message, setMessage] = useState('');
  const [templateId, setTemplateId] = useState<string>('');

  const { data: templatesRes, isLoading: loadingTemplates } = useQuery({
    queryKey: ['message-templates'],
    queryFn: () => disputeService.getMessageTemplates(),
  });

  const templates = templatesRes?.data || [];

  const sendMessageMutation = useMutation({
    mutationFn: (body: { text: string; tplId?: string }) =>
      disputeService.sendMessage(
        disputeId,
        contact.role.toLowerCase() as 'buyer' | 'seller',
        body.text,
        'in-app',
        body.tplId
      ),
    onSuccess: () => {
      toast.success(`Push notification sent to ${contact.name}`);
      setMessage('');
      setTemplateId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSendNotification = () => {
    if (!message.trim() && !templateId) return;
    const bodyText = message.trim() || templates.find((t) => t.id === templateId)?.body || '';
    sendMessageMutation.mutate({ text: bodyText, tplId: templateId || undefined });
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
              <span className="text-xs font-medium text-purple-600">{contact.initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{contact.name || 'Unknown'}</p>
              <p className="text-xs text-gray-400">{contact.role}</p>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone size={13} className="text-gray-400" />
              {contact.phone || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail size={13} className="text-gray-400" />
              {contact.email || 'N/A'}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Bell size={13} className="text-brand-green" />
              <span className="text-xs font-medium text-gray-700">Send In-App Push Notification</span>
            </div>

            {loadingTemplates ? (
              <div className="mb-2 text-xs text-gray-500">Loading templates...</div>
            ) : (
              <select
                className="mb-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  const tpl = templates.find((t) => t.id === e.target.value);
                  if (tpl) setMessage(tpl.body);
                }}
              >
                <option value="">Select a template...</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
            />
            <button
              onClick={handleSendNotification}
              disabled={sendMessageMutation.isPending || (!message.trim() && !templateId)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#020036] py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EvidencePanelPage: FC = () => {
  const navigate = useNavigate();
  const { disputeId } = useParams<{ disputeId: string }>();
  const queryClient = useQueryClient();

  const [buyerOpen, setBuyerOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [showPenalizeConfirm, setShowPenalizeConfirm] = useState(false);
  const [note, setNote] = useState('');

  const { data: disputeRes, isLoading: loadingDispute } = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: () => disputeService.getDispute(disputeId!),
    enabled: !!disputeId,
  });

  const { data: timelineRes, isLoading: loadingTimeline } = useQuery({
    queryKey: ['dispute-timeline', disputeId],
    queryFn: () => disputeService.getDisputeTimeline(disputeId!),
    enabled: !!disputeId,
  });

  const dispute = disputeRes?.data;
  const timeline = timelineRes?.data || [];

  // Pull the full escrow transaction behind this dispute so admins can review
  // the item details and the seller-submitted item photos alongside the
  // dispute evidence. Keyed off the dispute's escrow_transaction_id.
  const { data: escrowRes, isLoading: loadingEscrow } = useQuery({
    queryKey: ['escrow', dispute?.escrow_transaction_id],
    queryFn: () => escrowService.getEscrowById(dispute!.escrow_transaction_id),
    enabled: !!dispute?.escrow_transaction_id,
  });
  const escrow = escrowRes?.data;

  const payoutMutation = useMutation({
    mutationFn: (noteStr: string) => disputeService.payoutDispute(disputeId!, noteStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['dispute-timeline', disputeId] });
      setShowPayoutConfirm(false);
      setNote('');
      toast.success('Seller payout approved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process payout');
    },
  });

  const refundMutation = useMutation({
    mutationFn: (noteStr: string) => disputeService.refundDispute(disputeId!, noteStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['dispute-timeline', disputeId] });
      setShowRefundConfirm(false);
      setNote('');
      toast.success('Refund issued to buyer successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    },
  });

  const flagMutation = useMutation({
    mutationFn: (noteStr: string) => disputeService.flagDispute(disputeId!, 'Review Required', noteStr),
    onSuccess: () => {
      setShowFlagConfirm(false);
      setNote('');
      toast.success('Dispute flagged successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to flag dispute');
    },
  });

  const penalizeMutation = useMutation({
    mutationFn: (params: { targetUserId: string; reason: string }) =>
      disputeService.penalizeUser(disputeId!, params.targetUserId, params.reason, 'critical'),
    onSuccess: () => {
      setShowPenalizeConfirm(false);
      setNote('');
      toast.success('User penalized successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to penalize user');
    },
  });

  if (loadingDispute) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">Dispute not found</p>
        <button onClick={() => navigate('/disputes')} className="mt-4 text-brand-green hover:underline">
          Go back to Disputes
        </button>
      </div>
    );
  }

  const buyerContact = {
    name: dispute.buyer_name || 'Buyer',
    role: 'Buyer',
    email: dispute.buyer_email || '',
    phone: '',
    initials: (dispute.buyer_name || 'B')[0].toUpperCase(),
    userId: dispute.buyer_id || '',
  };

  const sellerContact = {
    name: dispute.seller_name || 'Seller',
    role: 'Seller',
    email: dispute.seller_email || '',
    phone: '',
    initials: (dispute.seller_name || 'S')[0].toUpperCase(),
    userId: dispute.seller_id || '',
  };

  const isResolved = ['resolved_refund', 'resolved_release', 'closed'].includes(dispute.status);

  return (
    <div>
      {/* Action Modals */}
      {showPayoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !payoutMutation.isPending && setShowPayoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Approve Seller Payout</h3>
            <p className="mt-2 text-sm text-gray-600">
              Release <span className="font-semibold">{dispute.escrow_currency} {dispute.escrow_amount}</span> from escrow to{' '}
              <span className="font-semibold">{sellerContact.name}</span>?
            </p>
            <input
              type="text"
              placeholder="Admin Notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
            />
            <p className="mt-2 text-xs text-gray-400">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowPayoutConfirm(false)}
                disabled={payoutMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => payoutMutation.mutate(note)}
                disabled={payoutMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {payoutMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {payoutMutation.isPending ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !refundMutation.isPending && setShowRefundConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Refund Buyer</h3>
            <p className="mt-2 text-sm text-gray-600">
              Refund <span className="font-semibold">{dispute.escrow_currency} {dispute.escrow_amount}</span> from escrow to{' '}
              <span className="font-semibold">{buyerContact.name}</span>?
            </p>
            <input
              type="text"
              placeholder="Admin Notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
            />
            <p className="mt-2 text-xs text-gray-400">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowRefundConfirm(false)}
                disabled={refundMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => refundMutation.mutate(note)}
                disabled={refundMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {refundMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {refundMutation.isPending ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlagConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !flagMutation.isPending && setShowFlagConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Flag Dispute</h3>
            <p className="mt-2 text-sm text-gray-600">
              Mark this dispute for escalation or internal review.
            </p>
            <input
              type="text"
              placeholder="Flag Reason"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowFlagConfirm(false)}
                disabled={flagMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => flagMutation.mutate(note)}
                disabled={flagMutation.isPending || !note.trim()}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {flagMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {showPenalizeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !penalizeMutation.isPending && setShowPenalizeConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Penalize User</h3>
            <p className="mt-2 text-sm text-gray-600">
              Apply a critical strike to the user who raised this dispute.
            </p>
            <input
              type="text"
              placeholder="Penalty Reason"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-green"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowPenalizeConfirm(false)}
                disabled={penalizeMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => penalizeMutation.mutate({ targetUserId: dispute.raised_by, reason: note })}
                disabled={penalizeMutation.isPending || !note.trim()}
                className="flex items-center gap-2 rounded-lg bg-[#F44336] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {penalizeMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Confirm Penalty
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
        <h1 className="text-2xl font-bold text-brand-green">Evidence Panel</h1>
        <p className="mt-1 text-base font-semibold text-gray-700">Dispute / {dispute.id.split('-')[0].toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Dispute Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Dispute Summary</h2>
              <span className={cn(
                "px-2 py-1 text-xs font-semibold rounded-md uppercase",
                isResolved ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
              )}>
                {dispute.status.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Transaction Ref</p>
                <p className="text-sm font-semibold text-gray-900">{dispute.escrow_reference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Escrow Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {dispute.escrow_currency} {Number(dispute.escrow_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Filed Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(dispute.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Buyer</p>
                <p className="text-sm font-semibold text-gray-900">{buyerContact.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seller</p>
                <p className="text-sm font-semibold text-gray-900">{sellerContact.name}</p>
              </div>
              <div className="col-span-3 mt-2">
                <p className="text-xs text-gray-500 mb-1">Dispute Reason</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {dispute.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Escrow Transaction Details */}
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
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{escrow.reference || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {escrow.currency} {Number(escrow.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {escrow.currency} {Number(escrow.fee ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery Window</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {escrow.delivery_window ? formatLabel(escrow.delivery_window) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery Deadline</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(escrow.delivery_deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(escrow.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery Confirmed</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(escrow.delivery_confirmed_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Buyer Confirmed</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(escrow.buyer_confirmed_at)}</p>
                  </div>
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
              </>
            )}
          </div>

          {/* Submitted Evidence */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Submitted Evidence</h2>
            {dispute.evidence_photos && dispute.evidence_photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {dispute.evidence_photos.map((url, i) => (
                  <a
                    key={i}
                    href={toDisplayImageUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={toDisplayImageUrl(url)}
                      alt={`Evidence ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No evidence was submitted for this dispute.</p>
            )}
          </div>

          {/* Evidence Timeline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-base font-bold text-gray-900">Evidence Timeline</h2>
            {loadingTimeline ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : timeline.length > 0 ? (
              <div className="relative space-y-8">
                <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />
                {timeline.map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-6">
                    <div
                      className={cn(
                        "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-2 ring-white",
                        event.kind.includes('dispute') ? 'bg-red-500' : 'bg-brand-green'
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-bold text-gray-900 capitalize">
                          {event.kind.replace('_', ' ')}
                        </h3>
                        <span className="ml-4 shrink-0 text-xs text-gray-400">
                          {new Date(event.at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {event.actor_name ? <span className="font-semibold text-gray-900">{event.actor_name}: </span> : null}
                        {event.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No timeline events available.</p>
            )}
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
                contact={buyerContact}
                isOpen={buyerOpen}
                onToggle={() => setBuyerOpen(!buyerOpen)}
                disputeId={disputeId!}
              />
              <ContactPanel
                label="Communicate with Seller"
                contact={sellerContact}
                isOpen={sellerOpen}
                onToggle={() => setSellerOpen(!sellerOpen)}
                disputeId={disputeId!}
              />

              {!isResolved && (
                <>
                  <button
                    onClick={() => {
                      setNote('');
                      setShowPayoutConfirm(true);
                    }}
                    className="w-full rounded-lg bg-[#7C3AED] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
                  >
                    Approve Seller Payout
                  </button>
                  <button
                    onClick={() => {
                      setNote('');
                      setShowRefundConfirm(true);
                    }}
                    className="w-full rounded-lg bg-brand-green py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green/90"
                  >
                    Refund Buyer
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setNote('');
                  setShowPenalizeConfirm(true);
                }}
                className="w-full rounded-lg border border-[#F44336] bg-white py-2.5 text-sm font-medium text-[#F44336] transition-colors hover:bg-red-50"
              >
                Penalize User
              </button>
              <button
                onClick={() => {
                  setNote('');
                  setShowFlagConfirm(true);
                }}
                className="w-full rounded-lg border border-amber-500 bg-white py-2.5 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-50"
              >
                Apply Dispute Flag
              </button>
            </div>
          </div>

          {/* Involved Parties */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Involved Parties</h2>
            <div className="space-y-4">
              {/* Buyer */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-sm font-medium text-purple-600">{buyerContact.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{buyerContact.name}</p>
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-xs text-gray-500">{buyerContact.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              {/* Seller */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-sm font-medium text-purple-600">{sellerContact.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{sellerContact.name}</p>
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-xs text-gray-500">{sellerContact.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Dispute Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(0, Math.floor((new Date().getTime() - new Date(dispute.created_at).getTime()) / (1000 * 3600 * 24)))}
                </p>
                <p className="mt-1 text-xs text-gray-500">Days Since Filed</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{timeline.length}</p>
                <p className="mt-1 text-xs text-gray-500">Timeline Events</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EvidencePanelPage;
