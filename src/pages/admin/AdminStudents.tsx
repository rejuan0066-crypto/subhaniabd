import AdminLayout from '@/components/AdminLayout';
import TabContainer from '@/components/TabContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, Loader2, CheckCircle, Eye, XCircle, Clock, Pencil, Filter, BookOpen, Banknote, BadgePercent, CalendarCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useApprovalCheck } from '@/hooks/useApprovalCheck';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AdmissionForm from '@/components/admission/AdmissionForm';

const AdminStudents = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { checkApproval } = useApprovalCheck('/admin/students', 'students');
  const { canAddItem, canEditItem, canDeleteItem } = usePagePermissions('/admin/students');
  const bn = language === 'bn';
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [filterDivisionId, setFilterDivisionId] = useState('all');
  const [filterSessionId, setFilterSessionId] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');

  // Realtime subscription for auto-refresh
  useEffect(() => {
    const channel = supabase
      .channel('students-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academic-sessions-active'],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('divisions').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*, divisions(name, name_bn)').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Filter classes by selected division
  const filteredClasses = filterDivisionId !== 'all'
    ? classes.filter((c: any) => c.division_id === filterDivisionId)
    : classes;

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*, divisions(name, name_bn)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (await checkApproval('edit', { id, approval_status: status }, id, `ছাত্র স্ট্যাটাস: ${status}`)) return;
      const { error } = await supabase.from('students').update({ approval_status: status, status: status === 'approved' ? 'active' : status === 'rejected' ? 'inactive' : 'active' } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(bn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    },
    onError: () => toast.error('Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const student = students.find((s: any) => s.id === id);
      if (await checkApproval('delete', { id, name_bn: student?.name_bn, student_id: student?.student_id }, id, `ছাত্র মুছুন: ${student?.name_bn}`)) return;
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(bn ? 'ছাত্র মুছে ফেলা হয়েছে' : 'Student deleted');
    },
    onError: () => toast.error('Error'),
  });

  const filtered = students.filter((s: any) => {
    // Division filter
    if (filterDivisionId !== 'all') {
      if (s.division_id !== filterDivisionId) return false;
    }
    // Session filter
    if (filterSessionId !== 'all') {
      if (s.session_id !== filterSessionId) return false;
    }
    // Class filter
    if (filterClassId !== 'all') {
      if (s.class_id !== filterClassId) return false;
    }
    // Approval status filter
    if (filterApproval !== 'all') {
      const status = s.approval_status || 'pending';
      if (status !== filterApproval) return false;
    }
    // Text search
    if (search) {
      const q = search.toLowerCase();
      return s.name_bn?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.roll_number?.toLowerCase().includes(q) || s.name_en?.toLowerCase().includes(q);
    }
    return true;
  });

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success"><CheckCircle className="w-3 h-3" />{bn ? 'অনুমোদিত' : 'Approved'}</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"><XCircle className="w-3 h-3" />{bn ? 'প্রত্যাখ্যাত' : 'Rejected'}</span>;
      default: return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning"><Clock className="w-3 h-3" />{bn ? 'অপেক্ষমাণ' : 'Pending'}</span>;
    }
  };

  const getClassName = (classId: string | null) => {
    if (!classId) return '-';
    const cls = classes.find((c: any) => c.id === classId);
    return cls ? (bn ? cls.name_bn : cls.name) : '-';
  };

  const getSessionName = (sessionId: string | null, fallback: string | null) => {
    if (sessionId) {
      const session = academicSessions.find((s: any) => s.id === sessionId);
      if (session) return bn ? (session.name_bn || session.name) : session.name;
    }
    return fallback || '-';
  };

  const studentListContent = (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('students')}</h1>
            <p className="text-sm text-muted-foreground">{bn ? `মোট ${filtered.length} জন ছাত্র` : `Total ${filtered.length} students`}</p>
          </div>
          {canAddItem && (
            <Button onClick={() => setShowAdd(true)} className="btn-primary-gradient flex items-center gap-2">
              <Plus className="w-4 h-4" /> {bn ? 'নতুন ভর্তি' : 'New Admission'}
            </Button>
          )}
        </div>

        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder={bn ? 'নাম, আইডি বা রোল দিয়ে খুঁজুন...' : 'Search by name, ID or roll...'} className="pl-10 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterDivisionId} onValueChange={(v) => { setFilterDivisionId(v); setFilterClassId('all'); }}>
              <SelectTrigger className="bg-background w-full sm:w-40">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder={bn ? 'বিভাগ' : 'Division'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bn ? 'সকল বিভাগ' : 'All Divisions'}</SelectItem>
                {divisions.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{bn ? d.name_bn : d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSessionId} onValueChange={setFilterSessionId}>
              <SelectTrigger className="bg-background w-full sm:w-40">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder={bn ? 'সেশন' : 'Session'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bn ? 'সকল সেশন' : 'All Sessions'}</SelectItem>
                {academicSessions.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{bn ? (s.name_bn || s.name) : s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterClassId} onValueChange={setFilterClassId}>
              <SelectTrigger className="bg-background w-full sm:w-40">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder={bn ? 'শ্রেণী' : 'Class'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bn ? 'সকল শ্রেণী' : 'All Classes'}</SelectItem>
                {filteredClasses.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{bn ? c.name_bn : c.name}{c.divisions ? ` (${bn ? c.divisions.name_bn : c.divisions.name})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterApproval} onValueChange={setFilterApproval}>
              <SelectTrigger className="bg-background w-full sm:w-40">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder={bn ? 'স্ট্যাটাস' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                <SelectItem value="pending">{bn ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                <SelectItem value="approved">{bn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{bn ? 'প্রত্যাখ্যাত' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'নাম' : 'Name'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'আইডি' : 'ID'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'রোল' : 'Roll'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'বিভাগ' : 'Division'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'সেশন' : 'Session'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'শ্রেণী' : 'Class'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অনুমোদন' : 'Approval'}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={s.photo_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {s.name_bn?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-foreground text-sm block">
                              {s.name_bn}
                              {s.is_free && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/20">{bn ? 'বিনা বেতন' : 'Free'}</span>}
                            </span>
                            {s.name_en && <span className="text-xs text-muted-foreground">{s.name_en}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.student_id}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.roll_number || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{bn ? s.divisions?.name_bn : s.divisions?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{getSessionName(s.session_id, s.admission_session)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{getClassName(s.class_id)}</td>
                      <td className="px-4 py-3">{getApprovalBadge(s.approval_status || 'pending')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setShowDetail(s)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></button>
                          {canEditItem && (
                            <button onClick={() => { setEditStudent(s); setShowAdd(true); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title={bn ? 'সম্পাদনা' : 'Edit'}><Pencil className="w-4 h-4" /></button>
                          )}
                          {canEditItem && (s.approval_status !== 'approved') && (
                            <button onClick={() => statusMutation.mutate({ id: s.id, status: 'approved' })} className="p-2 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success" title={bn ? 'অনুমোদন' : 'Approve'}><CheckCircle className="w-4 h-4" /></button>
                          )}
                          {canEditItem && (s.approval_status !== 'rejected') && (
                            <button onClick={() => statusMutation.mutate({ id: s.id, status: 'rejected' })} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title={bn ? 'প্রত্যাখ্যান' : 'Reject'}><XCircle className="w-4 h-4" /></button>
                          )}
                          {canEditItem && (s.approval_status === 'rejected') && (
                            <button onClick={() => statusMutation.mutate({ id: s.id, status: 'pending' })} className="p-2 rounded-lg hover:bg-warning/10 text-muted-foreground hover:text-warning" title={bn ? 'অপেক্ষমাণে ফেরত' : 'Back to Pending'}><Clock className="w-4 h-4" /></button>
                          )}
                          {canDeleteItem && (
                            <button onClick={() => deleteMutation.mutate(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">{bn ? 'কোনো ছাত্র পাওয়া যায়নি' : 'No students found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Dynamic Admission Form */}
      <AdmissionForm open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) setEditStudent(null); }} editStudent={editStudent} />

      {/* Detail View Dialog */}
      <Dialog open={!!showDetail} onOpenChange={o => { if (!o) setShowDetail(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bn ? 'ছাত্রের বিস্তারিত' : 'Student Details'}</DialogTitle></DialogHeader>
          {showDetail && <StudentDetailContent student={showDetail} bn={bn} getApprovalBadge={getApprovalBadge} getSessionName={getSessionName} getClassName={getClassName} setEditStudent={setEditStudent} setShowDetail={setShowDetail} setShowAdd={setShowAdd} statusMutation={statusMutation} canEditItem={canEditItem} />}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <AdminLayout>
      <TabContainer
        tabs={[
          {
            id: 'list',
            label: bn ? 'ছাত্র তালিকা' : 'Student List',
            icon: Eye,
            content: studentListContent,
          },
          ...(canAddItem ? [{
            id: 'admission',
            label: bn ? 'নতুন ভর্তি' : 'New Admission',
            icon: Plus,
            content: (
              <div className="space-y-4">
                <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" />
                  {bn ? 'নতুন ভর্তি ফর্ম' : 'New Admission Form'}
                </h1>
                <p className="text-muted-foreground text-sm">{bn ? 'নতুন ছাত্র ভর্তি করতে নিচের বাটনে ক্লিক করুন' : 'Click below to open the admission form'}</p>
                <Button onClick={() => setShowAdd(true)} className="btn-primary-gradient">
                  <Plus className="w-4 h-4 mr-2" /> {bn ? 'ভর্তি ফর্ম খুলুন' : 'Open Admission Form'}
                </Button>
                <AdmissionForm open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) setEditStudent(null); }} editStudent={editStudent} />
              </div>
            ),
          }] : []),
        ]}
        paramKey="tab"
      />
    </AdminLayout>
  );
};

// Student detail with library book history
const StudentDetailContent = ({ student, bn, getApprovalBadge, getSessionName, getClassName, setEditStudent, setShowDetail, setShowAdd, statusMutation, canEditItem }: any) => {
  const { data: libraryHistory = [], isLoading: libLoading } = useQuery({
    queryKey: ['student-library-history', student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('library_issuances')
        .select('*, library_books(title, title_bn)')
        .eq('student_id', student.id)
        .order('issued_date', { ascending: false });
      return data || [];
    },
  });

  const { data: feePayments = [], isLoading: feeLoading } = useQuery({
    queryKey: ['student-fee-payments', student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('fee_payments')
        .select('*, fee_types(name, name_bn, amount)')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: feeWaivers = [], isLoading: waiverLoading } = useQuery({
    queryKey: ['student-fee-waivers', student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('fee_waivers')
        .select('*, fee_types(name, name_bn, amount)')
        .eq('student_id', student.id)
        .eq('is_active', true);
      return data || [];
    },
  });

  // Applicable fee types for this student based on division/class
  const { data: applicableFeeTypes = [], isLoading: feeTypesLoading } = useQuery({
    queryKey: ['student-applicable-fee-types', student.division_id, student.class_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('fee_types')
        .select('*, divisions(name_bn), classes(name_bn)')
        .eq('is_active', true)
        .order('fee_category')
        .order('name_bn');
      if (!data) return [];
      // Filter: fee type applies if no division/class restriction, or matches student's
      return data.filter((ft: any) => {
        if (ft.division_id && ft.division_id !== student.division_id) return false;
        if (ft.class_id && ft.class_id !== student.class_id) return false;
        return true;
      });
    },
  });

  const totalPaid = feePayments.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.paid_amount || p.amount || 0), 0);

  // Calculate total due from applicable fee types minus paid amounts
  const totalApplicable = applicableFeeTypes.reduce((sum: number, ft: any) => {
    const waiver = feeWaivers.find((w: any) => w.fee_type_id === ft.id);
    const isFreeMonthly = student.is_free && ft.fee_category === 'monthly';
    const waiverPercent = isFreeMonthly ? 100 : (waiver ? waiver.waiver_percent : 0);
    const netAmount = ft.amount - Math.round(ft.amount * waiverPercent / 100);
    return sum + netAmount;
  }, 0);
  const totalDue = Math.max(0, totalApplicable - totalPaid);


  const getLibStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return <Badge className="bg-blue-500/10 text-blue-600">{bn ? 'ইস্যু' : 'Issued'}</Badge>;
      case 'returned': return <Badge className="bg-emerald-500/10 text-emerald-600">{bn ? 'জমা দিয়েছে ✓' : 'Returned ✓'}</Badge>;
      case 'lost': return <Badge variant="destructive">{bn ? 'হারিয়েছে' : 'Lost'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-600">{bn ? 'পরিশোধিত ✓' : 'Paid ✓'}</Badge>;
      case 'unpaid': return <Badge className="bg-destructive/10 text-destructive">{bn ? 'বকেয়া' : 'Unpaid'}</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-600">{bn ? 'অপেক্ষমাণ' : 'Pending'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start gap-4">
        {student.photo_url ? (
          <img src={student.photo_url} className="w-24 h-28 rounded-lg object-cover border" alt="" />
        ) : (
          <div className="w-24 h-28 rounded-lg bg-secondary flex items-center justify-center text-3xl font-bold text-muted-foreground">{student.name_bn?.[0]}</div>
        )}
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold text-foreground">{student.name_bn}</h3>
          {student.name_en && <p className="text-sm text-muted-foreground">{student.name_en}</p>}
          <p className="text-sm">{bn ? 'আইডি: ' : 'ID: '}{student.student_id}</p>
          <p className="text-sm">{bn ? 'রোল: ' : 'Roll: '}{student.roll_number || '-'}</p>
          <div className="mt-2">{getApprovalBadge(student.approval_status || 'pending')}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-muted-foreground">{bn ? 'পিতা: ' : 'Father: '}</span>{student.father_name || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'মাতা: ' : 'Mother: '}</span>{student.mother_name || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'জন্ম তারিখ: ' : 'DOB: '}</span>{student.date_of_birth || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'লিঙ্গ: ' : 'Gender: '}</span>{student.gender || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'ফোন: ' : 'Phone: '}</span>{student.phone || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'অভিভাবক ফোন: ' : 'Guardian: '}</span>{student.guardian_phone || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'জন্ম নিবন্ধন: ' : 'Birth Reg: '}</span>{student.birth_reg_no || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'ধর্ম: ' : 'Religion: '}</span>{student.religion || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'সেশন: ' : 'Session: '}</span>{getSessionName(student.session_id, student.admission_session)}</div>
        <div><span className="text-muted-foreground">{bn ? 'শ্রেণী: ' : 'Class: '}</span>{getClassName(student.class_id)}</div>
        <div><span className="text-muted-foreground">{bn ? 'আবাসিক: ' : 'Residence: '}</span>{student.residence_type || '-'}</div>
        <div><span className="text-muted-foreground">{bn ? 'ক্যাটাগরি: ' : 'Category: '}</span>{student.student_category === 'orphan' ? (bn ? 'এতিম' : 'Orphan') : student.student_category === 'poor' ? (bn ? 'গরীব' : 'Poor') : student.student_category === 'teacher_child' ? (bn ? 'শিক্ষক সন্তান' : "Teacher's Child") : (bn ? 'সাধারণ' : 'General')}</div>
        {student.is_free && <div><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">{bn ? '✓ বিনা বেতন' : '✓ Free Student'}</span></div>}
      </div>

      {/* Applicable Fee Types for this student */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          {bn ? 'প্রযোজ্য ফি ধরন' : 'Applicable Fee Types'}
        </h4>
        {feeTypesLoading ? (
          <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : applicableFeeTypes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{bn ? 'কোনো প্রযোজ্য ফি ধরন নেই' : 'No applicable fee types'}</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {applicableFeeTypes.map((ft: any) => {
              const waiver = feeWaivers.find((w: any) => w.fee_type_id === ft.id);
              const isFreeMonthly = student.is_free && ft.fee_category === 'monthly';
              const waiverPercent = isFreeMonthly ? 100 : (waiver ? waiver.waiver_percent : 0);
              const discountAmount = Math.round(ft.amount * waiverPercent / 100);
              const netAmount = ft.amount - discountAmount;
              // Check if already paid
              const payment = feePayments.find((p: any) => p.fee_type_id === ft.id && (p.status === 'paid' || p.status === 'pending'));
              const categoryLabel = ft.fee_category === 'monthly' ? (bn ? 'মাসিক' : 'Monthly') : ft.fee_category === 'admission' ? (bn ? 'ভর্তি' : 'Admission') : ft.fee_category === 'exam' ? (bn ? 'পরীক্ষা' : 'Exam') : ft.fee_category;

              return (
                <div key={ft.id} className="p-2.5 rounded-lg bg-muted/50 border border-border text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{bn ? ft.name_bn : ft.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabel}
                        {ft.classes?.name_bn && ` • ${ft.classes.name_bn}`}
                        {ft.divisions?.name_bn && ` • ${ft.divisions.name_bn}`}
                      </p>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      {waiverPercent > 0 ? (
                        <div>
                          <p className="text-xs line-through text-muted-foreground">৳{ft.amount}</p>
                          <p className="font-bold text-primary">৳{netAmount}</p>
                          <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">{waiverPercent}% {bn ? 'ছাড়' : 'off'}</Badge>
                        </div>
                      ) : (
                        <p className="font-bold text-foreground">৳{ft.amount}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5">
                    {payment?.status === 'paid' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">{bn ? '✓ পরিশোধিত' : '✓ Paid'}</Badge>
                    ) : payment?.status === 'pending' ? (
                      <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">{bn ? '⏳ পেন্ডিং' : '⏳ Pending'}</Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive text-[10px]">{bn ? '⏳ পেন্ডিং' : '⏳ Pending'}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fee Payment Summary */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Banknote className="w-4 h-4 text-primary" />
          {bn ? 'ফি পরিশোধের ইতিহাস' : 'Fee Payment History'}
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">{bn ? 'মোট পরিশোধিত' : 'Total Paid'}</p>
            <p className="text-lg font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">{bn ? 'মোট বকেয়া' : 'Total Due'}</p>
            <p className="text-lg font-bold text-destructive">৳{totalDue.toLocaleString()}</p>
          </div>
        </div>
        {feeLoading ? (
          <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : feePayments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{bn ? 'কোনো ফি পেমেন্ট রেকর্ড নেই' : 'No fee payment records'}</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {feePayments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bn ? (p.fee_types?.name_bn || p.fee_types?.name) : p.fee_types?.name || '-'}</p>
                  <p className="text-xs text-muted-foreground">
                    ৳{(p.paid_amount || p.amount || 0).toLocaleString()}
                    {p.receipt_number && <> • {bn ? 'রসিদ: ' : 'Receipt: '}{p.receipt_number}</>}
                  </p>
                </div>
                <div className="ml-2 shrink-0">{getFeeStatusBadge(p.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fee Waivers / Discounts */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <BadgePercent className="w-4 h-4 text-primary" />
          {bn ? 'ফি ছাড় / ডিসকাউন্ট' : 'Fee Waivers / Discounts'}
        </h4>
        {waiverLoading ? (
          <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : feeWaivers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{bn ? 'কোনো ছাড় নেই' : 'No waivers'}</p>
        ) : (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {feeWaivers.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bn ? (w.fee_types?.name_bn || w.fee_types?.name) : w.fee_types?.name || '-'}</p>
                  {w.reason && <p className="text-xs text-muted-foreground truncate">{w.reason}</p>}
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 ml-2 shrink-0">{w.waiver_percent}% {bn ? 'ছাড়' : 'off'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Library Book History */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          {bn ? 'লাইব্রেরি বই ইতিহাস' : 'Library Book History'}
        </h4>
        {libLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : libraryHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{bn ? 'কোনো বই ইস্যু/জমার রেকর্ড নেই' : 'No library records'}</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {libraryHistory.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bn ? (item.library_books?.title_bn || item.library_books?.title) : item.library_books?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {bn ? 'ইস্যু: ' : 'Issued: '}{item.issued_date}
                    {item.returned_date && <> • {bn ? 'জমা: ' : 'Returned: '}{item.returned_date}</>}
                  </p>
                </div>
                <div className="ml-2 shrink-0">{getLibStatusBadge(item.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => { setEditStudent(student); setShowDetail(null); setShowAdd(true); }} className="flex-1">
          <Pencil className="w-4 h-4 mr-2" /> {bn ? 'সম্পাদনা' : 'Edit'}
        </Button>
        {student.approval_status !== 'approved' && (
          <Button onClick={() => { statusMutation.mutate({ id: student.id, status: 'approved' }); setShowDetail(null); }} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
            <CheckCircle className="w-4 h-4 mr-2" /> {bn ? 'অনুমোদন' : 'Approve'}
          </Button>
        )}
        {student.approval_status !== 'rejected' && (
          <Button variant="destructive" onClick={() => { statusMutation.mutate({ id: student.id, status: 'rejected' }); setShowDetail(null); }} className="flex-1">
            <XCircle className="w-4 h-4 mr-2" /> {bn ? 'প্রত্যাখ্যান' : 'Reject'}
          </Button>
        )}
        {student.approval_status === 'rejected' && (
          <Button variant="outline" onClick={() => { statusMutation.mutate({ id: student.id, status: 'pending' }); setShowDetail(null); }} className="flex-1">
            <Clock className="w-4 h-4 mr-2" /> {bn ? 'অপেক্ষমাণে ফেরত' : 'Back to Pending'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
