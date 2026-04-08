import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Printer, CreditCard, Filter, Loader2, Eye, CheckSquare, Square, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudentIdCard from '@/components/idcard/StudentIdCard';
import { printIdCard, printMultipleIdCards } from '@/lib/idCardPrint';
import { toast } from 'sonner';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

const AdminIdCards = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const { settings } = useWebsiteSettings();
  const [search, setSearch] = useState('');
  const [filterDivisionId, setFilterDivisionId] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  const [previewStudent, setPreviewStudent] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [validUntil, setValidUntil] = useState('December 2026');
  const [principalName, setPrincipalName] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Load principal name from settings
  useEffect(() => {
    if (settings.principal_name && !principalName) {
      setPrincipalName(settings.principal_name);
    }
  }, [settings.principal_name]);

  // Load saved signature
  const { data: savedSignature } = useQuery({
    queryKey: ['idcard-principal-signature'],
    queryFn: async () => {
      const { data } = await supabase.from('website_settings').select('value').eq('key', 'idcard_principal_signature_url').maybeSingle();
      return data?.value || '';
    },
  });

  useEffect(() => {
    if (savedSignature && !signatureUrl) setSignatureUrl(String(savedSignature));
  }, [savedSignature]);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      toast.error(bn ? 'ফাইল সাইজ ৩০০KB এর বেশি' : 'File size exceeds 300KB');
      return;
    }
    setUploadingSignature(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `principal-signature-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('institution-logos').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('institution-logos').getPublicUrl(path);
      const url = urlData.publicUrl;
      setSignatureUrl(url);
      // Save to settings
      const { data: existing } = await supabase.from('website_settings').select('id').eq('key', 'idcard_principal_signature_url').maybeSingle();
      if (existing) {
        await supabase.from('website_settings').update({ value: url }).eq('key', 'idcard_principal_signature_url');
      } else {
        await supabase.from('website_settings').insert({ key: 'idcard_principal_signature_url', value: url });
      }
      toast.success(bn ? 'স্বাক্ষর আপলোড হয়েছে' : 'Signature uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingSignature(false);
      if (sigInputRef.current) sigInputRef.current.value = '';
    }
  };

  const removeSignature = async () => {
    setSignatureUrl('');
    await supabase.from('website_settings').update({ value: '' }).eq('key', 'idcard_principal_signature_url');
    toast.success(bn ? 'স্বাক্ষর সরানো হয়েছে' : 'Signature removed');
  };

  const { data: institution } = useQuery({
    queryKey: ['institution-default'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('*').eq('is_default', true).maybeSingle();
      return data;
    },
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('divisions').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*, divisions(name, name_bn)').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students-idcard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*, divisions(name, name_bn)').order('roll_number', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredClasses = filterDivisionId !== 'all' ? classes.filter((c: any) => c.division_id === filterDivisionId) : classes;

  const getClassName = (classId: string | null) => {
    if (!classId) return '-';
    const cls = classes.find((c: any) => c.id === classId);
    return cls ? (bn ? cls.name_bn : cls.name) : '-';
  };

  const parseRoll = (r: string | null) => { const n = parseInt(r || '', 10); return isNaN(n) ? Infinity : n; };

  const filtered = students
    .filter((s: any) => {
      if (filterDivisionId !== 'all' && s.division_id !== filterDivisionId) return false;
      if (filterClassId !== 'all' && s.class_id !== filterClassId) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name_bn?.toLowerCase().includes(q) || s.name_en?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.roll_number?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a: any, b: any) => parseRoll(a.roll_number) - parseRoll(b.roll_number));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s: any) => s.id)));
    }
  };

  const buildStudentData = (s: any) => ({
    name_bn: s.name_bn,
    name_en: s.name_en,
    student_id: s.student_id,
    roll_number: s.roll_number,
    photo_url: s.photo_url,
    blood_group: s.blood_group,
    class_name: getClassName(s.class_id),
    division_name: bn ? s.divisions?.name_bn : s.divisions?.name,
    father_name: s.father_name_bn || s.father_name,
    phone: s.phone,
    guardian_phone: s.guardian_phone,
    address: s.address,
  });

  const handlePrintSingle = useCallback((student: any) => {
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      root.render(
        <StudentIdCard
          student={buildStudentData(student)}
          institution={institution || undefined}
          validUntil={validUntil}
          principalName={principalName}
          principalSignatureUrl={signatureUrl}
          lang={language}
          ref={(el) => {
            if (el) {
              setTimeout(() => {
                printIdCard(el.outerHTML);
                root.unmount();
                document.body.removeChild(tempDiv);
              }, 100);
            }
          }}
        />
      );
    });
  }, [institution, validUntil, principalName, signatureUrl, bn, classes]);

  const handlePrintSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error(bn ? 'ছাত্র নির্বাচন করুন' : 'Select students first');
      return;
    }

    const selectedStudents = filtered.filter((s: any) => selectedIds.has(s.id));
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      const cards: string[] = [];
      let rendered = 0;

      const Cards = () => (
        <>
          {selectedStudents.map((s: any) => (
            <StudentIdCard
              key={s.id}
              student={buildStudentData(s)}
              institution={institution || undefined}
              validUntil={validUntil}
              principalName={principalName}
              principalSignatureUrl={signatureUrl}
              lang={language}
              ref={(el) => {
                if (el) {
                  cards.push(el.outerHTML);
                  rendered++;
                  if (rendered === selectedStudents.length) {
                    setTimeout(() => {
                      printMultipleIdCards(cards);
                      root.unmount();
                      document.body.removeChild(tempDiv);
                    }, 100);
                  }
                }
              }}
            />
          ))}
        </>
      );

      root.render(<Cards />);
    });
  }, [selectedIds, filtered, institution, validUntil, principalName, signatureUrl, bn, classes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            {bn ? 'আইডি কার্ড ব্যবস্থাপনা' : 'ID Card Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bn ? `মোট ${filtered.length} জন ছাত্র | ${selectedIds.size} জন নির্বাচিত` : `Total ${filtered.length} students | ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button onClick={handlePrintSelected} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center gap-2">
              <Printer className="w-4 h-4" />
              {bn ? `${selectedIds.size} টি প্রিন্ট` : `Print ${selectedIds.size}`}
            </Button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="card-elevated p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'মেয়াদ' : 'Valid Until'}</label>
            <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="bg-background" placeholder="December 2026" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'প্রিন্সিপালের নাম' : 'Principal Name'}</label>
            <Input value={principalName} onChange={(e) => setPrincipalName(e.target.value)} className="bg-background" placeholder={bn ? 'নাম লিখুন' : 'Enter name'} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'প্রিন্সিপালের স্বাক্ষর' : 'Principal Signature'}</label>
            {signatureUrl ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
                <img src={signatureUrl} alt="Signature" className="h-8 max-w-[100px] object-contain" />
                <button onClick={removeSignature} className="p-1 rounded hover:bg-destructive/10 text-destructive" title={bn ? 'সরান' : 'Remove'}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input ref={sigInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleSignatureUpload} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => sigInputRef.current?.click()}
                  disabled={uploadingSignature}
                >
                  {uploadingSignature ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  {bn ? 'আপলোড করুন' : 'Upload'}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">{bn ? 'PNG/JPG, সর্বোচ্চ ৩০০KB' : 'PNG/JPG, max 300KB'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={bn ? 'নাম, আইডি বা রোল...' : 'Name, ID or Roll...'} className="pl-10 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterDivisionId} onValueChange={(v) => { setFilterDivisionId(v); setFilterClassId('all'); }}>
            <SelectTrigger className="bg-background w-full sm:w-40">
              <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder={bn ? 'বিভাগ' : 'Division'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল বিভাগ' : 'All Divisions'}</SelectItem>
              {divisions.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{bn ? d.name_bn : d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="bg-background w-full sm:w-40">
              <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder={bn ? 'শ্রেণী' : 'Class'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{bn ? 'সকল শ্রেণী' : 'All Classes'}</SelectItem>
              {filteredClasses.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{bn ? c.name_bn : c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleAll} className="text-muted-foreground hover:text-primary">
                      {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'রোল' : 'Roll'}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'নাম' : 'Name'}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'আইডি' : 'ID'}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'শ্রেণী' : 'Class'}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'বিভাগ' : 'Division'}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{bn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(s.id)} className="text-muted-foreground hover:text-primary">
                        {selectedIds.has(s.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">{s.roll_number || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img src={s.photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {s.name_bn?.[0] || '?'}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-foreground text-sm block">{s.name_bn}</span>
                          {s.name_en && <span className="text-xs text-muted-foreground">{s.name_en}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.student_id}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{getClassName(s.class_id)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{bn ? s.divisions?.name_bn : s.divisions?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreviewStudent(s)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title={bn ? 'প্রিভিউ' : 'Preview'}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handlePrintSingle(s)} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary" title={bn ? 'প্রিন্ট' : 'Print'}>
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">{bn ? 'কোনো ছাত্র পাওয়া যায়নি' : 'No students found'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewStudent} onOpenChange={(o) => { if (!o) setPreviewStudent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bn ? 'আইডি কার্ড প্রিভিউ' : 'ID Card Preview'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {previewStudent && (
              <div className="transform scale-[1.8] origin-top my-8">
                <StudentIdCard
                  ref={cardRef}
                  student={buildStudentData(previewStudent)}
                  institution={institution || undefined}
                  validUntil={validUntil}
                  principalName={principalName}
                  principalSignatureUrl={signatureUrl}
                  lang={language}
                />
              </div>
            )}
            <Button
              onClick={() => {
                if (cardRef.current) {
                  printIdCard(cardRef.current.outerHTML);
                }
              }}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center gap-2 mt-4"
            >
              <Printer className="w-4 h-4" />
              {bn ? 'প্রিন্ট করুন' : 'Print Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIdCards;
