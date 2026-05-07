ALTER TABLE public.products ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.products
)
UPDATE public.products p SET position = r.rn FROM ranked r WHERE p.id = r.id;

CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);