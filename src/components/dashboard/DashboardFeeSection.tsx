import { useState, useMemo } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type FeeCategory = 'monthly' | 'exam' | 'admission';

interface FeeSectionProps {
  category: FeeCategory;
  titleBn: string;
  titleEn: string;
  icon?: React.ReactNode;
}

const DashboardFeeSection = ({ category, titleBn, titleEn, icon }: FeeSectionProps) => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [expanded, setExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [listType, setListType] = useState<'paid' | 'unpaid'>('paid');

  // Fetch fee payments (existing records)
  const { data: payments = [] } = useQuery({
    queryKey: ['dashboard-fee-payments', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*, students(id, name_bn, roll_number, division_id, class_id, divisions(name_bn), classes(name_bn, sort_order)), fee_types(name_bn, fee_category, name, amount)')
        .eq('fee_types.fee_category', category)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).filter((p: any) => p.fee_types?.fee_category === category);
    },
  });

  // Fetch fee types for this category with session info
  const { data: feeTypes = [] } = useQuery({
    queryKey: ['dashboard-fee-types', category],
    queryFn: async () => {
      const { data } = await supabase
        .from('fee_types')
        .select('id, name_bn, name, fee_category, amount, division_id, class_id, session_id, payment_frequency, applicable_months, academic_sessions:session_id(name, name_bn, start_date, end_date)')
        .eq('fee_category', category)
        .eq('is_active', true)
        .is('deleted_at', null);
      return data || [];
    },
  });

  // Get unique session names from fee types
  const sessionLabel = useMemo(() => {
    const sessions = new Set<string>();
    feeTypes.forEach((ft: any) => {
      if (ft.academic_sessions) {
        sessions.add(bn ? (ft.academic_sessions.name_bn || ft.academic_sessions.name) : ft.academic_sessions.name);
      }
    });
    return Array.from(sessions).join(', ');
  }, [feeTypes, bn]);

  // Fetch all active students
  const { data: students = [] } = useQuery({
    queryKey: ['dashboard-students-for-fees'],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id, name_bn, roll_number, division_id, class_id, session_id, is_free, divisions(name_bn), classes(name_bn, sort_order)')
        .eq('status', 'active');
      return data || [];
    },
  });

  // Fetch classes for grouping labels
  const { data: classes = [] } = useQuery({
    queryKey: ['dashboard-classes-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('classes')
        .select('id, name_bn, name, sort_order, division_id, divisions(name_bn)')
        .eq('is_active', true)
        .order('sort_order');
      return data || [];
    },
  });

  // Helper: get class label for a student
  const getClassLabel = (s: any) => {
    return s?.classes?.name_bn || bn ? 'অনির্ধারিত' : 'Unassigned';
  };

  const getClassLabelFromPayment = (p: any) => {
    return p?.students?.classes?.name_bn || (bn ? 'অনির্ধারিত' : 'Unassigned');
  };

  // Build class map for sort order
  const classMap = useMemo(() => {
    const map: Record<string, { name_bn: string; sort_order: number }> = {};
    classes.forEach((c: any) => {
      map[c.id] = { name_bn: c.name_bn, sort_order: c.sort_order || 0 };
    });
    return map;
  }, [classes]);

  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS_BN: Record<string, string> = {
    January: 'জানুয়ারি', February: 'ফেব্রুয়ারি', March: 'মার্চ', April: 'এপ্রিল',
    May: 'মে', June: 'জুন', July: 'জুলাই', August: 'আগস্ট',
    September: 'সেপ্টেম্বর', October: 'অক্টোবর', November: 'নভেম্বর', December: 'ডিসেম্বর',
  };

  // Build groups: monthly category → group by month, others → group by class
  const enrichedGroups = useMemo(() => {
    const groups: Record<string, { label: string; sortOrder: number; total: number; paid: any[]; unpaid: any[] }> = {};

    if (category === 'monthly') {
      // ---- GROUP BY MONTH ----
      // Determine valid session months first
      const sessionMonthSet = new Set<string>();
      feeTypes.forEach((ft: any) => {
        if (ft.payment_frequency !== 'monthly') return;
        let startM = 0, endM = 11;
        if (ft.academic_sessions?.start_date) startM = new Date(ft.academic_sessions.start_date).getMonth();
        if (ft.academic_sessions?.end_date) endM = new Date(ft.academic_sessions.end_date).getMonth();
        if (startM <= endM) {
          for (let i = startM; i <= endM; i++) sessionMonthSet.add(MONTHS_EN[i]);
        } else {
          for (let i = startM; i < 12; i++) sessionMonthSet.add(MONTHS_EN[i]);
          for (let i = 0; i <= endM; i++) sessionMonthSet.add(MONTHS_EN[i]);
        }
      });

      payments.forEach((p: any) => {
        const monthKey = p.month || 'N/A';
        // Skip months outside session range
        if (sessionMonthSet.size > 0 && !sessionMonthSet.has(monthKey)) return;
        const monthLabel = bn ? (MONTHS_BN[monthKey] || monthKey) : monthKey;
        const sortIdx = MONTHS_EN.indexOf(monthKey);
        if (!groups[monthKey]) groups[monthKey] = { label: monthLabel, sortOrder: sortIdx >= 0 ? sortIdx : 999, total: 0, paid: [], unpaid: [] };
        const amount = p.paid_amount || p.amount || 0;
        if (p.status === 'paid' || p.status === 'pending') {
          groups[monthKey].paid.push(p);
          groups[monthKey].total += Number(amount);
        }
      });

      // Find unpaid per month — use session start_date to end_date, up to current month
      const now = new Date();
      const currentMonthIdx = now.getMonth(); // 0-based
      const currentYear = now.getFullYear();

      feeTypes.forEach((ft: any) => {
        if (ft.payment_frequency !== 'monthly') return;

        // Determine session month range
        let sessionStartMonth = 0; // default January
        let sessionEndMonth = 11; // default December
        if (ft.academic_sessions?.start_date) {
          const sd = new Date(ft.academic_sessions.start_date);
          sessionStartMonth = sd.getMonth();
        }
        if (ft.academic_sessions?.end_date) {
          const ed = new Date(ft.academic_sessions.end_date);
          sessionEndMonth = ed.getMonth();
        }

        const applicableStudents = students.filter((s: any) => {
          if (s.is_free) return false;
          if (ft.division_id && ft.division_id !== s.division_id) return false;
          if (ft.class_id && ft.class_id !== s.class_id) return false;
          if (ft.session_id && ft.session_id !== s.session_id) return false;
          return true;
        });
        const applicableMonths: string[] = ft.applicable_months && Array.isArray(ft.applicable_months)
          ? (ft.applicable_months as string[])
          : MONTHS_EN;

        // Build list of months from session start to session end
        const monthIndices: number[] = [];
        if (sessionStartMonth <= sessionEndMonth) {
          for (let mi = sessionStartMonth; mi <= sessionEndMonth; mi++) monthIndices.push(mi);
        } else {
          // Wraps around year boundary (e.g., March to February)
          for (let mi = sessionStartMonth; mi < 12; mi++) monthIndices.push(mi);
          for (let mi = 0; mi <= sessionEndMonth; mi++) monthIndices.push(mi);
        }

        // Only show up to current month (running months)
        const runningMonths = monthIndices.filter(mi => mi <= currentMonthIdx);

        runningMonths.forEach((mi) => {
          const monthName = MONTHS_EN[mi];
          if (!applicableMonths.includes(monthName)) return;

          const monthLabel = bn ? (MONTHS_BN[monthName] || monthName) : monthName;
          if (!groups[monthName]) groups[monthName] = { label: monthLabel, sortOrder: monthIndices.indexOf(mi), total: 0, paid: [], unpaid: [] };

          const paidForMonth = new Set(
            payments
              .filter((p: any) => p.fee_type_id === ft.id && p.month === monthName && (p.status === 'paid' || p.status === 'pending'))
              .map((p: any) => p.student_id)
          );

          applicableStudents.forEach((s: any) => {
            if (!paidForMonth.has(s.id)) {
              const alreadyAdded = groups[monthName].unpaid.some((u: any) => u._studentId === s.id && u._feeTypeId === ft.id);
              if (!alreadyAdded) {
                groups[monthName].unpaid.push({
                  id: `unpaid-${s.id}-${ft.id}-${monthName}`,
                  _studentId: s.id,
                  _feeTypeId: ft.id,
                  students: s,
                  fee_types: ft,
                  amount: ft.amount,
                  month: monthName,
                  status: 'unpaid',
                });
              }
            }
          });
        });
      });
    } else {
      // ---- GROUP BY CLASS (admission, exam, other) ----
      payments.forEach((p: any) => {
        const classId = p.students?.class_id || 'unknown';
        const className = getClassLabelFromPayment(p);
        if (!groups[classId]) groups[classId] = { label: className, sortOrder: classMap[classId]?.sort_order || 999, total: 0, paid: [], unpaid: [] };
        const amount = p.paid_amount || p.amount || 0;
        if (p.status === 'paid' || p.status === 'pending') {
          groups[classId].paid.push(p);
          groups[classId].total += Number(amount);
        }
      });

      feeTypes.forEach((ft: any) => {
        if (ft.payment_frequency === 'monthly') return;
        const applicableStudents = students.filter((s: any) => {
          if (s.is_free) return false;
          if (ft.division_id && ft.division_id !== s.division_id) return false;
          if (ft.class_id && ft.class_id !== s.class_id) return false;
          if (ft.session_id && ft.session_id !== s.session_id) return false;
          return true;
        });
        const paidStudentIds = new Set(
          payments
            .filter((p: any) => p.fee_type_id === ft.id && (p.status === 'paid' || p.status === 'pending'))
            .map((p: any) => p.student_id)
        );
        const currentYear = new Date().getFullYear();

        applicableStudents.forEach((s: any) => {
          if (!paidStudentIds.has(s.id)) {
            const classId = s.class_id || 'unknown';
            const className = s.classes?.name_bn || (bn ? 'অনির্ধারিত' : 'Unassigned');
            if (!groups[classId]) groups[classId] = { label: className, sortOrder: classMap[classId]?.sort_order || 999, total: 0, paid: [], unpaid: [] };

            const alreadyAdded = groups[classId].unpaid.some((u: any) => u._studentId === s.id && u._feeTypeId === ft.id);
            if (!alreadyAdded) {
              groups[classId].unpaid.push({
                id: `unpaid-${s.id}-${ft.id}`,
                _studentId: s.id,
                _feeTypeId: ft.id,
                students: s,
                fee_types: ft,
                amount: ft.amount,
                year: currentYear,
                status: 'unpaid',
              });
            }
          }
        });
      });
    }

    return Object.values(groups).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [payments, feeTypes, students, category, bn, classMap]);

  const totalAmount = enrichedGroups.reduce((s: number, g: any) => s + g.total, 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !selectedGroup) return;
    const list = listType === 'paid' ? selectedGroup.paid : selectedGroup.unpaid;
    const sorted = [...list].sort((a: any, b: any) => {
      const clsA = a.students?.classes?.sort_order || 0;
      const clsB = b.students?.classes?.sort_order || 0;
      if (clsA !== clsB) return clsA - clsB;
      return (a.students?.roll_number || '').localeCompare(b.students?.roll_number || '');
    });

    printWindow.document.write(`<html><head><title>Print</title><style>
      body{font-family:Arial,sans-serif;padding:20px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#f5f5f5}
      h2{margin:0}
    </style></head><body>
      <h2>${language === 'bn' ? titleBn : titleEn} - ${selectedGroup.label}</h2>
      <p>${listType === 'paid' ? (language === 'bn' ? 'পরিশোধিত তালিকা' : 'Paid List') : (language === 'bn' ? 'অপরিশোধিত তালিকা' : 'Unpaid List')}</p>
      <table><thead><tr>
        <th>#</th><th>${language === 'bn' ? 'নাম' : 'Name'}</th><th>${language === 'bn' ? 'রোল' : 'Roll'}</th>
        <th>${language === 'bn' ? 'শ্রেণী' : 'Class'}</th>
        ${category === 'monthly' ? `<th>${language === 'bn' ? 'মাস' : 'Month'}</th>` : ''}
        ${category === 'exam' ? `<th>${language === 'bn' ? 'পরীক্ষা' : 'Exam'}</th>` : ''}
        <th>${language === 'bn' ? 'সেশন' : 'Year'}</th>
        <th>${listType === 'paid' ? (language === 'bn' ? 'পরিশোধিত' : 'Paid') : (language === 'bn' ? 'বকেয়া' : 'Due')}</th>
      </tr></thead><tbody>
      ${sorted.map((p: any, i: number) => `<tr>
        <td>${i + 1}</td>
        <td>${p.students?.name_bn || '-'}</td>
        <td>${p.students?.roll_number || '-'}</td>
        <td>${p.students?.classes?.name_bn || '-'}</td>
        ${category === 'monthly' ? `<td>${p.month || '-'}</td>` : ''}
        ${category === 'exam' ? `<td>${p.fee_types?.name_bn || '-'}</td>` : ''}
        <td>${p.year || '-'}</td>
        <td>${listType === 'paid' ? `৳ ${p.paid_amount || p.amount}` : `৳ ${p.amount || 0}`}</td>
      </tr>`).join('')}
      </tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadCSV = () => {
    if (!selectedGroup) return;
    const list = listType === 'paid' ? selectedGroup.paid : selectedGroup.unpaid;
    const sorted = [...list].sort((a: any, b: any) => {
      const clsA = a.students?.classes?.sort_order || 0;
      const clsB = b.students?.classes?.sort_order || 0;
      if (clsA !== clsB) return clsA - clsB;
      return (a.students?.roll_number || '').localeCompare(b.students?.roll_number || '');
    });

    const headers = [language === 'bn' ? 'নাম' : 'Name', language === 'bn' ? 'রোল' : 'Roll', language === 'bn' ? 'শ্রেণী' : 'Class', language === 'bn' ? 'সেশন' : 'Year', listType === 'paid' ? (language === 'bn' ? 'পরিশোধিত' : 'Amount') : (language === 'bn' ? 'বকেয়া' : 'Due')];
    const rows = sorted.map((p: any) => [
      p.students?.name_bn || '-', p.students?.roll_number || '-', p.students?.classes?.name_bn || '-', p.year || '-',
      listType === 'paid' ? (p.paid_amount || p.amount) : (p.amount || 0)
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category}_${selectedGroup.label}_${listType}.csv`;
    a.click();
  };

  return (
    <div className="card-elevated p-4">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {icon || <CreditCard className="w-5 h-5 text-primary" />}
          <h3 className="font-display font-bold text-foreground">{language === 'bn' ? titleBn : titleEn}</h3>
          {sessionLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{sessionLabel}</span>
          )}
          <span className="text-sm font-bold text-primary">৳ {totalAmount.toLocaleString()}</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {enrichedGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{language === 'bn' ? 'কোনো রেকর্ড নেই' : 'No records'}</p>}
          {enrichedGroups.map((g: any, i: number) => (
            <div key={i}
              onClick={() => setSelectedGroup(g)}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
              <span className="text-sm font-medium text-foreground">{g.label}</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-success">{language === 'bn' ? 'পরিশোধিত' : 'Paid'}: {g.paid.length} {bn ? 'জন' : ''} <span className="font-semibold">৳ {g.total.toLocaleString()}</span></span>
                <span className="text-xs text-destructive">{language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}: {g.unpaid.length} {bn ? 'জন' : ''} <span className="font-semibold">৳ {g.unpaid.reduce((s: number, u: any) => s + (u.amount || 0), 0).toLocaleString()}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? titleBn : titleEn} - {selectedGroup?.label}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setListType('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${listType === 'paid' ? 'bg-success text-success-foreground' : 'bg-success/10 text-success'}`}>
              {language === 'bn' ? 'পরিশোধিত' : 'Paid'} ({selectedGroup?.paid?.length || 0})
            </button>
            <button onClick={() => setListType('unpaid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${listType === 'unpaid' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive'}`}>
              {language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'} ({selectedGroup?.unpaid?.length || 0})
            </button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />{language === 'bn' ? 'প্রিন্ট' : 'Print'}</Button>
              <Button size="sm" variant="outline" onClick={handleDownloadCSV}><Download className="w-4 h-4 mr-1" />{language === 'bn' ? 'ডাউনলোড' : 'Download'}</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'নাম' : 'Name'}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'রোল' : 'Roll'}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'শ্রেণী' : 'Class'}</th>
                  {category === 'monthly' && <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'মাস' : 'Month'}</th>}
                  {category === 'exam' && <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'পরীক্ষা সেশন' : 'Exam Session'}</th>}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{language === 'bn' ? 'সেশন' : 'Year'}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{listType === 'paid' ? (language === 'bn' ? 'পরিশোধিত' : 'Amount') : (language === 'bn' ? 'বকেয়া' : 'Due')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {((() => {
                  const list = listType === 'paid' ? (selectedGroup?.paid || []) : (selectedGroup?.unpaid || []);
                  return [...list].sort((a: any, b: any) => {
                    const clsA = a.students?.classes?.sort_order || 0;
                    const clsB = b.students?.classes?.sort_order || 0;
                    if (clsA !== clsB) return clsA - clsB;
                    return (a.students?.roll_number || '').localeCompare(b.students?.roll_number || '');
                  });
                })()).map((p: any, i: number) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{p.students?.name_bn || '-'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.students?.roll_number || '-'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.students?.classes?.name_bn || '-'}</td>
                    {category === 'monthly' && <td className="px-3 py-2 text-muted-foreground">{p.month || '-'}</td>}
                    {category === 'exam' && <td className="px-3 py-2 text-muted-foreground">{p.fee_types?.name_bn || '-'}</td>}
                    <td className="px-3 py-2 text-muted-foreground">{p.year || '-'}</td>
                    <td className="px-3 py-2">
                      {listType === 'paid' ? (
                        <span className="font-bold text-success">৳ {p.paid_amount || p.amount}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">৳ {p.amount || 0}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {((listType === 'paid' ? selectedGroup?.paid : selectedGroup?.unpaid) || []).length === 0 && (
                  <tr><td colSpan={8} className="text-center py-6 text-muted-foreground">{language === 'bn' ? 'কোনো রেকর্ড নেই' : 'No records'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardFeeSection;
