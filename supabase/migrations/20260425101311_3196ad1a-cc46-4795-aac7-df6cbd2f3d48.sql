-- Update handle_new_user trigger to include the 3 new admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF LOWER(NEW.email) IN (
    'rufus090420@gmail.com',
    'dynamicuniversal08@gmail.com',
    'dynamicunuversal08@gmail.com',
    'marketingdynamic81@gmail.com',
    'dynamicmarketing538@gmail.com',
    'rufus090400@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- One-time promotion for the two emails already signed up
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE LOWER(u.email) IN (
  'marketingdynamic81@gmail.com',
  'dynamicmarketing538@gmail.com',
  'rufus090400@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;