import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { CheckCircle2, Download, Printer, Receipt, Search, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { numberToBanglaWords, toBanglaDigits } from '@/lib/amountInWords';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ReceiptData {
  id: string;
  receipt_number: string;
  student_name: string;
  student_id: string;
  class_name: string;
  roll: string;
  fee_type: string;
  amount: number;
  paid_amount: number;
  status: string;
  paid_at: string;
  month: string;
  year: number;
}

const AdminFeeReceipts = () => {
  const { language } = useLanguage();
  const [searchRoll, setSearchRoll] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  const { data: institution } = useQuery({
    queryKey: ['institution-receipt'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('*').eq('is_default', true).maybeSingle();
      return data;
    }
  });

  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academic-sessions-receipts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ['fee-payments-receipts', selectedYear, selectedMonth, searchRoll],
    queryFn: async () => {
      let query = supabase
        .from('fee_payments')
        .select(`
          *,
          students!inner(name_bn, name_en, student_id, roll_number, division_id, divisions:division_id(name, name_bn)),
          fee_types!inner(name, name_bn, fee_category)
        `)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false });

      if (selectedYear) query = query.eq('year', parseInt(selectedYear));
      if (selectedMonth) query = query.eq('month', selectedMonth);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        receipt_number: p.receipt_number || `RCP-${p.id.slice(0, 8).toUpperCase()}`,
        student_name: p.students?.name_bn || p.students?.name_en || '',
        student_id: p.students?.student_id || '',
        class_name: p.students?.divisions?.name_bn || p.students?.divisions?.name || '',
        roll: p.students?.roll_number || '',
        fee_type: language === 'bn' ? p.fee_types?.name_bn : p.fee_types?.name,
        amount: p.amount,
        paid_amount: p.paid_amount || p.amount,
        status: p.status,
        paid_at: p.paid_at,
        month: p.month,
        year: p.year,
      })) as ReceiptData[];
    }
  });

  const filteredPayments = (payments || []).filter(p =>
    !searchRoll || p.roll?.includes(searchRoll) || p.student_id?.includes(searchRoll) || p.student_name?.includes(searchRoll)
  );

  const months = [
    { value: 'january', en: 'January', bn: 'জানুয়ারি' },
    { value: 'february', en: 'February', bn: 'ফেব্রুয়ারি' },
    { value: 'march', en: 'March', bn: 'মার্চ' },
    { value: 'april', en: 'April', bn: 'এপ্রিল' },
    { value: 'may', en: 'May', bn: 'মে' },
    { value: 'june', en: 'June', bn: 'জুন' },
    { value: 'july', en: 'July', bn: 'জুলাই' },
    { value: 'august', en: 'August', bn: 'আগস্ট' },
    { value: 'september', en: 'September', bn: 'সেপ্টেম্বর' },
    { value: 'october', en: 'October', bn: 'অক্টোবর' },
    { value: 'november', en: 'November', bn: 'নভেম্বর' },
    { value: 'december', en: 'December', bn: 'ডিসেম্বর' },
  ];

  const handlePrint = (receipt: ReceiptData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const amountWords = numberToBanglaWords(receipt.paid_amount);
    const amountBn = toBanglaDigits(receipt.paid_amount.toLocaleString());
    const dateBn = receipt.paid_at ? new Date(receipt.paid_at).toLocaleDateString('bn-BD') : '-';
    const monthLabel = receipt.month || '-';
    const logoTag = institution?.logo_url ? `<img src="${institution.logo_url}" style="height:52px;object-fit:contain;" />` : '';

    const html = `
    <!DOCTYPE html>
    <html><head>
      <meta charset="utf-8" />
      <title>মানি রিসিট - ${receipt.receipt_number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'SutonnyOMJ','Noto Sans Bengali',sans-serif; background:#f0fdf4; display:flex; justify-content:center; padding:30px 15px; }
        .receipt { background:#fff; width:100%; max-width:560px; border:3px solid #059669; border-radius:0; position:relative; }
        .receipt::before { content:''; position:absolute; top:4px; left:4px; right:4px; bottom:4px; border:1px solid #d1fae5; pointer-events:none; }
        .header { background:linear-gradient(135deg,#064e3b,#059669); color:#fff; padding:20px 24px 16px; text-align:center; }
        .header .logo-row { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:8px; }
        .header .inst-name { font-size:20px; font-weight:800; letter-spacing:0.5px; }
        .header .inst-name-en { font-size:13px; font-weight:600; opacity:0.9; margin-top:2px; }
        .header .inst-addr { font-size:11px; opacity:0.8; margin-top:4px; line-height:1.5; }
        .receipt-title { background:#ecfdf5; border-bottom:2px solid #059669; padding:10px 0; text-align:center; }
        .receipt-title h2 { font-size:18px; font-weight:800; color:#064e3b; letter-spacing:3px; }
        .receipt-title .sub { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:2px; margin-top:2px; }
        .body { padding:20px 24px; }
        .info-grid { display:grid; grid-template-columns:140px 1fr; gap:8px 12px; margin-bottom:16px; }
        .info-grid .lbl { font-size:12px; font-weight:600; color:#374151; }
        .info-grid .val { font-size:13px; font-weight:700; color:#0f172a; border-bottom:1px dotted #d1d5db; padding-bottom:2px; }
        .amount-box { background:linear-gradient(135deg,#ecfdf5,#d1fae5); border:2px solid #059669; border-radius:10px; padding:16px 20px; margin:16px 0; text-align:center; }
        .amount-box .figure { font-size:32px; font-weight:800; color:#064e3b; }
        .amount-box .taka { font-size:18px; }
        .amount-box .words { font-size:13px; color:#065f46; margin-top:6px; font-weight:600; font-style:italic; }
        .divider { border:none; border-top:1px dashed #a7f3d0; margin:16px 0; }
        .sig-section { display:flex; justify-content:space-between; margin-top:44px; gap:30px; }
        .sig-block { flex:1; text-align:center; }
        .sig-line { border-top:1.5px solid #374151; padding-top:6px; font-size:11px; font-weight:600; color:#374151; }
        .sig-role { font-size:9px; color:#6b7280; margin-top:2px; }
        .footer { text-align:center; padding:12px; background:#f0fdf4; border-top:1px solid #d1fae5; }
        .footer p { font-size:9px; color:#6b7280; }
        .badge { display:inline-block; background:#d1fae5; color:#065f46; font-size:10px; font-weight:700; padding:3px 10px; border-radius:12px; letter-spacing:1px; }
        @media print { body { background:#fff; padding:0; } .receipt { border:2px solid #059669; max-width:100%; } }
      </style>
    </head><body>
      <div class="receipt">
        <div class="header">
          <div class="logo-row">
            ${logoTag}
            <div>
              <div class="inst-name">${institution?.name || 'প্রতিষ্ঠানের নাম'}</div>
              ${institution?.name_en ? `<div class="inst-name-en">${institution.name_en}</div>` : ''}
            </div>
          </div>
          <div class="inst-addr">
            ${institution?.address || ''}
            ${institution?.phone ? `<br>${language === 'bn' ? 'ফোন' : 'Phone'}: ${institution.phone}` : ''}
            ${institution?.email ? ` | ${language === 'bn' ? 'ইমেইল' : 'Email'}: ${institution.email}` : ''}
          </div>
        </div>

        <div class="receipt-title">
          <h2>মানি রিসিট</h2>
          <div class="sub">MONEY RECEIPT</div>
        </div>

        <div class="body">
          <div class="info-grid">
            <span class="lbl">রসিদ নং:</span>
            <span class="val">${receipt.receipt_number}</span>
            <span class="lbl">তারিখ:</span>
            <span class="val">${dateBn}</span>
            <span class="lbl">স্ট্যাটাস:</span>
            <span class="val"><span class="badge">✓ পরিশোধিত</span></span>
          </div>

          <hr class="divider" />

          <div class="info-grid">
            <span class="lbl">ছাত্রের নাম:</span>
            <span class="val">${receipt.student_name}</span>
            <span class="lbl">ছাত্র আইডি:</span>
            <span class="val">${receipt.student_id}</span>
            <span class="lbl">শ্রেণী:</span>
            <span class="val">${receipt.class_name}</span>
            <span class="lbl">রোল নম্বর:</span>
            <span class="val">${receipt.roll}</span>
          </div>

          <hr class="divider" />

          <div class="info-grid">
            <span class="lbl">ফি এর ধরন:</span>
            <span class="val">${receipt.fee_type}</span>
            <span class="lbl">মাস:</span>
            <span class="val">${monthLabel}</span>
            <span class="lbl">বছর:</span>
            <span class="val">${receipt.year || '-'}</span>
          </div>

          <div class="amount-box">
            <div class="figure"><span class="taka">৳</span> ${amountBn}</div>
            <div class="words">কথায়: ${amountWords}</div>
          </div>

          <div class="sig-section">
            <div class="sig-block">
              <div class="sig-line">হিসাবরক্ষক / গ্রহণকারী</div>
              <div class="sig-role">Accountant / Receiver</div>
            </div>
            <div class="sig-block">
              <div class="sig-line">অভিভাবক / ছাত্র</div>
              <div class="sig-role">Guardian / Student</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>এটি কম্পিউটার জেনারেটেড মানি রিসিট | Computer Generated Money Receipt</p>
          ${institution?.other_info ? `<p style="margin-top:4px">${institution.other_info}</p>` : ''}
        </div>
      </div>
    </body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {language === 'bn' ? '🧾 ফি রসিদ' : '🧾 Fee Receipts'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'bn' ? 'পরিশোধিত ফি এর রসিদ দেখুন ও প্রিন্ট করুন' : 'View and print paid fee receipts'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'নাম / রোল / আইডি...' : 'Name / Roll / ID...'}
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-background">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder={language === 'bn' ? 'বছর' : 'Year'} />
              </SelectTrigger>
              <SelectContent>
                {academicSessions.map((s: any) => (
                  <SelectItem key={s.id} value={s.name}>{language === 'bn' ? (s.name_bn || s.name) : s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={language === 'bn' ? 'সব মাস' : 'All Months'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব মাস' : 'All Months'}</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{language === 'bn' ? m.bn : m.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="w-4 h-4" />
              <span>{language === 'bn' ? `মোট: ${filteredPayments.length}টি` : `Total: ${filteredPayments.length}`}</span>
            </div>
          </div>
        </div>

        {/* Receipt Preview or List */}
        {selectedReceipt ? (
          <div className="animate-fade-in">
            {/* Floating Receipt Card */}
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="text-center pt-8 pb-4 px-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle2 className="w-7 h-7 text-success-foreground" />
                  </div>
                  {institution?.logo_url && (
                    <img src={institution.logo_url} alt="Logo" className="h-10 mx-auto mb-2 object-contain" />
                  )}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-lg font-bold text-foreground">{institution?.name || 'প্রতিষ্ঠান'}</h2>
                  </div>
                  {institution?.name_en && (
                    <p className="text-sm font-semibold text-foreground/80">{institution.name_en}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{institution?.address || ''}</p>
                  {institution?.phone && (
                    <p className="text-xs text-muted-foreground">{language === 'bn' ? 'ফোন' : 'Phone'}: {institution.phone}</p>
                  )}
                  {institution?.email && (
                    <p className="text-xs text-muted-foreground">{language === 'bn' ? 'ইমেইল' : 'Email'}: {institution.email}</p>
                  )}
                  {institution?.other_info && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{institution.other_info}</p>
                  )}
                  <p className="text-[11px] uppercase tracking-[3px] text-muted-foreground/60 mt-3 font-medium">
                    {language === 'bn' ? 'পেমেন্ট রসিদ' : 'Payment Receipt'}
                  </p>
                </div>

                {/* Order Info */}
                <div className="mx-5 mb-3 bg-muted/50 rounded-2xl p-4 space-y-2">
                  <InfoRow label={language === 'bn' ? 'রসিদ নং' : 'Receipt No'} value={selectedReceipt.receipt_number} />
                  <InfoRow label={language === 'bn' ? 'তারিখ' : 'Date'} value={selectedReceipt.paid_at ? new Date(selectedReceipt.paid_at).toLocaleDateString('bn-BD') : '-'} />
                  <InfoRow label={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} value={
                    <span className="inline-block bg-success/15 text-success text-[11px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      {language === 'bn' ? 'পরিশোধিত' : 'Paid'}
                    </span>
                  } />
                </div>

                {/* Student Info */}
                <div className="mx-5 mb-3 bg-muted/50 rounded-2xl p-4 space-y-2">
                  <InfoRow label={language === 'bn' ? 'ছাত্রের নাম' : 'Student'} value={selectedReceipt.student_name} />
                  <InfoRow label={language === 'bn' ? 'আইডি' : 'ID'} value={selectedReceipt.student_id} />
                  <InfoRow label={language === 'bn' ? 'শ্রেণী' : 'Class'} value={selectedReceipt.class_name} />
                  <InfoRow label={language === 'bn' ? 'রোল' : 'Roll'} value={selectedReceipt.roll} />
                </div>

                {/* Fee Details */}
                <div className="mx-5 mb-3 bg-muted/50 rounded-2xl p-4 space-y-2">
                  <InfoRow label={language === 'bn' ? 'ফি এর ধরন' : 'Fee Type'} value={selectedReceipt.fee_type} />
                  <InfoRow label={language === 'bn' ? 'মাস' : 'Month'} value={selectedReceipt.month || '-'} />
                  <InfoRow label={language === 'bn' ? 'বছর' : 'Year'} value={String(selectedReceipt.year || '-')} />
                </div>

                {/* Dashed separator + Total */}
                <div className="mx-5 mb-2">
                  <div className="border-t-2 border-dashed border-border my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      {language === 'bn' ? 'মোট পরিশোধ' : 'Total Paid'}
                    </span>
                    <span className="text-3xl font-extrabold text-primary">
                      <span className="text-lg font-medium">৳</span>{selectedReceipt.paid_amount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                {/* Signature */}
                <div className="mx-5 mt-8 mb-2 flex justify-between gap-8">
                  <div className="flex-1 text-center">
                    <div className="border-t border-border pt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {language === 'bn' ? 'গ্রহণকারী' : 'Received By'}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="border-t border-border pt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {language === 'bn' ? 'অনুমোদনকারী' : 'Authorized By'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center py-4 text-[10px] text-muted-foreground/50">
                  {language === 'bn' ? 'এটি কম্পিউটার জেনারেটেড রসিদ' : 'This is a computer-generated receipt'}
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-6 flex gap-3">
                  <Button
                    className="flex-1 rounded-xl bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground font-semibold"
                    onClick={() => handlePrint(selectedReceipt)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'ডাউনলোড' : 'Download PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl backdrop-blur-sm border-border/60 font-semibold"
                    onClick={() => handlePrint(selectedReceipt)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'প্রিন্ট' : 'Print'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button variant="ghost" onClick={() => setSelectedReceipt(null)} className="text-muted-foreground">
                ← {language === 'bn' ? 'তালিকায় ফিরুন' : 'Back to list'}
              </Button>
            </div>
          </div>
        ) : (
          /* Receipt Table */
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'রসিদ নং' : 'Receipt #'}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'ছাত্র' : 'Student'}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                      {language === 'bn' ? 'ফি' : 'Fee'}
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'পরিমাণ' : 'Amount'}
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'অ্যাকশন' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                      {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                    </td></tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12">
                      <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">{language === 'bn' ? 'কোনো রসিদ পাওয়া যায়নি' : 'No receipts found'}</p>
                    </td></tr>
                  ) : filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{p.receipt_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.student_name}</div>
                        <div className="text-xs text-muted-foreground">{p.class_name} • {language === 'bn' ? 'রোল' : 'Roll'}: {p.roll}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.fee_type}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">৳{p.paid_amount.toLocaleString('bn-BD')}</td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary" onClick={() => setSelectedReceipt(p)}>
                          <Receipt className="w-4 h-4 mr-1" />
                          {language === 'bn' ? 'রসিদ' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground font-medium">{label}</span>
    <span className="text-sm font-semibold text-foreground">{typeof value === 'string' ? value : value}</span>
  </div>
);

export default AdminFeeReceipts;
