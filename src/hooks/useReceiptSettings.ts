import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReceiptSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['receipt_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const defaultSetting = settings?.find((s: any) => s.is_default) || settings?.[0];

  const saveMutation = useMutation({
    mutationFn: async (config: { id?: string; name: string; name_bn: string; paper_size: string; design_config: any; is_default: boolean }) => {
      if (config.id) {
        const { error } = await supabase
          .from('receipt_settings')
          .update({
            name: config.name,
            name_bn: config.name_bn,
            paper_size: config.paper_size,
            design_config: config.design_config,
            is_default: config.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('receipt_settings')
          .insert({
            name: config.name,
            name_bn: config.name_bn,
            paper_size: config.paper_size,
            design_config: config.design_config,
            is_default: config.is_default,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt_settings'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('receipt_settings')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt_settings'] });
    },
  });

  return { settings, defaultSetting, isLoading, saveMutation, deleteMutation };
}
