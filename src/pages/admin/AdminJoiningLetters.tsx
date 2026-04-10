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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
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
  const { data: principal } = useQuery({
    queryKey: ['principal-staff'],
    queryFn: async () => {
      const { data } = await supabase
        .from('staff')
        .select('name_bn, name_en, designation')
        .in('designation', ['প্রধান শিক্ষক', 'অধ্যক্ষ', 'মুহতামিম', 'Principal'])
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
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
  <p>${bn ? 'জনাব,' : 'Dear,'}</p>
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
    ${principal ? `<p style="font-weight:600;margin-bottom:2px;">${principal.name_bn || principal.name_en || ''}</p>` : ''}
    <p>${bn ? 'অনুমোদনকারীর স্বাক্ষর' : "Authority's Signature"}</p>
    <p>${principal?.designation || (bn ? 'প্রধান/অধ্যক্ষ' : 'Principal/Head')}</p>
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
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>{bn ? 'নিয়োগপত্র' : 'Official Joining Letter'}</DialogTitle>
            </DialogHeader>
            {viewLetter && (
              <div className="flex flex-col">
                {/* Document with double border */}
                <div className="m-4 border-[3px] border-double border-foreground/30 p-1">
                  <div className="border border-foreground/15 p-7 relative overflow-hidden" style={{ fontFamily: "'Noto Serif Bengali', 'Georgia', serif" }}>

                    {/* Watermark */}
                    {institution?.logo_url && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <img src={institution.logo_url} alt="" className="w-56 h-56 object-contain opacity-[0.06]" />
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Header with logo + institution */}
                      <div className="flex items-center gap-4 border-b-[3px] border-double border-foreground/40 pb-4 mb-5">
                        {institution?.logo_url && (
                          <img src={institution.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded" />
                        )}
                        <div className="flex-1 text-center">
                          <h2 className="text-xl font-bold text-foreground">{institution?.name || ''}</h2>
                          {institution?.name_en && <p className="text-sm text-muted-foreground">{institution.name_en}</p>}
                          {institution?.address && <p className="text-xs text-muted-foreground mt-0.5">{institution.address}</p>}
                          {institution?.phone && <p className="text-xs text-muted-foreground">{bn ? 'ফোন' : 'Phone'}: {institution.phone}</p>}
                        </div>
                        <div className="w-14" />
                      </div>

                      {/* Formal title */}
                      <div className="text-center mb-5">
                        <h3 className="text-lg font-bold tracking-wider text-foreground uppercase">
                          {bn ? 'নিয়োগপত্র' : 'OFFICIAL JOINING LETTER'}
                        </h3>
                        <p className="text-xs text-muted-foreground tracking-wide">{bn ? 'OFFICIAL JOINING LETTER' : 'নিয়োগপত্র'}</p>
                        <div className="mx-auto mt-1.5 w-24 border-b-2 border-foreground/30" />
                      </div>

                      {/* Meta row */}
                      <div className="flex justify-between text-sm text-muted-foreground mb-5">
                        <span>{bn ? 'পত্র নং' : 'Ref'}: <span className="font-mono font-semibold text-foreground">{viewLetter.letter_number}</span></span>
                        <span>{bn ? 'তারিখ' : 'Date'}: <span className="font-medium text-foreground">{viewLetter.letter_date ? new Date(viewLetter.letter_date).toLocaleDateString(bn ? 'bn-BD' : 'en-US') : '—'}</span></span>
                      </div>

                      {/* Profile + Letter body */}
                      <div className="flex gap-5 mb-6">
                        <div className="flex-1 text-sm text-foreground space-y-3" style={{ lineHeight: '2.2' }}>
                          <p>{bn ? 'জনাব,' : 'Dear,'}</p>
                          <p className="font-bold text-base" style={{ color: 'hsl(var(--primary))' }}>
                            {viewLetter.staff_name_bn || viewLetter.staff_name || '—'}
                          </p>
                          <p>
                            {bn
                              ? <>এই পত্র দ্বারা প্রত্যয়ন করা যাচ্ছে যে, <strong style={{ color: 'hsl(var(--primary))' }}>{viewLetter.staff_name_bn || viewLetter.staff_name || ''}</strong> (আইডি: <span className="font-mono font-semibold">{viewLetter.letter_number}</span>) <strong style={{ color: 'hsl(var(--primary))' }}>"{viewLetter.designation || ''}"</strong> পদে <strong>{institution?.name || 'প্রতিষ্ঠান'}</strong>-এ আনুষ্ঠানিকভাবে যোগদান করেছেন। তাঁর যোগদানের তারিখ: <strong>{viewLetter.joining_date ? new Date(viewLetter.joining_date).toLocaleDateString('bn-BD') : ''}</strong>। আমরা তাঁকে আমাদের প্রতিষ্ঠানে স্বাগত জানাচ্ছি এবং আশা করি তিনি আন্তরিকতা ও নিষ্ঠার সাথে দায়িত্ব পালন করবেন।</>
                              : <>This is to certify that <strong style={{ color: 'hsl(var(--primary))' }}>{viewLetter.staff_name || viewLetter.staff_name_bn || ''}</strong> (ID: <span className="font-mono font-semibold">{viewLetter.letter_number}</span>) has officially joined <strong>{institution?.name_en || institution?.name || 'the institution'}</strong> as <strong style={{ color: 'hsl(var(--primary))' }}>"{viewLetter.designation || ''}"</strong>. The date of joining is: <strong>{viewLetter.joining_date ? new Date(viewLetter.joining_date).toLocaleDateString('en-US') : ''}</strong>. We welcome them to our institution and wish them a successful career.</>
                            }
                          </p>
                        </div>
                        {/* Profile photo */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                          <Avatar className="w-[88px] h-[88px] border-2 border-foreground/20 rounded-md">
                            <AvatarImage src={(viewLetter.letter_data as any)?.photo_url} className="object-cover" />
                            <AvatarFallback className="rounded-md bg-muted text-muted-foreground text-2xl">
                              {(viewLetter.staff_name_bn || viewLetter.staff_name || '?').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-[10px] text-muted-foreground">{bn ? 'প্রার্থীর ছবি' : 'Photo'}</p>
                        </div>
                      </div>

                      {/* Signature area with QR + Seal */}
                      <div className="flex justify-between items-end mt-12 pt-4">
                        {/* QR placeholder */}
                        <div className="flex flex-col items-center gap-1">
                          <QRCodeSVG
                            value={`JL:${viewLetter.letter_number}|${viewLetter.staff_name}|${viewLetter.joining_date}`}
                            size={64}
                            level="M"
                            className="opacity-80"
                          />
                          <p className="text-[9px] text-muted-foreground">{bn ? 'ডিজিটাল যাচাই' : 'Digital Verification'}</p>
                        </div>

                        {/* Employee signature */}
                        <div className="text-center">
                          <div className="w-36 border-t border-foreground/40 mb-1" />
                          <p className="text-[11px] text-muted-foreground">{bn ? 'কর্মচারীর স্বাক্ষর' : "Employee's Signature"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{bn ? 'তারিখ: __________' : 'Date: __________'}</p>
                        </div>

                        {/* Authority signature + Seal */}
                        <div className="flex items-end gap-3">
                          {/* Official seal placeholder */}
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-foreground/25 flex items-center justify-center">
                            <span className="text-[7px] text-muted-foreground text-center leading-tight">{bn ? 'সিল' : 'Official'}<br/>{bn ? '' : 'Seal'}</span>
                          </div>
                          <div className="text-center">
                            <div className="w-36 border-t border-foreground/40 mb-1" />
                            {principal && (
                              <p className="text-[11px] font-semibold text-foreground">{principal.name_bn || principal.name_en}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground font-medium">{bn ? 'অনুমোদনকারীর স্বাক্ষর' : "Authority's Signature"}</p>
                            <p className="text-[10px] text-muted-foreground">{principal?.designation || (bn ? 'প্রধান / অধ্যক্ষ' : 'Principal / Head')}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{bn ? 'তারিখ: __________' : 'Date: __________'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print button outside document border */}
                <div className="px-4 pb-4">
                  <Button className="w-full" onClick={() => handlePrint(viewLetter)}>
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
