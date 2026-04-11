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
  { value: 0, label_bn: 'শনি', label_en: 'Sat', full_bn: 'শনিবার', full_en: 'Saturday' },
  { value: 1, label_bn: 'রবি', label_en: 'Sun', full_bn: 'রবিবার', full_en: 'Sunday' },
  { value: 2, label_bn: 'সোম', label_en: 'Mon', full_bn: 'সোমবার', full_en: 'Monday' },
  { value: 3, label_bn: 'মঙ্গল', label_en: 'Tue', full_bn: 'মঙ্গলবার', full_en: 'Tuesday' },
  { value: 4, label_bn: 'বুধ', label_en: 'Wed', full_bn: 'বুধবার', full_en: 'Wednesday' },
  { value: 5, label_bn: 'বৃহঃ', label_en: 'Thu', full_bn: 'বৃহস্পতিবার', full_en: 'Thursday' },
  { value: 6, label_bn: 'শুক্র', label_en: 'Fri', full_bn: 'শুক্রবার', full_en: 'Friday' },
];

const PERIOD_LABELS_BN = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

const MasterRoutineView = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');

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

  // Fetch all routines for the selected session
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

  // Filter routines by division
  const filteredRoutines = (routines || []).filter(r => {
    if (selectedDivisionId === 'all') return true;
    const cls = r.classes as any;
    return cls?.division_id === selectedDivisionId;
  }).sort((a, b) => {
    const aSort = (a.classes as any)?.sort_order || 0;
    const bSort = (b.classes as any)?.sort_order || 0;
    return aSort - bSort;
  });

  // Fetch ALL periods for filtered routines
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

  // Build combined period structure
  // Get all unique period numbers across all routines
  const allPeriodNums = [...new Set((allPeriods || []).map(p => p.period_number))].sort((a, b) => a - b);
  const breakNums = new Set((allPeriods || []).filter(p => p.is_break).map(p => p.period_number));

  const fmtTime = (t: string) => {
    if (!t) return '';
    const s = t.slice(0, 5);
    if (!bn) return s;
    return s.replace(/\d/g, (d: string) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  };

  const instName = bn ? institution?.name : (institution?.name_en || institution?.name);
  const selectedSession = sessions?.find(s => s.id === selectedSessionId);
  const selectedDiv = divisions?.find(d => d.id === selectedDivisionId);

  // Get class range text
  const classNames = filteredRoutines.map(r => {
    const cls = r.classes as any;
    return bn ? cls?.name_bn : cls?.name;
  }).filter(Boolean);
  const classRangeText = classNames.length > 0 ? `${classNames[0]} — ${classNames[classNames.length - 1]}` : '';

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
      th, td { border: 1.5px solid #333; padding: 3px 5px; text-align: center; font-size: 10px; vertical-align: middle; }
      th { background: #f0f0f0; font-weight: 600; }
      .header { text-align: center; margin-bottom: 8px; }
      .header h1 { font-size: 16px; font-weight: 700; }
      .header p { font-size: 11px; margin: 1px 0; }
      .date-box { position: absolute; top: 10px; right: 15px; font-size: 10px; }
      .break-col { background: #e8f5e9 !important; writing-mode: vertical-rl; text-orientation: mixed; font-weight: 600; font-size: 9px; min-width: 24px; max-width: 28px; }
      .after-break-head { background: #d4edda !important; }
      .class-cell { background: #f5f5f5; font-weight: 600; text-align: left; padding-left: 6px; white-space: nowrap; font-size: 10px; }
      .subject { font-weight: 600; font-size: 9px; }
      .teacher { font-size: 8px; color: #555; }
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
              {/* Institution Header */}
              <div className="text-center py-3 px-4 border-b-2 border-border bg-muted/20 relative">
                <div className="absolute top-2 right-3 text-[10px] text-muted-foreground">
                  {bn ? 'তারিখ:' : 'Date:'} {new Date().toLocaleDateString(bn ? 'bn-BD' : 'en-GB')}
                </div>
                {institution?.logo_url && (
                  <img src={institution.logo_url} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />
                )}
                <h1 className="text-base font-bold text-foreground">{instName || ''}</h1>
                <p className="text-xs font-semibold text-foreground">
                  {bn ? 'ক্লাস রুটিন:' : 'Class Routine:'} {selectedSession ? (bn ? selectedSession.name_bn || selectedSession.name : selectedSession.name) : ''}
                </p>
                {selectedDiv && selectedDivisionId !== 'all' && (
                  <p className="text-[10px] text-muted-foreground">
                    {bn ? `${selectedDiv.name_bn} শাখা` : `${selectedDiv.name} Division`}
                    {classRangeText && ` — ${classRangeText} ${bn ? 'শ্রেণী' : ''}`}
                  </p>
                )}
              </div>

              {/* Master Timetable: one row per day, columns = periods, separate section per class */}
              {DAYS.map(day => {
                // Check if any routine has periods for this day
                const dayPeriods = (allPeriods || []).filter(p => p.day_of_week === day.value);
                if (dayPeriods.length === 0 && allPeriodNums.length > 0) return null;
                return null; // We'll use the combined table below instead
              })}

              {/* Combined view: Rows = Classes, within each class group by day */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse" style={{ minWidth: allPeriodNums.length * 100 + 120 }}>
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted/40 px-2 py-1.5 text-left font-semibold sticky left-0 z-10 min-w-[80px]">
                        {bn ? 'শ্রেণী' : 'Class'}
                      </th>
                      {allPeriodNums.map((num, i) => {
                        const sample = (allPeriods || []).find(p => p.period_number === num);
                        const isBreak = breakNums.has(num);
                        const isAfterBreak = breakNums.size > 0 && !isBreak && num > Math.max(...breakNums);
                        return (
                          <th
                            key={num}
                            className={`border border-border px-1 py-1.5 text-center font-semibold ${
                              isBreak ? 'bg-emerald-100 dark:bg-emerald-900/30 min-w-[28px] max-w-[32px]' :
                              isAfterBreak ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-muted/40'
                            }`}
                            style={isBreak ? { writingMode: 'vertical-rl', textOrientation: 'mixed', padding: '6px 2px' } : {}}
                          >
                            {isBreak ? (
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                                {bn ? (sample?.break_label_bn || 'বিরতি') : (sample?.break_label || 'Break')}
                              </span>
                            ) : (
                              <div>
                                <div className="font-bold text-[10px]">{bn ? PERIOD_LABELS_BN[i] || String(num) : `P${num}`}</div>
                                {sample && <div className="text-[8px] text-muted-foreground font-normal">{fmtTime(sample.start_time)}-{fmtTime(sample.end_time)}</div>}
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
                      const div = cls?.divisions as any;
                      const routinePeriods = (allPeriods || []).filter(p => p.routine_id === routine.id);

                      return DAYS.map(day => {
                        const dayPeriods = routinePeriods.filter(p => p.day_of_week === day.value);
                        if (dayPeriods.length === 0 && allPeriodNums.length > 0) {
                          // Skip days with no periods for this class
                          return null;
                        }
                        return (
                          <tr key={`${routine.id}-${day.value}`} className="hover:bg-accent/20 transition-colors">
                            {day.value === DAYS[0].value || !DAYS.slice(0, DAYS.indexOf(day)).some(d => routinePeriods.some(p => p.day_of_week === d.value)) ? null : null}
                            <td className="border border-border bg-muted/10 px-2 py-1 font-semibold text-[10px] whitespace-nowrap sticky left-0 z-10">
                              <div>{bn ? day.label_bn : day.label_en}</div>
                              {day.value === DAYS.find(d => routinePeriods.some(p => p.day_of_week === d.value))?.value && (
                                <div className="text-[8px] text-muted-foreground font-normal">
                                  {bn ? cls?.name_bn : cls?.name}
                                </div>
                              )}
                            </td>
                            {allPeriodNums.map(num => {
                              const p = dayPeriods.find(dp => dp.period_number === num);
                              const isBreak = breakNums.has(num);
                              const isAfterBreak = breakNums.size > 0 && !isBreak && num > Math.max(...breakNums);
                              const subj = p?.subjects as any;

                              if (isBreak) {
                                return <td key={num} className="border border-border bg-emerald-50/50 dark:bg-emerald-900/10" />;
                              }

                              if (!p) {
                                return <td key={num} className={`border border-border ${isAfterBreak ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}`} />;
                              }

                              return (
                                <td key={num} className={`border border-border px-1 py-1 text-center ${isAfterBreak ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}`}>
                                  <div className="text-[10px] font-semibold text-foreground leading-tight">
                                    {subj ? (bn ? subj.name_bn : subj.name) : '-'}
                                  </div>
                                  {(p.teacher_name_bn || p.teacher_name) && (
                                    <div className="text-[8px] text-muted-foreground leading-tight">
                                      {bn ? p.teacher_name_bn : p.teacher_name}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
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
