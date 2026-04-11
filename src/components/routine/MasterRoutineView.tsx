import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';

const DAYS = [
  { value: 0, label_bn: 'শনিবার', label_en: 'Saturday', short_bn: 'শনি', short_en: 'Sat' },
  { value: 1, label_bn: 'রবিবার', label_en: 'Sunday', short_bn: 'রবি', short_en: 'Sun' },
  { value: 2, label_bn: 'সোমবার', label_en: 'Monday', short_bn: 'সোম', short_en: 'Mon' },
  { value: 3, label_bn: 'মঙ্গলবার', label_en: 'Tuesday', short_bn: 'মঙ্গল', short_en: 'Tue' },
  { value: 4, label_bn: 'বুধবার', label_en: 'Wednesday', short_bn: 'বুধ', short_en: 'Wed' },
  { value: 5, label_bn: 'বৃহস্পতিবার', label_en: 'Thursday', short_bn: 'বৃহঃ', short_en: 'Thu' },
  { value: 6, label_bn: 'শুক্রবার', label_en: 'Friday', short_bn: 'শুক্র', short_en: 'Fri' },
];

const PERIOD_LABELS_BN = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

const MasterRoutineView = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const { data: institution } = useQuery({
    queryKey: ['institution-default'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('name, name_en, logo_url, address, phone').eq('is_default', true).maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions-for-master-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('academic_sessions').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: divisions } = useQuery({
    queryKey: ['divisions-for-master-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('divisions').select('*').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  const { data: routines } = useQuery({
    queryKey: ['master-routines', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) return [];
      const { data } = await supabase
        .from('class_routines')
        .select('*, classes(id, name, name_bn, sort_order, division_id, divisions(id, name, name_bn))')
        .eq('academic_session_id', selectedSessionId)
        .eq('is_active', true)
        .order('created_at');
      return data || [];
    },
    enabled: !!selectedSessionId,
  });

  // Get total student count
  const { data: studentCount } = useQuery({
    queryKey: ['total-students-count', selectedSessionId],
    queryFn: async () => {
      const { count } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active');
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredRoutines = (routines || []).filter(r => {
    if (selectedDivisionId === 'all') return true;
    return (r.classes as any)?.division_id === selectedDivisionId;
  }).sort((a, b) => ((a.classes as any)?.sort_order || 0) - ((b.classes as any)?.sort_order || 0));

  const routineIds = filteredRoutines.map(r => r.id);
  const { data: allPeriods } = useQuery({
    queryKey: ['master-routine-periods', routineIds],
    queryFn: async () => {
      if (routineIds.length === 0) return [];
      const { data } = await supabase
        .from('routine_periods')
        .select('*, subjects(name, name_bn)')
        .in('routine_id', routineIds)
        .order('period_number');
      return data || [];
    },
    enabled: routineIds.length > 0,
  });

  const allPeriodNums = [...new Set((allPeriods || []).map(p => p.period_number))].sort((a, b) => a - b);
  const breakNums = new Set((allPeriods || []).filter(p => p.is_break).map(p => p.period_number));

  let periodLabelIndex = 0;
  const periodLabels: Record<number, string> = {};
  allPeriodNums.forEach(num => {
    if (!breakNums.has(num)) {
      periodLabels[num] = bn ? (PERIOD_LABELS_BN[periodLabelIndex] || String(periodLabelIndex + 1)) : `P${periodLabelIndex + 1}`;
      periodLabelIndex++;
    }
  });

  const fmtTime = (t: string) => {
    if (!t) return '';
    const parts = t.slice(0, 5).split(':');
    let h = parseInt(parts[0]);
    const m = parts[1];
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    const timeStr = `${String(h).padStart(2, '0')}:${m}`;
    if (!bn) return timeStr;
    return timeStr.replace(/\d/g, (d: string) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  };

  const instName = bn ? institution?.name : (institution?.name_en || institution?.name);
  const selectedSession = sessions?.find(s => s.id === selectedSessionId);
  const selectedDiv = divisions?.find(d => d.id === selectedDivisionId);


  const daysToRender = selectedDay === 'all' ? DAYS : DAYS.filter(d => String(d.value) === selectedDay);

  const handlePrint = () => {
    const el = document.getElementById('master-routine-print');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${bn ? 'মাস্টার রুটিন' : 'Master Routine'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Noto Sans Bengali', sans-serif; padding: 10px; }
      @page { size: A4 landscape; margin: 8mm; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1.5px solid #333; text-align: center; vertical-align: middle; }
      th { background: #d4edda; font-weight: 700; }
      .inst-header { text-align: center; margin-bottom: 6px; }
      .inst-header h1 { font-size: 18px; font-weight: 700; }
      .inst-header p { font-size: 11px; margin: 2px 0; }
      .date-box { position: absolute; top: 10px; right: 15px; font-size: 10px; border: 1px solid #999; padding: 2px 6px; }
      .break-col { background: #c8e6c9 !important; writing-mode: vertical-rl; text-orientation: mixed; font-weight: 700; font-size: 10px; min-width: 26px; max-width: 30px; }
      .class-cell { background: #f5f5f5; font-weight: 700; text-align: center; white-space: nowrap; font-size: 10px; }
      .cell-inner { display: flex; flex-direction: column; min-height: 36px; }
      .cell-subject { font-weight: 600; font-size: 9.5px; line-height: 1.3; padding: 2px 3px; flex: 1; display: flex; align-items: center; justify-content: center; }
      .cell-divider { border-top: 1px solid #999; }
      .cell-teacher { font-size: 8px; color: #555; line-height: 1.2; padding: 2px 3px; flex: 1; display: flex; align-items: center; justify-content: center; }
      .day-header { background: #e8f5e9; font-weight: 700; font-size: 11px; text-align: center; padding: 4px; }
      .footer { margin-top: 6px; font-size: 9px; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body><div style="position:relative;">`);
    w.document.write(el.innerHTML);
    w.document.write('</div></body></html>');
    w.document.close();
    const check = setInterval(() => {
      if (w.document.readyState === 'complete') {
        clearInterval(check);
        setTimeout(() => { w.print(); w.close(); }, 300);
      }
    }, 100);
  };

  const renderDayTable = (day: typeof DAYS[0]) => {
    const dayAllPeriods = (allPeriods || []).filter(p => p.day_of_week === day.value);
    if (dayAllPeriods.length === 0) return null;

    return (
      <div key={day.value} className="mb-4">
        {selectedDay === 'all' && (
          <div className="text-center py-1.5 bg-emerald-100 dark:bg-emerald-900/20 border border-border border-b-0 font-bold text-sm text-foreground">
            {bn ? day.label_bn : day.label_en}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: allPeriodNums.length * 90 + 100 }}>
            <thead>
              <tr>
                <th className="border border-border bg-emerald-100 dark:bg-emerald-900/20 px-2 py-2 text-center font-bold text-xs min-w-[70px]">
                  {bn ? 'শ্রেণী' : 'Class'}
                </th>
                {allPeriodNums.map(num => {
                  const sample = dayAllPeriods.find(p => p.period_number === num) || (allPeriods || []).find(p => p.period_number === num);
                  const isBreak = breakNums.has(num);
                  return (
                    <th
                      key={num}
                      className={`border border-border text-center font-bold ${
                        isBreak ? 'bg-emerald-200 dark:bg-emerald-800/30 min-w-[28px] max-w-[32px]' : 'bg-emerald-100 dark:bg-emerald-900/20'
                      }`}
                      style={isBreak ? { writingMode: 'vertical-rl', textOrientation: 'mixed', padding: '8px 2px' } : { padding: '4px 2px' }}
                      rowSpan={isBreak ? undefined : undefined}
                    >
                      {isBreak ? (
                        <span className="text-[10px] font-bold">
                          {bn ? (sample?.break_label_bn || 'বিরতি') : (sample?.break_label || 'Break')}
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-xs">{periodLabels[num]}</div>
                          {sample && (
                            <div className="text-[8px] font-normal opacity-70">
                              {fmtTime(sample.start_time)} - {fmtTime(sample.end_time)}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRoutines.map(routine => {
                const cls = routine.classes as any;
                const routinePeriods = (allPeriods || []).filter(p => p.routine_id === routine.id && p.day_of_week === day.value);
                if (routinePeriods.length === 0) return null;

                return (
                  <tr key={routine.id} className="hover:bg-accent/10 transition-colors">
                    <td className="border border-border bg-muted/10 px-2 py-2 font-bold text-xs whitespace-nowrap text-center">
                      <div className="font-bold">{bn ? cls?.name_bn : cls?.name}</div>
                    </td>
                    {allPeriodNums.map(num => {
                      const p = routinePeriods.find(dp => dp.period_number === num);
                      const isBreak = breakNums.has(num);
                      const subj = p?.subjects as any;

                      if (isBreak) {
                        return <td key={num} className="border border-border bg-emerald-50 dark:bg-emerald-900/10" />;
                      }

                      if (!p) {
                        return <td key={num} className="border border-border p-0">
                          <div className="flex flex-col min-h-[40px]">
                            <div className="flex-1" />
                            <div className="border-t border-border/50 flex-1" />
                          </div>
                        </td>;
                      }

                      const subjName = subj ? (bn ? subj.name_bn : subj.name) : '';
                      const teacherName = bn ? (p.teacher_name_bn || p.teacher_name || '') : (p.teacher_name || p.teacher_name_bn || '');

                      return (
                        <td key={num} className="border border-border p-0">
                          <div className="flex flex-col min-h-[40px]">
                            {/* Subject - top half */}
                            <div className="flex-1 flex items-center justify-center px-1 py-0.5">
                              <span className="text-[10px] font-semibold text-foreground leading-tight text-center">
                                {subjName || '-'}
                              </span>
                            </div>
                            {/* Divider */}
                            <div className="border-t border-border/70" />
                            {/* Teacher - bottom half */}
                            <div className="flex-1 flex items-center justify-center px-1 py-0.5">
                              <span className="text-[8px] text-muted-foreground leading-tight text-center">
                                {teacherName}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="min-w-[180px]">
          <Label className="text-xs">{bn ? 'একাডেমিক সেশন' : 'Academic Session'}</Label>
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger><SelectValue placeholder={bn ? 'সেশন নির্বাচন' : 'Select session'} /></SelectTrigger>
            <SelectContent>
              {sessions?.map(s => <SelectItem key={s.id} value={s.id}>{bn ? s.name_bn || s.name : s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label className="text-xs">{bn ? 'বিভাগ' : 'Division'}</Label>
          <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল বিভাগ' : 'All Divisions'}</SelectItem>
              {divisions?.map(d => <SelectItem key={d.id} value={d.id}>{bn ? d.name_bn : d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px]">
          <Label className="text-xs">{bn ? 'দিন' : 'Day'}</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল দিন' : 'All Days'}</SelectItem>
              {DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>{bn ? d.label_bn : d.label_en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {filteredRoutines.length > 0 && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> {bn ? 'প্রিন্ট' : 'Print'}
          </Button>
        )}
      </div>

      {!selectedSessionId ? (
        <div className="py-12 text-center text-muted-foreground">
          {bn ? 'একটি একাডেমিক সেশন নির্বাচন করুন' : 'Select an academic session'}
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {bn ? 'এই সেশনে কোনো সক্রিয় রুটিন নেই। প্রথমে "ক্লাস রুটিন" ট্যাব থেকে নির্দিষ্ট ক্লাসের রুটিন তৈরি করুন।' : 'No active routines for this session. Create class-specific routines first.'}
        </div>
      ) : (
        <div id="master-routine-print">
          <Card className="overflow-hidden border-2 border-border">
            <CardContent className="p-0">
              {/* Institution Header - matching template exactly */}
              <div className="text-center py-3 px-4 border-b-2 border-border bg-muted/5 relative">
                {/* Date box top-right */}
                <div className="absolute top-2 right-3 text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">
                  {bn ? 'তারিখ:' : 'Date:'} {new Date().toLocaleDateString(bn ? 'bn-BD' : 'en-GB')} {bn ? 'ঈ:' : ''}
                </div>

                {/* Institution Logo */}
                {institution?.logo_url && (
                  <img src={institution.logo_url} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />
                )}

                {/* Institution Name */}
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  {instName || (bn ? 'প্রতিষ্ঠানের নাম' : 'Institution Name')}
                </h1>

                {/* Routine title line */}
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {bn ? 'ক্লাস রুটিন:' : 'Class Routine:'} {selectedSession ? (bn ? selectedSession.name_bn || selectedSession.name : selectedSession.name) : ''} {bn ? 'ঈ:' : ''}
                </p>

                {/* Division name */}
                {selectedDiv && selectedDivisionId !== 'all' && (
                  <p className="text-[11px] text-foreground font-medium">
                    {bn ? `${selectedDiv.name_bn} শাখা` : `${selectedDiv.name} Division`}
                  </p>
                )}

                {/* Class range */}
                {classRangeText && (
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {classRangeText} {bn ? 'শ্রেণী' : ''}
                  </p>
                )}

                {/* Student count */}
                {studentCount !== undefined && studentCount > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {bn ? `মোট ছাত্র: ${String(studentCount).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)])} জন` : `Total Students: ${studentCount}`}
                  </p>
                )}

                {/* Selected day */}
                {selectedDay !== 'all' && (
                  <p className="text-[11px] font-semibold text-foreground mt-0.5">
                    {bn ? daysToRender[0]?.label_bn : daysToRender[0]?.label_en}
                  </p>
                )}
              </div>

              {/* Render tables per day */}
              <div className="p-2">
                {daysToRender.map(day => renderDayTable(day))}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-border text-[9px] text-muted-foreground">
                {bn ? 'বি.দ্র. কর্তৃপক্ষ কর্তৃক পরিবর্তন করার ক্ষমতা এবং বিশেষ প্রয়োজনে অতিরিক্ত ক্লাশ নিতে পারবেন।' : 'Note: Schedule subject to change by administration.'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MasterRoutineView;
