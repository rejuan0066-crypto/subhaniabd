import { useLanguage } from '@/contexts/LanguageContext';
import { useGradingSystem, GradeScale } from '@/hooks/useGradingSystem';

const colorBg: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  destructive: 'bg-destructive',
};

const GradingChart = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const { scales, passMark, maxMarks } = useGradingSystem();

  return (
    <div className="card-elevated rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-semibold text-foreground text-sm">
          {bn ? 'গ্রেডিং স্কেল' : 'Grading Scale'}
        </h4>
        <span className="text-xs text-muted-foreground">
          {bn ? `পাশ মার্ক: ${passMark} | সর্বোচ্চ: ${maxMarks}` : `Pass: ${passMark} | Max: ${maxMarks}`}
        </span>
      </div>
      <div className="flex gap-1.5 items-end h-16">
        {scales.map((s: GradeScale) => {
          const width = ((s.max - s.min + 1) / (maxMarks + 1)) * 100;
          return (
            <div key={s.grade} className="flex flex-col items-center gap-0.5" style={{ width: `${width}%` }}>
              <span className="text-[10px] font-bold text-foreground">{s.grade}</span>
              <div
                className={`w-full rounded-sm ${colorBg[s.color] || 'bg-muted'} opacity-80`}
                style={{ height: `${Math.max(12, parseFloat(s.gpa) * 12)}px` }}
              />
              <span className="text-[9px] text-muted-foreground">{s.min}-{s.max}</span>
              <span className="text-[9px] font-medium text-primary">{s.gpa}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GradingChart;
