-- Fix 1: Enable RLS on newsletter_subscribers (was never enabled)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Fix 2: Trigger to validate order_items prices from products table
CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  real_price numeric;
BEGIN
  SELECT price INTO real_price FROM public.products WHERE id = NEW.product_id;
  IF real_price IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', NEW.product_id;
  END IF;
  -- Override client-supplied price with the real price
  NEW.price := real_price;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_order_item_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_item_price();

-- Fix 3: Trigger to recompute order total and lock payment_status on insert
CREATE OR REPLACE FUNCTION public.validate_order_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Force payment_status to 'unpaid' on creation (admin updates it later)
  NEW.payment_status := 'unpaid';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_order_on_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_on_insert();

-- Fix 4: Trigger to recompute orders.total after order_items are inserted
CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_total numeric;
BEGIN
  SELECT COALESCE(SUM(price * quantity), 0) INTO computed_total
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  UPDATE public.orders SET total = computed_total WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recompute_order_total
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recompute_order_total();