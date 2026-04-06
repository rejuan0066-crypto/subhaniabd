import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GradeScale {
  grade: string;
  min: number;
  max: number;
  gpa: string;
  color: string;
}

const DEFAULT_SCALES: GradeScale[] = [
  { grade: 'A+', min: 80, max: 100, gpa: '5.00', color: 'emerald' },
  { grade: 'A', min: 70, max: 79, gpa: '4.00', color: 'emerald' },
  { grade: 'A-', min: 60, max: 69, gpa: '3.50', color: 'sky' },
  { grade: 'B', min: 50, max: 59, gpa: '3.00', color: 'sky' },
  { grade: 'C', min: 40, max: 49, gpa: '2.00', color: 'amber' },
  { grade: 'D', min: 33, max: 39, gpa: '1.00', color: 'orange' },
  { grade: 'F', min: 0, max: 32, gpa: '0.00', color: 'destructive' },
];

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  sky: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  orange: 'text-orange-600 dark:text-orange-400 bg-orange-500/10',
  destructive: 'text-destructive bg-destructive/10',
};

export const useGradingSystem = () => {
  const { data: scales = DEFAULT_SCALES } = useQuery({
    queryKey: ['grading-scales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('config, sort_order')
        .eq('module', 'result')
        .eq('field_name', 'grading_scale')
        .eq('is_active', true)
        .order('sort_order');
      if (error || !data?.length) return DEFAULT_SCALES;
      return data.map((r: any) => {
        const c = typeof r.config === 'object' ? r.config : {};
        return { grade: c.grade, min: c.min, max: c.max, gpa: c.gpa, color: c.color } as GradeScale;
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: marksConfig } = useQuery({
    queryKey: ['marks-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('config')
        .eq('module', 'result')
        .eq('field_name', 'marks')
        .eq('is_active', true)
        .maybeSingle();
      if (error || !data) return { min: 0, max: 100 };
      const c = typeof data.config === 'object' ? data.config : {};
      return { min: (c as any).min ?? 0, max: (c as any).max ?? 100 };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: passMarkConfig } = useQuery({
    queryKey: ['pass-mark-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('config')
        .eq('module', 'result')
        .eq('field_name', 'pass_mark')
        .eq('is_active', true)
        .maybeSingle();
      if (error || !data) return 33;
      const c = typeof data.config === 'object' ? data.config : {};
      return (c as any).min ?? 33;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getGrade = (avg: number) => {
    for (const s of scales) {
      if (avg >= s.min && avg <= s.max) {
        return { grade: s.grade, gpa: s.gpa, color: colorMap[s.color] || colorMap.destructive };
      }
    }
    const last = scales[scales.length - 1] || DEFAULT_SCALES[DEFAULT_SCALES.length - 1];
    return { grade: last.grade, gpa: last.gpa, color: colorMap[last.color] || colorMap.destructive };
  };

  return {
    scales,
    getGrade,
    maxMarks: marksConfig?.max ?? 100,
    minMarks: marksConfig?.min ?? 0,
    passMark: passMarkConfig ?? 33,
  };
};
