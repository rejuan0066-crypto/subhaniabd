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
  const [sigNames, setSigNames] = useState({ examController: '', eduSecretary: '', principal: '' });

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
  const studentName = bn ? student.name_bn : (student.name_en || student.name_bn);

  const handlePrint = () => {
    const subjectRows = subjectResults.map((r, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:12px;">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:12px;">${bn ? r.subject.name_bn : r.subject.name}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:12px;">100</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:12px;font-weight:600;">${r.marks}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:12px;font-weight:600;">${r.grade}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:12px;font-weight:600;">${r.gpa}</td>
      </tr>
    `).join('');

    const photoHtml = student.photo_url
      ? `<img src="${student.photo_url}" style="width:80px;height:96px;object-fit:cover;border:1px solid #ccc;border-radius:4px;" crossorigin="anonymous" />`
      : '';

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${examTitle} - ${studentName}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Bengali',sans-serif; padding:15mm; max-width:700px; margin:0 auto; }
  @media print { body { padding:10mm; } }
  .header { text-align:center; margin-bottom:16px; border-bottom:2px solid #333; padding-bottom:12px; }
  .header-logo { width:50px; height:50px; object-fit:contain; margin:0 auto 6px; display:block; }
  .header h1 { font-size:18px; margin-bottom:2px; }
  .header .sub { font-size:11px; color:#555; }
  .header h2 { font-size:15px; color:#333; margin-top:8px; }
  .student-info { display:flex; gap:16px; margin:16px 0; padding:12px; background:#f9f9f9; border-radius:6px; }
  .student-photo { flex-shrink:0; }
  .student-details { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; }
  .student-details .label { color:#888; font-size:11px; }
  .student-details .value { font-weight:600; }
  table { width:100%; border-collapse:collapse; margin:16px 0; }
  th { padding:8px; border:1px solid #ccc; background:#f0f0f0; font-size:11px; text-align:center; }
  .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:16px 0; text-align:center; }
  .summary-box { border:1px solid #ddd; border-radius:6px; padding:10px; }
  .summary-box .label { font-size:10px; color:#888; }
  .summary-box .val { font-size:20px; font-weight:700; margin:4px 0; }
  .signatures { display:flex; justify-content:space-between; margin-top:50px; padding:0 10px; }
  .sig-block { text-align:center; min-width:140px; }
  .sig-line { border-top:1px dashed #999; padding-top:6px; margin-top:36px; }
  .sig-title { font-size:11px; font-weight:600; }
  .sig-name { font-size:11px; color:#444; margin-top:2px; }
</style>
</head><body>
<div class="header">
  ${institution?.logo_url ? `<img src="${institution.logo_url}" class="header-logo" crossorigin="anonymous" />` : ''}
  <h1>${instName || ''}</h1>
  ${institution?.address ? `<p class="sub">${institution.address}</p>` : ''}
  ${institution?.phone ? `<p class="sub">${bn ? 'ফোন' : 'Phone'}: ${institution.phone}</p>` : ''}
  <h2>${bn ? 'মার্কশিট' : 'Marksheet'} — ${examTitle}</h2>
</div>

<div class="student-info">
  ${photoHtml ? `<div class="student-photo">${photoHtml}</div>` : ''}
  <div class="student-details">
    <div><span class="label">${bn ? 'নাম' : 'Name'}</span><div class="value">${studentName}</div></div>
    <div><span class="label">${bn ? 'রোল নম্বর' : 'Roll Number'}</span><div class="value">${student.roll_number || '-'}</div></div>
    <div><span class="label">${bn ? 'রেজিস্ট্রেশন' : 'Registration'}</span><div class="value">${student.registration_number || student.student_id || '-'}</div></div>
    <div><span class="label">${bn ? 'পিতার নাম' : "Father's Name"}</span><div class="value">${student.father_name_bn || student.father_name || '-'}</div></div>
    ${student.date_of_birth ? `<div><span class="label">${bn ? 'জন্ম তারিখ' : 'Date of Birth'}</span><div class="value">${student.date_of_birth}</div></div>` : ''}
  </div>
</div>

<table>
  <thead><tr>
    <th>#</th>
    <th style="text-align:left;">${bn ? 'বিষয়' : 'Subject'}</th>
    <th>${bn ? 'পূর্ণমান' : 'Full Marks'}</th>
    <th>${bn ? 'প্রাপ্ত নম্বর' : 'Obtained'}</th>
    <th>${bn ? 'গ্রেড' : 'Grade'}</th>
    <th>GPA</th>
  </tr></thead>
  <tbody>${subjectRows}</tbody>
</table>

<div class="summary">
  <div class="summary-box"><div class="label">${bn ? 'মোট নম্বর' : 'Total'}</div><div class="val">${totalMarks}</div><div class="label">/ ${subjects.length * 100}</div></div>
  <div class="summary-box"><div class="label">${bn ? 'গড়' : 'Average'}</div><div class="val">${avgMarks.toFixed(1)}</div></div>
  <div class="summary-box"><div class="label">${bn ? 'গ্রেড' : 'Grade'}</div><div class="val">${overall.grade}</div></div>
  <div class="summary-box"><div class="label">GPA</div><div class="val">${overall.gpa}</div></div>
</div>

<div class="signatures">
  <div class="sig-block">
    <div class="sig-line"></div>
    <p class="sig-title">${bn ? 'পরীক্ষা নিয়ন্ত্রক' : 'Exam Controller'}</p>
    ${sigNames.examController ? `<p class="sig-name">${sigNames.examController}</p>` : ''}
  </div>
  <div class="sig-block">
    <div class="sig-line"></div>
    <p class="sig-title">${bn ? 'শিক্ষা সচিব' : 'Education Secretary'}</p>
    ${sigNames.eduSecretary ? `<p class="sig-name">${sigNames.eduSecretary}</p>` : ''}
  </div>
  <div class="sig-block">
    <div class="sig-line"></div>
    <p class="sig-title">${bn ? 'মুহতামিম' : 'Principal'}</p>
    ${sigNames.principal ? `<p class="sig-name">${sigNames.principal}</p>` : ''}
  </div>
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          URL.revokeObjectURL(url);
        }, 600);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  };

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
          <div className="flex gap-4">
            {/* Student Photo */}
            {student.photo_url && (
              <div className="flex-shrink-0">
                <img
                  src={student.photo_url}
                  alt={student.name_bn || student.name_en}
                  className="w-20 h-24 object-cover rounded border border-border"
                />
              </div>
            )}
            <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
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
              {student.date_of_birth && (
                <div>
                  <span className="text-muted-foreground">{bn ? 'জন্ম তারিখ' : 'Date of Birth'}:</span>
                  <p className="font-semibold text-foreground">{student.date_of_birth}</p>
                </div>
              )}
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
              { label: bn ? 'পরীক্ষা নিয়ন্ত্রক' : 'Exam Controller', key: 'examController' as const },
              { label: bn ? 'শিক্ষা সচিব' : 'Education Secretary', key: 'eduSecretary' as const },
              { label: bn ? 'মুহতামিম' : 'Principal', key: 'principal' as const },
            ].map(sig => (
              <div key={sig.key} className="text-center space-y-2">
                <div className="border-b border-dashed border-muted-foreground/40 mx-4 pb-1 min-h-[40px]" />
                <p className="text-xs font-semibold text-foreground">{sig.label}</p>
                <Input
                  className="text-center text-xs h-7 border-dashed"
                  placeholder={bn ? 'নাম লিখুন' : 'Enter name'}
                  value={sigNames[sig.key]}
                  onChange={(e) => setSigNames(prev => ({ ...prev, [sig.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" /> {bn ? 'প্রিন্ট মার্কশিট' : 'Print Marksheet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualMarksheet;
