CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));