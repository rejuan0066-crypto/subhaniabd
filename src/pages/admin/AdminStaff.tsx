import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Loader2, Pencil, UserPlus, Eye, EyeOff, User, FileText, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useApprovalCheck } from '@/hooks/useApprovalCheck';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export type StaffPageType = 'all' | 'staff' | 'teacher';

const TEACHER_KEYWORDS = ['teacher', 'শিক্ষক', 'ustaz', 'ustad', 'মুআল্লিম', 'মুয়াল্লিম'];

const isTeacherDesignation = (designation: string | null | undefined): boolean => {
  if (!designation) return false;
  const lower = designation.toLowerCase();
  return TEACHER_KEYWORDS.some(k => lower.includes(k));
};

const AdminStaff = ({ staffType = 'all' }: { staffType?: StaffPageType }) => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const menuPath = staffType === 'teacher' ? '/admin/teachers' : '/admin/staff';
  const { checkApproval } = useApprovalCheck(menuPath, 'staff');
  const { role } = useAuth();
  const { canAddItem, canEditItem, canDeleteItem } = usePagePermissions(menuPath);
  const bn = language === 'bn';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewStaff, setViewStaff] = useState<any>(null);

  // Account creation dialog state
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState('none');
  const [accCreating, setAccCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('staff').update({ status }).eq('id', id);
      if (error) throw error;

      // Auto-create joining letter when approved
      if (status === 'active') {
        const staff = staffList.find((s: any) => s.id === id);
        if (staff) {
          const sd = (staff as any).staff_data || {};
          const year = new Date().getFullYear();
          const serial = String(Math.floor(Math.random() * 9000) + 1000);
          await supabase.from('joining_letters').insert({
            staff_id: id,
            staff_name: staff.name_en || '',
            staff_name_bn: staff.name_bn || '',
            designation: staff.designation || '',
            joining_date: sd.joining_date || new Date().toISOString().split('T')[0],
            letter_number: `JL-${year}-${serial}`,
            letter_date: new Date().toISOString().split('T')[0],
            letter_data: { phone: staff.phone, department: staff.department, nid: sd.nid },
          } as any);
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['joining-letters'] });
      toast.success(status === 'active' ? (bn ? '✅ অনুমোদিত ও যোগদান পত্র তৈরি হয়েছে' : '✅ Approved & Joining Letter Created') : (bn ? '❌ বাতিল করা হয়েছে' : '❌ Rejected'));
    },
    onError: () => toast.error(bn ? 'সমস্যা হয়েছে' : 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const staff = staffList.find((s: any) => s.id === id);
      if (await checkApproval('delete', { id, name_bn: staff?.name_bn }, id, `কর্মী মুছুন: ${staff?.name_bn}`)) return;
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(bn ? 'কর্মী মুছে ফেলা হয়েছে' : 'Staff deleted');
    },
    onError: () => toast.error('Error'),
  });

  const typeFiltered = staffType === 'all' ? staffList : staffList.filter((s: any) => {
    const isTeacher = isTeacherDesignation(s.designation);
    return staffType === 'teacher' ? isTeacher : !isTeacher;
  });

  const pendingCount = typeFiltered.filter((s: any) => s.status === 'pending').length;

  const filtered = typeFiltered.filter((s: any) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name_bn?.toLowerCase().includes(q) || s.name_en?.toLowerCase().includes(q) || s.designation?.toLowerCase().includes(q);
  });

  const openAccountDialog = (staff: any) => {
    setSelectedStaff(staff);
    setAccEmail(staff.email || '');
    setAccPassword('');
    setAccRole('none');
    setShowPassword(false);
    setAccountDialogOpen(true);
  };

  const handleCreateAccount = async () => {
    if (!accEmail.trim()) { toast.error(bn ? 'ইমেইল দিন' : 'Enter email'); return; }
    if (!accPassword || accPassword.length < 6) { toast.error(bn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' : 'Password min 6 chars'); return; }

    setAccCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: accEmail.trim(),
          password: accPassword,
          role: accRole === 'none' ? undefined : accRole,
          full_name: selectedStaff?.name_bn || selectedStaff?.name_en || '',
          staff_id: selectedStaff?.id,
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || (bn ? 'অ্যাকাউন্ট তৈরি ব্যর্থ' : 'Failed to create account'));
        setAccCreating(false);
        return;
      }
      toast.success(bn ? '✅ অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : '✅ Account created successfully!');
      setAccountDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch {
      toast.error(bn ? 'অ্যাকাউন্ট তৈরি ব্যর্থ' : 'Failed to create account');
    }
    setAccCreating(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {staffType === 'teacher' ? (bn ? 'শিক্ষক ব্যবস্থাপনা' : 'Teacher Management') : staffType === 'staff' ? (bn ? 'স্টাফ ব্যবস্থাপনা' : 'Staff Management') : t('staff')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {staffType === 'teacher' ? (bn ? `মোট ${typeFiltered.length} জন শিক্ষক` : `Total ${typeFiltered.length} teachers`) : staffType === 'staff' ? (bn ? `মোট ${typeFiltered.length} জন স্টাফ` : `Total ${typeFiltered.length} staff`) : (bn ? `মোট ${staffList.length} জন কর্মী/শিক্ষক` : `Total ${staffList.length} staff`)}
            </p>
          </div>
          {canAddItem && (
            <Button onClick={() => navigate(staffType === 'teacher' ? '/admin/teachers/add' : '/admin/staff/add')} className="btn-primary-gradient flex items-center gap-2">
              <Plus className="w-4 h-4" /> {t('addNew')}
            </Button>
          )}
        </div>

        <div className="card-elevated p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={bn ? 'নাম বা পদবী দিয়ে খুঁজুন...' : 'Search by name or designation...'} className="pl-10 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
              {bn ? 'সবগুলো' : 'All'} ({typeFiltered.length})
            </Button>
            <Button variant={statusFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('active')}>
              {bn ? 'সক্রিয়' : 'Active'}
            </Button>
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')} className="relative">
              {bn ? 'আবেদন' : 'Pending'}
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button variant={statusFilter === 'inactive' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('inactive')}>
              {bn ? 'নিষ্ক্রিয়' : 'Inactive'}
            </Button>
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'পদবী' : 'Designation'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'বিভাগ' : 'Department'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'মোবাইল' : 'Mobile'}</th>
                    {isAdminRole(role) && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অ্যাকাউন্ট' : 'Account'}</th>}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-bold text-sm">{(bn ? s.name_bn : s.name_en)?.[0] || '?'}</div>
                          )}
                          <div>
                            <span className="font-medium text-foreground text-sm block">{bn ? (s.name_bn || s.name_en) : (s.name_en || s.name_bn)}</span>
                            {s.name_bn && s.name_en && <span className="text-xs text-muted-foreground">{bn ? s.name_en : s.name_bn}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.designation || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.department || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.phone || '-'}</td>
                      {isAdminRole(role) && (
                      <td className="px-4 py-3">
                        {s.user_id ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            {bn ? 'সক্রিয়' : 'Linked'}
                          </Badge>
                        ) : (
                          <button
                            onClick={() => openAccountDialog(s)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            {bn ? 'অ্যাকাউন্ট তৈরি' : 'Create Account'}
                          </button>
                        )}
                      </td>
                      )}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          s.status === 'active' ? 'bg-success/10 text-success' : 
                          s.status === 'pending' ? 'bg-warning/10 text-warning' : 
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {s.status === 'active' ? (bn ? 'সক্রিয়' : 'Active') : 
                           s.status === 'pending' ? (bn ? 'আবেদন' : 'Pending') : 
                           (bn ? 'নিষ্ক্রিয়' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        {s.status === 'pending' && isAdminRole(role) && (
                          <>
                            <button onClick={() => statusMutation.mutate({ id: s.id, status: 'active' })} className="p-2 rounded-lg hover:bg-success/10 text-success" title={bn ? 'অনুমোদন' : 'Approve'} disabled={statusMutation.isPending}><Check className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title={bn ? 'বাতিল' : 'Reject'} disabled={statusMutation.isPending}><X className="w-4 h-4" /></button>
                          </>
                        )}
                        <button onClick={() => setViewStaff(s)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title={bn ? 'প্রোফাইল দেখুন' : 'View Profile'}><Eye className="w-4 h-4" /></button>
                        {canEditItem && (
                          <button onClick={() => navigate(`/admin/${staffType === 'teacher' ? 'teachers' : 'staff'}/edit/${s.id}`)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title={bn ? 'সম্পাদনা' : 'Edit'}><Pencil className="w-4 h-4" /></button>
                        )}
                        {canDeleteItem && (
                          <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive" title={bn ? 'মুছুন' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">{bn ? 'কোনো কর্মী পাওয়া যায়নি' : 'No staff found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{bn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {bn ? 'এই কর্মী/শিক্ষকের তথ্য স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।' : 'This staff record will be permanently deleted. This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{bn ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              >
                {bn ? 'মুছে ফেলুন' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        {/* Account Creation Dialog */}
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{bn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {bn ? `কর্মী: ${selectedStaff?.name_bn || selectedStaff?.name_en || ''}` : `Staff: ${selectedStaff?.name_en || selectedStaff?.name_bn || ''}`}
              </p>
              <div className="space-y-2">
                <Label>{bn ? 'ইমেইল' : 'Email'}</Label>
                <Input type="email" value={accEmail} onChange={e => setAccEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>{bn ? 'পাসওয়ার্ড' : 'Password'}</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={accPassword} onChange={e => setAccPassword(e.target.value)} placeholder={bn ? 'কমপক্ষে ৬ অক্ষর' : 'Min 6 characters'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{bn ? 'রোল' : 'Role'}</Label>
                <Select value={accRole} onValueChange={setAccRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{bn ? 'রোল ছাড়া' : 'No Role'}</SelectItem>
                    <SelectItem value="staff">{bn ? 'স্টাফ' : 'Staff'}</SelectItem>
                    <SelectItem value="teacher">{bn ? 'শিক্ষক' : 'Teacher'}</SelectItem>
                    <SelectItem value="admin">{bn ? 'অ্যাডমিন' : 'Admin'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateAccount} disabled={accCreating} className="w-full btn-primary-gradient">
                {accCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {bn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Staff Profile Detail Dialog */}
        <Dialog open={!!viewStaff} onOpenChange={o => { if (!o) setViewStaff(null); }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{bn ? 'স্টাফ/শিক্ষক প্রোফাইল' : 'Staff/Teacher Profile'}</DialogTitle></DialogHeader>
            {viewStaff && <StaffProfileView staff={viewStaff} bn={bn} />}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">{value || '-'}</span>
  </div>
);

const translateReligion = (val: string | undefined, bn: boolean): string => {
  if (!val) return '-';
  const map: Record<string, [string, string]> = {
    islam: ['ইসলাম', 'Islam'], hinduism: ['হিন্দু', 'Hinduism'], christianity: ['খ্রিস্টান', 'Christianity'], buddhism: ['বৌদ্ধ', 'Buddhism'], other: ['অন্যান্য', 'Other'],
  };
  const m = map[val.toLowerCase()];
  return m ? m[bn ? 0 : 1] : val;
};

const translateGender = (val: string | undefined, bn: boolean): string => {
  if (!val) return '-';
  const map: Record<string, [string, string]> = { male: ['পুরুষ', 'Male'], female: ['মহিলা', 'Female'], other: ['অন্যান্য', 'Other'] };
  const m = map[val.toLowerCase()];
  return m ? m[bn ? 0 : 1] : val;
};

const translateResidence = (val: string | undefined, bn: boolean): string => {
  if (!val) return '-';
  const map: Record<string, [string, string]> = { residential: ['আবাসিক', 'Residential'], non_residential: ['অনাবাসিক', 'Non-Residential'], day_scholar: ['ডে স্কলার', 'Day Scholar'] };
  const m = map[val.toLowerCase()];
  return m ? m[bn ? 0 : 1] : val;
};

const StaffProfileView = ({ staff, bn }: { staff: any; bn: boolean }) => {
  const sd = staff.staff_data || {};
  const parents = sd.parents || {};
  const father = parents.father || {};
  const mother = parents.mother || {};
  const guardian = sd.guardian || {};
  const identifier = sd.identifier || {};
  const approver = sd.approver || {};
  const presentAddr = sd.present_address || {};
  const permanentAddr = sd.permanent_address || {};
  const docs = sd.documents || [];

  const formatAddr = (a: any) => [a?.village, a?.postOffice, a?.union, a?.upazila, a?.district, a?.division].filter(Boolean).join(', ');

  return (
    <div className="space-y-5 py-4">
      {/* Header with photo */}
      <div className="flex items-start gap-4">
        {staff.photo_url ? (
          <img src={staff.photo_url} className="w-24 h-28 rounded-lg object-cover border" alt="" />
        ) : (
          <div className="w-24 h-28 rounded-lg bg-secondary flex items-center justify-center text-3xl font-bold text-muted-foreground">
            <User className="w-10 h-10" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold text-foreground">{bn ? (staff.name_bn || staff.name_en) : (staff.name_en || staff.name_bn) || '-'}</h3>
          {staff.name_bn && staff.name_en && <p className="text-sm text-muted-foreground">{bn ? staff.name_en : staff.name_bn}</p>}
          <p className="text-sm text-primary font-medium">{staff.designation || '-'}</p>
          <p className="text-xs text-muted-foreground">{staff.department || ''}</p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            staff.status === 'active' ? 'bg-success/10 text-success' : 
            staff.status === 'pending' ? 'bg-warning/10 text-warning' : 
            'bg-destructive/10 text-destructive'
          }`}>
            {staff.status === 'active' ? (bn ? 'সক্রিয়' : 'Active') : 
             staff.status === 'pending' ? (bn ? 'আবেদন' : 'Pending') : 
             (bn ? 'নিষ্ক্রিয়' : 'Inactive')}
          </span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'ব্যক্তিগত তথ্য' : 'Personal Info'}</h4>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label={bn ? 'জন্ম তারিখ: ' : 'DOB: '} value={staff.date_of_birth || '-'} />
          <InfoRow label={bn ? 'ধর্ম: ' : 'Religion: '} value={translateReligion(staff.religion || sd.religion, bn)} />
          <InfoRow label={bn ? 'লিঙ্গ: ' : 'Gender: '} value={translateGender(staff.gender || sd.gender, bn)} />
          <InfoRow label={bn ? 'NID: ' : 'NID: '} value={staff.nid || '-'} />
          <InfoRow label={bn ? 'ফোন: ' : 'Phone: '} value={staff.phone ? `${sd.mobile_code || ''}${staff.phone}` : '-'} />
          <InfoRow label={bn ? 'ইমেইল: ' : 'Email: '} value={staff.email || '-'} />
          <InfoRow label={bn ? 'আবাসিক: ' : 'Residence: '} value={translateResidence(staff.residence_type || sd.residence_type, bn)} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'ঠিকানা' : 'Address'}</h4>
        <div className="grid grid-cols-1 gap-3">
          <InfoRow label={bn ? 'বর্তমান ঠিকানা: ' : 'Present Address: '} value={formatAddr(presentAddr) || staff.address || '-'} />
          <InfoRow label={bn ? 'স্থায়ী ঠিকানা: ' : 'Permanent Address: '} value={formatAddr(permanentAddr) || '-'} />
        </div>
      </div>

      {/* Employment Info */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'কর্মসংস্থান তথ্য' : 'Employment Info'}</h4>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label={bn ? 'কর্মের ধরন: ' : 'Employment Type: '} value={staff.employment_type || sd.employment_type || '-'} />
          <InfoRow label={bn ? 'যোগদানের তারিখ: ' : 'Joining Date: '} value={staff.joining_date || '-'} />
          <InfoRow label={bn ? 'শিক্ষাগত যোগ্যতা: ' : 'Education: '} value={staff.education || sd.education || '-'} />
          <InfoRow label={bn ? 'অভিজ্ঞতা: ' : 'Experience: '} value={staff.experience || sd.experience || '-'} />
          <InfoRow label={bn ? 'বেতন: ' : 'Salary: '} value={staff.salary ? `৳${staff.salary}` : '-'} />
          <InfoRow label={bn ? 'পূর্বের প্রতিষ্ঠান: ' : 'Previous Institute: '} value={staff.previous_institute || sd.previous_institute || '-'} />
          <InfoRow label={bn ? 'ডিউটি শুরু: ' : 'Duty Start: '} value={staff.duty_start_time || '-'} />
          <InfoRow label={bn ? 'ডিউটি শেষ: ' : 'Duty End: '} value={staff.duty_end_time || '-'} />
        </div>
      </div>

      {/* Father/Mother */}
      {(father.name || mother.name) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'পিতা-মাতার তথ্য' : 'Parents Info'}</h4>
          <div className="grid grid-cols-2 gap-3">
            {father.name && <InfoRow label={bn ? 'পিতার নাম: ' : 'Father: '} value={father.name} />}
            {father.occupation && <InfoRow label={bn ? 'পিতার পেশা: ' : "Father's Occupation: "} value={father.occupation} />}
            {father.nid && <InfoRow label={bn ? 'পিতার NID: ' : "Father's NID: "} value={father.nid} />}
            {father.mobile && <InfoRow label={bn ? 'পিতার ফোন: ' : "Father's Phone: "} value={`${father.mobile_code || ''}${father.mobile}`} />}
            <div className="col-span-2 border-t my-1" />
            {mother.name && <InfoRow label={bn ? 'মাতার নাম: ' : 'Mother: '} value={mother.name} />}
            {mother.occupation && <InfoRow label={bn ? 'মাতার পেশা: ' : "Mother's Occupation: "} value={mother.occupation} />}
            {mother.nid && <InfoRow label={bn ? 'মাতার NID: ' : "Mother's NID: "} value={mother.nid} />}
            {mother.mobile && <InfoRow label={bn ? 'মাতার ফোন: ' : "Mother's Phone: "} value={`${mother.mobile_code || ''}${mother.mobile}`} />}
          </div>
        </div>
      )}

      {/* Guardian */}
      {(guardian.name || guardian.relation) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'অভিভাবক তথ্য' : 'Guardian Info'}</h4>
          <div className="grid grid-cols-2 gap-3">
            {guardian.name && <InfoRow label={bn ? 'নাম: ' : 'Name: '} value={guardian.name} />}
            {guardian.relation && <InfoRow label={bn ? 'সম্পর্ক: ' : 'Relation: '} value={guardian.relation} />}
            {guardian.nid && <InfoRow label={bn ? 'NID: ' : 'NID: '} value={guardian.nid} />}
            {guardian.mobile && <InfoRow label={bn ? 'ফোন: ' : 'Phone: '} value={`${guardian.mobile_code || ''}${guardian.mobile}`} />}
            {formatAddr(guardian.present_address) && <div className="col-span-2"><InfoRow label={bn ? 'বর্তমান ঠিকানা: ' : 'Present Address: '} value={formatAddr(guardian.present_address)} /></div>}
            {formatAddr(guardian.permanent_address) && <div className="col-span-2"><InfoRow label={bn ? 'স্থায়ী ঠিকানা: ' : 'Permanent Address: '} value={formatAddr(guardian.permanent_address)} /></div>}
          </div>
        </div>
      )}

      {/* Identifier/Referee */}
      {(identifier.name || identifier.relation) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'পরিচয়দাতা' : 'Referee / Identifier'}</h4>
          <div className="grid grid-cols-2 gap-3">
            {identifier.name && <InfoRow label={bn ? 'নাম: ' : 'Name: '} value={identifier.name} />}
            {identifier.relation && <InfoRow label={bn ? 'সম্পর্ক: ' : 'Relation: '} value={identifier.relation} />}
            {identifier.nid && <InfoRow label={bn ? 'NID: ' : 'NID: '} value={identifier.nid} />}
            {identifier.mobile && <InfoRow label={bn ? 'ফোন: ' : 'Phone: '} value={`${identifier.mobile_code || ''}${identifier.mobile}`} />}
            {formatAddr(identifier.address) && <div className="col-span-2"><InfoRow label={bn ? 'ঠিকানা: ' : 'Address: '} value={formatAddr(identifier.address)} /></div>}
          </div>
        </div>
      )}

      {/* Approver */}
      {(approver.name || approver.position) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'অনুমোদনকারী' : 'Approver'}</h4>
          <div className="grid grid-cols-2 gap-3">
            {approver.name && <InfoRow label={bn ? 'নাম: ' : 'Name: '} value={approver.name} />}
            {approver.position && <InfoRow label={bn ? 'পদবী: ' : 'Position: '} value={approver.position} />}
            {approver.date && <InfoRow label={bn ? 'তারিখ: ' : 'Date: '} value={approver.date} />}
          </div>
        </div>
      )}

      {/* Documents */}
      {docs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{bn ? 'ডকুমেন্টস' : 'Documents'}</h4>
          <div className="space-y-2">
            {docs.map((doc: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/50">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 truncate">{doc.name || doc.type || `Document ${i + 1}`}</span>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0">
                    {bn ? 'দেখুন' : 'View'}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
