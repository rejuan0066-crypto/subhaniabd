import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Award } from 'lucide-react';
import { getGrade } from './ClassResultTable';

interface IndividualMarksheetProps {
  student: any;
  subjects: any[];
  marksMap: Record<string, number>;
  examTitle: string;
  onBack: () => void;
}

const IndividualMarksheet = ({ student, subjects, marksMap, examTitle, onBack }: IndividualMarksheetProps) => {
  const { language } = useLanguage();
  const bn = language === 'bn';

  const subjectResults = subjects.map((sub: any) => {
    const marks = marksMap[`${student.id}_${sub.id}`] ?? 0;
    const { grade, gpa, color } = getGrade(marks);
    return { subject: sub, marks, grade, gpa, color };
  });

  const totalMarks = subjectResults.reduce((sum, r) => sum + r.marks, 0);
  const avgMarks = subjects.length > 0 ? totalMarks / subjects.length : 0;
  const overall = getGrade(avgMarks);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        {bn ? 'ফিরে যান' : 'Back to List'}
      </Button>

      <div className="card-elevated rounded-xl overflow-hidden max-w-2xl mx-auto">
        {/* Marksheet Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 p-6 text-center border-b border-border">
          <Award className="w-10 h-10 mx-auto text-primary mb-2" />
          <h2 className="text-xl font-display font-bold text-foreground">{bn ? 'মার্কশিট' : 'Marksheet'}</h2>
          <p className="text-sm text-muted-foreground mt-1">{examTitle}</p>
        </div>

        {/* Student Info */}
        <div className="p-5 bg-muted/20 border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{bn ? 'নাম' : 'Name'}:</span>
              <p className="font-semibold text-foreground">{bn ? student.name_bn : (student.name_en || student.name_bn)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{bn ? 'রোল নম্বর' : 'Roll Number'}:</span>
              <p className="font-semibold text-foreground">{student.roll_number || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{bn ? 'রেজিস্ট্রেশন' : 'Registration'}:</span>
              <p className="font-semibold text-foreground">{student.registration_number || student.student_id || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{bn ? 'পিতার নাম' : "Father's Name"}:</span>
              <p className="font-semibold text-foreground">{student.father_name_bn || student.father_name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Subject-wise Results */}
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2.5 text-xs font-semibold text-muted-foreground">#</th>
                <th className="text-left py-2.5 text-xs font-semibold text-muted-foreground">{bn ? 'বিষয়' : 'Subject'}</th>
                <th className="text-center py-2.5 text-xs font-semibold text-muted-foreground">{bn ? 'পূর্ণমান' : 'Full Marks'}</th>
                <th className="text-center py-2.5 text-xs font-semibold text-muted-foreground">{bn ? 'প্রাপ্ত নম্বর' : 'Obtained'}</th>
                <th className="text-center py-2.5 text-xs font-semibold text-muted-foreground">{bn ? 'গ্রেড' : 'Grade'}</th>
                <th className="text-center py-2.5 text-xs font-semibold text-muted-foreground">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {subjectResults.map((r, idx) => (
                <tr key={r.subject.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                  <td className="py-2.5 font-medium text-foreground">{bn ? r.subject.name_bn : r.subject.name}</td>
                  <td className="py-2.5 text-center text-muted-foreground">100</td>
                  <td className="py-2.5 text-center font-semibold text-foreground">{r.marks}</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.color}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-medium text-primary">{r.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-5 border-t border-border bg-muted/20">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{bn ? 'মোট নম্বর' : 'Total Marks'}</p>
              <p className="text-xl font-bold text-foreground">{totalMarks}</p>
              <p className="text-xs text-muted-foreground">/ {subjects.length * 100}</p>
            </div>
            <div className="rounded-lg bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{bn ? 'গড়' : 'Average'}</p>
              <p className="text-xl font-bold text-foreground">{avgMarks.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{bn ? 'গ্রেড' : 'Grade'}</p>
              <p className={`text-xl font-bold ${overall.color.split(' ')[0]}`}>{overall.grade}</p>
            </div>
            <div className="rounded-lg bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">GPA</p>
              <p className="text-xl font-bold text-primary">{overall.gpa}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-4 h-4" /> {bn ? 'প্রিন্ট মার্কশিট' : 'Print Marksheet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualMarksheet;
