## Restore Admin CRUD + Full Order Visibility

### Root Cause (confirmed)

Admin gating in the **UI** uses an email allow-list (`isAdminEmail`), but the **database** RLS policies use `has_role(auth.uid(), 'admin')` against the `user_roles` table.

I checked the database — both predefined admin users currently have `role = 'user'`, NOT `'admin'`:

```
rufus090420@gmail.com         → user
dynamicunuversal08@gmail.com  → user
```

That's why:

- **Edit Save fails silently** → `UPDATE products` is blocked by RLS, returns 0 rows changed (no error toast because Supabase returns success with empty result for blocked updates).
- **Create / Delete don't reflect** → same RLS block on `INSERT` / `DELETE`.
- **Orders not visible in admin** → `Users view own orders` policy only shows the admin's own orders; the `Admins can manage orders` policy never matches because the user has no admin role.
- **Order status changes don't persist** → blocked by RLS on `orders.UPDATE`.

The UI lets you click everything because the email check passes, but every write/read of other users' data is silently blocked by Postgres RLS.

### The Fix

Two parts, both small:

**1. Database — promote the admin emails to the `admin` role**

Insert/upsert `admin` rows in `public.user_roles` for the two existing admin users. Also add a one-time helper so newly-signed-up admin emails are auto-promoted by the existing `handle_new_user` trigger.

```sql
-- Promote existing admin users
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE LOWER(u.email) IN (
  'rufus090420@gmail.com',
  'dynamicuniversal08@gmail.com',
  'dynamicmarketing538@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user trigger to auto-grant admin role on signup
-- if email is in the predefined admin list
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name',''),
          COALESCE(NEW.raw_user_meta_data->>'avatar_url',''));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  IF LOWER(NEW.email) IN (
    'rufus090420@gmail.com',
    'dynamicuniversal08@gmail.com',
    'dynamicunuversal08@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;
```

**2. Frontend — refetch after every mutation (already mostly there, one gap)**

`AdminProducts` already invalidates `["admin-products"]` after save/delete — good. `AdminOrders` invalidates `["admin-orders"]` and `["admin-stats"]` — good. No code changes needed there once RLS allows the writes through.

One small UX hardening: surface RLS-style silent failures by checking the affected row count in `AdminProducts` save mutation, so if RLS ever blocks again the admin sees a clear error instead of a fake "Updated" toast.

### Files touched

- **Migration** (new): grant admin role + update `handle_new_user`
- `src/pages/admin/AdminProducts.tsx`: tiny tweak to detect "0 rows updated" and throw, so silent RLS failures show an error toast

### What you'll see after

- Edit a product → Save → toast "Product updated" → row updates immediately in the table
- Create / Delete works the same
- Admin Orders page lists **all** customer orders (not just yours)
- Status changes persist; stock auto-adjusts
- New orders placed by any customer appear instantly on next refetch (already invalidated on relevant actions)

### Out of scope

- No auth flow changes
- No new tables or RLS policy rewrites — existing policies are correct, they just need the role row to exist
- No realtime subscriptions (refetch on mutation success is sufficient and matches existing pattern)