

## Unified Auth Flow — Single Screen

Replace the separate Login/Register pages with one frictionless "Continue" screen. Google OAuth on top, email/password below that auto-routes between sign-in and sign-up.

### What changes for the user

- One page at `/login` (and `/register` redirects there) with:
  - **Continue with Google** button (top)
  - "or" divider
  - **Name**, **Email**, **Password** fields
  - **Continue** button
- Click Continue → if account exists, signs in; if not, creates it and signs in immediately. No OTP, no email verification, no second screen.
- Header "Sign In" / "Sign Up" links both point to the same screen.

### Supabase config (user action required)

For instant access without email verification, **"Confirm email" must be turned OFF** in Supabase Auth settings. I'll surface a link after implementation. Google OAuth must also be enabled with a Client ID/Secret in the Supabase dashboard — I'll provide the exact redirect URL to paste into Google Cloud Console.

### Technical implementation

**New file: `src/pages/Auth.tsx`**
- Single component replacing Login + Register UI.
- State: `name`, `email`, `password`, `loading`.
- `handleGoogle()`: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
- `handleContinue()`:
  1. Try `supabase.auth.signInWithPassword({ email, password })`.
  2. If error message indicates invalid credentials / user not found → call `supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: window.location.origin } })`.
  3. If signup returns a session → navigate home. If signup succeeds but no session (email confirm still on) → show a clear error telling the user to disable email confirmation in Supabase.
  4. Any other sign-in error (wrong password for existing account) → show "Incorrect password for this email."
- Name field is only required when the flow falls through to signup; if empty at signup time, show "Please enter your name."
- Loading spinner on the Continue button; toast for errors.

**Routing — `src/App.tsx`**
- Route `/login` → `Auth`.
- Route `/register` → redirect to `/login` (so existing links keep working).
- Remove `ForgotPassword` / `ResetPassword` from nav? **Keep them** as-is (still reachable via direct URL) — out of scope for this task.

**Header — `src/components/layout/Header.tsx`**
- Collapse "Sign In" + "Sign Up" entries into a single "Sign In" link pointing to `/login`. (Both currently route separately; unify them.)

**Files removed from active use** (kept on disk, just unrouted):
- `src/pages/Login.tsx`, `src/pages/Register.tsx` — no longer mounted. Safe to delete later; leaving them avoids touching unrelated imports.

**AuthContext** — no changes. Existing `onAuthStateChange` listener already persists session and handles OAuth redirect callbacks automatically.

**Profile auto-creation** — already handled by the existing `handle_new_user` trigger, which inserts into `profiles` and `user_roles` on signup. Google OAuth users get a profile too (full_name pulled from `raw_user_meta_data`). No DB changes needed.

### Edge cases handled

- Existing user, correct password → signs in.
- Existing user, wrong password → "Incorrect password for this email."
- New email → auto signs up + signs in.
- Email confirmation still enabled in Supabase → signup returns no session; show actionable error pointing to the setting.
- Google OAuth → full redirect flow; AuthContext picks up the session on return.

### Post-implementation steps for you

1. **Supabase Dashboard → Authentication → Providers → Email**: turn **"Confirm email" OFF**.
2. **Authentication → Providers → Google**: enable, paste Client ID + Secret from Google Cloud Console (I'll share the redirect URL to authorize).

