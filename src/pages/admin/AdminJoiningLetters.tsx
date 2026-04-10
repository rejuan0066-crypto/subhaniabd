import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Printer, Trash2, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminJoiningLetters = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();
  const [viewLetter, setViewLetter] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['joining-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('joining_letters')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: institution } = useQuery({
    queryKey: ['institution-info'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('*').eq('is_default', true).maybeSingle();
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('joining_letters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joining-letters'] });
      toast.success(bn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
      setDeleteId(null);
    },
  });

  const handlePrint = (letter: any) => {
    const inst = institution || { name: '', name_en: '', address: '', phone: '' };
    const html = `
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Joining Letter</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans Bengali', sans-serif; padding: 40px 60px; color: #1a1a1a; }
  .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 700; }
  .header p { font-size: 13px; color: #555; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
  .title { text-align: center; font-size: 20px; font-weight: 700; margin-bottom: 24px; text-decoration: underline; }
  .body { font-size: 15px; line-height: 2; margin-bottom: 40px; }
  .body p { margin-bottom: 12px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
  .sig { text-align: center; }
  .sig .line { width: 180px; border-top: 1px solid #333; margin-bottom: 4px; }
  .sig p { font-size: 13px; }
  @media print { body { padding: 20px 40px; } }
</style>
</head><body>
<div class="header">
  <h1>${inst.name || ''}</h1>
  ${inst.name_en ? `<p>${inst.name_en}</p>` : ''}
  ${inst.address ? `<p>${inst.address}</p>` : ''}
  ${inst.phone ? `<p>${bn ? 'ফোন' : 'Phone'}: ${inst.phone}</p>` : ''}
</div>
<div class="meta">
  <span>${bn ? 'পত্র নং' : 'Letter No'}: ${letter.letter_number || ''}</span>
  <span>${bn ? 'তারিখ' : 'Date'}: ${letter.letter_date ? new Date(letter.letter_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : ''}</span>
</div>
<div class="title">${bn ? 'যোগদান পত্র' : 'Joining Letter'}</div>
<div class="body">
  <p>${bn ? 'প্রিয়,' : 'Dear,'}</p>
  <p><strong>${letter.staff_name_bn || letter.staff_name || ''}</strong></p>
  <p>${bn 
    ? `আপনাকে জানানো যাচ্ছে যে, আপনি <strong>"${letter.designation || ''}"</strong> পদে <strong>${inst.name || 'প্রতিষ্ঠান'}</strong>-এ যোগদান করেছেন। আপনার যোগদানের তারিখ: <strong>${letter.joining_date ? new Date(letter.joining_date).toLocaleDateString('bn-BD') : ''}</strong>।`
    : `This is to certify that you have joined <strong>${inst.name_en || inst.name || 'the institution'}</strong> as <strong>"${letter.designation || ''}"</strong>. Your date of joining is: <strong>${letter.joining_date ? new Date(letter.joining_date).toLocaleDateString('en-US') : ''}</strong>.`
  }</p>
  <p>${bn
    ? 'আমরা আশা করি আপনি আন্তরিকতা ও নিষ্ঠার সাথে আপনার দায়িত্ব পালন করবেন। আপনার উজ্জ্বল ভবিষ্যৎ কামনা করি।'
    : 'We hope you will perform your duties with sincerity and dedication. We wish you a bright future.'
  }</p>
</div>
<div class="signatures">
  <div class="sig">
    <div class="line"></div>
    <p>${bn ? 'কর্মচারীর স্বাক্ষর' : "Employee's Signature"}</p>
  </div>
  <div class="sig">
    <div class="line"></div>
    <p>${bn ? 'প্রধান/অধ্যক্ষ' : 'Principal/Head'}</p>
  </div>
</div>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 600);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {bn ? 'যোগদান পত্র' : 'Joining Letters'}
            <Badge variant="outline" className="ml-2">{letters.length}</Badge>
          </h1>
        </div>

        <div className="card-elevated overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : letters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {bn ? 'কোনো যোগদান পত্র পাওয়া যায়নি। স্টাফ অনুমোদন করলে স্বয়ংক্রিয়ভাবে তৈরি হবে।' : 'No joining letters found. They are auto-created when staff applications are approved.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bn ? 'পত্র নং' : 'Letter No'}</TableHead>
                  <TableHead>{bn ? 'নাম' : 'Name'}</TableHead>
                  <TableHead>{bn ? 'পদবী' : 'Designation'}</TableHead>
                  <TableHead>{bn ? 'যোগদানের তারিখ' : 'Joining Date'}</TableHead>
                  <TableHead>{bn ? 'পত্রের তারিখ' : 'Letter Date'}</TableHead>
                  <TableHead className="text-center w-32">{bn ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-sm">{l.letter_number}</TableCell>
                    <TableCell>
                      <p className="font-medium">{l.staff_name_bn || l.staff_name}</p>
                      {l.staff_name && l.staff_name_bn && <p className="text-xs text-muted-foreground">{l.staff_name}</p>}
                    </TableCell>
                    <TableCell>{l.designation}</TableCell>
                    <TableCell>{l.joining_date ? new Date(l.joining_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : '—'}</TableCell>
                    <TableCell>{l.letter_date ? new Date(l.letter_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => setViewLetter(l)} title={bn ? 'দেখুন' : 'View'}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-green-600 hover:bg-green-500/10" onClick={() => handlePrint(l)} title={bn ? 'প্রিন্ট' : 'Print'}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(l.id)} title={bn ? 'মুছুন' : 'Delete'}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={!!viewLetter} onOpenChange={(o) => { if (!o) setViewLetter(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {bn ? 'যোগদান পত্র বিস্তারিত' : 'Joining Letter Details'}
              </DialogTitle>
            </DialogHeader>
            {viewLetter && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">{bn ? 'পত্র নং' : 'Letter No'}</p><p className="font-medium font-mono">{viewLetter.letter_number}</p></div>
                  <div><p className="text-muted-foreground">{bn ? 'তারিখ' : 'Date'}</p><p className="font-medium">{viewLetter.letter_date ? new Date(viewLetter.letter_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : '—'}</p></div>
                  <div><p className="text-muted-foreground">{bn ? 'নাম (বাংলা)' : 'Name (Bangla)'}</p><p className="font-medium">{viewLetter.staff_name_bn || '—'}</p></div>
                  <div><p className="text-muted-foreground">{bn ? 'নাম (ইংরেজি)' : 'Name (English)'}</p><p className="font-medium">{viewLetter.staff_name || '—'}</p></div>
                  <div><p className="text-muted-foreground">{bn ? 'পদবী' : 'Designation'}</p><p className="font-medium">{viewLetter.designation || '—'}</p></div>
                  <div><p className="text-muted-foreground">{bn ? 'যোগদানের তারিখ' : 'Joining Date'}</p><p className="font-medium">{viewLetter.joining_date ? new Date(viewLetter.joining_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : '—'}</p></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => { handlePrint(viewLetter); }}>
                    <Printer className="w-4 h-4 mr-2" />{bn ? 'প্রিন্ট করুন' : 'Print'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{bn ? 'মুছে ফেলতে চান?' : 'Delete this letter?'}</AlertDialogTitle>
              <AlertDialogDescription>{bn ? 'এটি স্থায়ীভাবে মুছে যাবে।' : 'This will be permanently deleted.'}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{bn ? 'না' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
                {bn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminJoiningLetters;
