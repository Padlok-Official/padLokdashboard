/**
 * useInvitationPreview — fetches role + inviter context for the
 * accept-invite page.
 *
 * On 4xx, react-query treats the axios error as a rejection. We extract
 * the backend's typed `reason` field from the response body and expose
 * it separately so the page can pick a specific error state (expired,
 * revoked, already accepted, not found).
 *
 * No auto-retry — a bad token isn't going to become valid if we ask
 * again a few milliseconds later.
 */

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import authService from '@/services/auth-service';
import type {
  InvitationPreview,
  InvitationInvalidReason,
} from '@/services/auth-service';

export interface InvitationPreviewError extends Error {
  reason?: InvitationInvalidReason;
}

const toError = (err: unknown): InvitationPreviewError => {
  const axErr = err as AxiosError<{ message?: string; reason?: InvitationInvalidReason }>;
  const body = axErr?.response?.data;
  const message = body?.message ?? (err as Error)?.message ?? 'Failed to load invitation';
  const reason =
    body?.reason ??
    // Network failures + other transport errors have no reason; default
    // to 'not_found' so the UI still shows a useful screen.
    (axErr?.code === 'ERR_NETWORK' ? undefined : undefined);

  const result = new Error(message) as InvitationPreviewError;
  if (reason) result.reason = reason;
  return result;
};

export const useInvitationPreview = (token: string | null | undefined) =>
  useQuery<InvitationPreview, InvitationPreviewError>({
    queryKey: ['invitation-preview', token],
    enabled: Boolean(token),
    retry: false,
    gcTime: 0, // don't cache — token is one-time
    queryFn: async () => {
      try {
        const res = await authService.getInvitationPreview(token as string);
        if (!res.success || !res.data) {
          const e = new Error(res.message ?? 'Failed to load invitation') as InvitationPreviewError;
          throw e;
        }
        return res.data;
      } catch (err) {
        throw toError(err);
      }
    },
  });
