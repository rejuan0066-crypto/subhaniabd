import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Printer, Plus, Minus, Save } from 'lucide-react';
import { toast } from 'sonner';

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

const toBn = (n: number | string) => String(n).replace(/\d/g, (d: string) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const fmtTime = (t: string, bn: boolean) => {
  if (!t) return '';
  const parts = t.slice(0, 5).split(':');
  let h = parseInt(parts[0]);
  const m = parts[1];
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const timeStr = `${String(h).padStart(2, '0')}:${m}`;
  return bn ? toBn(timeStr) : timeStr;
};

/* ─── Cell Editor Popover ─── */
interface CellEditorProps {
  subjectId: string;
  teacherName: string;
  teacherNameBn: string;
  subjects: any[];
  bn: boolean;
  onSave: (subjectId: string, teacherName: string, teacherNameBn: string) => void;
  children: React.ReactNode;
}

const CellEditor = ({ subjectId, teacherName, teacherNameBn, subjects, bn, onSave, children }: CellEditorProps) => {
  const [open, setOpen] = useState(false);
  const [localSubjectId, setLocalSubjectId] = useState(subjectId);
  const [localTeacher, setLocalTeacher] = useState(teacherName);
  const [localTeacherBn, setLocalTeacherBn] = useState(teacherNameBn);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSubjectId(subjectId);
      setLocalTeacher(teacherName);
      setLocalTeacherBn(teacherNameBn);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    onSave(localSubjectId, localTeacher, localTeacherBn);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="center">
        <div>
          <Label className="text-xs">{bn ? 'বিষয়' : 'Subject'}</Label>
          <Select value={localSubjectId} onValueChange={setLocalSubjectId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={bn ? 'বিষয় নির্বাচন' : 'Select subject'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{bn ? '-- খালি --' : '-- Empty --'}</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{bn ? s.name_bn : s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{bn ? 'শিক্ষকের নাম (বাংলা)' : 'Teacher (Bangla)'}</Label>
          <Input className="h-8 text-xs" value={localTeacherBn} onChange={e => setLocalTeacherBn(e.target.value)} placeholder={bn ? 'শিক্ষকের নাম' : 'Teacher name BN'} />
        </div>
        <div>
          <Label className="text-xs">{bn ? 'শিক্ষকের নাম (ইংরেজি)' : 'Teacher (English)'}</Label>
          <Input className="h-8 text-xs" value={localTeacher} onChange={e => setLocalTeacher(e.target.value)} placeholder={bn ? 'Teacher name' : 'Teacher name EN'} />
        </div>
        <Button size="sm" className="w-full h-7 text-xs gap-1" onClick={handleSave}>
          <Save className="h-3 w-3" /> {bn ? 'সেভ' : 'Save'}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

/* ─── Main Component ─── */
const MasterRoutineView = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('0'); // default Saturday
  const [periodCount, setPeriodCount] = useState(8);
  const [breakAfter, setBreakAfter] = useState(4); // break after 4th period
  const [periodTimes, setPeriodTimes] = useState<Record<number, { start: string; end: string }>>({}); // periodNum -> times

  // Queries
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

  const { data: allClasses } = useQuery({
    queryKey: ['all-classes-for-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*, divisions(id, name, name_bn)').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-for-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('id, name, name_bn').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const { data: routines } = useQuery({
    queryKey: ['master-routines', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) return [];
      const { data } = await supabase
        .from('class_routines')
        .select('id, class_id, name, name_bn')
        .eq('academic_session_id', selectedSessionId)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!selectedSessionId,
  });

  const routineMap = useMemo(() => {
    const map: Record<string, string> = {}; // class_id -> routine_id
    (routines || []).forEach(r => { map[r.class_id] = r.id; });
    return map;
  }, [routines]);

  const routineIds = useMemo(() => Object.values(routineMap), [routineMap]);

  const { data: allPeriods } = useQuery({
    queryKey: ['master-routine-periods', routineIds, selectedDay],
    queryFn: async () => {
      if (routineIds.length === 0) return [];
      const { data } = await supabase
        .from('routine_periods')
        .select('*, subjects(name, name_bn)')
        .in('routine_id', routineIds)
        .eq('day_of_week', Number(selectedDay))
        .order('period_number');
      return data || [];
    },
    enabled: routineIds.length > 0,
  });

  const { data: studentCount } = useQuery({
    queryKey: ['total-students-count'],
    queryFn: async () => {
      const { count } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active');
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filtered classes
  const filteredClasses = useMemo(() => {
    if (!allClasses) return [];
    if (selectedDivisionId === 'all') return allClasses;
    return allClasses.filter(c => c.division_id === selectedDivisionId);
  }, [allClasses, selectedDivisionId]);

  // Period columns: 1..periodCount with break inserted
  const periodColumns = useMemo(() => {
    const cols: { num: number; isBreak: boolean }[] = [];
    let pNum = 1;
    for (let i = 1; i <= periodCount; i++) {
      if (i === breakAfter + 1) {
        cols.push({ num: pNum, isBreak: true });
        pNum++;
      }
      cols.push({ num: pNum, isBreak: false });
      pNum++;
    }
    // If break is at end
    if (breakAfter >= periodCount) {
      cols.push({ num: pNum, isBreak: true });
    }
    return cols;
  }, [periodCount, breakAfter]);

  // Get period data for a specific class and period
  const getPeriodData = useCallback((classId: string, periodNum: number) => {
    const routineId = routineMap[classId];
    if (!routineId || !allPeriods) return null;
    return allPeriods.find(p => p.routine_id === routineId && p.period_number === periodNum);
  }, [routineMap, allPeriods]);

  // Get period times: local state first, then DB
  const getPeriodTime = useCallback((periodNum: number) => {
    if (periodTimes[periodNum]) return periodTimes[periodNum];
    if (!allPeriods) return { start: '', end: '' };
    const p = allPeriods.find(pp => pp.period_number === periodNum && !pp.is_break);
    return { start: p?.start_time || '', end: p?.end_time || '' };
  }, [allPeriods, periodTimes]);

  // Save cell mutation
  const saveCellMutation = useMutation({
    mutationFn: async ({ classId, periodNum, subjectId, teacherName, teacherNameBn, isBreak }: {
      classId: string; periodNum: number; subjectId: string; teacherName: string; teacherNameBn: string; isBreak?: boolean;
    }) => {
      let routineId = routineMap[classId];

      // Auto-create routine if not exists
      if (!routineId) {
        const cls = allClasses?.find(c => c.id === classId);
        const { data: newRoutine, error } = await supabase.from('class_routines').insert({
          class_id: classId,
          academic_session_id: selectedSessionId,
          name: cls?.name || 'Routine',
          name_bn: cls?.name_bn || 'রুটিন',
          is_active: true,
        }).select('id').single();
        if (error) throw error;
        routineId = newRoutine.id;
      }

      // Upsert period
      const { data: existing } = await supabase
        .from('routine_periods')
        .select('id')
        .eq('routine_id', routineId)
        .eq('day_of_week', Number(selectedDay))
        .eq('period_number', periodNum)
        .maybeSingle();

      const time = periodTimes[periodNum] || { start: '08:00', end: '08:45' };
      const periodData = {
        routine_id: routineId,
        day_of_week: Number(selectedDay),
        period_number: periodNum,
        subject_id: subjectId === 'none' ? null : subjectId || null,
        teacher_name: teacherName || null,
        teacher_name_bn: teacherNameBn || null,
        is_break: isBreak || false,
        start_time: time.start,
        end_time: time.end,
      };

      if (existing) {
        const { error } = await supabase.from('routine_periods').update(periodData).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('routine_periods').insert(periodData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-routine-periods'] });
      queryClient.invalidateQueries({ queryKey: ['master-routines'] });
      toast.success(bn ? 'সেভ হয়েছে' : 'Saved');
    },
    onError: () => toast.error(bn ? 'সেভ ব্যর্থ' : 'Save failed'),
  });

  const handleCellSave = (classId: string, periodNum: number, subjectId: string, teacherName: string, teacherNameBn: string) => {
    saveCellMutation.mutate({ classId, periodNum, subjectId, teacherName, teacherNameBn });
  };

  const selectedSession = sessions?.find(s => s.id === selectedSessionId);
  const selectedDiv = divisions?.find(d => d.id === selectedDivisionId);
  const instName = bn ? institution?.name : (institution?.name_en || institution?.name);
  const dayObj = DAYS.find(d => String(d.value) === selectedDay);

  // Period label helpers
  let periodLabelIdx = 0;
  const periodLabelsMap: Record<number, string> = {};
  periodColumns.forEach(col => {
    if (!col.isBreak) {
      periodLabelIdx++;
      periodLabelsMap[col.num] = bn ? (PERIOD_LABELS_BN[periodLabelIdx - 1] || toBn(periodLabelIdx)) : `P${periodLabelIdx}`;
    }
  });

  // Print handler
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
      .header { text-align: center; margin-bottom: 8px; }
      .header h1 { font-size: 18px; font-weight: 700; }
      .header p { font-size: 11px; margin: 2px 0; }
      .date-box { position: absolute; top: 10px; right: 15px; font-size: 10px; border: 1px solid #999; padding: 2px 6px; }
      .break-col { background: #c8e6c9 !important; writing-mode: vertical-rl; text-orientation: mixed; font-weight: 700; font-size: 10px; min-width: 26px; max-width: 30px; }
      .cell-top { font-weight: 600; font-size: 9.5px; padding: 2px 3px; border-bottom: 1px solid #999; min-height: 18px; }
      .cell-bottom { font-size: 8px; color: #555; padding: 2px 3px; min-height: 18px; }
      .class-cell { background: #f5f5f5; font-weight: 700; font-size: 10px; white-space: nowrap; }
      .period-header { background: #d4edda; }
      .day-label { background: #c8e6c9; font-weight: 700; font-size: 12px; text-align: center; padding: 4px; }
      .footer { margin-top: 8px; font-size: 9px; }
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

  const thStyle = "border border-border bg-emerald-100 dark:bg-emerald-900/30 px-1 py-2 text-center font-bold text-[11px]";
  const breakThStyle = "border border-border bg-emerald-200 dark:bg-emerald-800/40 font-bold text-[10px]";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="min-w-[170px]">
          <Label className="text-xs">{bn ? 'একাডেমিক সেশন' : 'Session'}</Label>
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger><SelectValue placeholder={bn ? 'সেশন নির্বাচন' : 'Select session'} /></SelectTrigger>
            <SelectContent>
              {sessions?.map(s => <SelectItem key={s.id} value={s.id}>{bn ? s.name_bn || s.name : s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px]">
          <Label className="text-xs">{bn ? 'বিভাগ' : 'Division'}</Label>
          <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল বিভাগ' : 'All'}</SelectItem>
              {divisions?.map(d => <SelectItem key={d.id} value={d.id}>{bn ? d.name_bn : d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[130px]">
          <Label className="text-xs">{bn ? 'দিন' : 'Day'}</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>{bn ? d.label_bn : d.label_en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-1">
          <div>
            <Label className="text-xs">{bn ? 'পিরিয়ড' : 'Periods'}</Label>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setPeriodCount(p => Math.max(1, p - 1))}><Minus className="h-3 w-3" /></Button>
              <span className="text-sm font-bold w-6 text-center">{bn ? toBn(periodCount) : periodCount}</span>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setPeriodCount(p => Math.min(12, p + 1))}><Plus className="h-3 w-3" /></Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">{bn ? 'বিরতি পরে' : 'Break after'}</Label>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBreakAfter(p => Math.max(1, p - 1))}><Minus className="h-3 w-3" /></Button>
              <span className="text-sm font-bold w-6 text-center">{bn ? toBn(breakAfter) : breakAfter}</span>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBreakAfter(p => Math.min(periodCount, p + 1))}><Plus className="h-3 w-3" /></Button>
            </div>
          </div>
        </div>
        {selectedSessionId && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> {bn ? 'প্রিন্ট' : 'Print'}
          </Button>
        )}
      </div>

      {!selectedSessionId ? (
        <div className="py-12 text-center text-muted-foreground">
          {bn ? 'একটি একাডেমিক সেশন নির্বাচন করুন' : 'Select an academic session'}
        </div>
      ) : (
        <div id="master-routine-print">
          <div className="border-2 border-border rounded-lg overflow-hidden bg-background">
            {/* Header */}
            <div className="text-center py-3 px-4 border-b-2 border-border relative">
              <div className="absolute top-2 right-3 text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">
                {bn ? 'তারিখ:' : 'Date:'} {new Date().toLocaleDateString(bn ? 'bn-BD' : 'en-GB')}
              </div>
              {institution?.logo_url && (
                <img src={institution.logo_url} alt="" className="w-12 h-12 object-contain mx-auto mb-1" />
              )}
              <h1 className="text-lg font-bold text-foreground leading-tight">
                {instName || (bn ? 'প্রতিষ্ঠানের নাম' : 'Institution Name')}
              </h1>
              {institution?.address && (
                <p className="text-[10px] text-muted-foreground">{institution.address}</p>
              )}
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {bn ? 'ক্লাস রুটিন:' : 'Class Routine:'} {selectedSession ? (bn ? selectedSession.name_bn || selectedSession.name : selectedSession.name) : ''}
              </p>
              {selectedDiv && selectedDivisionId !== 'all' && (
                <p className="text-[11px] text-foreground font-medium">
                  {bn ? `${selectedDiv.name_bn} শাখা` : `${selectedDiv.name} Division`}
                </p>
              )}
              {studentCount !== undefined && studentCount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {bn ? `মোট ছাত্র: ${toBn(studentCount)} জন` : `Total Students: ${studentCount}`}
                </p>
              )}
              {/* Selected day */}
              <p className="text-[11px] font-semibold text-foreground mt-0.5 bg-emerald-100 dark:bg-emerald-900/20 inline-block px-3 py-0.5 rounded">
                {bn ? dayObj?.label_bn : dayObj?.label_en}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto p-2">
              <table className="w-full border-collapse" style={{ minWidth: periodColumns.length * 85 + 80 }}>
                <thead>
                  <tr>
                    <th className={thStyle} style={{ minWidth: 70 }}>
                      {bn ? 'শ্রেণী' : 'Class'}
                    </th>
                    {periodColumns.map((col, idx) => {
                      if (col.isBreak) {
                        return (
                          <th key={`br-${idx}`} className={breakThStyle}
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', padding: '8px 2px', minWidth: 28, maxWidth: 32 }}>
                            {bn ? 'বিরতি' : 'Break'}
                          </th>
                        );
                      }
                      const time = getPeriodTime(col.num);
                      return (
                        <th key={col.num} className={thStyle}>
                          <div className="font-bold text-xs">{periodLabelsMap[col.num]}</div>
                          {time.start && (
                            <div className="text-[8px] font-normal opacity-70">
                              {fmtTime(time.start, bn)} - {fmtTime(time.end, bn)}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map(cls => (
                    <tr key={cls.id} className="hover:bg-accent/5 transition-colors">
                      {/* Class name cell */}
                      <td className="border border-border bg-muted/10 px-2 py-1.5 font-bold text-[10px] whitespace-nowrap text-center">
                        {bn ? cls.name_bn : cls.name}
                      </td>
                      {/* Period cells */}
                      {periodColumns.map((col, idx) => {
                        if (col.isBreak) {
                          return <td key={`br-${idx}`} className="border border-border bg-emerald-50 dark:bg-emerald-900/10" />;
                        }

                        const period = getPeriodData(cls.id, col.num);
                        const subj = period?.subjects as any;
                        const subjName = subj ? (bn ? subj.name_bn : subj.name) : '';
                        const teacherDisplay = bn
                          ? (period?.teacher_name_bn || period?.teacher_name || '')
                          : (period?.teacher_name || period?.teacher_name_bn || '');

                        return (
                          <td key={col.num} className="border border-border p-0">
                            <CellEditor
                              subjectId={period?.subject_id || 'none'}
                              teacherName={period?.teacher_name || ''}
                              teacherNameBn={period?.teacher_name_bn || ''}
                              subjects={subjects || []}
                              bn={bn}
                              onSave={(sId, tn, tnBn) => handleCellSave(cls.id, col.num, sId, tn, tnBn)}
                            >
                              <button className="w-full cursor-pointer hover:bg-accent/10 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 rounded-none">
                                <div className="flex flex-col min-h-[42px]">
                                  {/* Subject - top half */}
                                  <div className="flex-1 flex items-center justify-center px-1 py-0.5">
                                    <span className="text-[10px] font-semibold text-foreground leading-tight text-center">
                                      {subjName || <span className="text-muted-foreground/30">+</span>}
                                    </span>
                                  </div>
                                  {/* Divider */}
                                  <div className="border-t border-border/70" />
                                  {/* Teacher - bottom half */}
                                  <div className="flex-1 flex items-center justify-center px-1 py-0.5">
                                    <span className="text-[8px] text-muted-foreground leading-tight text-center">
                                      {teacherDisplay || <span className="opacity-30">—</span>}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            </CellEditor>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border text-[9px] text-muted-foreground">
              {bn ? 'বি.দ্র. কর্তৃপক্ষ কর্তৃক পরিবর্তন করার ক্ষমতা এবং বিশেষ প্রয়োজনে অতিরিক্ত ক্লাশ নিতে পারবেন।' : 'Note: Schedule subject to change by administration.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterRoutineView;
