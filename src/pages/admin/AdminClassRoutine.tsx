import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Copy, Eye, Clock, BookOpen, Printer } from 'lucide-react';

const DAYS = [
  { value: 0, label_bn: 'শনিবার', label_en: 'Saturday' },
  { value: 1, label_bn: 'রবিবার', label_en: 'Sunday' },
  { value: 2, label_bn: 'সোমবার', label_en: 'Monday' },
  { value: 3, label_bn: 'মঙ্গলবার', label_en: 'Tuesday' },
  { value: 4, label_bn: 'বুধবার', label_en: 'Wednesday' },
  { value: 5, label_bn: 'বৃহস্পতিবার', label_en: 'Thursday' },
  { value: 6, label_bn: 'শুক্রবার', label_en: 'Friday' },
];

interface RoutinePeriod {
  id?: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_id: string | null;
  teacher_name: string;
  teacher_name_bn: string;
  room: string;
  is_break: boolean;
  break_label: string;
  break_label_bn: string;
}

const AdminClassRoutine = () => {
  const { language } = useLanguage();
  const qc = useQueryClient();
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', name_bn: '', class_id: '', academic_session_id: '', is_active: true });
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes-for-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('id, name, name_bn, division_id, divisions(name, name_bn)').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  // Fetch sessions
  const { data: sessions } = useQuery({
    queryKey: ['sessions-for-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('academic_sessions').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects-for-routine'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  // Fetch routines
  const { data: routines, isLoading } = useQuery({
    queryKey: ['class-routines'],
    queryFn: async () => {
      const { data } = await supabase.from('class_routines').select('*, classes(name, name_bn, divisions(name, name_bn)), academic_sessions(name, name_bn)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Fetch periods for selected routine
  const { data: periods } = useQuery({
    queryKey: ['routine-periods', selectedRoutineId],
    queryFn: async () => {
      if (!selectedRoutineId) return [];
      const { data } = await supabase.from('routine_periods').select('*, subjects(name, name_bn)').eq('routine_id', selectedRoutineId).order('day_of_week').order('period_number');
      return data || [];
    },
    enabled: !!selectedRoutineId,
  });

  // Create routine
  const createRoutine = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('class_routines').insert({
        name: form.name,
        name_bn: form.name_bn,
        class_id: form.class_id,
        academic_session_id: form.academic_session_id || null,
        is_active: form.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] });
      setShowCreate(false);
      setForm({ name: '', name_bn: '', class_id: '', academic_session_id: '', is_active: true });
      toast.success(language === 'bn' ? 'রুটিন তৈরি হয়েছে' : 'Routine created');
    },
    onError: () => toast.error(language === 'bn' ? 'সমস্যা হয়েছে' : 'Error'),
  });

  // Update routine
  const updateRoutine = useMutation({
    mutationFn: async () => {
      if (!editingRoutineId) return;
      const { error } = await supabase.from('class_routines').update({
        name: form.name,
        name_bn: form.name_bn,
        class_id: form.class_id,
        academic_session_id: form.academic_session_id || null,
        is_active: form.is_active,
      }).eq('id', editingRoutineId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] });
      setShowEdit(false);
      setEditingRoutineId(null);
      toast.success(language === 'bn' ? 'রুটিন আপডেট হয়েছে' : 'Routine updated');
    },
  });

  // Delete routine
  const deleteRoutine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('class_routines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] });
      if (selectedRoutineId) setSelectedRoutineId(null);
      toast.success(language === 'bn' ? 'রুটিন মুছে ফেলা হয়েছে' : 'Routine deleted');
    },
  });

  // Add/update period
  const savePeriod = useMutation({
    mutationFn: async (period: RoutinePeriod) => {
      if (period.id) {
        const { id, ...rest } = period;
        const { error } = await supabase.from('routine_periods').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('routine_periods').insert({ ...period, routine_id: selectedRoutineId! });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine-periods', selectedRoutineId] });
      toast.success(language === 'bn' ? 'পিরিয়ড সেভ হয়েছে' : 'Period saved');
    },
  });

  // Delete period
  const deletePeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routine_periods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine-periods', selectedRoutineId] });
    },
  });

  // Copy routine
  const copyRoutine = useMutation({
    mutationFn: async (routineId: string) => {
      const routine = routines?.find(r => r.id === routineId);
      if (!routine) return;
      const { data: newRoutine, error } = await supabase.from('class_routines').insert({
        name: routine.name + ' (Copy)',
        name_bn: routine.name_bn + ' (কপি)',
        class_id: routine.class_id,
        academic_session_id: routine.academic_session_id,
        is_active: false,
      }).select().single();
      if (error) throw error;
      // Copy periods
      const { data: srcPeriods } = await supabase.from('routine_periods').select('*').eq('routine_id', routineId);
      if (srcPeriods && srcPeriods.length > 0 && newRoutine) {
        const newPeriods = srcPeriods.map(({ id, routine_id, created_at, updated_at, ...rest }) => ({ ...rest, routine_id: newRoutine.id }));
        await supabase.from('routine_periods').insert(newPeriods);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] });
      toast.success(language === 'bn' ? 'রুটিন কপি হয়েছে' : 'Routine copied');
    },
  });

  const selectedRoutine = routines?.find(r => r.id === selectedRoutineId);

  // Period editor state
  const [periodForm, setPeriodForm] = useState<RoutinePeriod>({
    day_of_week: 0, period_number: 1, start_time: '08:00', end_time: '08:45',
    subject_id: null, teacher_name: '', teacher_name_bn: '', room: '',
    is_break: false, break_label: '', break_label_bn: '',
  });
  const [showPeriodDialog, setShowPeriodDialog] = useState(false);

  const openEditPeriod = (p: any) => {
    setPeriodForm({
      id: p.id, day_of_week: p.day_of_week, period_number: p.period_number,
      start_time: p.start_time, end_time: p.end_time, subject_id: p.subject_id,
      teacher_name: p.teacher_name || '', teacher_name_bn: p.teacher_name_bn || '',
      room: p.room || '', is_break: p.is_break || false,
      break_label: p.break_label || '', break_label_bn: p.break_label_bn || '',
    });
    setShowPeriodDialog(true);
  };

  const openNewPeriod = (day?: number) => {
    const dayPeriods = periods?.filter(p => p.day_of_week === (day ?? 0)) || [];
    const nextNum = dayPeriods.length > 0 ? Math.max(...dayPeriods.map(p => p.period_number)) + 1 : 1;
    const lastEnd = dayPeriods.length > 0 ? dayPeriods[dayPeriods.length - 1].end_time : '08:00';
    setPeriodForm({
      day_of_week: day ?? 0, period_number: nextNum, start_time: lastEnd, end_time: lastEnd,
      subject_id: null, teacher_name: '', teacher_name_bn: '', room: '',
      is_break: false, break_label: '', break_label_bn: '',
    });
    setShowPeriodDialog(true);
  };

  // Group periods by day
  const periodsByDay = DAYS.map(day => ({
    ...day,
    periods: (periods || []).filter(p => p.day_of_week === day.value).sort((a, b) => a.period_number - b.period_number),
  }));

  const RoutineFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
          <Input value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value }))} /></div>
        <div><Label>{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>{language === 'bn' ? 'শ্রেণী' : 'Class'}</Label>
          <Select value={form.class_id} onValueChange={v => setForm(f => ({ ...f, class_id: v }))}>
            <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'শ্রেণী নির্বাচন' : 'Select class'} /></SelectTrigger>
            <SelectContent>
              {classes?.map(c => {
                const div = c.divisions as any;
                return <SelectItem key={c.id} value={c.id}>{language === 'bn' ? `${div?.name_bn || ''} - ${c.name_bn}` : `${div?.name || ''} - ${c.name}`}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <div><Label>{language === 'bn' ? 'একাডেমিক সেশন' : 'Academic Session'}</Label>
          <Select value={form.academic_session_id} onValueChange={v => setForm(f => ({ ...f, academic_session_id: v }))}>
            <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সেশন নির্বাচন' : 'Select session'} /></SelectTrigger>
            <SelectContent>
              {sessions?.map(s => <SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn || s.name : s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
        <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
      </div>
    </div>
  );

  // ---- LIST VIEW ----
  if (!selectedRoutineId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold">{language === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'}</h1>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />{language === 'bn' ? 'নতুন রুটিন' : 'New Routine'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{language === 'bn' ? 'নতুন রুটিন তৈরি' : 'Create Routine'}</DialogTitle></DialogHeader>
              <RoutineFormFields />
              <Button onClick={() => createRoutine.mutate()} disabled={!form.name || !form.name_bn || !form.class_id}>
                {language === 'bn' ? 'তৈরি করুন' : 'Create'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <p className="text-muted-foreground">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p> : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[40px]">#</TableHead>
                      <TableHead className="min-w-[150px]">{language === 'bn' ? 'রুটিন নাম' : 'Routine Name'}</TableHead>
                      <TableHead className="min-w-[120px]">{language === 'bn' ? 'শ্রেণী' : 'Class'}</TableHead>
                      <TableHead className="min-w-[120px]">{language === 'bn' ? 'সেশন' : 'Session'}</TableHead>
                      <TableHead className="min-w-[80px]">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead className="w-28 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routines?.map((r, idx) => {
                      const cls = r.classes as any;
                      const div = cls?.divisions as any;
                      const sess = r.academic_sessions as any;
                      return (
                        <TableRow key={r.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedRoutineId(r.id)}>
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{language === 'bn' ? r.name_bn : r.name}</TableCell>
                          <TableCell className="text-sm">{language === 'bn' ? `${div?.name_bn || ''} - ${cls?.name_bn || ''}` : `${div?.name || ''} - ${cls?.name || ''}`}</TableCell>
                          <TableCell className="text-sm">{sess ? (language === 'bn' ? sess.name_bn || sess.name : sess.name) : '-'}</TableCell>
                          <TableCell>
                            <Badge variant={r.is_active ? 'default' : 'secondary'}>
                              {r.is_active ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1 justify-end">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedRoutineId(r.id)}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyRoutine.mutate(r.id)}><Copy className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                setForm({ name: r.name, name_bn: r.name_bn, class_id: r.class_id, academic_session_id: r.academic_session_id || '', is_active: r.is_active ?? true });
                                setEditingRoutineId(r.id);
                                setShowEdit(true);
                              }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                                if (confirm(language === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete?')) deleteRoutine.mutate(r.id);
                              }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {routines?.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'bn' ? 'কোনো রুটিন নেই' : 'No routines'}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit dialog */}
        <Dialog open={showEdit} onOpenChange={v => { setShowEdit(v); if (!v) setEditingRoutineId(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{language === 'bn' ? 'রুটিন সম্পাদনা' : 'Edit Routine'}</DialogTitle></DialogHeader>
            <RoutineFormFields />
            <Button onClick={() => updateRoutine.mutate()} disabled={!form.name || !form.name_bn || !form.class_id}>
              {language === 'bn' ? 'আপডেট করুন' : 'Update'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---- DETAIL VIEW (Routine Builder) ----
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setSelectedRoutineId(null)}>
          <span className="mr-1">←</span> {language === 'bn' ? 'পেছনে যান' : 'Go Back'}
        </Button>
        <h1 className="text-lg font-bold flex-1 min-w-0 truncate">
          {language === 'bn' ? selectedRoutine?.name_bn : selectedRoutine?.name}
        </h1>
      </div>

      {/* Period add dialog */}
      <Dialog open={showPeriodDialog} onOpenChange={setShowPeriodDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{periodForm.id ? (language === 'bn' ? 'পিরিয়ড সম্পাদনা' : 'Edit Period') : (language === 'bn' ? 'নতুন পিরিয়ড' : 'New Period')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{language === 'bn' ? 'বার' : 'Day'}</Label>
                <Select value={String(periodForm.day_of_week)} onValueChange={v => setPeriodForm(f => ({ ...f, day_of_week: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>{language === 'bn' ? d.label_bn : d.label_en}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'bn' ? 'পিরিয়ড নম্বর' : 'Period #'}</Label>
                <Input type="number" min={1} value={periodForm.period_number} onChange={e => setPeriodForm(f => ({ ...f, period_number: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{language === 'bn' ? 'শুরু' : 'Start'}</Label>
                <Input type="time" value={periodForm.start_time} onChange={e => setPeriodForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div><Label>{language === 'bn' ? 'শেষ' : 'End'}</Label>
                <Input type="time" value={periodForm.end_time} onChange={e => setPeriodForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={periodForm.is_break} onCheckedChange={v => setPeriodForm(f => ({ ...f, is_break: v }))} />
              <Label>{language === 'bn' ? 'বিরতি/টিফিন' : 'Break/Tiffin'}</Label>
            </div>
            {periodForm.is_break ? (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{language === 'bn' ? 'বিরতি লেবেল (বাংলা)' : 'Break Label (BN)'}</Label>
                  <Input value={periodForm.break_label_bn} onChange={e => setPeriodForm(f => ({ ...f, break_label_bn: e.target.value }))} placeholder="টিফিন" />
                </div>
                <div><Label>{language === 'bn' ? 'বিরতি লেবেল (ইংরেজি)' : 'Break Label (EN)'}</Label>
                  <Input value={periodForm.break_label} onChange={e => setPeriodForm(f => ({ ...f, break_label: e.target.value }))} placeholder="Tiffin" />
                </div>
              </div>
            ) : (
              <>
                <div><Label>{language === 'bn' ? 'বিষয়' : 'Subject'}</Label>
                  <Select value={periodForm.subject_id || ''} onValueChange={v => setPeriodForm(f => ({ ...f, subject_id: v || null }))}>
                    <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'বিষয় নির্বাচন' : 'Select subject'} /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn : s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{language === 'bn' ? 'শিক্ষক (বাংলা)' : 'Teacher (BN)'}</Label>
                    <Input value={periodForm.teacher_name_bn} onChange={e => setPeriodForm(f => ({ ...f, teacher_name_bn: e.target.value }))} /></div>
                  <div><Label>{language === 'bn' ? 'শিক্ষক (ইংরেজি)' : 'Teacher (EN)'}</Label>
                    <Input value={periodForm.teacher_name} onChange={e => setPeriodForm(f => ({ ...f, teacher_name: e.target.value }))} /></div>
                </div>
                <div><Label>{language === 'bn' ? 'রুম' : 'Room'}</Label>
                  <Input value={periodForm.room} onChange={e => setPeriodForm(f => ({ ...f, room: e.target.value }))} /></div>
              </>
            )}
            <Button className="w-full" onClick={() => {
              savePeriod.mutate(periodForm);
              setShowPeriodDialog(false);
            }}>
              {periodForm.id ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timetable grid view */}
      {(() => {
        // Collect unique period numbers across all days
        const allPeriodNums = [...new Set((periods || []).map(p => p.period_number))].sort((a, b) => a - b);
        if (allPeriodNums.length === 0) {
          return <p className="text-center text-muted-foreground py-8">{language === 'bn' ? 'কোনো পিরিয়ড নেই। নিচের বাটন থেকে পিরিয়ড যোগ করুন।' : 'No periods yet. Add periods using buttons below.'}</p>;
        }
        return (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[90px] border-r">
                        {language === 'bn' ? 'বার' : 'Day'}
                      </TableHead>
                      {allPeriodNums.map(num => {
                        // Get time from any day's period with this number
                        const sample = (periods || []).find(p => p.period_number === num);
                        const isBreak = sample?.is_break;
                        return (
                          <TableHead key={num} className={`text-center min-w-[100px] ${isBreak ? 'bg-muted/50' : ''}`}>
                            <div className="text-xs font-semibold">
                              {isBreak ? (language === 'bn' ? (sample?.break_label_bn || 'বিরতি') : (sample?.break_label || 'Break')) : `${language === 'bn' ? 'পিরিয়ড' : 'P'} ${num}`}
                            </div>
                            {sample && <div className="text-[10px] text-muted-foreground">{sample.start_time?.slice(0, 5)}-{sample.end_time?.slice(0, 5)}</div>}
                          </TableHead>
                        );
                      })}
                      <TableHead className="w-10">
                        <Plus className="h-3 w-3" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map(day => {
                      const dayPeriods = (periods || []).filter(p => p.day_of_week === day.value);
                      return (
                        <TableRow key={day.value}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r font-medium text-xs">
                            {language === 'bn' ? day.label_bn : day.label_en}
                          </TableCell>
                          {allPeriodNums.map(num => {
                            const p = dayPeriods.find(dp => dp.period_number === num);
                            const subj = p?.subjects as any;
                            if (!p) {
                              return (
                                <TableCell key={num} className="text-center">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => {
                                    const sample = (periods || []).find(sp => sp.period_number === num);
                                    setPeriodForm({
                                      day_of_week: day.value, period_number: num,
                                      start_time: sample?.start_time || '08:00', end_time: sample?.end_time || '08:45',
                                      subject_id: null, teacher_name: '', teacher_name_bn: '', room: '',
                                      is_break: false, break_label: '', break_label_bn: '',
                                    });
                                    setShowPeriodDialog(true);
                                  }}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              );
                            }
                            return (
                              <TableCell key={num} className={`text-center cursor-pointer hover:bg-accent/50 transition-colors ${p.is_break ? 'bg-muted/30' : ''}`} onClick={() => openEditPeriod(p)}>
                                {p.is_break ? (
                                  <Badge variant="outline" className="text-[10px]">{language === 'bn' ? (p.break_label_bn || 'বিরতি') : (p.break_label || 'Break')}</Badge>
                                ) : (
                                  <div>
                                    <div className="text-xs font-medium">{subj ? (language === 'bn' ? subj.name_bn : subj.name) : '-'}</div>
                                    {(p.teacher_name_bn || p.teacher_name) && (
                                      <div className="text-[10px] text-muted-foreground truncate max-w-[80px] mx-auto">{language === 'bn' ? p.teacher_name_bn : p.teacher_name}</div>
                                    )}
                                    {p.room && <div className="text-[10px] text-muted-foreground">{p.room}</div>}
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => openNewPeriod(day.value)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
};

export default AdminClassRoutine;
