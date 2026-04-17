import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

const DuesManagement = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const now = new Date();
  const currentMonthKey = `${MONTHS[now.getMonth()]}-${now.getFullYear()}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [searchText, setSearchText] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const { data: students = [] } = useQuery({
    queryKey: ['dues-students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, name_bn, name_en, student_id, roll_number, class_id, phone, guardian_phone, status, classes(name, name_bn)').eq('status', 'active');
      return data || [];
    },
  });

  const { data: feeTypes = [] } = useQuery({
    queryKey: ['dues-fee-types'],
    queryFn: async () => {
      const { data } = await supabase.from('fee_types').select('*').eq('is_active', true).eq('payment_frequency', 'monthly');
      return data || [];
    },
  });

  const { data: feePayments = [] } = useQuery({
    queryKey: ['dues-fee-payments', selectedMonth],
    queryFn: async () => {
      const parts = selectedMonth.split('-');
      const month = parts[0];
      const year = parseInt(parts[1]);
      const { data } = await supabase.from('fee_payments').select('student_id, fee_type_id, status, paid_amount, amount').eq('month', month).eq('year', year).eq('status', 'paid');
      return data || [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['dues-classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('id, name, name_bn').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  const { data: waivers = [] } = useQuery({
    queryKey: ['dues-waivers'],
    queryFn: async () => {
      const { data } = await supabase.from('fee_waivers').select('student_id, fee_type_id, waiver_percent').eq('is_active', true);
      return data || [];
    },
  });

  // Filter fee types applicable to the selected month
  const applicableFeeTypesForMonth = useMemo(() => {
    const selectedMonthName = selectedMonth.split('-')[0];
    return feeTypes.filter(ft => {
      const months = Array.isArray(ft.applicable_months) ? ft.applicable_months : [];
      // If no applicable_months specified, assume all months
      if (months.length === 0) return true;
      return months.includes(selectedMonthName);
    });
  }, [feeTypes, selectedMonth]);

  const dueStudents = useMemo(() => {
    // Map of student_id -> Set of paid fee_type_ids for the selected month
    const paidMap = new Map<string, Set<string>>();
    feePayments.forEach(fp => {
      if (!paidMap.has(fp.student_id)) paidMap.set(fp.student_id, new Set());
      paidMap.get(fp.student_id)!.add(fp.fee_type_id);
    });

    const fullWaiverMap = new Map<string, Set<string>>();
    waivers.filter(w => w.waiver_percent >= 100).forEach(w => {
      if (!fullWaiverMap.has(w.student_id)) fullWaiverMap.set(w.student_id, new Set());
      fullWaiverMap.get(w.student_id)!.add(w.fee_type_id);
    });

    return students
      .filter(s => {
        // Get applicable fee types for this student in this month
        const applicable = applicableFeeTypesForMonth.filter(ft => !ft.class_id || ft.class_id === s.class_id);
        if (applicable.length === 0) return false;

        // Student has dues if at least one applicable fee is neither paid nor fully waived
        const paidSet = paidMap.get(s.id) || new Set();
        const waiverSet = fullWaiverMap.get(s.id) || new Set();
        return applicable.some(ft => !paidSet.has(ft.id) && !waiverSet.has(ft.id));
      })
      .filter(s => {
        if (classFilter !== 'all' && s.class_id !== classFilter) return false;
        if (searchText) {
          const q = searchText.toLowerCase();
          return (s.name_bn?.toLowerCase().includes(q) || s.name_en?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.roll_number?.includes(q));
        }
        return true;
      });
  }, [students, feePayments, applicableFeeTypesForMonth, waivers, classFilter, searchText]);

  // Helper: compute due amount for a single student in selected month
  const computeStudentDue = (s: any) => {
    const applicable = applicableFeeTypesForMonth.filter(ft => !ft.class_id || ft.class_id === s.class_id);
    const paidIds = new Set(feePayments.filter(fp => fp.student_id === s.id).map(fp => fp.fee_type_id));
    const studentWaivers = waivers.filter(w => w.student_id === s.id);
    return applicable.reduce((sum, ft) => {
      if (paidIds.has(ft.id)) return sum;
      const waiver = studentWaivers.find(w => w.fee_type_id === ft.id);
      const waiverPct = waiver?.waiver_percent || 0;
      if (waiverPct >= 100) return sum;
      return sum + ft.amount * (1 - waiverPct / 100);
    }, 0);
  };

  const totalDueAmount = useMemo(() => {
    return dueStudents.reduce((sum, s) => sum + computeStudentDue(s), 0);
  }, [dueStudents, applicableFeeTypesForMonth, feePayments, waivers]);

  const handleSendReminder = (student: any) => {
    toast.info(bn ? `${student.name_bn} এর জন্য রিমাইন্ডার পাঠানো হবে (এসএমএস এপিআই যুক্ত হলে)` : `Reminder will be sent to ${student.name_en || student.name_bn} (when SMS API is connected)`);
  };

  const handleExportCSV = () => {
    const monthLabel = selectedMonth;
    const rows = [
      ['#', bn ? 'নাম' : 'Name', bn ? 'আইডি' : 'ID', bn ? 'রোল' : 'Roll', bn ? 'শ্রেণী' : 'Class', bn ? 'বকেয়া' : 'Due Amount', bn ? 'ফোন' : 'Phone'],
      ...dueStudents.map((s, i) => {
        const due = computeStudentDue(s);
        return [String(i + 1), s.name_bn, s.student_id, s.roll_number || '-', (s as any).classes?.name_bn || '-', `৳${due}`, s.guardian_phone || s.phone || '-'];
      })
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dues_list_${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(bn ? 'ডাউনলোড হয়েছে' : 'Downloaded');
  };

  // Generate month options
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
    monthOptions.push({ key, label: bn ? `${MONTHS_BN[d.getMonth()]} ${d.getFullYear()}` : `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-orange-200/30 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{bn ? 'বকেয়া ছাত্র সংখ্যা' : 'Students with Dues'}</p>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{dueStudents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200/30 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{bn ? 'মোট বকেয়া' : 'Total Due Amount'}</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">৳{totalDueAmount.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{bn ? 'পরিশোধিত ছাত্র' : 'Students Paid'}</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{students.length - dueStudents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder={bn ? 'শ্রেণী' : 'Class'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{bn ? 'সকল শ্রেণী' : 'All Classes'}</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{bn ? c.name_bn : c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={bn ? 'নাম, আইডি বা রোল দিয়ে খুঁজুন...' : 'Search by name, ID or roll...'} value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />{bn ? 'এক্সপোর্ট' : 'Export CSV'}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{bn ? 'নাম' : 'Name'}</TableHead>
                  <TableHead>{bn ? 'আইডি' : 'ID'}</TableHead>
                  <TableHead>{bn ? 'রোল' : 'Roll'}</TableHead>
                  <TableHead>{bn ? 'শ্রেণী' : 'Class'}</TableHead>
                  <TableHead className="text-right">{bn ? 'বকেয়া' : 'Due'}</TableHead>
                  <TableHead className="text-right">{bn ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dueStudents.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{bn ? 'এই মাসে কোনো বকেয়া নেই' : 'No dues for this month'}</TableCell></TableRow>
                ) : dueStudents.map((s, i) => {
                  const applicableFees = feeTypes.filter(ft => !ft.class_id || ft.class_id === s.class_id);
                  const studentWaivers = waivers.filter(w => w.student_id === s.id);
                  const due = applicableFees.reduce((sum, ft) => {
                    const waiver = studentWaivers.find(w => w.fee_type_id === ft.id);
                    return sum + ft.amount * (1 - (waiver?.waiver_percent || 0) / 100);
                  }, 0);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.name_bn}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{s.student_id}</Badge></TableCell>
                      <TableCell>{s.roll_number || '-'}</TableCell>
                      <TableCell>{(s as any).classes?.name_bn || '-'}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">৳{due.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleSendReminder(s)} className="gap-1 text-xs">
                          <Bell className="w-3 h-3" />{bn ? 'রিমাইন্ডার' : 'Remind'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuesManagement;
