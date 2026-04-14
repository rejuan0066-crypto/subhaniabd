
-- 1. Inventory Items
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_stock_level NUMERIC NOT NULL DEFAULT 0,
  buying_price NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Inventory Logs
CREATE TABLE public.inventory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  change_amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'in',
  reason TEXT,
  expense_id UUID,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory logs" ON public.inventory_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fixed Assets
CREATE TABLE public.fixed_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_name_bn TEXT NOT NULL,
  asset_name_en TEXT,
  category TEXT NOT NULL DEFAULT 'furniture',
  location TEXT,
  location_bn TEXT,
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'good',
  condition_notes TEXT,
  quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view assets" ON public.fixed_assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage assets" ON public.fixed_assets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Audit triggers
CREATE TRIGGER audit_inventory_items
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_fixed_assets
  AFTER INSERT OR UPDATE OR DELETE ON public.fixed_assets
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- 5. Indexes
CREATE INDEX idx_inventory_items_active ON public.inventory_items(is_active);
CREATE INDEX idx_inventory_logs_item ON public.inventory_logs(item_id);
CREATE INDEX idx_fixed_assets_status ON public.fixed_assets(status);
