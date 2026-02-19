# Deep Security & QA Audit Report (Red Team Edition)
**Target:** Calendario FPT Application
**Date:** 2026-02-19
**Auditor:** Morochief (AI Agent - Red Team)
**Scope:** Full Source Code Analysis (`src/**/*`)

## 1. Executive Summary
After a comprehensive, file-by-file analysis of the `src` directory, the security posture is **mixed**.
*   **Strengths:** The application relies heavily on Supabase for almost all backend logic, which reduces the attack surface of custom API endpoints (User Input -> API -> DB).
*   **Critical Weakness:** The application relies entirely on Client-Side Security for Authorization. The Database (Supabase) is configured to trust **any** authenticated user to perform Admin actions (Insert/Update/Delete). **This is a potentially catastrophic vulnerability.**

## 2. Detailed Findings

### [AUTH-01] Universal Write Access (RLS)
**Severity:** **CRITICAL**
**Location:** Database Policies (defined in `optimize_rls.sql`)
**Analysis:**
The RLS policies grant `ALL` privileges to the `authenticated` role.
```sql
CREATE POLICY "Admin write events" ON public.eventos FOR ALL USING ( (select auth.role()) = 'authenticated' );
```
**Impact:** Any user who logs in (even if they are just a "shooter" registering for an event) has full database write access. They can delete all events, change regulations, or modify other users' inscriptions via the browser console.
**Remediation:** Implement a secure function `is_admin()` in PostgreSQL and enforce it in RLS policies.

### [AUTH-02] Middleware Authorization Gap
**Severity:** **HIGH**
**Location:** `src/middleware.ts`
**Analysis:**
The middleware checks if a session exists (`supabase.auth.getUser()`) but does NOT check if the user is an admin.
```typescript
if (!user) return NextResponse.redirect(...) // Only checks authentication
```
**Impact:** If a new route `/admin/secret-dashboard` is added, any logged-in user can access it unless the page *also* implements a client-side check.
**Remediation:** Move the `ALLOWED_ADMINS` check into the middleware logic.

### [SEC-03] Missing Security Headers
**Severity:** **LOW**
**Location:** `next.config.ts`
**Analysis:**
The application does not implement standard security headers.
*   Missing `Content-Security-Policy` (CSP)
*   Missing `X-Content-Type-Options`
*   Missing `Referrer-Policy`
*   Missing `Strict-Transport-Security` (HSTS)
**Impact:** Increased susceptibility to Clickjacking and subtle XSS attacks if future vulnerabilities are introduced.
**Remediation:** Add `headers()` configuration to `next.config.ts`.

### [QA-01] Client-Side Admin Checks
**Severity:** **PASS** (Positive Finding)
**Location:** `src/app/admin/**/page.tsx`
**Analysis:**
I verified that all Admin Pages (`modalidades`, `eventos`, `clubes`, etc.) consistently import and use `isAllowedAdmin(user.email)`.
*   `src/app/admin/page.tsx`: **Verified**
*   `src/app/admin/modalidades/page.tsx`: **Verified**
*   `src/app/admin/reglamentos/page.tsx`: **Verified**
*   ...and others.
This redundant check prevents "casual" unauthorized access via the UI, but does not stop API/DB attacks (see AUTH-01).

### [QA-02] API Surface Area
**Severity:** **PASS** (Positive Finding)
**Analysis:**
A scan for `src/app/api` and `"use server"` returned **0 results**.
The application does not use Next.js API Routes or Server Actions. It communicates directly with Supabase from the client. This drastically reduces the unexpected attack surface, narrowing the focus entirely to Supabase RLS (AUTH-01).

### [QA-03] Sensitive Data Exposure
**Severity:** **PASS** (Positive Finding)
**Analysis:**
A grep scan for `SECRET`, `KEY`, `TOKEN`, `PASSWORD` in `src/` yielded no hardcoded secrets. All sensitive keys are correctly loaded from environment variables (`process.env.NEXT_PUBLIC_...`).

## 3. Recommendation Plan

1.  **IMMEDIATE (Priority 0):** Run the SQL migration to fix RLS policies. This stops potential data loss.
2.  **High Priority:** Update `middleware.ts` to block unauthorized access at the network edge.
3.  **Low Priority:** Add security headers to `next.config.ts` and `aria-label` to buttons.

## 4. Conclusion
The "Red Team" audit confirms that while the code quality is high (clean, consistent, modern), the **Database Security Model is fundamentally broken** due to misconfigured RLS policies. Fixing [AUTH-01] is mandatory before any public release.
