import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Printer, ArrowLeft } from 'lucide-react';
import { getGrade } from './ClassResultTable';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  const { data: institution } = useQuery({
    queryKey: ['institution-default'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('*').eq('is_default', true).maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const subjectResults = subjects.map((sub: any) => {
    const marks = marksMap[`${student.id}_${sub.id}`] ?? 0;
    const { grade, gpa, color } = getGrade(marks);
    return { subject: sub, marks, grade, gpa, color };
  });

  const totalMarks = subjectResults.reduce((sum, r) => sum + r.marks, 0);
  const avgMarks = subjects.length > 0 ? totalMarks / subjects.length : 0;
  const overall = getGrade(avgMarks);

  const instName = bn ? institution?.name : (institution?.name_en || institution?.name);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        {bn ? 'ফিরে যান' : 'Back to List'}
      </Button>

      <div className="card-elevated rounded-xl overflow-hidden max-w-2xl mx-auto relative">
        {/* Logo Watermark */}
        {institution?.logo_url && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <img
              src={institution.logo_url}
              alt=""
              className="w-64 h-64 object-contain opacity-[0.04] dark:opacity-[0.06]"
            />
          </div>
        )}

        {/* Institution Header */}
        <div className="relative z-10 border-b border-border bg-background px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-4">
            {institution?.logo_url && (
              <img src={institution.logo_url} alt="" className="w-14 h-14 object-contain rounded" />
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground">{instName || ''}</h2>
              {institution?.address && (
                <p className="text-xs text-muted-foreground">{institution.address}</p>
              )}
              {institution?.phone && (
                <p className="text-xs text-muted-foreground">{bn ? 'ফোন' : 'Phone'}: {institution.phone}</p>
              )}
            </div>
            {institution?.logo_url && (
              <img src={institution.logo_url} alt="" className="w-14 h-14 object-contain rounded opacity-0" />
            )}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <h3 className="text-base font-display font-bold text-primary">{bn ? 'মার্কশিট' : 'Marksheet'}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{examTitle}</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="relative z-10 p-5 bg-muted/20 border-b border-border">
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
        <div className="relative z-10 p-5">
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
        <div className="relative z-10 p-5 border-t border-border bg-muted/20">
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
        </div>

        {/* Signature Section */}
        <div className="relative z-10 p-6 border-t border-border">
          <div className="grid grid-cols-3 gap-6 mt-8 pt-4">
            {[
              { label: bn ? 'পরীক্ষা নিয়ন্ত্রক' : 'Exam Controller', key: 'examController' },
              { label: bn ? 'শিক্ষা সচিব' : 'Education Secretary', key: 'eduSecretary' },
              { label: bn ? 'মুহতামিম' : 'Principal', key: 'principal' },
            ].map(sig => (
              <div key={sig.key} className="text-center space-y-2">
                <div className="border-b border-dashed border-muted-foreground/40 mx-4 pb-1 min-h-[40px]" />
                <p className="text-xs font-semibold text-foreground">{sig.label}</p>
                <Input
                  className="text-center text-xs h-7 border-dashed"
                  placeholder={bn ? 'নাম লিখুন' : 'Enter name'}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
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
