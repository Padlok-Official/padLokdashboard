import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import disputeChatService, {
  type DisputeChatMessage,
  type DisputeConversationSummary,
} from '@/services/dispute-chat-service';
import { useAuthStore } from '@/stores/auth-store';

/**
 * The socket connection this hook manages talks DIRECTLY to padlokbackend
 * (the only service in the system running Socket.IO), never to padlok-api.
 * padlok-api mints the short-lived (60s) admin "ticket" this connection
 * authenticates with — see dispute-chat-service.ts#getDisputeChatTicket.
 *
 * Falls back to padlokbackend's production URL if the env var isn't set,
 * matching padlok-api's own USER_BACKEND_URL default (see
 * padlok-api/src/config/env.ts).
 */
const DISPUTE_CHAT_SOCKET_URL =
  import.meta.env.VITE_DISPUTE_CHAT_SOCKET_URL || 'https://server.padlokit.com';

export type DisputeChatConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export interface OptimisticDisputeChatMessage extends DisputeChatMessage {
  clientTempId?: string;
  status?: 'sending' | 'failed';
}

interface TypingState {
  senderType: 'admin' | 'buyer' | 'seller' | undefined;
  isTyping: boolean;
}

interface JoinAckSuccess {
  disputeId: string;
  senderType: 'admin';
  active: boolean;
  context: unknown;
}
interface JoinAckError {
  error: string;
}
type JoinAck = JoinAckSuccess | JoinAckError;

interface SendAckSuccess {
  message: DisputeChatMessage;
}
interface SendAckError {
  error: string;
  clientTempId?: string;
}
type SendAck = SendAckSuccess | SendAckError;

interface UseDisputeChatSocketOptions {
  /** Only connect while true (e.g. panel visible AND dispute is still active). */
  enabled: boolean;
  /** Seed the local message list from the REST history fetch (oldest-first). */
  initialMessages: DisputeChatMessage[];
}

interface UseDisputeChatSocketResult {
  messages: OptimisticDisputeChatMessage[];
  connectionState: DisputeChatConnectionState;
  conversation: DisputeConversationSummary | null;
  typing: TypingState | null;
  closed: { resolution: 'refund' | 'release'; message: string } | null;
  send: (body: string) => void;
  retry: (clientTempId: string) => void;
  emitTyping: (isTyping: boolean) => void;
  emitRead: (messageId: string) => void;
}

const dedupeAndSort = (
  list: OptimisticDisputeChatMessage[]
): OptimisticDisputeChatMessage[] => {
  const byId = new Map<string, OptimisticDisputeChatMessage>();
  for (const msg of list) byId.set(msg.id, msg);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

export function useDisputeChatSocket(
  disputeId: string | undefined,
  { enabled, initialMessages }: UseDisputeChatSocketOptions
): UseDisputeChatSocketResult {
  const [messages, setMessages] = useState<OptimisticDisputeChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<DisputeChatConnectionState>('idle');
  const [conversation, setConversation] = useState<DisputeConversationSummary | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [closed, setClosed] = useState<{ resolution: 'refund' | 'release'; message: string } | null>(
    null
  );

  const socketRef = useRef<Socket | null>(null);
  const typingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(false);
  const hasConnectedBeforeRef = useRef(false);
  const mountedRef = useRef(true);
  // Mirrors `closed` state but read synchronously inside socket event
  // handlers, which close over state from the render the effect ran in —
  // a plain `closed` read there would be stale by the time it matters.
  const closedRef = useRef(false);

  // Hard reset when the dispute itself changes — the panel is re-rendered
  // with a new disputeId rather than remounted, so state from the previous
  // dispute must not leak across.
  useEffect(() => {
    setMessages([]);
    setConversation(null);
    setClosed(null);
    closedRef.current = false;
  }, [disputeId]);

  // `initialMessages` (the REST history page) can arrive asynchronously
  // after this hook's first render — `useState(initialMessages)` only seeds
  // on mount, so without this effect a history load that completes after
  // mount would never reach the thread. Merging (not overwriting) also
  // means an incidental history refetch never clobbers live socket
  // messages that arrived in the meantime.
  useEffect(() => {
    if (initialMessages.length === 0) return;
    setMessages((prev) => dedupeAndSort([...prev, ...initialMessages]));
  }, [disputeId, initialMessages]);

  const backfillLatest = useCallback(async () => {
    if (!disputeId) return;
    try {
      const res = await disputeChatService.getDisputeChat(disputeId, { limit: 50 });
      if (!mountedRef.current) return;
      const fresh = res.data?.messages ?? [];
      setMessages((prev) => dedupeAndSort([...prev, ...fresh]));
      if (res.data?.conversation) setConversation(res.data.conversation);
    } catch {
      // Best-effort backfill only; live socket traffic will keep the thread
      // moving forward even if this fails.
    }
  }, [disputeId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || !disputeId) {
      return () => {
        mountedRef.current = false;
      };
    }

    let cancelled = false;

    const connect = async () => {
      setConnectionState((prev) => (prev === 'idle' ? 'connecting' : 'reconnecting'));
      try {
        const ticketRes = await disputeChatService.getDisputeChatTicket(disputeId);
        if (cancelled || !mountedRef.current) return;
        const ticket = ticketRes.data?.ticket;
        if (ticketRes.data?.conversation) setConversation(ticketRes.data.conversation);
        if (!ticket) throw new Error('No ticket returned');

        const socket = io(DISPUTE_CHAT_SOCKET_URL, {
          auth: { ticket },
          transports: ['websocket'],
          reconnection: false, // we drive reconnects ourselves to mint a fresh ticket each time
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          if (!mountedRef.current) return;
          socket.emit('dispute_chat:join', { disputeId }, (ack: JoinAck) => {
            if (!mountedRef.current) return;
            if ('error' in ack) {
              toast.error(ack.error || 'Failed to join dispute chat');
              setConnectionState('error');
              return;
            }
            setConnectionState('connected');
            if (!ack.active) {
              closedRef.current = true;
              setClosed((prev) => prev ?? { resolution: 'refund', message: 'This dispute has been resolved.' });
            }
            if (hasConnectedBeforeRef.current) {
              // Reconnect: refetch the latest page to backfill anything missed
              // while disconnected (short gap — well within one page).
              void backfillLatest();
            }
            hasConnectedBeforeRef.current = true;
          });
        });

        socket.on('dispute_chat:joined', () => {
          // Mirrors the join ack; state already applied via the ack callback above.
        });

        socket.on('dispute_chat:message', (msg: DisputeChatMessage & { clientTempId?: string }) => {
          if (!mountedRef.current) return;
          setMessages((prev) => {
            const withoutOptimistic = msg.clientTempId
              ? prev.filter((m) => m.id !== msg.clientTempId)
              : prev;
            return dedupeAndSort([...withoutOptimistic, msg]);
          });
        });

        socket.on(
          'dispute_chat:typing',
          (payload: { disputeId: string; senderType?: 'admin' | 'buyer' | 'seller'; isTyping: boolean }) => {
            if (!mountedRef.current || payload.disputeId !== disputeId) return;
            setTyping(
              payload.isTyping ? { senderType: payload.senderType, isTyping: true } : null
            );
          }
        );

        socket.on('dispute_chat:read', () => {
          // Read receipts aren't surfaced in the UI yet; hook consumers can
          // extend this if per-message read state is needed later.
        });

        socket.on(
          'dispute_chat:closed',
          (payload: { disputeId: string; resolution: 'refund' | 'release'; message: string }) => {
            if (!mountedRef.current || payload.disputeId !== disputeId) return;
            closedRef.current = true;
            setClosed({ resolution: payload.resolution, message: payload.message });
            setConnectionState('disconnected');
            socket.disconnect();
          }
        );

        socket.on(
          'dispute_chat:error',
          (payload: { disputeId?: string; message: string; clientTempId?: string }) => {
            if (!mountedRef.current) return;
            toast.error(payload.message || 'Dispute chat error');
            if (payload.clientTempId) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === payload.clientTempId ? { ...m, status: 'failed' as const } : m
                )
              );
            }
          }
        );

        socket.on('disconnect', (reason) => {
          if (!mountedRef.current) return;
          if (closedRef.current) return; // already in a terminal closed state, don't reconnect
          setConnectionState('reconnecting');
          if (reason !== 'io client disconnect') {
            // Not a deliberate local disconnect — reconnect with a fresh ticket.
            reconnectTimerRef.current = setTimeout(() => {
              if (mountedRef.current && !cancelled) void connect();
            }, 1000);
          }
        });

        socket.on('connect_error', (err) => {
          if (!mountedRef.current) return;
          setConnectionState('error');
          toast.error(err.message || 'Could not connect to dispute chat');
        });
      } catch (err) {
        if (!mountedRef.current || cancelled) return;
        setConnectionState('error');
        const message = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message
          : err instanceof Error
            ? err.message
            : undefined;
        toast.error(message || 'Failed to start dispute chat');
      }
    };

    void connect();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
      const socket = socketRef.current;
      if (socket) {
        socket.emit('dispute_chat:leave', { disputeId });
        socket.disconnect();
        socketRef.current = null;
      }
      hasConnectedBeforeRef.current = false;
      setConnectionState('idle');
    };
    // `connect` reads `backfillLatest` via closure but is re-created fresh
    // every time this effect runs (which is itself keyed off disputeId), so
    // it always sees the current dispute's backfill function; adding it as
    // a dependency would just cause redundant reconnects on identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId, enabled]);

  const send = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !disputeId) return;
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        toast.error('Not connected to dispute chat yet');
        return;
      }

      const clientTempId = crypto.randomUUID();
      // Real admin id (not "me") so the optimistic bubble is already styled/
      // aligned as "You" — matching how the canonical message will render
      // once its ack/broadcast replaces this placeholder — rather than
      // flashing as a generic "Admin" bubble for the split second it's pending.
      const selfAdminId = useAuthStore.getState().admin?.id ?? 'me';
      const optimistic: OptimisticDisputeChatMessage = {
        id: clientTempId,
        dispute_id: disputeId,
        conversation_id: conversation?.id ?? '',
        sender_type: 'admin',
        sender_id: selfAdminId,
        admin_id: selfAdminId,
        body: trimmed,
        channel: 'chat',
        created_at: new Date().toISOString(),
        clientTempId,
        status: 'sending',
      };
      setMessages((prev) => dedupeAndSort([...prev, optimistic]));

      socket.emit(
        'dispute_chat:send',
        { disputeId, body: trimmed, clientTempId },
        (ack: SendAck) => {
          if (!mountedRef.current) return;
          if ('error' in ack) {
            setMessages((prev) =>
              prev.map((m) => (m.id === clientTempId ? { ...m, status: 'failed' as const } : m))
            );
            toast.error(ack.error || 'Failed to send message');
            return;
          }
          setMessages((prev) => {
            const withoutOptimistic = prev.filter((m) => m.id !== clientTempId);
            return dedupeAndSort([...withoutOptimistic, ack.message]);
          });
        }
      );

      // Sending implicitly ends the typing burst.
      if (lastTypingSentRef.current) {
        socket.emit('dispute_chat:typing', { disputeId, isTyping: false });
        lastTypingSentRef.current = false;
      }
    },
    [disputeId, conversation?.id]
  );

  const retry = useCallback(
    (clientTempId: string) => {
      const failed = messages.find((m) => m.id === clientTempId);
      if (!failed) return;
      setMessages((prev) => prev.filter((m) => m.id !== clientTempId));
      send(failed.body);
    },
    [messages, send]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected || !disputeId) return;

      if (typingIdleTimerRef.current) {
        clearTimeout(typingIdleTimerRef.current);
        typingIdleTimerRef.current = null;
      }

      if (isTyping) {
        if (!lastTypingSentRef.current) {
          socket.emit('dispute_chat:typing', { disputeId, isTyping: true });
          lastTypingSentRef.current = true;
        }
        typingIdleTimerRef.current = setTimeout(() => {
          socket.emit('dispute_chat:typing', { disputeId, isTyping: false });
          lastTypingSentRef.current = false;
        }, 2000);
      } else if (lastTypingSentRef.current) {
        socket.emit('dispute_chat:typing', { disputeId, isTyping: false });
        lastTypingSentRef.current = false;
      }
    },
    [disputeId]
  );

  const emitRead = useCallback(
    (messageId: string) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected || !disputeId) return;
      socket.emit('dispute_chat:read', { disputeId, messageId });
    },
    [disputeId]
  );

  return { messages, connectionState, conversation, typing, closed, send, retry, emitTyping, emitRead };
}
