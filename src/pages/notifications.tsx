import { useState } from 'react';
import type { FC } from 'react';
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
import { cn } from '@/lib/utils';

const notificationTypes = ['Warning', 'Dispute Update', 'Transaction', 'Announcement'] as const;
type NotificationType = (typeof notificationTypes)[number];

const typeStyle: Record<string, string> = {
  Warning: 'bg-[#F44336]/10 text-[#F44336]',
  Dispute: 'bg-purple-100 text-purple-600',
  'Dispute Update': 'bg-purple-100 text-purple-600',
  Transaction: 'bg-brand-green/10 text-brand-green',
  Announcement: 'bg-[#020036] text-white',
};

interface Notification {
  recipient: string;
  userId: string;
  type: string;
  subject: string;
  channels: string[];
  status: 'Sent' | 'Failed';
  time: string;
}

const recentNotifications: Notification[] = [
  { recipient: 'Kweku Frimpong', userId: '#USR00892', type: 'Warning', subject: 'Account flagged for review', channels: ['push', 'sms'], status: 'Sent', time: '2 min ago' },
  { recipient: 'John Mensah', userId: '#USR00456', type: 'Dispute', subject: 'Dispute #DSP001247 update', channels: ['push', 'email'], status: 'Sent', time: '15 min ago' },
  { recipient: 'Ama Serwaa', userId: '#USR00321', type: 'Transaction', subject: 'Payment of GHS 780 released', channels: ['sms'], status: 'Sent', time: '1 hour ago' },
  { recipient: 'All Users', userId: 'Broadcast', type: 'Announcement', subject: 'Platform maintenance notice', channels: ['push', 'sms', 'email'], status: 'Sent', time: '3 hours ago' },
  { recipient: 'Kofi Asante', userId: '#USR00178', type: 'Warning', subject: 'Suspicious activity detected', channels: ['sms'], status: 'Failed', time: '5 hours ago' },
];

const quickTemplates = [
  { title: 'Account Warning', description: 'Standard warning template', dotColor: 'bg-[#F44336]' },
  { title: 'Dispute Resolution', description: 'Dispute outcome notification', dotColor: 'bg-[#020036]' },
  { title: 'Payment Released', description: 'Escrow release confirmation', dotColor: 'bg-brand-green' },
  { title: 'Platform Update', description: 'General announcement', dotColor: 'bg-gray-400' },
];

const channelPerformance = [
  { channel: 'Push Notifications', rate: '99.1% delivery rate', count: '847', dotColor: 'bg-[#020036]' },
  { channel: 'SMS Messages', rate: '97.8% delivery rate', count: '312', dotColor: 'bg-[#020036]' },
  { channel: 'Email', rate: '94.2% delivery rate', count: '88', dotColor: 'bg-[#F59E0B]' },
];

const channelIcon = (ch: string) => {
  if (ch === 'push') return <Bell size={14} className="text-gray-500" />;
  if (ch === 'sms') return <Phone size={14} className="text-gray-500" />;
  return <Mail size={14} className="text-gray-500" />;
};

const NotificationsPage: FC = () => {
  const [selectedType, setSelectedType] = useState<NotificationType>('Warning');

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-1 text-sm text-gray-400">
        Dashboard <span className="mx-1">/</span>{' '}
        <span className="text-brand-green">Notifications</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-brand-green">
        Notification Center
      </h1>

      {/* Top Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: '1,247', label: 'Total Sent Today', color: 'text-brand-green' },
          { value: '98.2%', label: 'Delivery Rate', color: 'text-brand-green' },
          { value: '342', label: 'Pending', color: 'text-brand-green' },
          { value: '23', label: 'Failed', color: 'text-[#F44336]' },
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
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Compose Notification
            </h2>

            {/* Notification Type */}
            <p className="mb-2 text-sm text-gray-600">Notification Type</p>
            <div className="mb-5 flex flex-wrap gap-3">
              {notificationTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    'rounded-lg border px-5 py-2 text-sm font-medium transition-colors',
                    selectedType === t
                      ? 'border-[#EF5350] bg-[#EF5350]/90 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Recipient */}
            <p className="mb-2 text-sm text-gray-600">Recipient</p>
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search user by ID, name, or email..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-brand-green"
                />
              </div>
              <span className="text-sm text-gray-400">or</span>
              <button className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                All Users
              </button>
              <button className="rounded-lg border border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
                Broadcast to All
              </button>
            </div>

            {/* Subject */}
            <p className="mb-2 text-sm text-gray-600">Subject</p>
            <input
              type="text"
              placeholder="Enter notification subject..."
              className="mb-5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />

            {/* Message */}
            <p className="mb-2 text-sm text-gray-600">Message</p>
            <textarea
              placeholder="Type your notification message here..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-green"
            />
          </div>

          {/* Recent Notifications */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-bold text-gray-900">
                Recent Notifications
              </h2>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-brand-green">
                  View All
                </button>
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentNotifications.map((n, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {n.recipient}
                        </p>
                        <p className="text-xs text-gray-400">{n.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle[n.type]}`}
                        >
                          {n.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {n.subject}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {n.channels.map((ch) => (
                            <span key={ch}>{channelIcon(ch)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            n.status === 'Sent'
                              ? 'bg-brand-green/10 text-brand-green'
                              : 'bg-[#F44336]/10 text-[#F44336]',
                          )}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {n.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Delivery Channels */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Delivery Channels
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    Push Notification
                  </span>
                </div>
                <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    SMS
                  </span>
                </div>
                <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    Email
                  </span>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  Optional
                </span>
              </div>
            </div>

            {/* Schedule + Send */}
            <div className="mt-5 flex items-end gap-3">
              <div className="flex-1">
                <p className="mb-1 text-xs text-gray-500">Schedule</p>
                <div className="h-10 rounded-lg border border-gray-200" />
              </div>
              <button className="rounded-lg bg-[#020036] px-6 py-2.5 text-sm font-medium text-white">
                Send Notification
              </button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Quick Templates
            </h2>
            <div className="space-y-4">
              {[
                { icon: <AlertTriangle size={18} className="text-gray-700" />, title: 'Account Warning', description: 'Standard warning template' },
                { icon: <Scale size={18} className="text-gray-700" />, title: 'Dispute Resolution', description: 'Dispute outcome notification' },
                { icon: <CreditCard size={18} className="text-gray-700" />, title: 'Payment Released', description: 'Escrow release confirmation' },
                { icon: <Megaphone size={18} className="text-gray-700" />, title: 'Platform Update', description: 'General announcement' },
              ].map((t) => (
                <div
                  key={t.title}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-brand-green">
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Channel Performance
            </h2>
            <div className="space-y-4">
              {[
                { icon: <Bell size={18} className="text-gray-700" />, channel: 'Push Notifications', rate: '99.1% delivery rate', count: '847' },
                { icon: <Smartphone size={18} className="text-gray-700" />, channel: 'SMS Messages', rate: '97.8% delivery rate', count: '312' },
                { icon: <Mail size={18} className="text-gray-700" />, channel: 'Email', rate: '94.2% delivery rate', count: '88' },
              ].map((cp) => (
                <div
                  key={cp.channel}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {cp.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cp.channel}
                      </p>
                      <p className="text-xs text-gray-500">{cp.rate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-green">
                      {cp.count}
                    </p>
                    <p className="text-xs text-gray-400">sent today</p>
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
