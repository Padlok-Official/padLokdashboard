import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Smartphone,
  Mail,
  Filter,
  Phone,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Lock,
  Megaphone,
  Loader2,
  Users,
  X,
  Sparkles,
  Clock,
  FileText,
  Wallet,
  CheckCircle2,
  PackageCheck,
  Send,
  TrendingUp,
  Info,
  UserCheck,
  Star,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import notificationService from '@/services/notification-service';
import type { NotificationType, NotificationRow } from '@/services/notification-service';

const TYPES: { label: string; value: NotificationType }[] = [
  { label: 'Warning', value: 'warning' },
  { label: 'Dispute Update', value: 'dispute_update' },
  { label: 'Transaction', value: 'transaction' },
  { label: 'Announcement', value: 'announcement' },
];

const typeLabel = (t: string): string =>
  TYPES.find((x) => x.value === t)?.label ?? t.replace(/_/g, ' ');

const typeStyle: Record<string, string> = {
  warning: 'bg-[#F44336]/10 text-[#F44336]',
  dispute_update: 'bg-purple-100 text-purple-600',
  transaction: 'bg-brand-green/10 text-brand-green',
  announcement: 'bg-brand-blue text-white',
  system: 'bg-gray-100 text-gray-600',
};

interface Template {
  icon: FC<{ size?: number; className?: string }>;
  title: string;
  description: string;
  category: string;
  type: NotificationType;
  subject: string;
  message: string;
}

const TEMPLATES: Template[] = [
  // ---- Safety & Education ----
  { icon: ShieldCheck, category: 'Safety', title: 'Escrow Safety Tips', description: 'How to transact safely', type: 'announcement', subject: 'Stay safe: always use escrow', message: 'Keep your money protected — only pay through PadLok escrow and never send funds directly to a seller. Funds are released to the seller only after you confirm you have received your item. If anything looks off, raise a dispute instead of paying outside the app.' },
  { icon: AlertTriangle, category: 'Safety', title: 'Spot & Avoid Scams', description: 'Fraud awareness tips', type: 'warning', subject: 'How to recognise a scam', message: 'Be cautious of deals that seem too good to be true, sellers who pressure you to pay outside PadLok, or anyone asking for your PIN or password. PadLok will never ask for your PIN. When in doubt, slow down, verify the other party, and keep all payments inside escrow.' },
  { icon: GraduationCap, category: 'Safety', title: 'How Escrow Works', description: 'Educational walkthrough', type: 'announcement', subject: 'Understanding PadLok escrow', message: 'Escrow holds the buyer’s payment securely until the deal is complete: 1) The buyer funds the escrow, 2) the seller ships or delivers the item, 3) the buyer confirms receipt, 4) PadLok releases the funds to the seller. This protects both sides from fraud.' },

  // ---- Account & Security ----
  { icon: Lock, category: 'Account', title: 'Secure Your Account', description: 'Security best practices', type: 'announcement', subject: 'Protect your PadLok account', message: 'Keep your account safe: set a strong, unique PIN, never share your login or one-time codes, and always sign out on shared devices. Review your transactions regularly and report anything you don’t recognise right away.' },
  { icon: ShieldAlert, category: 'Account', title: 'Suspicious Activity', description: 'Security alert', type: 'warning', subject: 'Unusual activity on your account', message: 'We noticed a sign-in or action on your account that looks unusual. If this was you, no action is needed. If not, change your PIN immediately, sign out of all devices, and contact PadLok support so we can help secure your account.' },
  { icon: UserCheck, category: 'Account', title: 'Complete Your KYC', description: 'Verification reminder', type: 'announcement', subject: 'Verify your identity to unlock full access', message: 'Complete your identity verification to raise your transaction limits and keep your account secure. It only takes a couple of minutes — head to Settings → Verification to submit your documents.' },
  { icon: Bell, category: 'Account', title: 'Enable 2FA', description: 'Extra layer of security', type: 'announcement', subject: 'Add two-factor authentication', message: 'Protect your wallet with two-factor authentication. With 2FA on, a one-time code is required at sign-in, so even if someone learns your password they still can’t get in. Turn it on in Settings → Security.' },

  // ---- Transactions ----
  { icon: Wallet, category: 'Transactions', title: 'Payment Received', description: 'Funds credited to escrow', type: 'transaction', subject: 'Payment received into escrow', message: 'Good news — the buyer has funded the escrow for your transaction. You can now proceed to deliver the item. Funds will be released to you once the buyer confirms they have received it.' },
  { icon: CheckCircle2, category: 'Transactions', title: 'Funds Released', description: 'Escrow payout completed', type: 'transaction', subject: 'Your funds have been released', message: 'The escrow for your transaction has been released and the funds are now available in your PadLok wallet. Thank you for transacting safely with escrow.' },
  { icon: PackageCheck, category: 'Transactions', title: 'Confirm Delivery', description: 'Prompt buyer to confirm', type: 'transaction', subject: 'Please confirm you received your item', message: 'Your seller has marked this order as delivered. Once you confirm receipt, the funds will be released to them. If you have not received your item or something is wrong, please raise a dispute instead of confirming.' },
  { icon: Send, category: 'Transactions', title: 'Withdrawal Processed', description: 'Payout to bank', type: 'transaction', subject: 'Your withdrawal is on its way', message: 'Your withdrawal request has been processed and the funds are being sent to your linked bank account. Depending on your bank, it may take a short while to reflect.' },
  { icon: TrendingUp, category: 'Transactions', title: 'Top-Up Successful', description: 'Wallet funded', type: 'transaction', subject: 'Your wallet has been topped up', message: 'Your wallet top-up was successful and your balance has been updated. You’re all set to fund your next escrow transaction.' },

  // ---- Disputes ----
  { icon: Info, category: 'Disputes', title: 'Dispute Received', description: 'Acknowledgement', type: 'dispute_update', subject: 'We’ve received your dispute', message: 'Your dispute has been received and our team is reviewing it. The escrowed funds remain safely held while we investigate. We’ll reach out if we need any additional information from you.' },
  { icon: FileText, category: 'Disputes', title: 'Submit Evidence', description: 'Request more info', type: 'dispute_update', subject: 'Action needed: please submit evidence', message: 'To help us resolve your dispute fairly, please submit any supporting evidence — photos, receipts, or chat screenshots — within the app as soon as possible. The more detail you provide, the faster we can reach a decision.' },
  { icon: CheckCircle2, category: 'Disputes', title: 'Dispute Resolved', description: 'Outcome notice', type: 'dispute_update', subject: 'Your dispute has been resolved', message: 'Your dispute has now been resolved and the escrowed funds have been settled according to the outcome. You can view the full details in the app. Thank you for your patience while we reviewed the case.' },

  // ---- Announcements & Engagement ----
  { icon: Sparkles, category: 'Product', title: 'Welcome to PadLok', description: 'Onboarding greeting', type: 'announcement', subject: 'Welcome to PadLok 👋', message: 'Welcome to PadLok — the safer way to buy and sell. Fund a transaction into escrow, and we’ll hold the money securely until both sides are happy. Explore the app and reach out to support anytime you need a hand.' },
  { icon: Megaphone, category: 'Product', title: 'New Feature', description: 'Product update', type: 'announcement', subject: 'Something new on PadLok', message: 'We’ve just rolled out a new feature to make your experience even better. Update to the latest version of the app to try it out, and let us know what you think.' },
  { icon: Clock, category: 'Product', title: 'Scheduled Maintenance', description: 'Downtime notice', type: 'announcement', subject: 'Scheduled maintenance notice', message: 'PadLok will undergo scheduled maintenance during off-peak hours to keep things running smoothly. You may be briefly unable to transact during this window. Your funds and data remain safe throughout.' },
  { icon: Star, category: 'Engagement', title: 'Rate Your Experience', description: 'Feedback request', type: 'announcement', subject: 'How was your transaction?', message: 'We’d love your feedback! Take a moment to rate your recent transaction and the person you dealt with. Your ratings help build a trusted community and keep PadLok safe for everyone.' },
  { icon: Gift, category: 'Engagement', title: 'Invite Friends', description: 'Referral nudge', type: 'announcement', subject: 'Invite friends to PadLok', message: 'Know someone who buys or sells online? Invite them to PadLok so they can transact safely with escrow too. Share your invite from the app — it only takes a second.' },
];

const TEMPLATE_CATEGORIES = ['All', 'Safety', 'Account', 'Transactions', 'Disputes', 'Product', 'Engagement'] as const;
type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

const channelIcon = (ch: string) => {
  if (ch === 'push') return <Bell size={14} className="text-gray-500" />;
  if (ch === 'sms') return <Phone size={14} className="text-gray-500" />;
  return <Mail size={14} className="text-gray-500" />;
};

const activeChannels = (row: NotificationRow): string[] => {
  const c = row.data?.channels;
  if (!c) return [];
  return [c.push && 'push', c.sms && 'sms', c.email && 'email'].filter(Boolean) as string[];
};

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const NotificationsPage: FC = () => {
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<NotificationType>('announcement');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [saveInApp, setSaveInApp] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('All');

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationService.getStats(),
  });

  const { data: listRes, isLoading: loadingList } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationService.list({ limit: 10 }),
  });

  const stats = statsRes?.data;
  const recent = listRes?.data ?? [];

  const broadcastMutation = useMutation({
    mutationFn: () =>
      notificationService.broadcast({
        type: selectedType,
        title: subject.trim(),
        body: message.trim(),
        channels: { push, email },
        saveInApp,
      }),
    onSuccess: (res) => {
      const data = res.data;
      if (data?.delivery_error) {
        toast.warning(`Saved, but delivery had an issue: ${data.delivery_error}`);
      } else {
        const parts: string[] = [];
        if (data?.in_app) parts.push(`${data.in_app.recipients} in-app`);
        if (data?.delivery?.email) parts.push(`${data.delivery.email.sent} emails`);
        if (data?.delivery?.push?.success) parts.push('push sent');
        toast.success(`Broadcast sent${parts.length ? ` — ${parts.join(', ')}` : ''}`);
      }
      setSubject('');
      setMessage('');
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'recent'] });
    },
    onError: (err: any) => {
      setShowConfirm(false);
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    },
  });

  const canSend = subject.trim().length > 0 && message.trim().length > 0 && (push || email);

  const applyTemplate = (tpl: Template) => {
    setSelectedType(tpl.type);
    setSubject(tpl.subject);
    setMessage(tpl.message);
    toast.success(`Loaded "${tpl.title}" template`);
  };

  const visibleTemplates =
    templateCategory === 'All'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === templateCategory);

  const statCards = [
    { value: stats ? stats.total_today.toLocaleString() : '—', label: 'Total Sent Today', color: 'text-brand-green' },
    { value: stats ? `${stats.delivery_rate_pct}%` : '—', label: 'Delivery Rate', color: 'text-brand-green' },
    { value: stats ? stats.pending.toLocaleString() : '—', label: 'Pending', color: 'text-brand-green' },
    { value: stats ? stats.failed.toLocaleString() : '—', label: 'Failed', color: 'text-[#F44336]' },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Notifications</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-brand-green">Notification Center</h1>

      {/* Top Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-brand-green/40 bg-white px-5 py-4 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>
              {loadingStats ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-300" /> : stat.value}
            </p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Compose Broadcast */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-1 text-base font-bold text-gray-900">Compose Broadcast</h2>
            <p className="mb-4 text-xs text-gray-500">
              Sends to every PadLok user over the selected channels.
            </p>

            {/* Notification Type */}
            <p className="mb-2 text-sm text-gray-600">Notification Type</p>
            <div className="mb-5 flex flex-wrap gap-3">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={cn(
                    'rounded-lg border px-5 py-2 text-sm font-medium transition-colors',
                    selectedType === t.value
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Audience */}
            <p className="mb-2 text-sm text-gray-600">Audience</p>
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
              <Users size={16} className="text-brand-green" />
              <span className="text-sm font-medium text-gray-900">All Users</span>
              <span className="ml-auto text-xs text-gray-400">Broadcast</span>
            </div>

            {/* Subject */}
            <p className="mb-2 text-sm text-gray-600">Subject</p>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              placeholder="Enter notification subject..."
              className="mb-5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />

            {/* Message */}
            <p className="mb-2 text-sm text-gray-600">Message</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              placeholder="Type your notification message here..."
              rows={4}
              className="mb-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />
            <p className="text-right text-xs text-gray-400">{message.length}/2000</p>
          </div>

          {/* Recent Notifications */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">Recent Notifications</h2>
              <Filter size={16} className="text-gray-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Recipient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Channel</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-gray-400" />
                        Loading notifications...
                      </td>
                    </tr>
                  ) : recent.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No notifications yet.
                      </td>
                    </tr>
                  ) : (
                    recent.map((n) => {
                      const channels = activeChannels(n);
                      const failed = n.data?.delivery_status === 'failed';
                      return (
                        <tr key={n.id} className="border-b border-gray-50 last:border-b-0">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{n.user_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{n.user_email || ''}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle[n.type] ?? 'bg-gray-100 text-gray-600'}`}>
                              {typeLabel(n.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{n.title}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              {channels.length === 0 ? (
                                <span className="text-xs text-gray-300">—</span>
                              ) : (
                                channels.map((ch) => <span key={ch}>{channelIcon(ch)}</span>)
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                failed ? 'bg-[#F44336]/10 text-[#F44336]' : 'bg-brand-green/10 text-brand-green',
                              )}
                            >
                              {failed ? 'Failed' : 'Sent'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{relativeTime(n.created_at)}</td>
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
            <h2 className="mb-1 text-base font-bold text-gray-900">Delivery Channels</h2>
            <p className="mb-4 text-xs text-gray-500">Choose how this broadcast is delivered.</p>
            <div className="space-y-3">
              <button
                onClick={() => setPush((v) => !v)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-3 py-3 transition-colors',
                  push ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Push Notification</span>
                </div>
                <span className={cn('h-4 w-4 rounded border', push ? 'border-brand-green bg-brand-green' : 'border-gray-300')} />
              </button>

              <button
                onClick={() => setEmail((v) => !v)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-3 py-3 transition-colors',
                  email ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </div>
                <span className={cn('h-4 w-4 rounded border', email ? 'border-brand-green bg-brand-green' : 'border-gray-300')} />
              </button>

              <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-3 opacity-60">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">SMS</span>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                  Unavailable
                </span>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={saveInApp}
                onChange={(e) => setSaveInApp(e.target.checked)}
                className="h-4 w-4 accent-brand-green"
              />
              Also save to users' in-app inbox
            </label>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!canSend || broadcastMutation.isPending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {broadcastMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
              {broadcastMutation.isPending ? 'Broadcasting...' : 'Broadcast to All Users'}
            </button>
          </div>

          {/* Quick Templates */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Quick Templates</h2>
              <span className="text-xs text-gray-400">{visibleTemplates.length} options</span>
            </div>

            {/* Category filter */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {TEMPLATE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setTemplateCategory(c)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    templateCategory === c
                      ? 'bg-brand-green text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
              {visibleTemplates.map((t) => (
                <div
                  key={t.title}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn('shrink-0 rounded-lg p-1.5', typeStyle[t.type] ?? 'bg-gray-100 text-gray-600')}>
                      <t.icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="truncate text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyTemplate(t)}
                    className="shrink-0 rounded-md border border-brand-green/40 px-3 py-1 text-sm font-medium text-brand-green transition-colors hover:bg-brand-green/5"
                  >
                    Use
                  </button>
                </div>
              ))}
              {visibleTemplates.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">No templates in this category.</p>
              )}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">Channel Performance</h2>
            <div className="space-y-4">
              {(stats?.by_channel ?? []).map((cp) => {
                const Icon = cp.channel === 'push' ? Bell : cp.channel === 'sms' ? Smartphone : Mail;
                return (
                  <div key={cp.channel} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-700" />
                      <div>
                        <p className="text-sm font-medium capitalize text-gray-900">{cp.channel}</p>
                        <p className="text-xs text-gray-500">{cp.delivery_pct}% delivery rate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-green">{cp.sent.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">sent today</p>
                    </div>
                  </div>
                );
              })}
              {!loadingStats && (stats?.by_channel?.length ?? 0) === 0 && (
                <p className="text-sm text-gray-500">No channel activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Broadcast Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-900">Confirm Broadcast</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              This will send <span className="font-semibold">"{subject}"</span> to{' '}
              <span className="font-semibold">all users</span> via{' '}
              <span className="font-semibold">
                {[push && 'Push', email && 'Email'].filter(Boolean).join(' + ')}
              </span>
              {saveInApp && ' and save it to their in-app inbox'}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => broadcastMutation.mutate()}
                disabled={broadcastMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-blue py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {broadcastMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {broadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
