import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
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

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [searchText, setSearchText] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['dues-sessions'],
    queryFn: async () => {
      const { data } = await supabase.from('academic_sessions').select('id, name, name_bn, start_date, end_date, is_active').order('start_date', { ascending: false, nullsFirst: false });
      return data || [];
    },
  });

  // Default to active session
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      const active = sessions.find((s: any) => s.is_active) || sessions[0];
      setSelectedSessionId(active.id);
    }
  }, [sessions, selectedSessionId]);

  const { data: students = [] } = useQuery({
    queryKey: ['dues-students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, name_bn, name_en, student_id, roll_number, class_id, phone, guardian_phone, status, classes(name, name_bn)').eq('status', 'active');
      return data || [];
    },
  });

  // Fee types scoped to selected session (or session-less i.e. global)
  const { data: feeTypes = [] } = useQuery({
    queryKey: ['dues-fee-types', selectedSessionId],
    enabled: !!selectedSessionId,
    queryFn: async () => {
      const { data } = await supabase.from('fee_types').select('*').eq('is_active', true).eq('payment_frequency', 'monthly');
      return (data || []).filter((ft: any) => !ft.session_id || ft.session_id === selectedSessionId);
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
      if (months.length === 0) return true;
      return months.includes(selectedMonthName);
    });
  }, [feeTypes, selectedMonth]);

  // Per-student per-fee-type breakdown for the selected month
  const computeBreakdown = (s: any) => {
    const applicable = applicableFeeTypesForMonth.filter(ft => !ft.class_id || ft.class_id === s.class_id);
    const paidIds = new Set(feePayments.filter(fp => fp.student_id === s.id).map(fp => fp.fee_type_id));
    const studentWaivers = waivers.filter(w => w.student_id === s.id);
    return applicable.map(ft => {
      const waiver = studentWaivers.find(w => w.fee_type_id === ft.id);
      const waiverPct = waiver?.waiver_percent || 0;
      const isPaid = paidIds.has(ft.id);
      const isFullyWaived = waiverPct >= 100;
      const due = (isPaid || isFullyWaived) ? 0 : ft.amount * (1 - waiverPct / 100);
      return { feeTypeId: ft.id, due, isPaid, isFullyWaived };
    });
  };

  const dueStudents = useMemo(() => {
    return students
      .filter(s => {
        const breakdown = computeBreakdown(s);
        if (breakdown.length === 0) return false;
        return breakdown.some(b => b.due > 0);
      })
      .filter(s => {
        if (classFilter !== 'all' && s.class_id !== classFilter) return false;
        if (searchText) {
          const q = searchText.toLowerCase();
          return (s.name_bn?.toLowerCase().includes(q) || s.name_en?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.roll_number?.includes(q));
        }
        return true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, feePayments, applicableFeeTypesForMonth, waivers, classFilter, searchText]);

  const computeStudentDue = (s: any) => computeBreakdown(s).reduce((sum, b) => sum + b.due, 0);

  const totalDueAmount = useMemo(() => {
    return dueStudents.reduce((sum, s) => sum + computeStudentDue(s), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueStudents, applicableFeeTypesForMonth, feePayments, waivers]);

  // Per-fee-type column totals
  const feeTypeColumnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    applicableFeeTypesForMonth.forEach(ft => { totals[ft.id] = 0; });
    dueStudents.forEach(s => {
      computeBreakdown(s).forEach(b => {
        totals[b.feeTypeId] = (totals[b.feeTypeId] || 0) + b.due;
      });
    });
    return totals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueStudents, applicableFeeTypesForMonth, feePayments, waivers]);

  const handleSendReminder = (student: any) => {
    toast.info(bn ? `${student.name_bn} এর জন্য রিমাইন্ডার প