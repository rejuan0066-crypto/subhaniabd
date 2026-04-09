import AdminLayout from '@/components/AdminLayout';
import TabContainer from '@/components/TabContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Loader2, CheckCircle, ArrowRight, ExternalLink, Search, User, Banknote, Globe, AlertCircle, Settings, BarChart3, Users, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useApprovalCheck } from '@/hooks/useApprovalCheck';
import FeeReceiptDownload from '@/components/fees/FeeReceiptDownload';
import { EmbeddedProvider } from '@/contexts/EmbeddedContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import FeeTypeManager from '@/components/admin/FeeTypeManager';
import StudentCategoryManager from '@/components/admin/StudentCategoryManager';
import FeeCategoryManager from '@/components/admin/FeeCategoryManager';

const LazyPaymentDashboard = lazy(() => import('@/pages/admin/AdminPayments'));

type PaymentMethod = 'cash' | 'online';

const generateTransactionId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `STU-${y}${m}${d}-${rand}`;
};

type SearchMode = 'registration' | 'session_roll';

const AdminStudentsFees = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkApproval } = useApprovalCheck('/admin/students-fees', 'payments');
  const [feeType, setFeeType] = useState('');
  const [selectedFeeTypeObj, setSelectedFeeTypeObj] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [step, setStep] = useState<'form' | 'summary' | 'done'>('form');
  const [paymentMonth, setPaymentMonth] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Student search
  const [searchMode, setSearchMode] = useState<SearchMode>('registration');
  const [regNo, setRegNo] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [foundStudent, setFoundStudent] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  // Search history
  const HISTORY_KEY = 'fee_search_history';
  const MAX_HISTORY = 8;
  const [searchHistory, setSearchHistory] = useState<{ value: string; label: string; mode: SearchMode; time: number }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setSearchHistory(saved);
    } catch { setSearchHistory([]); }
  }, []);

  const addToHistory = useCallback((value: string, label: string, mode: SearchMode) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.value !== value);
      const next = [{ value, label, mode, time: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((value: string) => {
    setSearchHistory(prev => {
      const next = prev.filter(h => h.value !== value);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Close history dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setShowHistory(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['academic_sessions_fee'],
    queryFn: async () => {
      const { data } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name');
      return data || [];
    },
  });

  // Fetch dynamic fee types from fee_types table
  const { data: dbFeeTypes = [] } = useQuery({
    queryKey: ['fee_types_for_collection'],
    queryFn: async () => {
      const { data } = await supabase.from('fee_types').select('*, divisions(name_bn), classes(name_bn)').eq('is_active', true).order('fee_category').order('name_bn');
      return data || [];
    },
  });

  // Bengali month names
  const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch existing fee_payments for found student to show paid status
  const { data: studentFeePayments = [] } = useQuery({
    queryKey: ['student_fee_payments_status', foundStudent?.id],
    queryFn: async () => {
      if (!foundStudent?.id) return [];
      const { data } = await supabase.from('fee_payments').select('fee_type_id, status, paid_amount, month, year').eq('student_id', foundStudent.id).in('status', ['paid', 'unpaid']);
      return data || [];
    },
    enabled: !!foundStudent?.id,
  });

  const paidFeeTypeIds = new Set(studentFeePayments.filter((p: any) => p.status === 'paid').map((p: any) => p.fee_type_id));

  // Build monthly payment status map: { feeTypeId: { monthName: status } }
  const monthlyPaymentMap: Record<string, Record<string, string>> = {};
  studentFeePayments.forEach((p: any) => {
    if (p.month) {
      if (!monthlyPaymentMap[p.fee_type_id]) monthlyPaymentMap[p.fee_type_id] = {};
      monthlyPaymentMap[p.fee_type_id][p.month] = p.status;
    }
  });

  // Get monthly fee status for a given fee type
  const getMonthlyStatuses = (feeTypeId: string) => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const ftObj = dbFeeTypes.find((ft: any) => ft.id === feeTypeId);
    const applicableMonths: string[] | null = ftObj?.applicable_months && Array.isArray(ftObj.applicable_months) ? ftObj.applicable_months : null;
    return MONTHS_EN.map((monthEn, i) => {
      // If applicable_months is set, months not in the list are 'n/a'
      if (applicableMonths && !applicableMonths.includes(monthEn)) {
        return { month: monthEn, monthBn: MONTHS_BN[i], status: 'na' as const };
      }
      const existingStatus = monthlyPaymentMap[feeTypeId]?.[monthEn];
      if (existingStatus === 'paid') return { month: monthEn, monthBn: MONTHS_BN[i], status: 'paid' as const };
      if (i < currentMonthIndex) return { month: monthEn, monthBn: MONTHS_BN[i], status: 'due' as const };
      if (i === currentMonthIndex) return { month: monthEn, monthBn: MONTHS_BN[i], status: 'unpaid' as const };
      return { month: monthEn, monthBn: MONTHS_BN[i], status: 'upcoming' as const };
    });
  };

  // Filter fee types based on found student's division/class
  const applicableFeeTypes = foundStudent
    ? dbFeeTypes.filter((ft: any) => {
        if (ft.division_id && ft.division_id !== foundStudent.division_id) return false;
        if (ft.class_id && ft.class_id !== foundStudent.class_id) return false;
        return true;
      })
    : dbFeeTypes;

  // Check for existing pending/approved payment for selected student + fee type
  const { data: existingPayment, isLoading: checkingExisting } = useQuery({
    queryKey: ['existing_payment_check', foundStudent?.id, feeType, selectedFeeTypeObj?.name_bn],
    queryFn: async () => {
      if (!foundStudent?.id || !selectedFeeTypeObj) return null;
      const feeTypeName = selectedFeeTypeObj.name_bn || selectedFeeTypeObj.name;
      const { data, error } = await supabase
        .from('payments')
        .select('id, status, transaction_id, amount, created_at, notes')
        .eq('student_id', foundStudent.id)
        .eq('fee_type', feeTypeName)
        .in('status', ['pending', 'success'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!foundStudent?.id && !!selectedFeeTypeObj,
  });

  const isPaymentBlocked = !!existingPayment;
  const blockedStatus = existingPayment?.status; // 'pending' or 'success'


  const { data: gatewayConfig } = useQuery({
    queryKey: ['payment_gateway_config_check'],
    queryFn: async () => {
      const { data } = await supabase
        .from('payment_gateway_config')
        .select('id, provider, provider_name, is_enabled')
        .eq('is_enabled', true)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
  const isGatewayReady = !!gatewayConfig;

  // Get logged-in user's staff/profile name for collector
  const { data: collectorName = '' } = useQuery({
    queryKey: ['collector_name', user?.id],
    queryFn: async () => {
      if (!user?.id) return '';
      // Try staff table first
      const { data: staffData } = await supabase
        .from('staff')
        .select('name_bn, name_en')
        .eq('user_id', user.id)
        .maybeSingle();
      if (staffData) return staffData.name_bn || staffData.name_en || '';
      // Fallback to profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      return profile?.full_name || user.email || '';
    },
    enabled: !!user?.id,
  });

  const searchStudent = async () => {
    setSearching(true);
    setFoundStudent(null);
    try {
      let query = supabase.from('students').select('*, divisions(name_bn, name)').eq('status', 'active');

      if (searchMode === 'registration') {
        if (!regNo.trim()) { toast.error(bn ? 'রেজিস্ট্রেশন নম্বর দিন' : 'Enter registration number'); return; }
        query = query.eq('registration_no', regNo.trim());
      } else {
        if (!selectedSession || !rollNumber.trim()) { toast.error(bn ? 'সেশন ও রোল নম্বর দিন' : 'Enter session & roll'); return; }
        const session = sessions.find((s: any) => s.id === selectedSession);
        query = query.eq('admission_session', session?.name || '').eq('roll_number', rollNumber.trim());
      }

      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.error(bn ? 'ছাত্র পাওয়া যায়নি' : 'Student not found');
        return;
      }
      setFoundStudent(data);
      // Save to search history
      if (searchMode === 'registration') {
        addToHistory(regNo.trim(), `${data.name_bn} (${regNo.trim()})`, 'registration');
      } else {
        const key = `${selectedSession}|${rollNumber.trim()}`;
        const sessionObj = sessions.find((s: any) => s.id === selectedSession);
        addToHistory(key, `${data.name_bn} (${sessionObj?.name || ''} রোল: ${rollNumber.trim()})`, 'session_roll');
      }
      setShowHistory(false);
      toast.success(bn ? 'ছাত্র পাওয়া গেছে' : 'Student found');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      setSearching(false);
    }
  };

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!feeType || !foundStudent || !amount) throw new Error('All fields are required');
      const txnId = generateTransactionId();
      setTransactionId(txnId);
      const isCash = paymentMethod === 'cash';

      // Get atomic serial number
      let serialNumber = txnId; // fallback
      try {
        const { data: sn, error: serialErr } = await supabase.rpc('get_next_receipt_serial');
        if (!serialErr && sn) serialNumber = sn;
      } catch (e) {
        console.warn('Serial generation fallback to txnId');
      }

      const feeTypeName = selectedFeeTypeObj ? (bn ? selectedFeeTypeObj.name_bn : selectedFeeTypeObj.name) : feeType;

      const payload = {
        fee_type: feeTypeName,
        amount: parseFloat(amount),
        transaction_id: txnId,
        status: isCash ? 'pending' : 'pending',
        student_id: foundStudent.id,
        payer_name: foundStudent.name_bn,
        payment_method: isCash ? 'cash' : 'online',
        notes: `${bn ? 'আদায়কারী' : 'Collector'}: ${collectorName} | Reg: ${foundStudent.registration_no || ''}, Roll: ${foundStudent.roll_number || ''}${isCash ? ' | Cash Payment' : ''} | Serial: ${serialNumber}`,
      };

      // Check if approval is needed
      if (await checkApproval('add', payload, undefined, `${bn ? 'ফি আদায়' : 'Fee Collection'}: ৳${amount} - ${foundStudent.name_bn}`)) {
        return txnId;
      }

      const { error } = await supabase.from('payments').insert(payload);
      if (error) throw error;

      // Also insert into fee_payments for student profile tracking
      const feePaymentPayload = {
        fee_type_id: feeType,
        student_id: foundStudent.id,
        amount: parseFloat(amount),
        paid_amount: isCash ? parseFloat(amount) : 0,
        status: isCash ? 'paid' : 'pending',
        receipt_number: serialNumber || txnId,
        paid_at: isCash ? new Date().toISOString() : null,
        month: paymentMonth || new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
      };
      await supabase.from('fee_payments').insert(feePaymentPayload);

      return txnId;
    },
    onSuccess: async (txnId) => {
      setStep('done');
      if (paymentMethod === 'cash') {
        toast.success(bn ? 'ক্যাশ পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে (অনুমোদনের অপেক্ষায়)' : 'Cash payment saved (awaiting approval)');
      } else {
        // Call process-payment edge function
        try {
          const { data, error } = await supabase.functions.invoke('process-payment', {
            body: {
              action: 'initiate',
              amount: parseFloat(amount),
              student_id: foundStudent?.id,
              fee_type_id: feeType,
            },
          });
          if (error) throw error;
          if (data?.payment_url) {
            toast.success(bn ? 'পেমেন্ট গেটওয়েতে রিডাইরেক্ট হচ্ছে...' : 'Redirecting to payment gateway...');
            setTimeout(() => window.open(data.payment_url, '_blank'), 1000);
          } else {
            toast.success(bn ? 'পেমেন্ট সংরক্ষিত হয়েছে' : 'Payment saved');
          }
        } catch (e: any) {
          toast.error(bn ? 'গেটওয়ে ত্রুটি, পেমেন্ট পেন্ডিং আছে' : 'Gateway error, payment is pending');
        }
      }
    },
    onError: (e: any) => toast.error(e.message || 'Error saving payment'),
  });

  const handleProceed = () => {
    if (!feeType) { toast.error(bn ? 'ফি ধরন নির্বাচন করুন' : 'Select fee type'); return; }
    if (!foundStudent) { toast.error(bn ? 'প্রথমে ছাত্র খুঁজুন' : 'Search student first'); return; }
    if (selectedFeeTypeObj?.payment_frequency === 'monthly' && !paymentMonth) { toast.error(bn ? 'মাস নির্বাচন করুন' : 'Select a month'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error(bn ? 'সঠিক পরিমাণ দিন' : 'Enter valid amount'); return; }
    if (isPaymentBlocked) {
      toast.error(bn ? 'এই ফি ধরনে ইতিমধ্যে পেমেন্ট আছে। বাতিল না হওয়া পর্যন্ত আবার পরিশোধ করা যাবে না।' : 'Payment already exists. Cannot pay again until cancelled.');
      return;
    }
    if (paymentMethod === 'online' && !isGatewayReady) {
      toast.error(bn ? 'প্রথমে পেমেন্ট গেটওয়ে সেটআপ করুন' : 'Please setup payment gateway first');
      return;
    }
    setStep('summary');
  };

  const handleReset = () => {
    setStep('form');
    setFeeType('');
    setSelectedFeeTypeObj(null);
    setAmount('');
    setPaymentMethod('cash');
    setPaymentMonth('');
    setTransactionId('');
    setFoundStudent(null);
    setRegNo('');
    setRollNumber('');
    setSelectedSession('');
  };

  const feeCollectionContent = (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          {bn ? 'ছাত্র ফি পরিশোধ' : 'Student Fee Payment'}
        </h1>

        {step === 'form' && (
          <div className="card-elevated p-6 space-y-5">
            <h3 className="font-display font-semibold text-foreground text-lg">
              {bn ? 'ছাত্র খুঁজুন' : 'Find Student'}
            </h3>

            {/* Search mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => { setSearchMode('registration'); setFoundStudent(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchMode === 'registration' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                {bn ? 'রেজিস্ট্রেশন নম্বর' : 'Registration No'}
              </button>
              <button onClick={() => { setSearchMode('session_roll'); setFoundStudent(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchMode === 'session_roll' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                {bn ? 'সেশন + রোল' : 'Session + Roll'}
              </button>
            </div>

            {/* Search fields */}
            <div className="space-y-3">
              {searchMode === 'registration' ? (
                <div ref={historyRef} className="relative">
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {bn ? 'রেজিস্ট্রেশন নম্বর' : 'Registration Number'} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input className="bg-background flex-1" value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder={bn ? 'যেমন: 20261001' : 'e.g. 20261001'}
                      onFocus={() => setShowHistory(true)}
                      onKeyDown={(e) => e.key === 'Enter' && searchStudent()} />
                    <Button onClick={searchStudent} disabled={searching} variant="outline" size="icon">
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {/* Search History Dropdown */}
                  {showHistory && searchHistory.filter(h => h.mode === 'registration').length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-10 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium border-b border-border flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {bn ? 'সাম্প্রতিক সার্চ' : 'Recent Searches'}
                      </div>
                      {searchHistory.filter(h => h.mode === 'registration').map(h => (
                        <div key={h.value} className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer group"
                          onClick={() => { setRegNo(h.value); setShowHistory(false); }}>
                          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground flex-1 truncate">{h.label}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeFromHistory(h.value); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {bn ? 'সেশন' : 'Session'} <span className="text-destructive">*</span>
                    </label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder={bn ? 'নির্বাচন' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {sessions.map((s: any) => <SelectItem key={s.id} value={s.id}>{bn ? (s.name_bn || s.name) : s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div ref={searchMode === 'session_roll' ? historyRef : undefined} className="relative">
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {bn ? 'রোল নম্বর' : 'Roll Number'} <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input className="bg-background flex-1" value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder={bn ? 'রোল' : 'Roll'}
                        onFocus={() => setShowHistory(true)}
                        onKeyDown={(e) => e.key === 'Enter' && searchStudent()} />
                      <Button onClick={searchStudent} disabled={searching} variant="outline" size="icon">
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                    {/* Search History Dropdown for session+roll */}
                    {showHistory && searchHistory.filter(h => h.mode === 'session_roll').length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-10 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium border-b border-border flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {bn ? 'সাম্প্রতিক সার্চ' : 'Recent Searches'}
                        </div>
                        {searchHistory.filter(h => h.mode === 'session_roll').map(h => {
                          const [sessId, roll] = h.value.split('|');
                          return (
                            <div key={h.value} className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer group"
                              onClick={() => { setSelectedSession(sessId); setRollNumber(roll); setShowHistory(false); }}>
                              <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground flex-1 truncate">{h.label}</span>
                              <button onClick={(e) => { e.stopPropagation(); removeFromHistory(h.value); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded">
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Found student card */}
            {foundStudent && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{foundStudent.name_bn}</p>
                  <p className="text-xs text-muted-foreground">
                    {bn ? 'রোল' : 'Roll'}: {foundStudent.roll_number || '-'} | {bn ? 'রেজি' : 'Reg'}: {foundStudent.registration_no || '-'} | {foundStudent.divisions?.name_bn || ''}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              </div>
            )}

            {/* Monthly Fee Breakdown for monthly fee types */}
            {foundStudent && applicableFeeTypes.filter((ft: any) => ft.payment_frequency === 'monthly').length > 0 && (
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                  🔄 {bn ? 'মাসিক ফি স্ট্যাটাস' : 'Monthly Fee Status'}
                </h4>
                {applicableFeeTypes.filter((ft: any) => ft.payment_frequency === 'monthly').map((ft: any) => {
                  const statuses = getMonthlyStatuses(ft.id);
                  const dueCount = statuses.filter(s => s.status === 'due').length;
                  return (
                    <div key={ft.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">{bn ? ft.name_bn : ft.name} — ৳{ft.amount}/{bn ? 'মাস' : 'mo'}</span>
                        {dueCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                            {dueCount} {bn ? 'বকেয়া' : 'Due'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {statuses.map(s => {
                          const canPay = s.status === 'due' || s.status === 'unpaid';
                          return (
                            <button
                              key={s.month}
                              type="button"
                              disabled={!canPay}
                              onClick={() => {
                                if (!canPay) return;
                                setFeeType(ft.id);
                                setSelectedFeeTypeObj(ft);
                                setAmount(String(ft.amount));
                                setPaymentMonth(s.month);
                                toast.info(bn ? `${s.monthBn} মাস সিলেক্ট করা হয়েছে` : `${s.month} selected`);
                              }}
                              className={`text-center rounded-lg px-2 py-2 text-xs font-medium border transition-all ${
                                s.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 cursor-default' :
                                s.status === 'due' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 cursor-pointer hover:ring-2 hover:ring-red-400' :
                                s.status === 'unpaid' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400 cursor-pointer hover:ring-2 hover:ring-amber-400' :
                                'bg-muted/30 border-border text-muted-foreground opacity-60 cursor-default'
                              } ${paymentMonth === s.month && feeType === ft.id ? 'ring-2 ring-primary shadow-md scale-105' : ''}`}
                            >
                              <div className="truncate">{bn ? s.monthBn : s.month.slice(0, 3)}</div>
                              <div className="text-[10px] mt-0.5">
                                {s.status === 'paid' ? '✓' : s.status === 'due' ? '⚠' : s.status === 'unpaid' ? '○' : '—'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {dueCount > 0 && (
                        <Button size="sm" className="btn-primary-gradient w-full" onClick={() => {
                          setFeeType(ft.id);
                          setSelectedFeeTypeObj(ft);
                          setAmount(String(ft.amount * dueCount));
                        }}>
                          {bn ? `৳${ft.amount * dueCount} বকেয়া পরিশোধ করুন` : `Pay ৳${ft.amount * dueCount} Due`}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {bn ? 'ফি ধরন' : 'Fee Type'} <span className="text-destructive">*</span>
                </label>
                <Select value={feeType} onValueChange={(v) => {
                  setFeeType(v);
                  const ftObj = applicableFeeTypes.find((ft: any) => ft.id === v);
                  setSelectedFeeTypeObj(ftObj || null);
                  if (ftObj) setAmount(String(ftObj.amount || ''));
                  setPaymentMonth(''); // reset month on fee type change
                }}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={bn ? 'ফি ধরন নির্বাচন করুন' : 'Select Fee Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableFeeTypes.map((ft: any) => {
                      const isPaid = paidFeeTypeIds.has(ft.id);
                      return (
                        <SelectItem key={ft.id} value={ft.id} disabled={isPaid}>
                          <span className="flex items-center gap-2">
                            {bn ? ft.name_bn : ft.name} — ৳{ft.amount}
                            {ft.payment_frequency === 'monthly' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">🔄</span>}
                            {ft.divisions?.name_bn ? ` (${ft.divisions.name_bn})` : ''}
                            {ft.classes?.name_bn ? ` - ${ft.classes.name_bn}` : ''}
                            {isPaid && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success">
                                {bn ? '✓ পরিশোধিত' : '✓ Paid'}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Month selector for monthly fee types */}
                {selectedFeeTypeObj?.payment_frequency === 'monthly' && foundStudent && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {bn ? 'মাস নির্বাচন করুন' : 'Select Month'} <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {getMonthlyStatuses(feeType).map(s => {
                        const canPay = s.status === 'due' || s.status === 'unpaid';
                        return (
                          <button
                            key={s.month}
                            type="button"
                            disabled={!canPay}
                            onClick={() => {
                              if (!canPay) return;
                              setPaymentMonth(s.month);
                              setAmount(String(selectedFeeTypeObj.amount));
                            }}
                            className={`text-center rounded-lg px-2 py-2 text-xs font-medium border transition-all ${
                              s.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 cursor-default' :
                              s.status === 'due' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 cursor-pointer hover:ring-2 hover:ring-red-400' :
                              s.status === 'unpaid' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400 cursor-pointer hover:ring-2 hover:ring-amber-400' :
                              'bg-muted/30 border-border text-muted-foreground opacity-60 cursor-default'
                            } ${paymentMonth === s.month ? 'ring-2 ring-primary shadow-md scale-105' : ''}`}
                          >
                            <div className="truncate">{bn ? s.monthBn : s.month.slice(0, 3)}</div>
                            <div className="text-[10px] mt-0.5">
                              {s.status === 'paid' ? '✓' : s.status === 'due' ? '⚠' : s.status === 'unpaid' ? '○' : '—'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {paymentMonth && (
                      <p className="text-xs mt-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary font-medium">
                        ✓ {bn ? `${MONTHS_BN[MONTHS_EN.indexOf(paymentMonth)]} মাসের ফি পরিশোধ হবে` : `Paying for ${paymentMonth}`}
                      </p>
                    )}
                  </div>
                )}

                {applicableFeeTypes.length === 0 && (
                  <p className="text-xs text-destructive mt-1">
                    {bn ? 'কোনো ফি ধরন পাওয়া যায়নি। প্রথমে "ফি ধরন" ট্যাব থেকে ফি যোগ করুন।' : 'No fee types found. Add fee types from the "Fee Types" tab first.'}
                  </p>
                )}
                {/* Existing payment block warning */}
                {isPaymentBlocked && existingPayment && (
                  <div className={`mt-2 border rounded-xl p-4 space-y-2 ${blockedStatus === 'pending' ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700' : 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700'}`}>
                    <div className="flex items-center gap-2">
                      {blockedStatus === 'pending' ? (
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      <span className={`text-sm font-semibold ${blockedStatus === 'pending' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                        {blockedStatus === 'pending'
                          ? (bn ? '⏳ পেন্ডিং রিসিট — অনুমোদনের অপেক্ষায়' : '⏳ Pending Receipt — Awaiting Approval')
                          : (bn ? '✅ অনুমোদিত রিসিট — পরিশোধিত' : '✅ Approved Receipt — Paid')}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-foreground/80">
                      <p><strong>{bn ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}:</strong> {existingPayment.transaction_id}</p>
                      <p><strong>{bn ? 'পরিমাণ' : 'Amount'}:</strong> ৳{existingPayment.amount}</p>
                      <p><strong>{bn ? 'তারিখ' : 'Date'}:</strong> {new Date(existingPayment.created_at).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <p className={`text-xs font-medium ${blockedStatus === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {bn ? '🚫 বাতিল না হওয়া পর্যন্ত এই ফি ধরনে আবার পরিশোধ করা যাবে না।' : '🚫 Cannot pay again until this payment is cancelled.'}
                    </p>
                  </div>
                )}
                {checkingExisting && feeType && foundStudent && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {bn ? 'পূর্ববর্তী পেমেন্ট যাচাই করা হচ্ছে...' : 'Checking existing payments...'}
                  </div>
                )}
              </div>


              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {bn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'} <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`}>
                    <Banknote className="w-5 h-5" />
                    {bn ? 'ক্যাশ পেমেন্ট' : 'Cash Payment'}
                  </button>
                  <button onClick={() => setPaymentMethod('online')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`}>
                    <Globe className="w-5 h-5" />
                    {bn ? 'অনলাইন পেমেন্ট' : 'Online Payment'}
                  </button>
                </div>

                {/* Online payment gateway status */}
                {paymentMethod === 'online' && !isGatewayReady && (
                  <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-sm font-medium text-warning">
                        {bn ? 'পেমেন্ট গেটওয়ে সেটআপ করা হয়নি' : 'Payment gateway not configured'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bn
                        ? 'অনলাইন পেমেন্ট ব্যবহার করতে প্রথমে পেমেন্ট গেটওয়ে (bKash, Nagad, SSLCommerz ইত্যাদি) সেটআপ করুন।'
                        : 'To accept online payments, configure a payment gateway (bKash, Nagad, SSLCommerz, etc.) first.'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-1" onClick={() => navigate('/admin/settings')}>
                      <Settings className="w-3.5 h-3.5 mr-1.5" />
                      {bn ? 'গেটওয়ে সেটআপ করুন' : 'Setup Gateway'}
                    </Button>
                  </div>
                )}

                {paymentMethod === 'online' && isGatewayReady && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">
                      {bn ? `${gatewayConfig?.provider_name || gatewayConfig?.provider} গেটওয়ে সক্রিয়` : `${gatewayConfig?.provider_name || gatewayConfig?.provider} gateway active`}
                    </span>
                  </div>
                )}
              </div>

              {/* Collector name display for cash */}
              {paymentMethod === 'cash' && collectorName && (
                <div className="bg-accent/50 border border-accent rounded-lg p-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">
                    <strong>{bn ? 'আদায়কারী' : 'Collector'}:</strong> {collectorName}
                  </span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {bn ? 'পরিমাণ (৳)' : 'Amount (৳)'} <span className="text-destructive">*</span>
                </label>
                <Input type="number" className="bg-background" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="৳ 0.00" min="0" step="0.01" />
              </div>
            </div>

            <Button onClick={handleProceed} className="btn-primary-gradient w-full mt-2" disabled={isPaymentBlocked || checkingExisting}>
              <ArrowRight className="w-4 h-4 mr-2" />
              {isPaymentBlocked
                ? (bn ? '🚫 পেমেন্ট ব্লকড — পূর্ববর্তী পেমেন্ট বাতিল করুন' : '🚫 Blocked — Cancel previous payment first')
                : (bn ? 'পরিশোধে এগিয়ে যান' : 'Proceed to Pay')}
            </Button>
          </div>
        )}

        {step === 'summary' && (
          <div className="card-elevated p-6 space-y-5">
            <h3 className="font-display font-semibold text-foreground text-lg">
              {bn ? 'পেমেন্ট সারাংশ' : 'Payment Summary'}
            </h3>
            <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bn ? 'ছাত্রের নাম' : 'Student Name'}</span>
                <span className="font-semibold text-foreground">{foundStudent?.name_bn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bn ? 'রেজিস্ট্রেশন' : 'Registration'}</span>
                <span className="font-semibold text-foreground">{foundStudent?.registration_no || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bn ? 'রোল' : 'Roll'}</span>
                <span className="font-semibold text-foreground">{foundStudent?.roll_number || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bn ? 'ফি ধরন' : 'Fee Type'}</span>
                <span className="font-semibold text-foreground">
                  {selectedFeeTypeObj ? (bn ? selectedFeeTypeObj.name_bn : selectedFeeTypeObj.name) : feeType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {paymentMethod === 'cash' ? <><Banknote className="w-4 h-4" /> {bn ? 'ক্যাশ' : 'Cash'}</> : <><Globe className="w-4 h-4" /> {bn ? 'অনলাইন' : 'Online'}</>}
                </span>
              </div>
              {paymentMethod === 'cash' && collectorName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{bn ? 'আদায়কারী' : 'Collector'}</span>
                  <span className="font-semibold text-foreground">{collectorName}</span>
                </div>
              )}
              <div className="border-t border-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{bn ? 'মোট পরিমাণ' : 'Total Amount'}</span>
                <span className="text-xl font-bold text-primary">৳ {parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
                {bn ? 'পরিবর্তন করুন' : 'Edit'}
              </Button>
              <Button onClick={() => payMutation.mutate()} className="btn-primary-gradient flex-1" disabled={payMutation.isPending}>
                {payMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {paymentMethod === 'cash' ? <Banknote className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                {paymentMethod === 'cash' ? (bn ? 'ক্যাশ পরিশোধ নিশ্চিত করুন' : 'Confirm Cash Payment') : (bn ? 'নিশ্চিত করুন ও পরিশোধ করুন' : 'Confirm & Pay')}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="card-elevated p-6 text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${paymentMethod === 'cash' ? 'bg-primary/10' : 'bg-primary/10'}`}>
              {paymentMethod === 'cash' ? <Banknote className="w-8 h-8 text-primary" /> : <CheckCircle className="w-8 h-8 text-primary" />}
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">
              {paymentMethod === 'cash'
                ? (bn ? 'ক্যাশ পেমেন্ট সম্পন্ন!' : 'Cash Payment Complete!')
                : (bn ? 'পেমেন্ট সংরক্ষিত!' : 'Payment Saved!')}
            </h3>
            {paymentMethod === 'cash' && (
              <p className="text-sm text-muted-foreground font-medium">
                {bn ? 'অনুমোদনের অপেক্ষায় রয়েছে' : 'Awaiting admin approval'}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {bn ? 'ট্রানজেকশন আইডি:' : 'Transaction ID:'}
            </p>
            <div className="bg-secondary/50 rounded-lg px-4 py-3 font-mono text-lg font-bold text-foreground">
              {transactionId}
            </div>
            {paymentMethod === 'online' && (
              <p className="text-xs text-muted-foreground">
                {bn ? 'পেমেন্ট গেটওয়েতে রিডাইরেক্ট হচ্ছে...' : 'Redirecting to payment gateway...'}
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </p>
            )}
            <Button variant="outline" onClick={handleReset} className="mt-4">
              {bn ? 'নতুন পেমেন্ট' : 'New Payment'}
            </Button>
          </div>
        )}

        {/* Receipt Download Section */}
        <FeeReceiptDownload collectorName={collectorName} />
      </div>
  );

  return (
    <AdminLayout>
      <TabContainer
        tabs={[
          {
            id: 'collection',
            label: bn ? 'ফি আদায়' : 'Fee Collection',
            icon: CreditCard,
            content: feeCollectionContent,
          },
          {
            id: 'dashboard',
            label: bn ? 'পেমেন্ট ড্যাশবোর্ড' : 'Payment Dashboard',
            icon: BarChart3,
            content: (
              <ErrorBoundary>
                <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
                  <EmbeddedProvider>
                    <LazyPaymentDashboard />
                  </EmbeddedProvider>
                </Suspense>
              </ErrorBoundary>
            ),
          },
          {
            id: 'fee_types',
            label: bn ? 'ফি ধরন' : 'Fee Types',
            icon: Settings,
            content: <FeeTypeManager />,
          },
          {
            id: 'fee_categories',
            label: bn ? 'ফি ক্যাটাগরি' : 'Fee Categories',
            icon: Settings,
            content: <FeeCategoryManager />,
          },
          {
            id: 'categories',
            label: bn ? 'ছাত্র ক্যাটাগরি' : 'Student Categories',
            icon: Users,
            content: <StudentCategoryManager />,
          },
        ]}
        paramKey="tab"
      />
    </AdminLayout>
  );
};

export default AdminStudentsFees;
