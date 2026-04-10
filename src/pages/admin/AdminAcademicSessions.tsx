import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, CalendarDays, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApprovalCheck } from '@/hooks/useApprovalCheck';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const AdminAcademicSessions = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { checkApproval } = useApprovalCheck('/admin/academic-sessions', 'academic_sessions');
  const { canAddItem, canEditItem, canDeleteItem } = usePagePermissions('/admin/academic-sessions');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const bn = language === 'bn';

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error(bn ? 'ইংরেজি নাম দিন' : 'Enter English name');
      if (!startDate) throw new Error(bn ? 'শুরুর তারিখ দিন' : 'Select start date');
      if (!endDate) throw new Error(bn ? 'শেষের তারিখ দিন' : 'Select end date');
      if (endDate <= startDate) throw new Error(bn ? 'শেষের তারিখ শুরুর পরে হতে হবে' : 'End date must be after start date');

      const payload = {
        name: name.trim(),
        name_bn: nameBn.trim(),
        is_active: isActive,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      } as any;

      if (editId) {
        if (await checkApproval('edit', payload, editId, `সেশন সম্পাদনা: ${name.trim()}`)) return;
        const { error } = await supabase.from('academic_sessions').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        if (await checkApproval('add', payload, undefined, `সেশন যোগ: ${name.trim()}`)) return;
        const { error } = await supabase.from('academic_sessions').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success(bn ? 'সংরক্ষিত হয়েছে' : 'Saved successfully');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const session = sessions.find((s: any) => s.id === id);
      if (await checkApproval('delete', { id, name: session?.name }, id, `সেশন মুছুন: ${session?.name}`)) return;
      const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
      toast.success(bn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (await checkApproval('edit', { id, is_active: active }, id, `সেশন ${active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`)) return;
      const { error } = await supabase.from('academic_sessions').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-sessions'] }),
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditId(null);
    setName('');
    setNameBn('');
    setIsActive(true);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const openEdit = (session: any) => {
    setEditId(session.id);
    setName(session.name);
    setNameBn(session.name_bn || '');
    setIsActive(session.is_active);
    setStartDate(session.start_date ? new Date(session.start_date + 'T00:00:00') : undefined);
    setEndDate(session.end_date ? new Date(session.end_date + 'T00:00:00') : undefined);
    setDialogOpen(true);
  };

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy');
    } catch { return '-'; }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            {bn ? 'একাডেমিক সেশন' : 'Academic Sessions'}
          </h1>
          {canAddItem && <Button className="btn-primary-gradient" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            {bn ? 'নতুন সেশন' : 'New Session'}
          </Button>}
        </div>

        <div className="card-elevated">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {bn ? 'কোনো সেশন নেই। নতুন সেশন যোগ করুন।' : 'No sessions yet. Add a new session.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bn ? 'বাংলা নাম' : 'Bengali Name'}</TableHead>
                  <TableHead>{bn ? 'ইংরেজি নাম' : 'English Name'}</TableHead>
                  <TableHead>{bn ? 'শুরু' : 'Start'}</TableHead>
                  <TableHead>{bn ? 'শেষ' : 'End'}</TableHead>
                  <TableHead className="text-center">{bn ? 'সক্রিয়' : 'Active'}</TableHead>
                  <TableHead className="text-right">{bn ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-foreground">{s.name_bn || '-'}</TableCell>
                    <TableCell className="text-foreground">{s.name}</TableCell>
                    <TableCell className="text-foreground">{formatDateDisplay(s.start_date)}</TableCell>
                    <TableCell className="text-foreground">{formatDateDisplay(s.end_date)}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={s.is_active}
                        disabled={!canEditItem}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: s.id, active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditItem && <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="w-4 h-4" />
                        </Button>}
                        {canDeleteItem && <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{bn ? 'নিশ্চিত করুন' : 'Confirm'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {bn ? `"${s.name}" সেশনটি মুছে ফেলতে চান?` : `Delete session "${s.name}"?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{bn ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {bn ? 'মুছুন' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editId
                  ? (bn ? 'সেশন সম্পাদনা' : 'Edit Session')
                  : (bn ? 'নতুন সেশন তৈরি' : 'Create New Session')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {bn ? 'বাংলা নাম' : 'Bengali Name'}
                </label>
                <Input
                  placeholder={bn ? 'যেমন: ২০২৫, ২০২৫-২৬' : 'e.g. ২০২৫, ২০২৫-২৬'}
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {bn ? 'ইংরেজি নাম' : 'English Name'} *
                </label>
                <Input
                  placeholder={bn ? 'যেমন: 2025, 2025-26' : 'e.g. 2025, 2025-26'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {bn ? 'শুরুর তারিখ' : 'Start Date'} *
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy') : (bn ? 'তারিখ নির্বাচন' : 'Pick date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {bn ? 'শেষের তারিখ' : 'End Date'} *
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy') : (bn ? 'তারিখ নির্বাচন' : 'Pick date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate ? date <= startDate : false}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-foreground">{bn ? 'সক্রিয়' : 'Active'}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>{bn ? 'বাতিল' : 'Cancel'}</Button>
              <Button className="btn-primary-gradient" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {bn ? 'সংরক্ষণ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAcademicSessions;
