import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const METHOD_COLORS: Record<string, string> = {
  bkash: '#E2136E',
  nagad: '#F6A623',
  rocket: '#8B2FC9',
  upay: '#00A651',
  bank: '#1a73e8',
};

interface ManualPaymentMethodsProps {
  transactionId: string;
  onTransactionIdChange: (id: string) => void;
  selectedMethod?: string;
  onMethodSelect?: (method: string) => void;
}

const ManualPaymentMethods = ({
  transactionId,
  onTransactionIdChange,
  selectedMethod,
  onMethodSelect,
}: ManualPaymentMethodsProps) => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const { data: methods = [] } = useQuery({
    queryKey: ['public-manual-payment-methods'],
    queryFn: async () => {
      const { data } = await supabase
        .from('manual_payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return data || [];
    },
  });

  if (methods.length === 0) return null;

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast.success(bn ? 'নম্বর কপি হয়েছে' : 'Number copied');
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const activeMethod = methods.find((m: any) => m.method_type === selectedMethod);

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          {bn ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {methods.map((m: any) => {
            const color = METHOD_COLORS[m.method_type] || '#888';
            const isSelected = selectedMethod === m.method_type;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMethodSelect?.(m.method_type)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/40 bg-background'
                }`}
              >
                <Badge
                  style={{ backgroundColor: color, color: '#fff' }}
                  className="text-xs mb-1"
                >
                  {bn ? m.method_name_bn : m.method_name}
                </Badge>
                <p className="text-xs text-muted-foreground font-mono mt-1">{m.account_number}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Method Details */}
      {activeMethod && (
        <div className="card-elevated p-4 rounded-xl space-y-3 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <Badge
              style={{ backgroundColor: METHOD_COLORS[activeMethod.method_type] || '#888', color: '#fff' }}
              className="text-sm px-3 py-1"
            >
              {bn ? activeMethod.method_name_bn : activeMethod.method_name}
            </Badge>
            {activeMethod.account_holder_bn && (
              <span className="text-xs text-muted-foreground">
                {bn ? activeMethod.account_holder_bn : activeMethod.account_holder}
              </span>
            )}
          </div>

          {/* Account Number with copy */}
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
            <span className="text-lg font-mono font-bold text-foreground flex-1">
              {activeMethod.account_number}
            </span>
            <button
              type="button"
              onClick={() => copyNumber(activeMethod.account_number)}
              className="p-2 rounded-lg hover:bg-background transition-colors"
            >
              {copiedNumber === activeMethod.account_number ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* QR Code */}
          {activeMethod.qr_code_url && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                {bn ? 'QR কোড স্ক্যান করুন' : 'Scan QR Code'}
              </p>
              <img
                src={activeMethod.qr_code_url}
                alt="QR Code"
                className="w-48 h-48 mx-auto rounded-xl border object-contain bg-white p-2"
              />
            </div>
          )}

          {/* Instructions */}
          {(activeMethod.instructions_bn || activeMethod.instructions) && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                📋 {bn ? activeMethod.instructions_bn || activeMethod.instructions : activeMethod.instructions || activeMethod.instructions_bn}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transaction ID Input */}
      {selectedMethod && (
        <div>
          <Label className="text-sm font-medium text-foreground">
            {bn ? 'ট্রানজেকশন আইডি / TrxID' : 'Transaction ID / TrxID'} *
          </Label>
          <Input
            className="mt-1 bg-background font-mono"
            placeholder={bn ? 'আপনার ট্রানজেকশন আইডি লিখুন' : 'Enter your transaction ID'}
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {bn
              ? 'পেমেন্ট করার পর প্রাপ্ত ট্রানজেকশন আইডি এখানে দিন'
              : 'Enter the transaction ID received after payment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualPaymentMethods;
