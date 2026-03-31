import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface TimelineEvent {
  color: string;
  title: string;
  date: string;
  description: string;
  images?: number;
}

const timeline: TimelineEvent[] = [
  {
    color: 'bg-brand-green',
    title: 'Escrow Funded by Buyer',
    date: 'Mar 18, 2026 - 10:24 AM',
    description:
      'John Mensah deposited GHS 2,450.00 into escrow for purchase of iPhone 14 Pro Max (256GB) from Kwame Electronics.',
  },
  {
    color: 'bg-brand-green',
    title: 'Order Accepted by Seller',
    date: 'Mar 18, 2026 - 02:15 PM',
    description:
      'Kwame Electronics accepted the order and confirmed item availability. Estimated delivery: 2-3 business days.',
  },
  {
    color: 'bg-blue-500',
    title: 'Item Marked as Delivered (Seller)',
    date: 'Mar 20, 2026 - 11:42 AM',
    description: 'Seller uploaded proof of delivery showing item handover.',
    images: 2,
  },
  {
    color: 'bg-amber-500',
    title: 'Delivery Proof from Buyer',
    date: 'Mar 20, 2026 - 04:30 PM',
    description:
      'Buyer uploaded images of item received - claims item is damaged/defective.',
    images: 3,
  },
  {
    color: 'bg-red-500',
    title: 'Dispute Filed',
    date: 'Mar 24, 2026 - 09:15 AM',
    description:
      'Buyer filed dispute claiming the iPhone received has a cracked screen and is not as described. Requesting full refund.',
  },
];

const EvidencePanelPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
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
        <p className="mt-1 text-base font-semibold text-gray-700">
          Dispute / #DPOQ22332
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dispute Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Dispute Summary
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Transaction ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  #TXN8834521
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Escrow Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  GHS 2,450.00
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Filed Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  Mar 24, 2026
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Buyer</p>
                <p className="text-sm font-semibold text-gray-900">
                  John Mensah
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seller</p>
                <p className="text-sm font-semibold text-gray-900">
                  Kwame Electronics
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Evidence Status</p>
                <p className="text-sm font-semibold text-gray-900">Complete</p>
              </div>
            </div>
          </div>

          {/* Evidence Timeline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-base font-bold text-gray-900">
              Evidence Timeline
            </h2>
            <div className="relative space-y-8">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-0.5 bg-gray-200" />

              {timeline.map((event, i) => (
                <div key={i} className="relative flex gap-4 pl-6">
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ${event.color} ring-2 ring-white`}
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-gray-900">
                        {event.title}
                      </h3>
                      <span className="ml-4 shrink-0 text-xs text-gray-400">
                        {event.date}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {event.description}
                    </p>

                    {event.images && (
                      <div className="mt-3 flex gap-2">
                        {Array.from({ length: event.images }).map((_, j) => (
                          <div
                            key={j}
                            className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400"
                          >
                            IMG
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Admin Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Admin Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100">
                Communicate with Buyer
              </button>
              <button className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100">
                Communicate with Seller
              </button>
              <button className="w-full rounded-lg bg-[#7C3AED] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]">
                Approve Seller Payout
              </button>
              <button className="w-full rounded-lg bg-brand-green py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green/90">
                Refund Buyer
              </button>
              <button className="w-full rounded-lg border border-[#F44336] bg-white py-2.5 text-sm font-medium text-[#F44336] transition-colors hover:bg-red-50">
                Penalize User
              </button>
              <button className="w-full rounded-lg border border-amber-500 bg-white py-2.5 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-50">
                Apply Dispute Flag
              </button>
            </div>
          </div>

          {/* Involved Parties */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Involved Parties
            </h2>
            <div className="space-y-4">
              {/* Buyer */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-sm font-medium text-purple-600">
                    JM
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    John Mensah
                  </p>
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-xs text-gray-500">
                    john.mensah@email.com
                  </p>
                  <p className="text-xs text-gray-500">+233 24 123 4567</p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Seller */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-sm font-medium text-purple-600">
                    KE
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Kwame Electronics
                  </p>
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-xs text-gray-500">
                    kwame.elec@business.com
                  </p>
                  <p className="text-xs text-gray-500">+233 20 987 6543</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Dispute Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">6</p>
                <p className="mt-1 text-xs text-gray-500">Days Since Filed</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="mt-1 text-xs text-gray-500">Evidence Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidencePanelPage;
