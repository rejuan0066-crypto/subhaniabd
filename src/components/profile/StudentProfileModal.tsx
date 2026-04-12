import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  User, Hash, Calendar, Heart, Phone, Mail, MapPin, BookOpen, Banknote,
  BadgePercent, FileText, Pencil, CheckCircle, XCircle, Clock, Loader2,
  Plus, Trash2, GraduationCap, Users, Home, CreditCard, ClipboardList,
  Fingerprint, School, Building2, Library, CalendarCheck, BarChart3, Award, TrendingUp
} from 'lucide-react';
import ProfileInfoItem from './ProfileInfoItem';
import ProfileSectionCard from './ProfileSectionCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StudentProfileModalProps {
  student: any;
  bn: boolean;
  getApprovalBadge: (status: string) => any;
  getSessionName: (id: string, fallback?: string) => string;
  getClassName: (id: string) => string;
  setEditStudent: (s: any) => void;
  setShowDetail: (s: any) => void;
  setShowAdd: (v: boolean) => void;
  statusMutation: any;
  canEditItem: boolean;
}

const StudentProfileModal = ({
  student, bn, getApprovalBadge, getSessionName, getClassName,
  setEditStudent, setShowDetail, setShowAdd, statusMutation, canEditItem
}: StudentProfileModalProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'academic' | 'others'>('profile');
  const [showWaiverDialog, setShowWaiverDialog] = useState(false);
  const [waiverForm, setWaiverForm] = useState({ fee_type_id: '', waiver_amount: '', reason: '' });

  const { data: libraryHistory = [], isLoading: libLoading } = useQuery({
    queryKey: ['student-library-history', student.id],
    queryFn: async () => {
      const { data } = await supabase.from('library_issuances').select('*, library_books(title, title_bn)').eq('student_id', student.id).order('issued_date', { ascending: false });
      return data || [];
    },
  });

  const { data: feePayments = [], isLoading: feeLoading } = useQuery({
    queryKey: ['student-fee-payments', student.id],
    queryFn: async () => {
      const { data } = await supabase.from('fee_payments').select('*, fee_types(name, name_bn, amount)').eq('student_id', student.id).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: feeWaivers = [], isLoading: waiverLoading } = useQuery({
    queryKey: ['student-fee-waivers', student.id],
    queryFn: async () => {
      const { data } = await supabase.from('fee_waivers').select('*, fee_types(name, name_bn, amount)').eq('student_id', student.id).eq('is_active', true);
      return data || [];
    },
  });

  const { data: applicableFeeTypes = [], isLoading: feeTypesLoading } = useQuery({
    queryKey: ['student-applicable-fee-types', student.division_id, student.class_id],
    queryFn: async () => {
      const { data } = await supabase.from('fee_types').select('*, divisions(name_bn), classes(name_bn)').eq('is_active', true).order('fee_category').order('name_bn');
      if (!data) return [];
      return data.filter((ft: any) => {
        if (ft.division_id && ft.division_id !== student.division_id) return false;
        if (ft.class_id && ft.class_id !== student.class_id) return false;
        return true;
      });
    },
  });

  // ── Results data ──
  const { data: studentResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['student-results', student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('results')
        .select('*, exam_sessions(name, name_bn, exam_type), subjects(name, name_bn)')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // ── Attendance data ──
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['student-attendance', student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('entity_id', student.id)
        .eq('entity_type', 'student')
        .eq('shift', 'full_day')
        .order('attendance_date', { ascending: false });
      return data || [];
    },
  });

  // ── Computed result stats ──
  const resultStats = useMemo(() => {
    if (studentResults.length === 0) return null;
    // Group by exam
    const examMap = new Map<string, any[]>();
    studentResults.forEach((r: any) => {
      const examId = r.exam_id;
      if (!examMap.has(examId)) examMap.set(examId, []);
      examMap.get(examId)!.push(r);
    });
    return Array.from(examMap.entries()).map(([examId, results]) => {
      const totalMarks = results.reduce((s: number, r: any) => s + (r.marks || 0), 0);
      const count = results.filter((r: any) => r.marks != null).length;
      const avgGpa = count > 0 ? results.reduce((s: number, r: any) => s + (r.gpa || 0), 0) / count : 0;
      return {
        examId,
        examName: bn ? results[0]?.exam_sessions?.name_bn : results[0]?.exam_sessions?.name,
        examType: results[0]?.exam_sessions?.exam_type,
        results,
        totalMarks,
        avgGpa: Math.round(avgGpa * 100) / 100,
        subjectCount: count,
      };
    });
  }, [studentResults, bn]);

  // ── Computed attendance stats ──
  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a: any) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a: any) => a.status === 'absent').length;
    const late = attendanceRecords.filter((a: any) => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const last7 = attendanceRecords.slice(0, 7);
    return { total, present, absent, late, percentage, last7 };
  }, [attendanceRecords]);

  const totalPaid = feePayments.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.paid_amount || p.amount || 0), 0);
  const totalApplicable = applicableFeeTypes.reduce((sum: number, ft: any) => {
    const waiver = feeWaivers.find((w: any) => w.fee_type_id === ft.id);
    const isFreeMonthly = student.is_free && ft.fee_category === 'monthly';
    const waiverPercent = isFreeMonthly ? 100 : (waiver ? waiver.waiver_percent : 0);
    const netAmount = ft.amount - Math.round(ft.amount * waiverPercent / 100);
    return sum + netAmount;
  }, 0);
  const totalDue = Math.max(0, totalApplicable - totalPaid);

  const addWaiverMutation = useMutation({
    mutationFn: async () => {
      if (!waiverForm.fee_type_id) throw new Error(bn ? 'ফি ধরন নির্বাচন করুন' : 'Select fee type');
      const selectedFt = applicableFeeTypes.find((ft: any) => ft.id === waiverForm.fee_type_id);
      const amount = parseFloat(waiverForm.waiver_amount) || 0;
      const percent = selectedFt && selectedFt.amount > 0 ? Math.min(100, Math.round((amount / selectedFt.amount) * 100)) : 100;
      const { error } = await supabase.from('fee_waivers').insert({
        student_id: student.id, fee_type_id: waiverForm.fee_type_id, waiver_percent: percent, reason: waiverForm.reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-waivers', student.id] });
      setShowWaiverDialog(false);
      setWaiverForm({ fee_type_id: '', waiver_amount: '', reason: '' });
      toast.success(bn ? 'ডিসকাউন্ট যোগ হয়েছে' : 'Discount added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteWaiverMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fee_waivers').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-waivers', student.id] });
      toast.success(bn ? 'ডিসকাউন্ট সরানো হয়েছে' : 'Discount removed');
    },
  });

  const availableFeeTypesForWaiver = applicableFeeTypes.filter(
    (ft: any) => !feeWaivers.some((w: any) => w.fee_type_id === ft.id)
  );

  const getLibStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return <Badge className="bg-blue-500/10 text-blue-600 rounded-full px-3">{bn ? 'ইস্যু' : 'Issued'}</Badge>;
      case 'returned': return <Badge className="bg-emerald-500/10 text-emerald-600 rounded-full px-3">{bn ? 'জমা ✓' : 'Returned ✓'}</Badge>;
      case 'lost': return <Badge variant="destructive" className="rounded-full px-3">{bn ? 'হারিয়েছে' : 'Lost'}</Badge>;
      default: return <Badge variant="secondary" className="rounded-full px-3">{status}</Badge>;
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-600 rounded-full px-3 shadow-[0_0_12px_hsl(152_55%_40%/0.15)]">{bn ? 'পরিশোধিত ✓' : 'Paid ✓'}</Badge>;
      case 'unpaid': return <Badge className="bg-destructive/10 text-destructive rounded-full px-3">{bn ? 'বকেয়া' : 'Unpaid'}</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-600 rounded-full px-3">{bn ? 'অপেক্ষমাণ' : 'Pending'}</Badge>;
      default: return <Badge variant="secondary" className="rounded-full px-3">{status}</Badge>;
    }
  };

  const tabs = [
    { id: 'profile' as const, label: bn ? 'প্রোফাইল' : 'Profile', icon: User },
    { id: 'finance' as const, label: bn ? 'আর্থিক' : 'Finance', icon: Banknote },
    { id: 'academic' as const, label: bn ? 'শিক্ষা ও উপস্থিতি' : 'Academic', icon: GraduationCap },
    { id: 'others' as const, label: bn ? 'অন্যান্য' : 'Others', icon: ClipboardList },
  ];

  const translateGender = (val: string) => {
    if (!val) return '-';
    const map: Record<string, [string, string]> = { male: ['পুরুষ', 'Male'], female: ['মহিলা', 'Female'], other: ['অন্যান্য', 'Other'] };
    return map[val.toLowerCase()]?.[bn ? 0 : 1] || val;
  };

  const translateReligion = (val: string) => {
    if (!val) return '-';
    const map: Record<string, [string, string]> = { islam: ['ইসলাম', 'Islam'], hinduism: ['হিন্দু', 'Hinduism'], christianity: ['খ্রিস্টান', 'Christianity'], buddhism: ['বৌদ্ধ', 'Buddhism'], other: ['অন্যান্য', 'Other'] };
    return map[val.toLowerCase()]?.[bn ? 0 : 1] || val;
  };

  const translateResidence = (val: string) => {
    if (!val) return '-';
    const map: Record<string, [string, string]> = { residential: ['আবাসিক', 'Residential'], non_residential: ['অনাবাসিক', 'Non-Residential'], day_scholar: ['ডে স্কলার', 'Day Scholar'] };
    return map[val.toLowerCase()]?.[bn ? 0 : 1] || val;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-5">
        <div className="relative">
          {student.photo_url ? (
            <img src={student.photo_url} className="w-28 h-32 rounded-2xl object-cover border-2 border-primary/20 shadow-lg" alt="" />
          ) : (
            <div className="w-28 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-4xl font-bold text-primary/40 border-2 border-primary/10">
              {student.name_bn?.[0] || <User className="w-10 h-10" />}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2">
            {getApprovalBadge(student.approval_status || 'pending')}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-xl font-bold text-foreground tracking-tight truncate">
            {bn ? (student.name_bn || student.name_en) : (student.name_en || student.name_bn)}
          </h3>
          {student.name_bn && student.name_en && (
            <p className="text-sm text-muted-foreground truncate">{bn ? student.name_en : student.name_bn}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/8 text-primary">
              <Hash className="w-3 h-3" /> {student.student_id}
            </span>
            {student.roll_number && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                {bn ? 'রোল: ' : 'Roll: '}{student.roll_number}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {student.is_free && <Badge className="bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] px-2.5">{bn ? '✓ বিনা বেতন' : '✓ Free'}</Badge>}
            {student.is_orphan && <Badge className="bg-amber-500/10 text-amber-600 rounded-full text-[10px] px-2.5">{bn ? 'এতিম' : 'Orphan'}</Badge>}
            {student.is_poor && <Badge className="bg-blue-500/10 text-blue-600 rounded-full text-[10px] px-2.5">{bn ? 'গরীব' : 'Poor'}</Badge>}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <ProfileSectionCard title={bn ? 'মৌলিক তথ্য' : 'Basic Info'} icon={User}>
            <ProfileInfoItem icon={Fingerprint} label={bn ? 'রেজিস্ট্রেশন নং' : 'Reg No'} value={student.registration_no} />
            <ProfileInfoItem icon={Calendar} label={bn ? 'জন্ম তারিখ' : 'Date of Birth'} value={student.date_of_birth} />
            <ProfileInfoItem icon={User} label={bn ? 'লিঙ্গ' : 'Gender'} value={translateGender(student.gender)} />
            <ProfileInfoItem icon={Heart} label={bn ? 'ধর্ম' : 'Religion'} value={translateReligion(student.religion)} />
            <ProfileInfoItem icon={CreditCard} label={bn ? 'জন্ম নিবন্ধন' : 'Birth Reg'} value={student.birth_reg_no} />
            <ProfileInfoItem icon={Mail} label={bn ? 'ইমেইল' : 'Email'} value={student.email} />
            <ProfileInfoItem icon={Phone} label={bn ? 'ফোন' : 'Phone'} value={student.phone} />
            <ProfileInfoItem icon={Phone} label={bn ? 'অভিভাবক ফোন' : 'Guardian Phone'} value={student.guardian_phone} />
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'অভিভাবক তথ্য' : 'Parents Info'} icon={Users}>
            <ProfileInfoItem icon={User} label={bn ? 'পিতা (বাংলা)' : 'Father (BN)'} value={student.father_name} />
            <ProfileInfoItem icon={User} label={bn ? 'পিতা (ইংরেজি)' : 'Father (EN)'} value={student.father_name_en} />
            <ProfileInfoItem icon={ClipboardList} label={bn ? 'পিতার পেশা' : 'Father Occupation'} value={student.father_occupation} />
            <ProfileInfoItem icon={CreditCard} label={bn ? 'পিতার NID' : 'Father NID'} value={student.father_nid} />
            <ProfileInfoItem icon={Phone} label={bn ? 'পিতার ফোন' : 'Father Phone'} value={student.father_phone} />
            <div className="col-span-full border-t border-border/20 my-1" />
            <ProfileInfoItem icon={User} label={bn ? 'মাতা (বাংলা)' : 'Mother (BN)'} value={student.mother_name} />
            <ProfileInfoItem icon={User} label={bn ? 'মাতা (ইংরেজি)' : 'Mother (EN)'} value={student.mother_name_en} />
            <ProfileInfoItem icon={ClipboardList} label={bn ? 'মাতার পেশা' : 'Mother Occupation'} value={student.mother_occupation} />
            <ProfileInfoItem icon={CreditCard} label={bn ? 'মাতার NID' : 'Mother NID'} value={student.mother_nid} />
            <ProfileInfoItem icon={Phone} label={bn ? 'মাতার ফোন' : 'Mother Phone'} value={student.mother_phone} />
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'একাডেমিক তথ্য' : 'Academic Info'} icon={GraduationCap}>
            <ProfileInfoItem icon={Building2} label={bn ? 'বিভাগ' : 'Division'} value={bn ? student.divisions?.name_bn : student.divisions?.name} />
            <ProfileInfoItem icon={School} label={bn ? 'শ্রেণী' : 'Class'} value={getClassName(student.class_id)} />
            <ProfileInfoItem icon={CalendarCheck} label={bn ? 'সেশন' : 'Session'} value={getSessionName(student.session_id, student.admission_session)} />
            <ProfileInfoItem icon={Calendar} label={bn ? 'সেশন বছর' : 'Session Year'} value={student.session_year} />
            <ProfileInfoItem icon={Calendar} label={bn ? 'ভর্তির তারিখ' : 'Admission Date'} value={student.admission_date} />
            <ProfileInfoItem icon={School} label={bn ? 'পূর্বের শ্রেণী' : 'Previous Class'} value={student.previous_class} />
            <ProfileInfoItem icon={School} label={bn ? 'পূর্বের প্রতিষ্ঠান' : 'Previous Institute'} value={student.previous_institute} fullWidth />
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'অন্যান্য তথ্য' : 'Other Info'} icon={ClipboardList}>
            <ProfileInfoItem icon={Home} label={bn ? 'আবাসিক' : 'Residence'} value={translateResidence(student.residence_type)} />
            <ProfileInfoItem icon={Users} label={bn ? 'ক্যাটাগরি' : 'Category'} value={
              student.student_category === 'orphan' ? (bn ? 'এতিম' : 'Orphan') :
              student.student_category === 'poor' ? (bn ? 'গরীব' : 'Poor') :
              student.student_category === 'teacher_child' ? (bn ? 'শিক্ষক সন্তান' : "Teacher's Child") :
              (bn ? 'সাধারণ' : 'General')
            } />
            <ProfileInfoItem icon={MapPin} label={bn ? 'ঠিকানা' : 'Address'} value={student.address} fullWidth />
          </ProfileSectionCard>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 p-4 text-center shadow-sm">
              <Banknote className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-[11px] font-medium text-emerald-700/70 uppercase tracking-wider">{bn ? 'মোট পরিশোধিত' : 'Total Paid'}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">৳{totalPaid.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 border border-rose-500/20 p-4 text-center shadow-sm">
              <CreditCard className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
              <p className="text-[11px] font-medium text-rose-700/70 uppercase tracking-wider">{bn ? 'মোট বকেয়া' : 'Total Due'}</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">৳{totalDue.toLocaleString()}</p>
            </div>
          </div>

          <ProfileSectionCard title={bn ? 'প্রযোজ্য ফি ধরন' : 'Applicable Fee Types'} icon={FileText}>
            <div className="col-span-full">
              {feeTypesLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : applicableFeeTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{bn ? 'কোনো প্রযোজ্য ফি ধরন নেই' : 'No applicable fee types'}</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {applicableFeeTypes.map((ft: any) => {
                    const waiver = feeWaivers.find((w: any) => w.fee_type_id === ft.id);
                    const isFreeMonthly = student.is_free && ft.fee_category === 'monthly';
                    const waiverPercent = isFreeMonthly ? 100 : (waiver ? waiver.waiver_percent : 0);
                    const discountAmount = Math.round(ft.amount * waiverPercent / 100);
                    const netAmount = ft.amount - discountAmount;
                    const paidPayments = feePayments.filter((p: any) => p.fee_type_id === ft.id && p.status === 'paid');
                    const pendingPayment = feePayments.find((p: any) => p.fee_type_id === ft.id && p.status === 'pending');
                    const totalPaidForThis = paidPayments.reduce((s: number, p: any) => s + (p.paid_amount || p.amount || 0), 0);
                    const remaining = Math.max(0, netAmount - totalPaidForThis);
                    const isFullyPaid = remaining === 0 && totalPaidForThis >= netAmount;
                    const isPartialPaid = totalPaidForThis > 0 && remaining > 0;
                    const categoryLabel = ft.fee_category === 'monthly' ? (bn ? 'মাসিক' : 'Monthly') : ft.fee_category === 'admission' ? (bn ? 'ভর্তি' : 'Admission') : ft.fee_category === 'exam' ? (bn ? 'পরীক্ষা' : 'Exam') : ft.fee_category;

                    return (
                      <div key={ft.id} className="p-3 rounded-xl bg-muted/30 border border-border/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{bn ? ft.name_bn : ft.name}</p>
                            <p className="text-[11px] text-muted-foreground">{categoryLabel}{ft.classes?.name_bn && ` • ${ft.classes.name_bn}`}</p>
                          </div>
                          <div className="text-right ml-2 shrink-0">
                            {waiverPercent > 0 ? (
                              <div>
                                <p className="text-[11px] line-through text-muted-foreground">৳{ft.amount}</p>
                                <p className="font-bold text-primary text-sm">৳{netAmount}</p>
                              </div>
                            ) : (
                              <p className="font-bold text-foreground text-sm">৳{ft.amount}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          {isFullyPaid ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] px-2.5 shadow-[0_0_8px_hsl(152_55%_40%/0.12)]">{bn ? '✓ সম্পূর্ণ পরিশোধিত' : '✓ Fully Paid'}</Badge>
                          ) : isPartialPaid ? (
                            <>
                              <Badge className="bg-amber-500/10 text-amber-600 rounded-full text-[10px] px-2.5">{bn ? `আংশিক ৳${totalPaidForThis}` : `Partial ৳${totalPaidForThis}`}</Badge>
                              <Badge className="bg-destructive/10 text-destructive rounded-full text-[10px] px-2.5">{bn ? `বকেয়া ৳${remaining}` : `Due ৳${remaining}`}</Badge>
                            </>
                          ) : pendingPayment ? (
                            <Badge className="bg-amber-500/10 text-amber-600 rounded-full text-[10px] px-2.5">{bn ? '⏳ পেন্ডিং' : '⏳ Pending'}</Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive rounded-full text-[10px] px-2.5">{bn ? `বকেয়া ৳${netAmount}` : `Due ৳${netAmount}`}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'ফি পরিশোধের ইতিহাস' : 'Payment History'} icon={Banknote}>
            <div className="col-span-full">
              {feeLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : feePayments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{bn ? 'কোনো ফি পেমেন্ট রেকর্ড নেই' : 'No payment records'}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feePayments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{bn ? (p.fee_types?.name_bn || p.fee_types?.name) : p.fee_types?.name || '-'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          ৳{(p.paid_amount || p.amount || 0).toLocaleString()}
                          {p.receipt_number && <> • {bn ? 'রসিদ: ' : '#'}{p.receipt_number}</>}
                        </p>
                      </div>
                      <div className="ml-2 shrink-0">{getFeeStatusBadge(p.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'ফি ছাড় / ডিসকাউন্ট' : 'Discounts'} icon={BadgePercent}>
            <div className="col-span-full">
              <div className="flex justify-end mb-3">
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-full" onClick={() => setShowWaiverDialog(true)} disabled={availableFeeTypesForWaiver.length === 0}>
                  <Plus className="w-3 h-3 mr-1" /> {bn ? 'ছাড় দিন' : 'Add Discount'}
                </Button>
              </div>
              {waiverLoading ? (
                <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : feeWaivers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">{bn ? 'কোনো ছাড় নেই' : 'No waivers'}</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {feeWaivers.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{bn ? (w.fee_types?.name_bn || w.fee_types?.name) : w.fee_types?.name || '-'}</p>
                        {w.reason && <p className="text-[11px] text-muted-foreground truncate">{w.reason}</p>}
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <Badge className="bg-amber-500/10 text-amber-600 rounded-full text-[10px] px-2.5">৳{Math.round((w.fee_types?.amount || 0) * w.waiver_percent / 100)}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-full" onClick={() => deleteWaiverMutation.mutate(w.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ProfileSectionCard>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="space-y-4">
          {/* ── Attendance Overview ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/12 to-blue-500/5 border border-blue-500/20 p-4 text-center">
              <CalendarCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-blue-700/70">{bn ? 'মোট কার্যদিবস' : 'Total Days'}</p>
              <p className="text-xl font-bold text-blue-600">{attendanceStats.total}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/12 to-emerald-500/5 border border-emerald-500/20 p-4 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700/70">{bn ? 'উপস্থিতি' : 'Present'}</p>
              <p className="text-xl font-bold text-emerald-600">{attendanceStats.present}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/12 to-rose-500/5 border border-rose-500/20 p-4 text-center">
              <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-rose-700/70">{bn ? 'অনুপস্থিতি' : 'Absent'}</p>
              <p className="text-xl font-bold text-rose-600">{attendanceStats.absent}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/12 to-primary/5 border border-primary/20 p-4 text-center relative overflow-hidden">
              {/* Circular progress ring */}
              <div className="mx-auto mb-1 relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(attendanceStats.percentage / 100) * 150.8} 150.8`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{attendanceStats.percentage}%</span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-primary/70">{bn ? 'উপস্থিতির হার' : 'Rate'}</p>
            </div>
          </div>

          {/* Last 7 days */}
          <ProfileSectionCard title={bn ? 'সাম্প্রতিক উপস্থিতি (শেষ ৭ দিন)' : 'Recent Attendance (Last 7 Days)'} icon={CalendarCheck}>
            <div className="col-span-full">
              {attendanceLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : attendanceStats.last7.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{bn ? 'কোনো উপস্থিতি রেকর্ড নেই' : 'No attendance records'}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attendanceStats.last7.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-xs">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full shadow-sm',
                        a.status === 'present' ? 'bg-emerald-500 shadow-emerald-500/30' :
                        a.status === 'late' ? 'bg-amber-500 shadow-amber-500/30' :
                        'bg-rose-500 shadow-rose-500/30'
                      )} />
                      <span className="font-medium text-foreground">{a.attendance_date}</span>
                      <Badge className={cn(
                        'rounded-full text-[9px] px-2',
                        a.status === 'present' ? 'bg-emerald-500/10 text-emerald-600' :
                        a.status === 'late' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      )}>
                        {a.status === 'present' ? (bn ? 'উপস্থিত' : 'Present') :
                         a.status === 'late' ? (bn ? 'বিলম্ব' : 'Late') :
                         (bn ? 'অনুপস্থিত' : 'Absent')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ProfileSectionCard>

          {/* ── Academic Results ── */}
          {resultsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !resultStats || resultStats.length === 0 ? (
            <ProfileSectionCard title={bn ? 'পরীক্ষার ফলাফল' : 'Exam Results'} icon={BookOpen}>
              <div className="col-span-full">
                <p className="text-xs text-muted-foreground text-center py-6">{bn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}</p>
              </div>
            </ProfileSectionCard>
          ) : (
            resultStats.map((exam: any) => (
              <div key={exam.examId} className="space-y-3">
                {/* Exam Summary */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border border-primary/15 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Award className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-foreground">{exam.examName || 'Exam'}</h5>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{exam.subjectCount} {bn ? 'বিষয়' : 'subjects'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                        <p className="text-[9px] font-medium uppercase text-emerald-700/70">{bn ? 'মোট নম্বর' : 'Total'}</p>
                        <p className="text-lg font-bold text-emerald-600">{exam.totalMarks}</p>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/15">
                        <p className="text-[9px] font-medium uppercase text-primary/70">{bn ? 'গড় GPA' : 'Avg GPA'}</p>
                        <p className="text-lg font-bold text-primary">{exam.avgGpa}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject-wise results with progress bars */}
                <ProfileSectionCard title={bn ? 'বিষয়ভিত্তিক ফলাফল' : 'Subject-wise Results'} icon={BarChart3}>
                  <div className="col-span-full space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {exam.results.filter((r: any) => r.marks != null).map((r: any) => {
                      const maxMarks = 100;
                      const pct = Math.min(100, Math.round((r.marks / maxMarks) * 100));
                      return (
                        <div key={r.id} className="p-3 rounded-xl bg-muted/30 border border-border/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-sm font-semibold truncate">{bn ? r.subjects?.name_bn : r.subjects?.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-bold text-foreground">{r.marks}</span>
                              {r.grade && <Badge className="bg-primary/10 text-primary rounded-full text-[10px] px-2">{r.grade}</Badge>}
                              {r.gpa != null && <span className="text-[10px] text-muted-foreground">GPA {r.gpa}</span>}
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-primary' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ProfileSectionCard>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'others' && (
        <div className="space-y-4">
          <ProfileSectionCard title={bn ? 'লাইব্রেরি বই ইতিহাস' : 'Library Book History'} icon={Library}>
            <div className="col-span-full">
              {libLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : libraryHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{bn ? 'কোনো বই ইস্যু/জমার রেকর্ড নেই' : 'No library records'}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {libraryHistory.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/20">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{bn ? (item.library_books?.title_bn || item.library_books?.title) : item.library_books?.title}</p>
                        <p className="text-[11px] text-muted-foreground">
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
          </ProfileSectionCard>

          <ProfileSectionCard title={bn ? 'উপস্থিতি' : 'Attendance'} icon={CalendarCheck}>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground text-center py-6">{bn ? 'শীঘ্রই আসছে...' : 'Coming soon...'}</p>
            </div>
          </ProfileSectionCard>
        </div>
      )}

      <Dialog open={showWaiverDialog} onOpenChange={setShowWaiverDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{bn ? 'ফি ছাড় / ডিসকাউন্ট দিন' : 'Add Fee Discount'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">{bn ? 'ফি ধরন' : 'Fee Type'} *</label>
              <Select value={waiverForm.fee_type_id} onValueChange={v => setWaiverForm(p => ({ ...p, fee_type_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={bn ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
                <SelectContent>
                  {availableFeeTypesForWaiver.map((ft: any) => (
                    <SelectItem key={ft.id} value={ft.id}>{bn ? ft.name_bn : ft.name} (৳{ft.amount})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{bn ? 'ছাড়ের পরিমাণ (৳)' : 'Discount Amount (৳)'} *</label>
              <Input type="number" min="1" value={waiverForm.waiver_amount} onChange={e => setWaiverForm(p => ({ ...p, waiver_amount: e.target.value }))} className="mt-1" placeholder={bn ? 'টাকার পরিমাণ' : 'Amount in Taka'} />
              {waiverForm.fee_type_id && waiverForm.waiver_amount && (() => {
                const ft = applicableFeeTypes.find((f: any) => f.id === waiverForm.fee_type_id);
                if (!ft) return null;
                const pct = Math.min(100, Math.round((parseFloat(waiverForm.waiver_amount) / ft.amount) * 100));
                return <p className="text-xs text-muted-foreground mt-1">{bn ? `ফি ৳${ft.amount} এর ${pct}%` : `${pct}% of ৳${ft.amount}`}</p>;
              })()}
            </div>
            <div>
              <label className="text-sm font-medium">{bn ? 'কারণ' : 'Reason'}</label>
              <Textarea value={waiverForm.reason} onChange={e => setWaiverForm(p => ({ ...p, reason: e.target.value }))} className="mt-1" rows={2} placeholder={bn ? 'ঐচ্ছিক...' : 'Optional...'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaiverDialog(false)}>{bn ? 'বাতিল' : 'Cancel'}</Button>
            <Button onClick={() => addWaiverMutation.mutate()} disabled={addWaiverMutation.isPending || !waiverForm.fee_type_id} className="btn-primary-gradient">
              {addWaiverMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {bn ? 'সেভ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 pt-4 border-t border-border/30">
        <Button variant="outline" onClick={() => { setEditStudent(student); setShowDetail(null); setShowAdd(true); }} className="flex-1 rounded-full h-11">
          <Pencil className="w-4 h-4 mr-2" /> {bn ? 'সম্পাদনা' : 'Edit'}
        </Button>
        {student.approval_status !== 'approved' && (
          <Button onClick={() => { statusMutation.mutate({ id: student.id, status: 'approved' }); setShowDetail(null); }} className="flex-1 rounded-full h-11 bg-emerald-600 hover:bg-emerald-600/90 text-white">
            <CheckCircle className="w-4 h-4 mr-2" /> {bn ? 'অনুমোদন' : 'Approve'}
          </Button>
        )}
        {student.approval_status !== 'rejected' && (
          <Button variant="destructive" onClick={() => { statusMutation.mutate({ id: student.id, status: 'rejected' }); setShowDetail(null); }} className="flex-1 rounded-full h-11">
            <XCircle className="w-4 h-4 mr-2" /> {bn ? 'প্রত্যাখ্যান' : 'Reject'}
          </Button>
        )}
        {student.approval_status === 'rejected' && (
          <Button variant="outline" onClick={() => { statusMutation.mutate({ id: student.id, status: 'pending' }); setShowDetail(null); }} className="flex-1 rounded-full h-11">
            <Clock className="w-4 h-4 mr-2" /> {bn ? 'অপেক্ষমাণে ফেরত' : 'Back to Pending'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudentProfileModal;
