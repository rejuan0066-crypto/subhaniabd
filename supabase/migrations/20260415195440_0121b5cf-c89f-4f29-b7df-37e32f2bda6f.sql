CREATE OR REPLACE FUNCTION public.increment_inventory_stock(p_item_id UUID, p_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.inventory_items
  SET current_stock = current_stock + p_amount,
      updated_at = now()
  WHERE id = p_item_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found or inactive: %', p_item_id;
  END IF;
END;
$$;