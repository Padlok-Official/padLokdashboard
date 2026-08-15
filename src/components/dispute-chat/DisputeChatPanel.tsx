import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Send, RotateCw, Wifi, WifiOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import disputeChatService from '@/services/dispute-chat-service';
import { useDisputeChatSocket } from '@/hooks/useDisputeChatSocket';
import { useAuthStore } from '@/stores/auth-store';
import type { DisputeStatus } from '@/services/dispute-service';

interface DisputeChatPanelProps {
  disputeId: string;
  disputeStatus: DisputeStatus;
  buyerName: string;
  sellerName: string;
}

const RESOLVED_STATUSES: DisputeStatus[] = ['resolved_refund', 'resolved_release', 'closed'];

const formatTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const senderStyles: Record<'buyer' | 'seller' | 'admin', string> = {
  buyer: 'bg-blue-50 text-blue-900 border-blue-100',
  seller: 'bg-amber-50 text-amber-900 border-amber-100',
  admin: 'bg-brand-green/10 text-brand-green border-brand-green/20',
};

const connectionLabel: Record<string, string> = {
  idle: 'Not connected',
  connecting: 'Connecting…',
  connected: 'Live',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
  error: 'Connection error',
};

const DisputeChatPanel: FC<DisputeChatPanelProps> = ({
  disputeId,
  disputeStatus,
  buyerName,
  sellerName,
}) => {
  const admin = useAuthStore((s) => s.admin);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDisputeResolved = RESOLVED_STATUSES.includes(disputeStatus);

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['dispute-chat', disputeId],
    queryFn: () => disputeChatService.getDisputeChat(disputeId, { limit: 50 }),
    enabled: !!disputeId,
    // The live socket (when connected) is the source of truth for freshness;
    // avoid a background refetch silently racing against merged live state.
    staleTime: 60_000,
  });

  const history = historyRes?.data;
  const initialMessages = useMemo(() => history?.messages ?? [], [history?.messages]);

  const conversationActive = history?.conversation?.status === 'active';
  const shouldConnect = !!disputeId && !isDisputeResolved && !!history && conversationActive;

  const { messages, connectionState, conversation, typing, closed, send, retry, emitTyping, emitRead } =
    useDisputeChatSocket(disputeId, { enabled: shouldConnect, initialMessages });

  const isClosed = !!closed || isDisputeResolved || (!!history && !conversationActive);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Mark the newest message read once it's rendered.
  useEffect(() => {
    if (messages.length === 0) return;
    const newest = messages[messages.length - 1];
    if (!newest.clientTempId) emitRead(newest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleSend = () => {
    if (!draft.trim() || isClosed) return;
    send(draft);
    setDraft('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    emitTyping(e.target.value.length > 0);
  };

  const assignedAdminId = conversation?.assigned_admin_id ?? history?.conversation?.assigned_admin_id;

  const senderLabel = (msg: (typeof messages)[number]) => {
    if (msg.sender_type === 'buyer') return buyerName || 'Buyer';
    if (msg.sender_type === 'seller') return sellerName || 'Seller';
    if (admin && msg.admin_id === admin.id) return 'You';
    return 'Admin';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Dispute Chat</h2>
        {!isDisputeResolved && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
              connectionState === 'connected'
                ? 'bg-brand-green/10 text-brand-green'
                : connectionState === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
            )}
          >
            {connectionState === 'connected' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connectionLabel[connectionState] ?? connectionState}
          </span>
        )}
      </div>

      {assignedAdminId && !isDisputeResolved && (
        <p className="mb-3 text-xs text-gray-400">
          Chat claimed by an admin{admin && assignedAdminId === admin.id ? ' (you)' : ''}.
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="mb-3 h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            {messages.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                No messages yet. Start the conversation with the buyer and seller below.
              </p>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_type === 'admin';
                const isMine = isAdmin && admin && msg.admin_id === admin.id;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg border px-3 py-2 text-sm',
                        senderStyles[msg.sender_type]
                      )}
                    >
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                          {senderLabel(msg)}
                        </span>
                        <span className="text-[10px] opacity-50">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                      {msg.status === 'sending' && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] opacity-60">
                          <Loader2 size={10} className="animate-spin" /> Sending…
                        </span>
                      )}
                      {msg.status === 'failed' && (
                        <button
                          onClick={() => msg.clientTempId && retry(msg.clientTempId)}
                          className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-600 hover:underline"
                        >
                          <RotateCw size={10} /> Failed to send — retry
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {typing && (
            <p className="mb-2 text-xs italic text-gray-400">
              {typing.senderType === 'buyer' ? buyerName || 'Buyer' : typing.senderType === 'seller' ? sellerName || 'Seller' : 'Someone'} is typing…
            </p>
          )}

          {isClosed ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              <Lock size={14} className="shrink-0 text-gray-400" />
              {closed
                ? `Dispute resolved — ${closed.message}`
                : 'This dispute has been resolved. Chat is read-only.'}
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={handleChange}
                onBlur={() => emitTyping(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message buyer and seller…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim() || connectionState !== 'connected'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#020036] text-white disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DisputeChatPanel;
