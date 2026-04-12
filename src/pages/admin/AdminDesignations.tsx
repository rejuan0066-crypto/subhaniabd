import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usePagePermissions } from '@/hooks/usePagePermissions';

const AdminDesignations = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();
  const { canAddItem, canEditItem, canDeleteItem } = usePagePermissions('/admin/designations');

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [staffCategory, setStaffCategory] = useState('general');

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setName('');
    setNameBn('');
    setDescription('');
    setSortOrder(0);
    setIsActive(true);
    setStaffCategory('general');
    setEditItem(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setName(item.name || '');
    setNameBn(item.name_bn || '');
    setDescription(item.description || '');
    setSortOrder(item.sort_order || 0);
    setIsActive(item.is_active ?? true);
    setStaffCategory(item.staff_category || 'general');
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !nameBn.trim()) throw new Error(bn ? 'নাম আবশ্যক' : 'Name is required');

      const record = {
        name: name.trim(),
        name_bn: nameBn.trim(),
        description: description.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
        staff_category: staffCategory,
      };

      if (editItem) {
        const { error } = await supabase.from('designations').update(record).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('designations').insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success(editItem ? (bn ? 'পদবি আপডেট হয়েছে' : 'Designation updated') : (bn ? 'পদবি যোগ হয়েছে' : 'Designation added'));
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('designations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success(bn ? 'পদবি মুছে ফেলা হয়েছে' : 'Designation deleted');
      setDeleteId(null);
    },
    onError: () => toast.error(bn ? 'সমস্যা হয়েছে' : 'Error'),
  });

  const filtered = designations.filter((d: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.name_bn?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Tag className="w-6 h-6 text-primary" />
              {bn ? 'পদবি ব্যবস্থাপনা' : 'Designation Management'}
            </h1>
            <p className="text-sm text-muted-foreground">{bn ? `মোট ${designations.length}টি পদবি` : `Total ${designations.length} designations`}</p>
          </div>
          {canAddItem && (
            <Button onClick={openAdd} className="btn-primary-gradient flex items-center gap-2">
              <Plus className="w-4 h-4" /> {bn ? 'নতুন পদবি' : 'Add Designation'}
            </Button>
          )}
        </div>

        <div className="card-elevated p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={bn ? 'পদবি খুঁজুন...' : 'Search designations...'} className="pl-10 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'পদবি (বাংলা)' : 'Name (Bangla)'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'পদবি (ইংরেজি)' : 'Name (English)'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'বিবরণ' : 'Description'}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((d: any, i: number) => (
                    <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{d.name_bn}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.description || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={d.is_active ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                          {d.is_active ? (bn ? 'সক্রিয়' : 'Active') : (bn ? 'নিষ্ক্রিয়' : 'Inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEditItem && (
                            <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title={bn ? 'সম্পাদনা' : 'Edit'}>
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteItem && (
                            <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive" title={bn ? 'মুছুন' : 'Delete'}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">{bn ? 'কোনো পদবি পাওয়া যায়নি' : 'No designations found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                {editItem ? (bn ? 'পদবি সম্পাদনা' : 'Edit Designation') : (bn ? 'নতুন পদবি যোগ করুন' : 'Add New Designation')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{bn ? 'পদবি (বাংলা)' : 'Name (Bangla)'} <span className="text-destructive">*</span></Label>
                <Input className="bg-background mt-1" value={nameBn} onChange={e => setNameBn(e.target.value)} placeholder={bn ? 'যেমন: প্রধান শিক্ষক' : 'e.g. প্রধান শিক্ষক'} />
              </div>
              <div>
                <Label>{bn ? 'পদবি (ইংরেজি)' : 'Name (English)'} <span className="text-destructive">*</span></Label>
                <Input className="bg-background mt-1" value={name} onChange={e => setName(e.target.value)} placeholder={bn ? 'যেমন: Head Teacher' : 'e.g. Head Teacher'} />
              </div>
              <div>
                <Label>{bn ? 'বিবরণ' : 'Description'}</Label>
                <Input className="bg-background mt-1" value={description} onChange={e => setDescription(e.target.value)} placeholder={bn ? 'ঐচ্ছিক' : 'Optional'} />
              </div>
              <div>
                <Label>{bn ? 'ক্রম' : 'Sort Order'}</Label>
                <Input type="number" className="bg-background mt-1 w-24" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{bn ? 'সক্রিয়' : 'Active'}</Label>
              </div>
              <Button onClick={() => saveMutation.mutate()} className="btn-primary-gradient w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editItem ? (bn ? 'আপডেট করুন' : 'Update') : (bn ? 'যোগ করুন' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{bn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {bn ? 'এই পদবি স্থায়ীভাবে মুছে ফেলা হবে।' : 'This designation will be permanently deleted.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{bn ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {bn ? 'মুছুন' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDesignations;
