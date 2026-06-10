import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import verificationService from '@/services/verification-service';
import type {
  VerificationSubmission,
  VerificationStatus,
  VerificationTier,
} from '@/services/verification-service';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format-date';

const TIER_LABEL: Record<VerificationTier, string> = {
  tier1: 'Tier 1 · Identity',
  tier2: 'Tier 2 · Address & Banking',
  tier3: 'Tier 3 · Business',
};

const STATUS_STYLE: Record<VerificationStatus, string> = {
  pending: 'text-[#F59E0B] bg-[#FEF3C7]',
  approved: 'text-brand-green bg-brand-green/10',
  rejected: 'text-[#F44336] bg-[#F44336]/10',
};

// Turn payload keys like "ghanaCardFront" into "Ghana Card Front".
const humanize = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const isUrl = (v: unknown): v is string => typeof v === 'string' && /^https?:\/\//.test(v);

/** Renders a single tier's submitted documents/metadata from the JSONB payload. */
const PayloadView: FC<{ payload: Record<string, unknown> }> = ({ payload }) => {
  const entries = Object.entries(payload ?? {});
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No documents submitted.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => {
        if (isUrl(value)) {
          return (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-brand-green hover:bg-gray-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <FileText size={16} className="text-gray-400" />
                {humanize(key)}
              </span>
              <ExternalLink size={15} className="text-gray-400 group-hover:text-brand-green" />
            </a>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key} className="rounded-lg border border-gray-100 p-3 sm:col-span-2">
              <p className="text-xs text-gray-500">{humanize(key)}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {value.map((item, i) =>
                  isUrl(item) ? (
                    <a
                      key={i}
                      href={item}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-blue hover:underline"
                    >
                      {item}
                    </a>
                  ) : (
                    <span key={i} className="text-sm text-gray-700">
                      {String(item)}
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={key} className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-500">{humanize(key)}</p>
            <p className="text-sm font-semibold text-gray-900">{String(value ?? '—')}</p>
          </div>
        );
      })}
    </div>
  );
};

/** A single tier card with documents, review history, and approve/reject controls. */
const SubmissionCard: FC<{ userId: string; submission: VerificationSubmission }> = ({
  userId,
  submission,
}) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['verification', userId] });
    queryClient.invalidateQueries({ queryKey: ['verifications'] });
    queryClient.invalidateQueries({ queryKey: ['verification-stats'] });
  };

  const approveMutation = useMutation({
    mutationFn: () => verificationService.approve(userId, submission.tier, comment.trim() || undefined),
    onSuccess: () => {
      toast.success(`${TIER_LABEL[submission.tier].split(' ·')[0]} approved`);
      setComment('');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => verificationService.reject(userId, submission.tier, comment.trim()),
    onSuccess: () => {
      toast.success(`${TIER_LABEL[submission.tier].split(' ·')[0]} rejected`);
      setComment('');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject');
    },
  });

  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">{TIER_LABEL[submission.tier]}</h3>
        <span
          className={cn(
            'inline-block rounded-full px-3 py-1 text-xs font-medium capitalize',
            STATUS_STYLE[submission.status],
          )}
        >
          {submission.status}
        </span>
      </div>

      <p className="mb-2 text-xs text-gray-500">Submitted {formatDateTime(submission.submitted_at)}</p>

      <div className="my-4">
        <PayloadView payload={submission.payload} />
      </div>

      {/* Existing review trail */}
      {submission.reviewed_at && (
        <div
          className={cn(
            'mb-4 rounded-lg border p-3',
            submission.status === 'approved'
              ? 'border-brand-green/30 bg-brand-green/5'
              : 'border-[#F44336]/30 bg-[#F44336]/5',
          )}
        >
          <p className="text-xs font-semibold text-gray-700">
            {submission.status === 'approved' ? 'Approved' : 'Rejected'}
            {submission.reviewed_by_admin_name ? ` by ${submission.reviewed_by_admin_name}` : ''} ·{' '}
            {formatDateTime(submission.reviewed_at)}
          </p>
          {submission.review_comment && (
            <p className="mt-1 text-sm text-gray-700">{submission.review_comment}</p>
          )}
        </div>
      )}

      {/* Review controls */}
      <div className="border-t border-gray-100 pt-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Comment{' '}
          <span className="text-gray-400">(required to reject, optional to approve)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Add a comment for this decision…"
          disabled={busy}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-green disabled:opacity-50"
        />
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => approveMutation.mutate()}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:opacity-50"
          >
            {approveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Approve
          </button>
          <button
            onClick={() => {
              if (!comment.trim()) {
                toast.error('A comment is required to reject');
                return;
              }
              rejectMutation.mutate();
            }}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#F44336] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#F44336]/90 disabled:opacity-50"
          >
            {rejectMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <XCircle size={16} />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const KYCVerificationDetailPage: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: detailRes, isLoading } = useQuery({
    queryKey: ['verification', userId],
    queryFn: () => verificationService.getUserDetail(userId!),
    enabled: !!userId,
  });

  const detail = detailRes?.data;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-gray-600">No verification record found for this user.</p>
        <button
          onClick={() => navigate('/kyc-verification')}
          className="mt-4 flex items-center gap-1 text-sm text-brand-green hover:underline"
        >
          <ArrowLeft size={16} /> Back to KYC &amp; Verification
        </button>
      </div>
    );
  }

  const { user, account_status, submissions } = detail;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/kyc-verification')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          KYC &amp; Verification
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-brand-green">Verification Details</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Submissions */}
        <div className="space-y-6 lg:col-span-2">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              This user has no verification submissions.
            </div>
          ) : (
            submissions.map((s) => (
              <SubmissionCard key={s.id} userId={user.id} submission={s} />
            ))
          )}
        </div>

        {/* Sidebar: user + account status */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-gray-900">User</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-900">{user.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.email || '—'}
                  {user.email_verified && (
                    <span className="ml-2 text-xs font-medium text-brand-green">verified</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.phone_number || '—'}
                  {user.phone_verified && (
                    <span className="ml-2 text-xs font-medium text-brand-green">verified</span>
                  )}
                </p>
              </div>
              {user.created_at && (
                <div>
                  <p className="text-xs text-gray-500">Member since</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateTime(user.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <ShieldCheck size={18} className="text-brand-green" />
              Account Status
            </h2>
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Highest Approved Tier</p>
              <p className="text-lg font-bold text-gray-900">
                {account_status.highest_approved_tier
                  ? TIER_LABEL[account_status.highest_approved_tier].split(' ·')[0]
                  : 'Unverified'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-brand-green/10 p-2">
                <p className="text-lg font-bold text-brand-green">{account_status.approved_count}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
              <div className="rounded-lg bg-[#FEF3C7] p-2">
                <p className="text-lg font-bold text-[#F59E0B]">{account_status.pending_count}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="rounded-lg bg-[#F44336]/10 p-2">
                <p className="text-lg font-bold text-[#F44336]">{account_status.rejected_count}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Account active</span>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  account_status.is_active
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'bg-[#F44336]/10 text-[#F44336]',
                )}
              >
                {account_status.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationDetailPage;
