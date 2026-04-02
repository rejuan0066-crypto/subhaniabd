import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Loader2, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UserItem {
  id: string;
  email: string;
  role: string;
  full_name: string;
  created_at: string;
}

const AdminUserManagement = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users?action=list', {
        method: 'GET',
      });
      if (error) throw error;
      setUsers(data?.users || []);
    } catch (err: any) {
      toast.error(bn ? 'ইউজার তালিকা লোড ব্যর্থ' : 'Failed to load users');
    }
    setLoading(false);
  }, [bn]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!email.trim()) { toast.error(bn ? 'ইমেইল দিন' : 'Enter email'); return; }
    if (!password || password.length < 6) { toast.error(bn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' : 'Password min 6 chars'); return; }
    if (!role) { toast.error(bn ? 'রোল সিলেক্ট করুন' : 'Select a role'); return; }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users?action=create', {
        body: { email: email.trim(), password, role, full_name: fullName.trim() },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || (bn ? 'ইউজার তৈরি ব্যর্থ' : 'Failed to create user'));
        setCreating(false);
        return;
      }
      toast.success(bn ? '✅ ইউজার সফলভাবে তৈরি হয়েছে!' : '✅ User created successfully!');
      setDialogOpen(false);
      setEmail(''); setPassword(''); setFullName(''); setRole('');
      fetchUsers();
    } catch {
      toast.error(bn ? 'ইউজার তৈরি ব্যর্থ' : 'Failed to create user');
    }
    setCreating(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(bn ? 'এই ইউজার ডিলিট করতে চান?' : 'Delete this user?')) return;
    setDeleting(userId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users?action=delete', {
        body: { user_id: userId },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || (bn ? 'ডিলিট ব্যর্থ' : 'Delete failed'));
        setDeleting(null);
        return;
      }
      toast.success(bn ? 'ইউজার ডিলিট হয়েছে' : 'User deleted');
      fetchUsers();
    } catch {
      toast.error(bn ? 'ডিলিট ব্যর্থ' : 'Delete failed');
    }
    setDeleting(null);
  };

  const roleBadge = (r: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-destructive/10 text-destructive border-destructive/30',
      teacher: 'bg-primary/10 text-primary border-primary/30',
      staff: 'bg-accent/50 text-accent-foreground border-accent',
    };
    return <Badge variant="outline" className={colors[r] || ''}>{r === 'admin' ? (bn ? 'অ্যাডমিন' : 'Admin') : r === 'teacher' ? (bn ? 'শিক্ষক' : 'Teacher') : r === 'staff' ? (bn ? 'স্টাফ' : 'Staff') : r}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {bn ? 'ইউজার ব্যবস্থাপনা' : 'User Management'}
          </h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2">
                <Plus className="w-4 h-4" /> {bn ? 'নতুন ইউজার' : 'New User'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  {bn ? 'নতুন ইউজার তৈরি করুন' : 'Create New User'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{bn ? 'নাম' : 'Full Name'}</Label>
                  <Input className="mt-1" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={bn ? 'ইউজারের নাম' : 'User name'} />
                </div>
                <div>
                  <Label>{bn ? 'ইমেইল' : 'Email'} *</Label>
                  <Input className="mt-1" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={bn ? 'ইমেইল অ্যাড্রেস' : 'Email address'} />
                </div>
                <div>
                  <Label>{bn ? 'পাসওয়ার্ড' : 'Password'} *</Label>
                  <div className="relative mt-1">
                    <Input className="pr-10" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={bn ? 'কমপক্ষে ৬ অক্ষর' : 'Min 6 characters'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>{bn ? 'রোল' : 'Role'} *</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={bn ? 'রোল সিলেক্ট করুন' : 'Select role'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{bn ? 'অ্যাডমিন' : 'Admin'}</SelectItem>
                      <SelectItem value="teacher">{bn ? 'শিক্ষক' : 'Teacher'}</SelectItem>
                      <SelectItem value="staff">{bn ? 'স্টাফ' : 'Staff'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full btn-primary-gradient">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {bn ? 'ইউজার তৈরি করুন' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info notice */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            {bn
              ? 'এখানে তৈরি করা ইউজাররা সরাসরি লগইন করতে পারবে। তাদের ইমেইল ভেরিফাই করার প্রয়োজন নেই।'
              : 'Users created here can log in immediately. No email verification needed.'}
          </p>
        </div>

        {/* Users table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {bn ? 'কোনো ইউজার পাওয়া যায়নি' : 'No users found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bn ? 'নাম' : 'Name'}</TableHead>
                  <TableHead>{bn ? 'ইমেইল' : 'Email'}</TableHead>
                  <TableHead>{bn ? 'রোল' : 'Role'}</TableHead>
                  <TableHead>{bn ? 'তৈরির তারিখ' : 'Created'}</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{roleBadge(u.role)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString(bn ? 'bn-BD' : 'en-US')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                      >
                        {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;
