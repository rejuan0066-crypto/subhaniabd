import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, Save, Loader2, Eye, FileDown, FileSpreadsheet } from 'lucide-react';
import { useGradingSystem } from '@/hooks/useGradingSystem';
import { exportResultCSV, exportResultPDF } from '@/lib/resultExport';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Legacy export for backward compat
const getGrade = (avg: number) => {
  if (avg >= 80) return { grade: 'A+', gpa: '5.00', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' };
  if (avg >= 70) return { grade: 'A', gpa: '4.00', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' };
  if (avg >= 60) return { grade: 'A-', gpa: '3.50', color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' };
  if (avg >= 50) return { grade: 'B', gpa: '3.00', color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' };
  if (avg >= 40) return { grade: 'C', gpa: '2.00', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' };
  if (avg >= 33) return { grade: 'D', gpa: '1.00', color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10' };
  return { grade: 'F', gpa: '0.00', color: 'text-destructive bg-destructive/10' };
};

interface ClassResultTableProps {
  students: any[];
  subjects: any[];
  marksMap: Record<string, number>;
  onMarksChange: (key: string, value: number) => void;
  onSave: () => void;
  isSaving: boolean;
  title: string;
  onViewMarksheet: (studentId: string) => void;
}

const ClassResultTable = ({ students, subjects, marksMap, onMarksChange, onSave, isSaving, title, onViewMarksheet }: ClassResultTableProps) => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const { getOverallGrade, maxMarks, minMarks, passMark } = useGradingSystem();

  const { data: institution } = useQuery({
    queryKey: ['institution-default'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('name, name_en').eq('is_default', true).maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleExport = (type: 'csv' | 'pdf') => {
    const params = { title, students, subjects, marksMap, getOverallGrade, bn, institutionName: bn ? institution?.name : (institution?.name_en || institution?.name) };
    type === 'csv' ? exportResultCSV(params) : exportResultPDF(params);
  };

  if (students.length === 0 || subjects.length === 0) {
    return (
      <div className="card-elevated rounded-xl p-12 text-center">
        <p className="text-muted-foreground">{bn ? 'এই ক্লাসে কোনো ছাত্র বা বিষয় নেই।' : 'No students or subjects in this class.'}</p>
      </div>
    );
  }

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
        <h3 className="font-display font-bold text-foreground text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-1.5">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-1.5">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="w-4 h-4" /> {bn ? 'প্রিন্ট' : 'Print'}
          </Button>
          <Button size="sm" className="btn-primary-gradient gap-1.5" onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {bn ? 'সংরক্ষণ' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground w-10">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{bn ? 'রোল' : 'Roll'}</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground min-w-[120px]">{bn ? 'নাম' : 'Name'}</th>
              {subjects.map((s: any) => (
                <th key={s.id} className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground min-w-[70px]">
                  {bn ? s.name_bn : s.name}
                </th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">{bn ? 'মোট' : 'Total'}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">{bn ? 'গড়' : 'Avg'}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">{bn ? 'গ্রেড' : 'Grade'}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">GPA</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground min-w-[80px]">{bn ? 'মর্যাদা' : 'Title'}</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((st: any, idx: number) => {
              const studentMarks = subjects.map((sub: any) => marksMap[`${st.id}_${sub.id}`] ?? 0);
              const total = studentMarks.reduce((a, b) => a + b, 0);
              const avg = subjects.length > 0 ? total / subjects.length : 0;
              const { grade, gpa, color, hasFail, title, title_bn } = getOverallGrade(studentMarks);
              return (
                <tr key={st.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-foreground">{st.roll_number || '-'}</td>
                  <td className="px-3 py-2 text-foreground">{bn ? st.name_bn : (st.name_en || st.name_bn)}</td>
                  {subjects.map((sub: any) => {
                    const mark = marksMap[`${st.id}_${sub.id}`] ?? 0;
                    const isFail = mark < passMark && mark > 0;
                    return (
                      <td key={sub.id} className="px-1 py-1.5 text-center">
                        <Input
                          className={`w-16 h-8 text-center bg-background text-sm mx-auto focus:border-primary ${isFail ? 'border-destructive text-destructive' : 'border-border/50'}`}
                          type="number" min={minMarks} max={maxMarks}
                          value={mark === 0 ? '' : mark}
                          onChange={(e) => onMarksChange(`${st.id}_${sub.id}`, parseInt(e.target.value) || 0)}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-bold text-foreground">{total}</td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{avg.toFixed(1)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
                      {grade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-primary">{gpa}</td>
                  <td className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">{bn ? title_bn : title}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onViewMarksheet(st.id)}
                      className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title={bn ? 'মার্কশিট দেখুন' : 'View Marksheet'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { getGrade };
export default ClassResultTable;
