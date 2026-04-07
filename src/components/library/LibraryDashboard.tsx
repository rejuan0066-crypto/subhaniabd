import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, BookX, AlertTriangle, DollarSign, ArrowRightLeft, Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const LibraryDashboard = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['library-books-all'],
    queryFn: async () => {
      const { data } = await supabase.from('library_books').select('*').eq('is_active', true);
      return data || [];
    },
  });

  const { data: issuances = [], isLoading: issLoading } = useQuery({
    queryKey: ['library-issuances-all'],
    queryFn: async () => {
      const { data } = await supabase.from('library_issuances').select('*');
      return data || [];
    },
  });

  if (booksLoading || issLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Auto-aging: check if purchase_date > 365 days
  const now = Date.now();
  const newBooks = books.filter((b: any) => {
    const age = (now - new Date(b.purchase_date).getTime()) / (1000 * 60 * 60 * 24);
    return age < 365;
  });
  const oldBooks = books.filter((b: any) => {
    const age = (now - new Date(b.purchase_date).getTime()) / (1000 * 60 * 60 * 24);
    return age >= 365;
  });

  const totalCopies = books.reduce((s: number, b: any) => s + (b.total_copies || 0), 0);
  const availableCopies = books.reduce((s: number, b: any) => s + (b.available_copies || 0), 0);
  const lostCopies = books.reduce((s: number, b: any) => s + (b.lost_copies || 0), 0);
  const damagedCopies = books.reduce((s: number, b: any) => s + (b.damaged_copies || 0), 0);
  const totalValue = books.reduce((s: number, b: any) => s + (b.buying_price || 0) * (b.total_copies || 0), 0);
  const activeIssuances = issuances.filter((i: any) => i.status === 'issued').length;
  const saleIssuances = issuances.filter((i: any) => i.distribution_type === 'sale');
  const totalSaleValue = saleIssuances.reduce((s: number, i: any) => s + (i.selling_price || 0), 0);

  const stats = [
    { label: bn ? 'মোট বই (টাইটেল)' : 'Total Books (Titles)', value: books.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: bn ? 'মোট কপি' : 'Total Copies', value: totalCopies, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: bn ? 'নতুন বই' : 'New Books', value: newBooks.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: bn ? 'পুরাতন বই' : 'Old Books', value: oldBooks.length, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: bn ? 'উপলব্ধ কপি' : 'Available Copies', value: availableCopies, icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    { label: bn ? 'ইস্যু আছে' : 'Currently Issued', value: activeIssuances, icon: ArrowRightLeft, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: bn ? 'হারানো' : 'Lost', value: lostCopies, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: bn ? 'নষ্ট' : 'Damaged', value: damagedCopies, icon: BookX, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { label: bn ? 'ইনভেন্টরি ভ্যালু' : 'Inventory Value', value: `৳${totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: bn ? 'বিক্রয় আয়' : 'Sales Revenue', value: `৳${totalSaleValue.toLocaleString()}`, icon: DollarSign, color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
      {stats.map((s, i) => (
        <div key={i} className="card-elevated p-4 flex flex-col items-center text-center gap-2">
          <div className={`p-2 rounded-lg ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <p className="text-xl font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default LibraryDashboard;
