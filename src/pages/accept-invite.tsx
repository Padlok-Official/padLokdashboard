/**
 * Accept-invite page.
 *
 * Lands from the email link with `?token=...`. Fetches a preview so we
 * can show "you've been invited by X as Y" before the form. Four states:
 *   - loading     — waiting for the preview to resolve
 *   - invalid     — backend rejected the token (expired/accepted/revoked/not_found)
 *   - valid       — happy path: role card + form
 *   - submitting  — same layout as valid, form disabled
 *
 * On successful submit, the backend auto-logs the new admin in; we stash
 * the token pair in the store and land them on the dashboard home.
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

import { acceptInviteSchema } from '@/schemas/auth-schema';
import type { AcceptInviteFormData } from '@/schemas/auth-schema';
import { useInvitationPreview } from '@/hooks/useInvitationPreview';
import type { InvitationInvalidReason } from '@/services/auth-service';
import authService from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import Spinner from '@/components/shared/Spinner';

// --------------------------------------------------------------------------
// Copy for each invalid state
// --------------------------------------------------------------------------

const INVALID_COPY: Record<InvitationInvalidReason | 'unknown', { title: string; body: string }> = {
  expired: {
    title: 'This invitation has expired',
    body: 'Invitation links expire after 7 days. Ask the person who invited you to send a fresh one from the dashboard.',
  },
  accepted: {
    title: 'Invitation already accepted',
    body: 'This invitation has already been used to create an account. Log in to continue.',
  },
  revoked: {
    title: 'Invitation was revoked',
    body: "The admin who invited you cancelled this invitation. If you believe that's a mistake, reach out to them.",
  },
  not_found: {
    title: "We couldn't find that invitation",
    body: 'The link might have a typo, or the invitation may have been deleted. Double-check the email we sent you.',
  },
  unknown: {
    title: 'Something went wrong',
    body: "We couldn't load this invitation right now. Try again in a moment, or contact the admin who invited you.",
  },
};

// --------------------------------------------------------------------------
// Brand panel (matches the login page for consistency)
// --------------------------------------------------------------------------

const BrandPanel: FC = () => (
  <div className="hidden w-1/2 items-center justify-center p-6 md:flex">
    <div className="relative flex h-full w-full flex-col justify-between rounded-3xl bg-brand-deep-navy px-14 py-14 lg:px-16 lg:py-16">
      <h2 className="text-4xl font-bold text-white lg:text-5xl">Security</h2>
      <div className="flex justify-center">
        <h2 className="text-4xl font-bold text-white lg:text-5xl">Speed</h2>
      </div>
      <div className="flex justify-end">
        <h2 className="text-4xl font-bold text-white lg:text-5xl">Trust</h2>
      </div>
    </div>
  </div>
);

// --------------------------------------------------------------------------
// Main page
// --------------------------------------------------------------------------

const AcceptInvitePage: FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const preview = useInvitationPreview(token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: '', password: '', confirmPassword: '' },
  });

  // --- No token at all in the URL ---
  if (!token) {
    return <InvalidStateView reason="not_found" />;
  }

  // --- Loading the preview ---
  if (preview.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8EAF0] font-sans">
        <Spinner size="md" />
      </div>
    );
  }

  // --- Preview failed (expired / accepted / revoked / not_found / network) ---
  if (preview.error || !preview.data) {
    return <InvalidStateView reason={preview.error?.reason ?? 'unknown'} />;
  }

  const invitation = preview.data;

  const onSubmit = async (formData: AcceptInviteFormData) => {
    setSubmitting(true);
    try {
      const res = await authService.acceptInvite({
        token,
        name: formData.name,
        password: formData.password,
      });

      if (!res.success || !res.data) {
        toast.error(res.message ?? 'Failed to accept invitation');
        setSubmitting(false);
        return;
      }

      // authService.acceptInvite unwraps padlok-api's camelCase shape into
      // { token, user } — same as login — so the rest of the app sees a
      // single admin shape regardless of the sign-in path.
      const { token: accessToken, user } = res.data;
      setAuth(accessToken, user);
      toast.success(`Welcome, ${user.name.split(' ')[0]}! You're in.`);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axErr = err as AxiosError<{ message?: string; reason?: InvitationInvalidReason }>;
      const message =
        axErr.response?.data?.message ??
        (err as Error).message ??
        'Unable to accept invitation';
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E8EAF0] font-sans">
      {/* Left — Welcome + Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-12 lg:px-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
              <Sparkles size={12} />
              Invitation
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep-navy md:text-4xl">
              Welcome to PadLok 👋
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              You&apos;ve been invited by{' '}
              <strong className="text-brand-deep-navy">{invitation.inviterName}</strong> to
              join as a <strong className="text-brand-green">{invitation.roleName}</strong>.
            </p>
          </div>

          {/* Role card */}
          <div className="mb-8 rounded-2xl border border-brand-green/20 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                <ShieldCheck size={18} className="text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{invitation.roleName}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {invitation.roleDescription ?? 'Your permissions are set by this role.'}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Signing in as <strong className="text-gray-600">{invitation.email}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:opacity-60"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:opacity-60"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:opacity-60"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white transition hover:bg-brand-green/90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  Creating your account…
                </>
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By accepting, you confirm that you&apos;re {invitation.email}.
          </p>
        </div>
      </div>

      <BrandPanel />
    </div>
  );
};

// --------------------------------------------------------------------------
// Invalid state view
// --------------------------------------------------------------------------

const InvalidStateView: FC<{ reason: InvitationInvalidReason | 'unknown' }> = ({
  reason,
}) => {
  const navigate = useNavigate();
  const copy = INVALID_COPY[reason];

  return (
    <div className="flex min-h-screen bg-[#E8EAF0] font-sans">
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-12 lg:px-20">
        <div className="w-full max-w-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#F59E0B]/10">
            <AlertTriangle size={24} className="text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-deep-navy md:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm text-gray-600">{copy.body}</p>

          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-deep-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-navy"
          >
            Go to login
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <BrandPanel />
    </div>
  );
};

export default AcceptInvitePage;
