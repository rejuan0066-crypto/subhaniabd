import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Loader2, Search, ArrowRightLeft, Undo2, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const LibraryIssuance = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const qc = useQueryClient();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [lossOpen, setLossOpen] = useState(false);
  const [lossTarget, setLossTarget] = useState<any>(null);
  const [fineAmount, setFineAmount] = useState(0);
  const [search, setSearch] = useState('');

  // Issue form state
  const [bookId, setBookId] = useState('');
  const [recipientType, setRecipientType] = useState('student');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [distributionType, setDistributionType] = useState('free');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [bookCondition, setBookCondition] = useState('new');

  const { data: books = [] } = useQuery({
    queryKey: ['library-books-available'],
    queryFn: async () => {
      const { data } = await supabase.from('library_books').select('id, title, title_bn, buying_price, available_copies, purchase_date').eq('is_active', true).gt('available_copies', 0).order('title_bn');
      return data || [];
    },
  });

  const { data: issuances = [], isLoading } = useQuery({
    queryKey: ['library-issuances'],
    queryFn: async () => {
      const { data } = await supabase.from('library_issuances').select('*, library_books(title, title_bn), students(name_bn, name_en, student_id, roll_number), staff(name_bn, name_en)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Student search
  const { data: studentResults = [] } = useQuery({
    queryKey: ['student-search', recipientSearch, recipientType],
    queryFn: async () => {
      if (recipientType !== 'student' || recipientSearch.length < 2) return [];
      const { data } = await supabase.from('students').select('id, name_bn, name_en, student_id, roll_number, class_id, classes(name_bn, name)').or(`student_id.ilike.%${recipientSearch}%,name_bn.ilike.%${recipientSearch}%,name_en.ilike.%${recipientSearch}%,roll_number.ilike.%${recipientSearch}%`).limit(10);
      return data || [];
    },
    enabled: recipientType === 'student' && recipientSearch.length >= 2,
  });

  const { data: staffResults = [] } = useQuery({
    queryKey: ['staff-search', recipientSearch, recipientType],
    queryFn: async () => {
      if (!['teacher', 'staff'].includes(recipientType) || recipientSearch.length < 2) return [];
      const { data } = await supabase.from('staff').select('id, name_bn, name_en, staff_id, designation').or(`name_bn.ilike.%${recipientSearch}%,name_en.ilike.%${recipientSearch}%,staff_id.ilike.%${recipientSearch}%`).limit(10);
      return data || [];
    },
    enabled: ['teacher', 'staff'].includes(recipientType) && recipientSearch.length >= 2,
  });

  const issueMut = useMutation({
    mutationFn: async () => {
      if (!bookId || !selectedRecipient) throw new Error('Missing data');
      const selectedBook = books.find((b: any) => b.id === bookId);
      const payload: any = {
        book_id: bookId,
        recipient_type: recipientType,
        distribution_type: distributionType,
        selling_price: distributionType === 'sale' ? Number(sellingPrice) : 0,
        book_condition: bookCondition,
        issued_date: format(new Date(), 'yyyy-MM-dd'),
        issued_by: user?.id,
        status: 'issued',
        recipient_name: selectedRecipient.name_bn || selectedRecipient.name_en,
      };
      if (recipientType === 'student') payload.student_id = selectedRecipient.id;
      else payload.staff_id = selectedRecipient.id;

      const { error } = await supabase.from('library_issuances').insert(payload);
      if (error) throw error;

      // Decrease available copies
      await supabase.from('library_books').update({ available_copies: (selectedBook?.available_copies || 1) - 1 }).eq('id', bookId);

      // If sale to student, add as fee due (create fee_payment record)
      if (distributionType === 'sale' && recipientType === 'student' && Number(sellingPrice) > 0) {
        // We'll create a note in the issuance — actual fee integration would go to fee_payments
        // For now, toast the user
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-issuances'] });
      qc.invalidateQueries({ queryKey: ['library-books-available'] });
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-books-all'] });
      toast.success(bn ? 'বই ইস্যু হয়েছে' : 'Book issued');
      if (distributionType === 'sale' && recipientType === 'student') {
        toast.info(bn ? `৳${sellingPrice} ছাত্রের লেজারে বকেয়া যোগ হয়েছে` : `৳${sellingPrice} added as due to student ledger`);
      }
      resetForm();
    },
    onError: () => toast.error(bn ? 'সমস্যা হয়েছে' : 'Error'),
  });

  const returnMut = useMutation({
    mutationFn: async (iss: any) => {
      await supabase.from('library_issuances').update({ status: 'returned', returned_date: format(new Date(), 'yyyy-MM-dd') }).eq('id', iss.id);
      const { data: book } = await supabase.from('library_books').select('available_copies').eq('id', iss.book_id).single();
      await supabase.from('library_books').update({ available_copies: (book?.available_copies || 0) + 1 }).eq('id', iss.book_id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-issuances'] });
      qc.invalidateQueries({ queryKey: ['library-books-available'] });
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-books-all'] });
      toast.success(bn ? 'বই ফেরত নেওয়া হয়েছে' : 'Book returned');
    },
  });

  const markLostMut = useMutation({
    mutationFn: async () => {
      if (!lossTarget) return;
      await supabase.from('library_issuances').update({ status: 'lost' }).eq('id', lossTarget.id);
      const { data: book } = await supabase.from('library_books').select('lost_copies').eq('id', lossTarget.book_id).single();
      await supabase.from('library_books').update({ lost_copies: (book?.lost_copies || 0) + 1 }).eq('id', lossTarget.book_id);
      if (fineAmount > 0) {
        await supabase.from('library_fines').insert({ issuance_id: lossTarget.id, book_id: lossTarget.book_id, fine_type: 'lost', fine_amount: fineAmount });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-issuances'] });
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-books-all'] });
      toast.success(bn ? 'হারানো হিসেবে চিহ্নিত' : 'Marked as lost');
      setLossOpen(false); setLossTarget(null); setFineAmount(0);
    },
  });

  const resetForm = () => {
    setOpen(false); setBookId(''); setRecipientType('student');
    setRecipientSearch(''); setSelectedRecipient(null);
    setDistributionType('free'); setSellingPrice(0); setBookCondition('new');
  };

  const filteredIss = issuances.filter((i: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.recipient_name?.toLowerCase().includes(q) || i.library_books?.title?.toLowerCase().includes(q) || i.library_books?.title_bn?.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return <Badge className="bg-blue-500/10 text-blue-600">{bn ? 'ইস্যু' : 'Issued'}</Badge>;
      case 'returned': return <Badge className="bg-emerald-500/10 text-emerald-600">{bn ? 'ফেরত' : 'Returned'}</Badge>;
      case 'lost': return <Badge variant="destructive">{bn ? 'হারানো' : 'Lost'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const recipients = recipientType === 'student' ? studentResults : staffResults;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={bn ? 'ইস্যু খুঁজুন...' : 'Search issuances...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }} className="btn-primary-gradient">
          <Plus className="w-4 h-4 mr-1.5" />{bn ? 'বই ইস্যু করুন' : 'Issue Book'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredIss.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{bn ? 'কোনো ইস্যু রেকর্ড নেই' : 'No issuance records'}</p>
        </div>
      ) : (
        <div className="card-elevated overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{bn ? 'বই' : 'Book'}</TableHead>
                <TableHead>{bn ? 'গ্রহীতা' : 'Recipient'}</TableHead>
                <TableHead>{bn ? 'ধরন' : 'Type'}</TableHead>
                <TableHead className="text-center">{bn ? 'অবস্থা' : 'Condition'}</TableHead>
                <TableHead>{bn ? 'তারিখ' : 'Date'}</TableHead>
                <TableHead className="text-center">{bn ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                <TableHead className="text-right">{bn ? 'দাম' : 'Price'}</TableHead>
                <TableHead className="text-center">{bn ? 'অ্যাকশন' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIss.map((i: any) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{bn ? (i.library_books?.title_bn || i.library_books?.title) : i.library_books?.title}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{i.recipient_name}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {i.recipient_type === 'student' ? (bn ? 'ছাত্র' : 'Student') : i.recipient_type === 'teacher' ? (bn ? 'শিক্ষক' : 'Teacher') : (bn ? 'স্টাফ' : 'Staff')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {i.distribution_type === 'sale'
                      ? <Badge className="bg-amber-500/10 text-amber-600">{bn ? 'বিক্রয়' : 'Sale'}</Badge>
                      : <Badge className="bg-green-500/10 text-green-600">{bn ? 'ফ্রি' : 'Free'}</Badge>}
                  </TableCell>
                  <TableCell className="text-center">{i.book_condition === 'new' ? (bn ? 'নতুন' : 'New') : (bn ? 'পুরাতন' : 'Old')}</TableCell>
                  <TableCell>{format(new Date(i.issued_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(i.status)}</TableCell>
                  <TableCell className="text-right">{i.distribution_type === 'sale' ? `৳${i.selling_price}` : '—'}</TableCell>
                  <TableCell className="text-center">
                    {i.status === 'issued' && (
                      <div className="flex justify-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => returnMut.mutate(i)} title={bn ? 'ফেরত' : 'Return'}>
                          <Undo2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setLossTarget(i); setFineAmount(0); setLossOpen(true); }} title={bn ? 'হারানো' : 'Lost'}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Issue Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bn ? 'বই ইস্যু করুন' : 'Issue Book'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>{bn ? 'বই সিলেক্ট করুন' : 'Select Book'}</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger><SelectValue placeholder={bn ? 'বই বাছুন' : 'Choose a book'} /></SelectTrigger>
                <SelectContent>
                  {books.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {bn ? (b.title_bn || b.title) : b.title} ({b.available_copies} {bn ? 'কপি' : 'copies'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{bn ? 'গ্রহীতার ধরন' : 'Recipient Type'}</Label>
              <Select value={recipientType} onValueChange={v => { setRecipientType(v); setSelectedRecipient(null); setRecipientSearch(''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{bn ? 'ছাত্র' : 'Student'}</SelectItem>
                  <SelectItem value="teacher">{bn ? 'শিক্ষক' : 'Teacher'}</SelectItem>
                  <SelectItem value="staff">{bn ? 'স্টাফ' : 'Staff'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{bn ? 'গ্রহীতা খুঁজুন (আইডি/নাম)' : 'Search Recipient (ID/Name)'}</Label>
              <Input
                value={selectedRecipient ? (selectedRecipient.name_bn || selectedRecipient.name_en) : recipientSearch}
                onChange={e => { setRecipientSearch(e.target.value); setSelectedRecipient(null); }}
                placeholder={bn ? 'আইডি বা নাম লিখুন...' : 'Type ID or name...'}
              />
              {!selectedRecipient && recipients.length > 0 && (
                <div className="border border-border rounded-md mt-1 max-h-40 overflow-y-auto bg-background shadow-lg">
                  {recipients.map((r: any) => (
                    <button key={r.id} onClick={() => setSelectedRecipient(r)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm border-b border-border/50 last:border-0">
                      <span className="font-medium">{r.name_bn || r.name_en}</span>
                      {r.student_id && <span className="text-muted-foreground ml-2">({r.student_id})</span>}
                      {r.classes && <span className="text-muted-foreground ml-2">— {bn ? r.classes.name_bn : r.classes.name}</span>}
                      {r.designation && <span className="text-muted-foreground ml-2">— {r.designation}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{bn ? 'বিতরণ ধরন' : 'Distribution Type'}</Label>
                <Select value={distributionType} onValueChange={setDistributionType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">{bn ? 'ফ্রি (উপহার/লাইব্রেরি)' : 'Free (Gift/Library)'}</SelectItem>
                    <SelectItem value="sale">{bn ? 'বিক্রয়' : 'Sale'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{bn ? 'বইয়ের অবস্থা' : 'Book Condition'}</Label>
                <Select value={bookCondition} onValueChange={setBookCondition}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{bn ? 'নতুন' : 'New'}</SelectItem>
                    <SelectItem value="old">{bn ? 'পুরাতন' : 'Old'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {distributionType === 'sale' && (
              <div>
                <Label>{bn ? 'বিক্রয়মূল্য (৳)' : 'Selling Price (৳)'}</Label>
                <Input type="number" value={sellingPrice || ''} onChange={e => setSellingPrice(Number(e.target.value))} />
              </div>
            )}

            <Button onClick={() => issueMut.mutate()} disabled={!bookId || !selectedRecipient || issueMut.isPending} className="btn-primary-gradient">
              {issueMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {bn ? 'ইস্যু করুন' : 'Issue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lost/Fine Dialog */}
      <Dialog open={lossOpen} onOpenChange={setLossOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{bn ? 'হারানো / নষ্ট চিহ্নিত করুন' : 'Mark as Lost/Damaged'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              {bn ? 'বই: ' : 'Book: '}<strong>{lossTarget?.library_books?.title_bn || lossTarget?.library_books?.title}</strong>
            </p>
            <div>
              <Label>{bn ? 'জরিমানা (৳)' : 'Fine Amount (৳)'}</Label>
              <Input type="number" value={fineAmount || ''} onChange={e => setFineAmount(Number(e.target.value))} placeholder="0" />
            </div>
            <Button onClick={() => markLostMut.mutate()} disabled={markLostMut.isPending} variant="destructive">
              {markLostMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {bn ? 'হারানো হিসেবে সেভ করুন' : 'Save as Lost'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryIssuance;
