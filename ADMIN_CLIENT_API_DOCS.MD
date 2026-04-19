# PadLok Admin Dashboard — API Reference

All admin-dashboard traffic targets a single backend: **padlok-api** (the admin server), configured via `VITE_API_URL` (default `http://localhost:4000/api/v1`).

padlok-api reads from the shared Postgres database that **padlokbackend** (the user backend) writes to, so admin endpoints operate on live user data without proxying HTTP calls through the client backend.

- Admin server repo: `/Users/berthajones/Desktop/padlok-api`
- Shared DB tables owned by client backend: `users`, `wallets`, `wallet_transactions`, `transactions`, `disputes`, `payment_methods`, `ratings`, `notifications`, `audit_log`
- Tables owned by admin server: `admins`, `admin_roles`, `admin_permissions`, `role_permissions`, `admin_invitations`, `admin_refresh_tokens`, `admin_audit_logs`, `user_flags`, `risk_alerts`

---

## Conventions

- **Base URL**: `{VITE_API_URL}` — include the `/api/v1` prefix.
- **Auth**: `Authorization: Bearer <accessToken>` on every request except `POST /auth/login`, `POST /auth/refresh`, `GET /auth/invitations/:token`, `POST /auth/accept-invite`.
- **Content type**: `application/json`.
- **Success envelope**: `{ success: true, message: string, data: T }`.
- **Pagination envelope**: `{ success: true, data: T[], pagination: { page, limit, total, totalPages } }`.
- **Error envelope**: `{ success: false, message: string, errors?: [] }` with HTTP status 400/401/403/404/409/422/429/500.
- **Permission model**: role → permission-keys. `requirePermission('key')` or `requireAnyPermission(['a','b'])`. Super Admin role is seeded with every key.
- **Rate limits**: general API 1000 req / 15 min per IP; auth endpoints 15 req / 15 min per IP. 429 responses have `RateLimit-Reset` (seconds).

### Standard frontend fallbacks on error

| Error | What the dashboard should show | Should it retry? |
|---|---|---|
| 401 on any non-login endpoint | Clear the session, redirect to `/login`. | No. |
| 403 | Empty state with "You don't have permission to see this." Don't retry. | No. |
| 404 on a detail route | "Record not found" panel. Keep the user on the list page. | No. |
| 409 / 422 | Surface `message` as a toast. | User retries after fixing input. |
| 429 | Toast: "Too many requests, try again in X seconds." Hold off mutations until `RateLimit-Reset`. | After delay. |
| 5xx | Toast: "Service temporarily unavailable." React Query's 1 retry is enough. | Auto. |
| Network error (no response) | Inline banner: "Can't reach admin server." | Yes, with backoff. |

### When an endpoint is not yet implemented

Every planned-but-unbuilt endpoint is marked **🚧 Not yet built** below. Dashboard pages depending on those endpoints should:

1. Call the endpoint anyway (feature-flag in server config if needed).
2. On 404 / Network-error / 501, render the existing hardcoded mock data with a small muted badge ("demo data") so the page stays usable and design review still works.
3. Do NOT short-circuit at the query layer — keep React Query keys live so the page auto-promotes to real data as soon as the endpoint ships.

---

## 1. Auth — `/auth`

Issued by `padlok-api`. Token payload: `{ adminId, email, roleId, type:'access' }`. Refresh tokens rotate — every `/refresh` call invalidates the presented token.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | public, rate-limited | `{ email, password }` → `{ accessToken, refreshToken, admin }` |
| POST | `/auth/refresh` | public, rate-limited | `{ refreshToken }` → `{ accessToken, refreshToken }` |
| GET | `/auth/me` | required | `{ admin }` (full DTO incl. role + permissions) |
| POST | `/auth/logout` | required | `{ refreshToken? }` → revokes the presented refresh token |
| GET | `/auth/invitations/:token` | public | Preview invite (email, role, expiry) |
| POST | `/auth/accept-invite` | public | `{ token, name, password }` → full login payload |

**Admin DTO (`admin`)**:
```ts
{
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: 'active' | 'away' | 'inactive' | 'suspended';
  role: { id, name, description, isSystem };
  permissions: string[]; // permission keys
  lastLoginAt: string | null;
  createdAt: string;
}
```

> **Dashboard note**: [src/services/auth-service.ts](src/services/auth-service.ts) normalises this DTO into `{ token, user: AdminUser }` so existing pages keep working. Persist `refreshToken` in localStorage under `padlok-admin-refresh-token`.

---

## 2. Admins — `/admins`

Required permission: `manage_admins` on every route.

| Method | Path | Purpose | Key query/body |
|---|---|---|---|
| GET | `/admins` | Paginated list | `search`, `roleId`, `status`, `page`, `limit` |
| GET | `/admins/:id` | Single admin detail | — |
| PATCH | `/admins/:id` | Update admin | `name`, `status`, `roleId` |
| DELETE | `/admins/:id` | Soft-delete | — |
| POST | `/admins/invite` | Send email invite | `{ email, roleId }` |
| GET | `/admins/invitations` | List invitations | `status`, `page`, `limit` |
| POST | `/admins/invitations/:id/resend` | Resend invitation email | — |
| DELETE | `/admins/invitations/:id` | Revoke invitation | — |

---

## 3. Roles & Permissions — `/roles`, `/permissions`

| Method | Path | Perm | Purpose |
|---|---|---|---|
| GET | `/roles` | `manage_roles` | All roles |
| GET | `/roles/:id` | `manage_roles` | Single role + granted permission keys |
| POST | `/roles` | `manage_roles` | `{ name, description?, permissionKeys[] }` |
| PATCH | `/roles/:id` | `manage_roles` | Partial update (prevents renaming system roles) |
| DELETE | `/roles/:id` | `manage_roles` | Reject if `is_system` or in use |
| GET | `/permissions` | auth only | Catalog grouped by category (drives role-permissions matrix) |

**Permission categories seeded:**

- **Financial Analysis** — `view_revenue`, `view_forecasts`, `export_financials`, `manage_escrow`, `release_funds`, `process_refunds`
- **User Management** — `view_users`, `edit_users`, `suspend_users`, `verify_kyc`, `flag_users`
- **Transaction Management** — `view_transactions`, `create_orders`, `update_orders`, `delete_orders`, `view_analytics`
- **Dispute Management** — `view_disputes`, `resolve_disputes`, `review_evidence`, `apply_flags`
- **Communication** — `send_messages`, `view_messages`, `send_notifications`, `send_sms`, `send_email`
- **Administration** — `view_activity_log`, `manage_branches`, `create_branch`, `delete_branch`, `manage_admins`, `manage_roles`

---

## 4. Analytics — `/analytics`

Admin-scoped aggregates over the shared DB. Every endpoint accepts `currency=NGN|GHS|USD` (default `NGN`).

| Method | Path | Perm | Purpose |
|---|---|---|---|
| GET | `/analytics/platform-activity` | `view_analytics` | BI Overview live counts — disputes, completed txns, ongoing txns, active users. Dashboard polls every 5 s. |
| GET | `/analytics/financial-summary` | `view_analytics` | Donut chart: `total_revenue`, `in_escrow_balance`, `transaction_fees`. |
| GET | `/analytics/revenue-trend?months=6` | `view_analytics` | Array of `{ month, revenue, forecast }`. Forecast is a simple linear regression over the actuals. |
| GET | `/analytics/seasonal-demand?months=12` | `view_analytics` | Array of `{ month, short_label, value }` — monthly escrow-transaction count. |
| GET | `/analytics/financial-forecast` | `view_forecasts` \| `view_analytics` | `{ monthly_forecasted_revenue, seasonal_peak, projected_escrow_growth }`. |
| GET | `/analytics/transaction-insights` | `view_analytics` | `{ avg_transaction_value, failed_rate_pct, refund_rate_pct, transaction_volume, daily_transactions, daily_avg_value }`. |
| GET | `/analytics/payment-behavior` | `view_analytics` | `{ avg_topup_amount, topup_per_hour, promo_redemption_pct, topup_by_tier[] }`. |
| GET | `/analytics/wallet-balance-trend?days=7` | `view_analytics` | Per-day `{ date, day_label, avg_balance }`. |
| GET | `/analytics/revenue-efficiency` | `view_analytics` | `{ revenue_per_transaction, service_availability_pct, pricing_efficiency_pct }`. |

> **Data-freshness caveats**:
> - `wallet-balance-trend` derives EOD balance by taking the latest `wallet_transactions.balance_after` per wallet per day. Wallets with no activity that day are excluded. If you need absolute daily snapshots, add a `wallet_balance_snapshots` job.
> - `promo_redemption_pct` is hard-coded to `0` — no `promotions/redemptions` table exists yet in the shared DB. Build that on padlokbackend before trusting the number.
> - Quarterly "Seasonal Peak" uses the calendar year of `NOW()`; tune if you care about fiscal year.

---

## 5. Escrow — `/escrow`

Requires `view_transactions` OR `manage_escrow` except where noted.

| Method | Path | Perm | Purpose |
|---|---|---|---|
| GET | `/escrow` | `view_transactions`/`manage_escrow` | Cross-user list. Query: `status`, `buyerId`, `sellerId`, `from`, `to`, `page`, `limit`. |
| GET | `/escrow/:id` | ^ | Detail with latest dispute attached. |
| GET | `/escrow/stats` | ^ | `{ total_in_escrow, total_released, total_refunded, total_cancelled, escrow_count_by_status }`. |
| GET | `/escrow/disputes` | `view_disputes` | List with `{ status, page, limit }`. |
| GET | `/escrow/disputes/stats` | `view_disputes` | `{ open, under_review, resolved_this_month, avg_resolution_days }`. |
| GET | `/escrow/disputes/:id/timeline` | `view_disputes` | Chronological `{ at, kind, actor_name, detail }[]` — drives the evidence panel timeline. |
| POST | `/escrow/disputes/:id/resolve` | `resolve_disputes` | `{ resolution: 'refund'\|'release', admin_notes? }`. Atomically updates dispute, escrow, credits the wallet, and writes a ledger entry. |

---

## 6. Wallet — `/wallet` (read-only)

Requires `view_transactions` OR `view_revenue`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/wallet/stats?currency=NGN` | `{ total_balance, total_funding, total_withdrawals, total_wallets, active_wallets, funding_per_hour }`. |
| GET | `/wallet/transactions` | `type`, `status`, `userId`, `walletId`, `from`, `to`, `page`, `limit`. Joined with `wallets` + `users` so each row has `user_name`/`user_email`. |
| GET | `/wallet/transactions/:id` | Single ledger entry. |

> **Not exposed**: mutating wallet ops (credit/debit/lock). All fund movements flow through `/escrow/disputes/:id/resolve` or are recorded by padlokbackend's user flows.

---

## 7. Users — `/users`

Requires `view_users` on reads. `suspend_users` on status changes.

| Method | Path | Perm | Purpose |
|---|---|---|---|
| GET | `/users` | `view_users` | Filtered list. Query: `search`, `status` (`active`\|`suspended`\|`flagged`\|`banned`), `minFlags`, `page`, `limit`. Each row carries aggregates: wallet_balance, total_transactions, open_disputes, avg_rating, flag_count, risk_level. |
| GET | `/users/:id` | `view_users` | Single user with same aggregates. |
| GET | `/users/:id/activity` | `view_users`/`view_activity_log` | `audit_log` entries (limit up to 200). |
| GET | `/users/:id/transactions` | `view_users`/`view_transactions` | Paginated transaction history. |
| GET | `/users/:id/disputes` | `view_users`/`view_disputes` | Paginated disputes the user is party to. |
| PATCH | `/users/:id/status` | `suspend_users` | `{ status: 'active'\|'inactive' }` — soft suspend by flipping `is_active`. |

> `flag_count` and `risk_level` require the admin migration `008_create_user_flags` to have run. Before that, both fields return `0` / `'none'` and the service skips the flag subqueries.

---

## 8. Flags & Risk Alerts — `/flags`

Requires `flag_users` for mutations, `view_users` OR `flag_users` for reads.

| Method | Path | Purpose |
|---|---|---|
| GET | `/flags/stats` | `{ flagged_users, active_alerts, accounts_frozen, accounts_banned, by_severity }`. |
| GET | `/flags` | List flags. Query: `severity` (`critical`/`warning`/`info`), `userId`, `resolved`, `page`, `limit`. |
| POST | `/flags` | `{ userId, reason, severity?, category?, relatedDisputeId?, relatedTransactionId?, notes? }`. |
| GET | `/flags/:id` | Flag detail. |
| POST | `/flags/:id/resolve` | `{ resolutionNotes? }` — marks flag resolved. |
| GET | `/flags/alerts` | List risk alerts. Query: `severity`, `source`, `acknowledged`, `page`, `limit`. |
| POST | `/flags/alerts/:id/acknowledge` | Dismiss an alert from the active feed. |

**Required migration**: `008_create_user_flags.sql` (creates `user_flags`, `risk_alerts`, enum `user_flag_severity`). Run `npm run migrate` before deploying the Flags & Reports page.

> Risk alerts are expected to be *written* by background workers (dispute-heuristic scorers, fraud rules, future ML). Until those workers exist, the alerts list is empty and the page should fall back to hardcoded demo rows.

---

## 9. Notifications — `/notifications`

Requires `send_notifications` for sending, `send_notifications` OR `view_messages` for reads.

| Method | Path | Purpose |
|---|---|---|
| GET | `/notifications/stats` | `{ total_today, pending, failed, delivery_rate_pct, by_channel[] }`. |
| GET | `/notifications` | List. Query: `type`, `userId`, `unread_only`, `page`, `limit`. |
| POST | `/notifications/send` | `{ type, title, body, userId? \| userIds[]? \| broadcast:true, channels?, data? }`. |
| POST | `/notifications/:id/read` | Mark one notification read. |

> **Channel routing**: this endpoint writes rows to the shared `notifications` table (in-app inbox). Real push/SMS/email fan-out is not yet wired — the `channels` object is stored under `data.channels` so a worker can pick up the row. Dashboard copy should read "Sent to inbox" until delivery workers ship.

---

## Dashboard page → endpoint map

| Page | Calls | Falls back to mock when |
|---|---|---|
| `dashboard.tsx` | `GET /analytics/platform-activity` (poll 5 s), `GET /analytics/financial-summary` | 404/5xx/network |
| `wallet-escrow.tsx` | `GET /wallet/transactions?page=1&limit=50`, `GET /escrow/stats`, `GET /wallet/stats` | 404/5xx/network |
| `disputes.tsx` | `GET /escrow/disputes/stats`, `GET /escrow/disputes?page&limit&status` | 404/5xx/network |
| `evidence-panel.tsx` | `GET /escrow/:id`, `GET /escrow/disputes/:id/timeline`, `POST /escrow/disputes/:id/resolve`, `POST /flags`, `POST /notifications/send`, `PATCH /users/:id/status` | 404/5xx — resolution button disabled |
| `flags-reports.tsx` | `GET /flags/stats`, `GET /flags?resolved=false&page&limit`, `GET /flags/alerts?acknowledged=false&limit=3` | migration 008 not run → returns empty; show demo |
| `flagged-user-details.tsx` | `GET /users/:id`, `GET /flags?userId=:id`, `GET /users/:id/disputes`, `GET /users/:id/activity`, `POST /flags/:id/resolve`, `PATCH /users/:id/status` | same as above |
| `financial-forecast.tsx` | `GET /analytics/financial-forecast`, `GET /analytics/seasonal-demand?months=12` | 404/5xx |
| `integration-insights.tsx` | `GET /analytics/transaction-insights`, `GET /analytics/revenue-trend?months=6` | 404/5xx |
| `payment-behavior.tsx` | `GET /analytics/payment-behavior`, `GET /analytics/wallet-balance-trend?days=7` | 404/5xx |
| `revenue-analytics.tsx` | `GET /analytics/revenue-efficiency`, `GET /analytics/revenue-trend?months=6` | 404/5xx |
| `notifications.tsx` | `GET /notifications/stats`, `GET /notifications?page=1&limit=5`, `POST /notifications/send` | 404/5xx |
| `role-permissions.tsx` | `GET /roles`, `GET /permissions`, `PATCH /roles/:id` | 403 → read-only matrix |
| `admin-management.tsx` | `GET /admins`, `GET /roles`, `GET /admins/invitations?status=pending`, `POST /admins/invite`, etc. | — |

---

## Still to build (recommended, not yet in admin-api)

- **Promotions & redemptions surface** (padlokbackend) — unlocks `promo_redemption_pct` in payment-behavior.
- **Wallet balance snapshots job** — gives exact EOD balances for the payment-behavior chart instead of the derive-from-activity approach.
- **Risk heuristic worker** — populates `risk_alerts`. Suggested triggers: >3 disputes in 30 days, wallet withdraw > X × avg, KYC mismatch.
- **Notification delivery worker** — consumes `notifications.data.channels` and fans out to push/SMS/email providers. Writes `data.delivery_status = 'delivered'|'failed'` so `/notifications/stats` becomes accurate.
- **Audit action dictionary** — the `audit_log.action` values vary; expose a `/users/:id/activity-summary` that groups by action + shows last timestamps once product defines the important ones.
- **Rate-limit reset exposure** — client handles 429 today by reading `RateLimit-Reset` from headers; if we keep stacking limiters, consider surfacing both windows in the response body.

---

## Operational notes

- **Run order**: migrate padlok-api (`npm run migrate && npm run migrate:seed`), then padlokbackend. Admin dashboard assumes both have migrated.
- **Seed admin**: `admin@padlok.com` / `SEED_SUPER_ADMIN_PASSWORD` (default `ChangeMe123!`). Change this before production.
- **CORS**: admin-api allows origin `http://localhost:5173` by default (`CORS_ORIGIN` env). Set it to the production dashboard origin before deploying.
- **Shared DB**: admin-api does **not** write to client tables (`users`, `wallets`, `transactions`, …) except through dispute resolution. It writes only to its own tables listed above.
- **Rate limits**: general 1000/15m per IP, auth 15/15m per IP — both in Redis with per-limiter prefixes (`rl:general:`, `rl:auth:`). To clear during local dev: `redis-cli --scan --pattern 'rl:*' | xargs redis-cli del`.
