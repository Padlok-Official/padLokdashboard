import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Bell,
  Smartphone,
  Mail,
  Filter,
  Phone,
  AlertTriangle,
  Scale,
  CreditCard,
  Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  notificationService,
  type NotificationType,
  type SendNotificationPayload,
} from '@/services/notification-service';
import { formatRelative } from '@/lib/format-date';

interface ComposeType {
  label: string;
  value: NotificationType;
}

const notificationTypes: ComposeType[] = [
  { label: 'Warning', value: 'warning' },
  { label: 'Dispute Update', value: 'dispute_update' },
  { label: 'Transaction', value: 'transaction' },
  { label: 'Announcement', value: 'announcement' },
];

const typeStyle: Record<NotificationType, string> = {
  warning: 'bg-[#F44336]/10 text-[#F44336]',
  dispute_update: 'bg-purple-100 text-purple-600',
  transaction: 'bg-brand-green/10 text-brand-green',
  announcement: 'bg-[#020036] text-white',
  system: 'bg-gray-100 text-gray-700',
};

const typeDisplay: Record<NotificationType, string> = {
  warning: 'Warning',
  dispute_update: 'Dispute',
  transaction: 'Transaction',
  announcement: 'Announcement',
  system: 'System',
};

const channelIcon = (ch: string) => {
  if (ch === 'push') return <Bell size={14} className="text-gray-500" />;
  if (ch === 'sms') return <Phone size={14} className="text-gray-500" />;
  return <Mail size={14} className="text-gray-500" />;
};

interface Template {
  icon: React.ReactNode;
  title: string;
  description: string;
  apply: () => { type: NotificationType; subject: string; message: string };
}

const templates: Template[] = [
  {
    icon: <AlertTriangle size={18} className="text-gray-700" />,
    title: 'Account Warning',
    description: 'Standard warning template',
    apply: () => ({
      type: 'warning',
      subject: 'Account flagged for review',
      message:
        'Your account has been flagged for review due to recent activity. Please respond within 48 hours.',
    }),
  },
  {
    icon: <Scale size={18} className="text-gray-700" />,
    title: 'Dispute Resolution',
    description: 'Dispute outcome notification',
    apply: () => ({
      type: 'dispute_update',
      subject: 'Dispute resolution',
      message:
        'An update is available for your open dispute. Please check the dispute page for details.',
    }),
  },
  {
    icon: <CreditCard size={18} className="text-gray-700" />,
    title: 'Payment Released',
    description: 'Escrow release confirmation',
    apply: () => ({
      type: 'transaction',
      subject: 'Escrow payment released',
      message: 'Your escrow payment has been released. Funds are now available in your wallet.',
    }),
  },
  {
    icon: <Megaphone size={18} className="text-gray-700" />,
    title: 'Platform Update',
    description: 'General announcement',
    apply: () => ({
      type: 'announcement',
      subject: 'PadLok platform update',
      message: 'We are introducing new features and improvements. Read more in the app.',
    }),
  },
];

const NotificationsPage: FC = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<NotificationType>('warning');
  const [recipient, setRecipient] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [pushOn, setPushOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [emailOn, setEmailOn] = useState(false);

  const statsQuery = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationService.getStats(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const listQuery = useQuery({
    queryKey: ['notifications', 'list', { page: 1, limit: 10 }],
    queryFn: () => notificationService.list({ page: 1, limit: 10 }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const stats = statsQuery.data?.data;
  const notifications = listQuery.data?.data ?? [];

  const sendMutation = useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationService.send(payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          `Sent to ${res.data?.recipients ?? 0} ${
            (res.data?.recipients ?? 0) === 1 ? 'recipient' : 'recipients'
          }`,
        );
        setSubject('');
        setMessage('');
        setRecipient('');
        setBroadcast(false);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else {
        toast.error(res.message ?? 'Failed to send notification');
      }
    },
    onError: () => toast.error('Failed to send notification'),
  });

  const applyTemplate = (t: Template) => {
    const { type, subject: s, message: m } = t.apply();
    setSelectedType(type);
    setSubject(s);
    setMessage(m);
  };

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    const payload: SendNotificationPayload = {
      type: selectedType,
      title: subject.trim(),
      body: message.trim(),
      channels: { push: pushOn, sms: smsOn, email: emailOn },
    };
    if (broadcast) {
      payload.broadcast = true;
    } else if (recipient.trim()) {
      payload.userId = recipient.trim();
    } else {
      toast.error('Add a recipient or choose Broadcast');
      return;
    }
    sendMutation.mutate(payload);
  };

  const pushChan = stats?.by_channel.find((c) => c.channel === 'push');
  const smsChan = stats?.by_channel.find((c) => c.channel === 'sms');
  const emailChan = stats?.by_channel.find((c) => c.channel === 'email');

  const offline = statsQuery.isError || listQuery.isError;

  return (
    <div>
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Notifications</span>
      </div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Notification Center</h1>
        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Top Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            value: statsQuery.isLoading ? '…' : (stats?.total_today ?? 0).toLocaleString(),
            label: 'Total Sent Today',
            color: 'text-brand-green',
          },
          {
            value: statsQuery.isLoading ? '…' : `${stats?.delivery_rate_pct ?? '100.0'}%`,
            label: 'Delivery Rate',
            color: 'text-brand-green',
          },
          {
            value: statsQuery.isLoading ? '…' : String(stats?.pending ?? 0),
            label: 'Pending',
            color: 'text-brand-green',
          },
          {
            value: statsQuery.isLoading ? '…' : String(stats?.failed ?? 0),
            label: 'Failed',
            color: stats?.failed ? 'text-[#F44336]' : 'text-brand-green',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-brand-green/40 bg-white px-5 py-4 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Compose Notification */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Compose Notification</h2>

            <p className="mb-2 text-sm text-gray-600">Notification Type</p>
            <div className="mb-5 flex flex-wrap gap-3">
              {notificationTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={cn(
                    'rounded-lg border px-5 py-2 text-sm font-medium transition-colors',
                    selectedType === t.value
                      ? 'border-[#EF5350] bg-[#EF5350]/90 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm text-gray-600">Recipient</p>
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setBroadcast(false);
                  }}
                  placeholder="Paste user ID (UUID) to target a single user..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-brand-green"
                />
              </div>
              <span className="text-sm text-gray-400">or</span>
              <button
                onClick={() => {
                  setBroadcast(true);
                  setRecipient('');
                }}
                className={cn(
                  'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                  broadcast
                    ? 'border-brand-green bg-brand-green/10 text-brand-green'
                    : 'border-gray-900 bg-white text-gray-900 hover:bg-gray-50',
                )}
              >
                Broadcast to All
              </button>
            </div>

            <p className="mb-2 text-sm text-gray-600">Subject</p>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter notification subject..."
              className="mb-5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />

            <p className="mb-2 text-sm text-gray-600">Message</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notification message here..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />
          </div>

          {/* Recent Notifications */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">Recent Notifications</h2>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-brand-green">View All</button>
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Recipient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Channel</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Read</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {listQuery.isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        Loading…
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        No notifications yet.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => {
                      const channels = (n.data?.channels as Record<string, boolean> | undefined) ?? {};
                      const activeChannels = Object.entries(channels)
                        .filter(([, v]) => v)
                        .map(([k]) => k);
                      return (
                        <tr key={n.id} className="border-b border-gray-50 last:border-b-0">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {n.user_name ?? '—'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {n.user_email ?? n.user_id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle[n.type]}`}
                            >
                              {typeDisplay[n.type]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{n.title}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              {activeChannels.length === 0 ? (
                                <span className="text-xs text-gray-400">inbox</span>
                              ) : (
                                activeChannels.map((ch) => (
                                  <span key={ch}>{channelIcon(ch)}</span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                n.is_read
                                  ? 'bg-brand-green/10 text-brand-green'
                                  : 'bg-gray-100 text-gray-600',
                              )}
                            >
                              {n.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatRelative(n.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Delivery Channels */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Delivery Channels</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Push Notification</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushOn}
                  onChange={(e) => setPushOn(e.target.checked)}
                  className="h-4 w-4 accent-brand-green"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">SMS</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsOn}
                  onChange={(e) => setSmsOn(e.target.checked)}
                  className="h-4 w-4 accent-brand-green"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOn}
                  onChange={(e) => setEmailOn(e.target.checked)}
                  className="h-4 w-4 accent-brand-green"
                />
              </label>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <button
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="flex-1 rounded-lg bg-[#020036] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {sendMutation.isPending ? 'Sending…' : 'Send Notification'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Delivery workers aren't wired yet — messages post to the in-app inbox.
            </p>
          </div>

          {/* Quick Templates */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Quick Templates</h2>
            <div className="space-y-4">
              {templates.map((t) => (
                <div key={t.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyTemplate(t)}
                    className="text-sm font-medium text-brand-green"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Channel Performance</h2>
            <div className="space-y-4">
              {[
                { icon: <Bell size={18} className="text-gray-700" />, channel: 'Push Notifications', stat: pushChan },
                { icon: <Smartphone size={18} className="text-gray-700" />, channel: 'SMS Messages', stat: smsChan },
                { icon: <Mail size={18} className="text-gray-700" />, channel: 'Email', stat: emailChan },
              ].map((cp) => (
                <div key={cp.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cp.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cp.channel}</p>
                      <p className="text-xs text-gray-500">
                        {cp.stat ? `${cp.stat.delivery_pct}% delivery rate` : '— no data'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-green">
                      {cp.stat?.sent ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">sent total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
