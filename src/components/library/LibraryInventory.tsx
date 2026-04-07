import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, BookOpen } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const BOOK_CATEGORIES = [
  { key: 'textbook', label: 'Textbook', label_bn: 'পাঠ্যবই' },
  { key: 'reference', label: 'Reference', label_bn: 'রেফারেন্স' },
  { key: 'religious', label: 'Religious', label_bn: 'ধর্মীয়' },
  { key: 'general', label: 'General Knowledge', label_bn: 'সাধারণ জ্ঞান' },
  { key: 'story', label: 'Story / Literature', label_bn: 'গল্প / সাহিত্য' },
  { key: 'other', label: 'Other', label_bn: 'অন্যান্য' },
];

const emptyBook = {
  title: '', title_bn: '', author: '', author_bn: '',
  class_id: '', subject_id: '', book_category: 'textbook',
  purchase_date: format(new Date(), 'yyyy-MM-dd'),
  buying_price: 0, total_copies: 1, purchased_by: '', notes: '',
};

const LibraryInventory = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBook);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const { data } = await supabase.from('library_books').select('*, classes(name_bn, name), subjects(name_bn, name)').eq('is_active', true).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => { const { data } = await supabase.from('classes').select('id, name, name_bn').eq('is_active', true).order('sort_order'); return data || []; },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: async () => { const { data } = await supabase.from('subjects').select('id, name, name_bn').eq('is_active', true).order('name_bn'); return data || []; },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title, title_bn: form.title_bn, author: form.author, author_bn: form.author_bn,
        class_id: form.class_id || null, subject_id: form.subject_id || null,
        book_category: form.book_category || 'textbook',
        purchase_date: form.purchase_date, buying_price: Number(form.buying_price) || 0,
        total_copies: Number(form.total_copies) || 1, purchased_by: form.purchased_by, notes: form.notes,
        available_copies: Number(form.total_copies) || 1,
        condition: differenceInDays(new Date(), new Date(form.purchase_date)) >= 365 ? 'old' : 'new',
      };
      if (editId) {
        const { error } = await supabase.from('library_books').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('library_books').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-books-all'] });
      toast.success(bn ? 'বই সেভ হয়েছে' : 'Book saved');
      setOpen(false); setEditId(null); setForm(emptyBook);
    },
    onError: () => toast.error(bn ? 'সমস্যা হয়েছে' : 'Error saving'),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('library_books').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-books-all'] });
      toast.success(bn ? 'বই মুছে ফেলা হয়েছে' : 'Book removed');
    },
  });

  const openEdit = (book: any) => {
    setForm({
      title: book.title || '', title_bn: book.title_bn || '', author: book.author || '', author_bn: book.author_bn || '',
      class_id: book.class_id || '', subject_id: book.subject_id || '',
      book_category: book.book_category || 'textbook',
      purchase_date: book.purchase_date || format(new Date(), 'yyyy-MM-dd'),
      buying_price: book.buying_price || 0, total_copies: book.total_copies || 1,
      purchased_by: book.purchased_by || '', notes: book.notes || '',
    });
    setEditId(book.id);
    setOpen(true);
  };

  const filtered = books.filter((b: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.title?.toLowerCase().includes(q) || b.title_bn?.includes(q) || b.author?.toLowerCase().includes(q) || b.author_bn?.includes(q);
    const matchClass = filterClass === 'all' || b.class_id === filterClass;
    return matchSearch && matchClass;
  });

  const getConditionBadge = (book: any) => {
    const age = differenceInDays(new Date(), new Date(book.purchase_date));
    if (age >= 365) return <Badge variant="secondary">{bn ? 'পুরাতন' : 'Old'}</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">{bn ? 'নতুন' : 'New'}</Badge>;
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={bn ? 'বই খুঁজুন...' : 'Search books...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={bn ? 'ক্লাস ফিল্টার' : 'Filter by class'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল ক্লাস' : 'All Classes'}</SelectItem>
              {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{bn ? c.name_bn : c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setForm(emptyBook); setEditId(null); setOpen(true); }} className="btn-primary-gradient">
          <Plus className="w-4 h-4 mr-1.5" />{bn ? 'নতুন বই যোগ করুন' : 'Add Book'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{bn ? 'কোনো বই পাওয়া যায়নি' : 'No books found'}</p>
        </div>
      ) : (
        <div className="card-elevated overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{bn ? 'বইয়ের নাম' : 'Title'}</TableHead>
                <TableHead>{bn ? 'লেখক' : 'Author'}</TableHead>
                <TableHead>{bn ? 'ক্লাস' : 'Class'}</TableHead>
                <TableHead>{bn ? 'বিষয়' : 'Subject'}</TableHead>
                <TableHead className="text-center">{bn ? 'অবস্থা' : 'Condition'}</TableHead>
                <TableHead className="text-center">{bn ? 'মোট' : 'Total'}</TableHead>
                <TableHead className="text-center">{bn ? 'উপলব্ধ' : 'Avail.'}</TableHead>
                <TableHead className="text-right">{bn ? 'দাম' : 'Price'}</TableHead>
                <TableHead className="text-center">{bn ? 'অ্যাকশন' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{bn ? (b.title_bn || b.title) : b.title}</TableCell>
                  <TableCell>{bn ? (b.author_bn || b.author) : b.author}</TableCell>
                  <TableCell>{b.classes ? (bn ? b.classes.name_bn : b.classes.name) : '—'}</TableCell>
                  <TableCell>{b.subjects ? (bn ? b.subjects.name_bn : b.subjects.name) : '—'}</TableCell>
                  <TableCell className="text-center">{getConditionBadge(b)}</TableCell>
                  <TableCell className="text-center">{b.total_copies}</TableCell>
                  <TableCell className="text-center">{b.available_copies}</TableCell>
                  <TableCell className="text-right">৳{b.buying_price}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm(bn ? 'মুছে ফেলবেন?' : 'Delete?')) deleteMut.mutate(b.id); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? (bn ? 'বই সম্পাদনা' : 'Edit Book') : (bn ? 'নতুন বই যোগ করুন' : 'Add New Book')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{bn ? 'বইয়ের নাম (ইংরেজি)' : 'Title (English)'}</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>{bn ? 'বইয়ের নাম (বাংলা)' : 'Title (Bangla)'}</Label><Input value={form.title_bn} onChange={e => setForm({ ...form, title_bn: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{bn ? 'লেখক (ইংরেজি)' : 'Author (English)'}</Label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label>{bn ? 'লেখক (বাংলা)' : 'Author (Bangla)'}</Label><Input value={form.author_bn} onChange={e => setForm({ ...form, author_bn: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{bn ? 'ক্লাস' : 'Class'}</Label>
                <Select value={form.class_id} onValueChange={v => setForm({ ...form, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder={bn ? 'সিলেক্ট করুন' : 'Select'} /></SelectTrigger>
                  <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{bn ? c.name_bn : c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{bn ? 'বিষয়' : 'Subject'}</Label>
                <Select value={form.subject_id} onValueChange={v => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder={bn ? 'সিলেক্ট করুন' : 'Select'} /></SelectTrigger>
                  <SelectContent>{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{bn ? s.name_bn : s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>{bn ? 'কেনার তারিখ' : 'Purchase Date'}</Label><Input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} /></div>
              <div><Label>{bn ? 'দাম (৳)' : 'Price (৳)'}</Label><Input type="number" value={form.buying_price || ''} onChange={e => setForm({ ...form, buying_price: Number(e.target.value) })} /></div>
              <div><Label>{bn ? 'কপি সংখ্যা' : 'Copies'}</Label><Input type="number" min={1} value={form.total_copies || ''} onChange={e => setForm({ ...form, total_copies: Number(e.target.value) })} /></div>
            </div>
            <div><Label>{bn ? 'কার জিম্মায় কেনা' : 'Purchased By'}</Label><Input value={form.purchased_by} onChange={e => setForm({ ...form, purchased_by: e.target.value })} /></div>
            <div><Label>{bn ? 'নোট' : 'Notes'}</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={() => saveMut.mutate()} disabled={!form.title.trim() && !form.title_bn.trim() || saveMut.isPending} className="btn-primary-gradient">
              {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {bn ? 'সেভ করুন' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryInventory;
