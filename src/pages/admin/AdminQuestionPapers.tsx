import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Plus, Trash2, Printer, ArrowLeft, Check, X, Clock, Eye, Keyboard, Type, ChevronDown, ChevronUp, GripVertical, FileCheck, AlertCircle } from 'lucide-react';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { useAuth } from '@/hooks/useAuth';

// ─── Arabic Virtual Keyboard Layout ───
const ARABIC_KEYBOARD_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['ً', 'ٌ', 'ٍ', 'َ', 'ُ', 'ِ', 'ّ', 'ْ'],
];

// Physical keyboard → Arabic character mapping (standard Arabic keyboard layout)
const PHYSICAL_TO_ARABIC: Record<string, string> = {
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
  '[': 'ج', ']': 'د', 'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن',
  'l': 'م', ';': 'ك', "'": 'ط', 'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة',
  ',': 'و', '.': 'ز', '/': 'ظ',
  // Shift variants (harakat)
  'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'ِ', 'Y': 'ٍ', 'U': 'ّ', 'I': 'ْ',
};

// Reverse map: Arabic char → physical key (for highlighting)
const ARABIC_TO_PHYSICAL: Record<string, string> = {};
for (const [phys, ar] of Object.entries(PHYSICAL_TO_ARABIC)) {
  ARABIC_TO_PHYSICAL[ar] = phys;
}

// ─── Arabic Keyboard Component ───
const ArabicKeyboard = ({
  onKeyPress,
  onClose,
  highlightedKey,
}: {
  onKeyPress: (char: string) => void;
  onClose: () => void;
  highlightedKey: string | null;
}) => {
  const [position, setPosition] = useState({ x: 100, y: 300 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const kbRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragging, dragOffset]);

  return (
    <div
      ref={kbRef}
      className="fixed z-[100] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-3 select-none"
      style={{ left: position.x, top: position.y, cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-muted-foreground">⌨️ Arabic Keyboard</span>
        <span className="text-[10px] text-muted-foreground mx-2">Physical keys mapped when AR is ON</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
      </div>
      {ARABIC_KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center mb-1" dir="rtl">
          {row.map((char) => {
            const isHighlighted = highlightedKey === char;
            return (
              <button
                key={char}
                className={`h-9 min-w-[2.2rem] px-1.5 rounded-lg text-base font-medium transition-all duration-100
                  ${isHighlighted
                    ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                    : 'bg-secondary/80 hover:bg-primary/20 hover:text-primary active:scale-95'
                  }`}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onKeyPress(char); }}
              >
                {char}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex gap-1 justify-center mt-1">
        <button className="h-9 px-6 rounded-lg bg-secondary/80 hover:bg-primary/20 text-sm transition-colors" onMouseDown={(e) => { e.preventDefault(); onKeyPress(' '); }}>Space</button>
        <button className="h-9 px-4 rounded-lg bg-secondary/80 hover:bg-destructive/20 text-sm transition-colors" onMouseDown={(e) => { e.preventDefault(); onKeyPress('BACKSPACE'); }}>⌫</button>
      </div>
    </div>
  );
};

// ─── Status Badge Component ───
const StatusBadge = ({ status, language }: { status: string; language: string }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="h-3 w-3" />
      {language === 'bn' ? config.labelBn : config.label}
    </span>
  );
};

// ─── Live Preview Component ───
const LivePreview = ({ paper, questions, fontConfig, headerConfig, institution, language }: {
  paper: any; questions: Question[]; fontConfig: FontConfig; headerConfig: HeaderConfig; institution: any; language: string;
}) => {
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const sessionName = paper?.exam_sessions ? (language === 'bn' ? paper.exam_sessions.name_bn : paper.exam_sessions.name) : '';
  const subjectName = paper?.subjects ? (language === 'bn' ? paper.subjects.name_bn : paper.subjects.name) : '';

  return (
    <div className="bg-white text-black rounded-xl shadow-lg border border-border/20 overflow-hidden">
      {/* A4 Preview */}
      <div className="p-1">
        <div className="relative" style={{ fontFamily: fontConfig.bengali, fontSize: `${fontConfig.fontSize}px`, aspectRatio: '210/297', maxHeight: '70vh', overflow: 'auto' }}>
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className={`mb-4 pb-3 border-b-2 border-black ${headerConfig.centered ? 'text-center' : ''}`}>
              {headerConfig.showLogo && institution?.logo_url && (
                <img src={institution.logo_url} alt="" className="h-14 mx-auto mb-2" />
              )}
              {headerConfig.showInstitutionName && institution && (
                <h2 className="text-lg font-bold" style={{ fontFamily: fontConfig.bengali }}>
                  {language === 'bn' ? institution.name : institution.name_en || institution.name}
                </h2>
              )}
              {institution?.address && (
                <p className="text-xs text-gray-600">{institution.address}</p>
              )}
              {sessionName && <p className="text-sm font-semibold mt-1">{sessionName}</p>}
              <h1 className="text-base font-bold mt-1">{language === 'bn' ? paper?.title_bn : paper?.title}</h1>
              {subjectName && <p className="text-sm">📖 {subjectName}</p>}
              <div className="flex justify-between mt-2 text-xs">
                <span>{language === 'bn' ? 'পূর্ণমান' : 'Full Marks'}: {totalMarks}</span>
                <span>{language === 'bn' ? 'সময়' : 'Time'}: {paper?.duration_minutes} {language === 'bn' ? 'মিনিট' : 'min'}</span>
              </div>
            </div>

            {/* Instructions */}
            {(paper?.instructions_bn || paper?.instructions) && (
              <div className="mb-3 p-2 bg-gray-50 rounded text-xs italic">
                {language === 'bn' ? paper?.instructions_bn : paper?.instructions}
              </div>
            )}

            {/* Questions */}
            {questions.map((q, i) => {
              const qText = language === 'bn' ? q.question_text_bn || q.question_text : q.question_text;
              const isArabic = /[\u0600-\u06FF]/.test(qText);
              const fontFamily = isArabic ? fontConfig.arabic : fontConfig.bengali;

              return (
                <div key={i} className="mb-3" style={{ fontFamily }}>
                  {q.group_label_bn && i === 0 || (i > 0 && q.group_label_bn !== questions[i - 1]?.group_label_bn) ? (
                    <div className="font-bold text-sm mb-1 mt-2 px-1 py-0.5 bg-gray-100">
                      {language === 'bn' ? q.group_label_bn : q.group_label}
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm" dir={isArabic ? 'rtl' : 'ltr'}>
                    <span>{i + 1}। {qText || (language === 'bn' ? '(প্রশ্ন লিখুন)' : '(Enter question)')}</span>
                    <span className="text-gray-500 shrink-0 ml-2">[{q.marks}]</span>
                  </div>
                  {q.question_type === 'mcq' && Array.isArray(q.options) && (
                    <div className="ml-6 mt-1 grid grid-cols-2 gap-x-4 text-xs">
                      {q.options.map((opt: any, oi: number) => (
                        <span key={oi}>{String.fromCharCode(65 + oi)}. {language === 'bn' ? opt.text_bn || opt.text : opt.text}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {questions.length === 0 && (
              <div className="text-center text-gray-400 py-12 text-sm">
                {language === 'bn' ? 'বাম পাশে প্রশ্ন যোগ করুন — এখানে লাইভ প্রিভিউ দেখাবে' : 'Add questions on the left — live preview will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───
const AdminQuestionPapers = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);
  const [activeInputRef, setActiveInputRef] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const [fontConfig, setFontConfig] = useState<FontConfig>({ arabic: 'Amiri', bengali: 'SutonnyOMJ', english: 'Arial', fontSize: 14 });
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({ showLogo: true, showInstitutionName: true, centered: true });

  const [newPaper, setNewPaper] = useState({
    title: '', title_bn: '', subject_type: 'bangla',
    total_marks: 100, duration_minutes: 120,
    instructions: '', instructions_bn: '',
    exam_session_id: '', class_id: '', division_id: '', subject_id: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  // ─── Data Queries ───
  const { data: examSessions = [] } = useQuery({
    queryKey: ['exam-sessions-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_sessions')
        .select('id, name, name_bn, academic_session_id, exam_type, is_active')
        .eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('divisions').select('id, name, name_bn, sort_order').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list', newPaper.division_id],
    queryFn: async () => {
      let q = supabase.from('classes').select('id, name, name_bn, division_id, sort_order').eq('is_active', true);
      if (newPaper.division_id) q = q.eq('division_id', newPaper.division_id);
      const { data, error } = await q.order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-list', newPaper.class_id],
    queryFn: async () => {
      let q = supabase.from('subjects').select('id, name, name_bn, class_id').eq('is_active', true);
      if (newPaper.class_id) q = q.eq('class_id', newPaper.class_id);
      const { data, error } = await q.order('name_bn');
      if (error) throw error;
      return data;
    },
  });

  const { data: institution } = useQuery({
    queryKey: ['institution'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('*').eq('is_default', true).maybeSingle();
      return data;
    },
  });

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['question-papers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('question_papers')
        .select('*, exam_sessions(id, name, name_bn), subjects(id, name, name_bn)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: paperQuestions = [] } = useQuery({
    queryKey: ['questions', selectedPaper?.id],
    queryFn: async () => {
      if (!selectedPaper?.id) return [];
      const { data, error } = await supabase.from('questions').select('*').eq('paper_id', selectedPaper.id).order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPaper?.id,
  });

  // Load font config from paper
  useEffect(() => {
    if (selectedPaper) {
      if (selectedPaper.font_config) {
        try { setFontConfig(typeof selectedPaper.font_config === 'string' ? JSON.parse(selectedPaper.font_config) : selectedPaper.font_config); } catch { }
      }
      if (selectedPaper.header_config) {
        try { setHeaderConfig(typeof selectedPaper.header_config === 'string' ? JSON.parse(selectedPaper.header_config) : selectedPaper.header_config); } catch { }
      }
    }
  }, [selectedPaper?.id]);

  useEffect(() => {
    if (selectedPaper && paperQuestions) {
      setQuestions(paperQuestions.map((q: any) => ({
        id: q.id, question_text: q.question_text || '', question_text_bn: q.question_text_bn || '',
        question_type: q.question_type || 'descriptive', marks: q.marks || 5, sort_order: q.sort_order || 0,
        group_label: q.group_label || '', group_label_bn: q.group_label_bn || '',
        options: q.options, answer: q.answer || '',
      })));
    }
  }, [selectedPaper?.id, paperQuestions]);

  // ─── Mutations ───
  const createPaper = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('question_papers').insert({
        title: newPaper.title, title_bn: newPaper.title_bn, subject_type: newPaper.subject_type,
        total_marks: newPaper.total_marks, duration_minutes: newPaper.duration_minutes,
        instructions: newPaper.instructions, instructions_bn: newPaper.instructions_bn,
        exam_session_id: newPaper.exam_session_id || null, class_id: newPaper.class_id || null,
        division_id: newPaper.division_id || null, subject_id: newPaper.subject_id || null,
        status: 'pending', created_by: user?.id || null,
        font_config: fontConfig as any, header_config: headerConfig as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-papers'] });
      setShowCreateDialog(false);
      setNewPaper({ title: '', title_bn: '', subject_type: 'bangla', total_marks: 100, duration_minutes: 120, instructions: '', instructions_bn: '', exam_session_id: '', class_id: '', division_id: '', subject_id: '' });
      toast.success(language === 'bn' ? 'প্রশ্নপত্র তৈরি হয়েছে (অপেক্ষমান)' : 'Paper created (Pending)');
    },
    onError: () => toast.error(language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error'),
  });

  const deletePaper = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('question_papers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-papers'] });
      setDeleteTarget(null);
      if (selectedPaper) setSelectedPaper(null);
      toast.success(language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted');
    },
  });

  const saveQuestions = useMutation({
    mutationFn: async () => {
      if (!selectedPaper?.id) return;
      // Save font/header config too
      await supabase.from('question_papers').update({ font_config: fontConfig as any, header_config: headerConfig as any }).eq('id', selectedPaper.id);
      await supabase.from('questions').delete().eq('paper_id', selectedPaper.id);
      if (questions.length > 0) {
        const rows = questions.map((q, i) => ({
          paper_id: selectedPaper.id, question_text: q.question_text, question_text_bn: q.question_text_bn,
          question_type: q.question_type, marks: q.marks, sort_order: i,
          group_label: q.group_label, group_label_bn: q.group_label_bn, options: q.options, answer: q.answer,
        }));
        const { error } = await supabase.from('questions').insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedPaper?.id] });
      toast.success(language === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved');
    },
    onError: () => toast.error(language === 'bn' ? 'ত্রুটি' : 'Error'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const update: Record<string, any> = { status };
      if (status === 'approved') { update.approved_by = user?.id; update.approved_at = new Date().toISOString(); }
      if (note) update.rejection_note = note;
      const { error } = await supabase.from('question_papers').update(update as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-papers'] });
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
      setShowRejectDialog(false);
      setRejectionNote('');
    },
  });

  // ─── Question Helpers ───
  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '', question_text_bn: '', question_type: 'descriptive',
      marks: 5, sort_order: prev.length, group_label: '', group_label_bn: '',
      options: null, answer: '',
    }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addMcqOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = Array.isArray(q.options) ? [...q.options] : [];
      opts.push({ text: '', text_bn: '', is_correct: false });
      return { ...q, options: opts };
    }));
  };

  const updateMcqOption = (qIndex: number, optIndex: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = Array.isArray(q.options) ? [...q.options] : [];
      opts[optIndex] = { ...opts[optIndex], [field]: value };
      if (field === 'is_correct' && value) opts.forEach((o, oi) => { if (oi !== optIndex) o.is_correct = false; });
      return { ...q, options: opts };
    }));
  };

  const removeMcqOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: (q.options || []).filter((_: any, oi: number) => oi !== optIndex) };
    }));
  };

  // Arabic keyboard handler
  const handleArabicKey = useCallback((char: string) => {
    if (!activeInputRef) return;
    const el = activeInputRef;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    if (char === 'BACKSPACE') {
      if (start > 0) {
        const newVal = el.value.slice(0, start - 1) + el.value.slice(end);
        const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
          || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeSet?.call(el, newVal);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => el.setSelectionRange(start - 1, start - 1), 0);
      }
    } else {
      const newVal = el.value.slice(0, start) + char + el.value.slice(end);
      const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSet?.call(el, newVal);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => el.setSelectionRange(start + char.length, start + char.length), 0);
    }
    el.focus();
  }, [activeInputRef]);

  // Print function
  const printPaper = () => {
    if (!selectedPaper) return;
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const sessionName = selectedPaper.exam_sessions ? (language === 'bn' ? selectedPaper.exam_sessions.name_bn : selectedPaper.exam_sessions.name) : '';
    const subjectName = selectedPaper.subjects ? (language === 'bn' ? selectedPaper.subjects.name_bn : selectedPaper.subjects.name) : '';

    const buildQuestionsHtml = () => {
      let currentGroup = '';
      return questions.map((q, i) => {
        let groupHtml = '';
        const gl = language === 'bn' ? q.group_label_bn : q.group_label;
        if (gl && gl !== currentGroup) { currentGroup = gl; groupHtml = '<div class="group-label">' + gl + '</div>'; }
        const qText = language === 'bn' ? q.question_text_bn || q.question_text : q.question_text;
        const isArabic = /[\u0600-\u06FF]/.test(qText);
        const dir = isArabic ? 'rtl' : 'ltr';
        const ff = isArabic ? fontConfig.arabic : fontConfig.bengali;
        const opts = Array.isArray(q.options) ? '<div class="options">' + q.options.map((o: any, oi: number) =>
          '<span class="option">' + String.fromCharCode(65 + oi) + '. ' + (language === 'bn' ? o.text_bn || o.text : o.text) + '</span>'
        ).join('') + '</div>' : '';
        return groupHtml + '<div class="question" style="font-family:\'' + ff + '\';direction:' + dir + '"><div class="q-header"><span>' + (i + 1) + '। ' + qText + '</span><span>[' + q.marks + ']</span></div>' + opts + '</div>';
      }).join('');
    };

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      @page { margin: 15mm; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: '${fontConfig.bengali}', 'Noto Sans Bengali', sans-serif; padding: 30px; font-size: ${fontConfig.fontSize}px; }
      .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 14px; }
      .header h1 { font-size: 18px; } .header h2 { font-size: 22px; margin-bottom: 4px; }
      .header .meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; }
      .instructions { background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 12px; font-style: italic; }
      .question { margin-bottom: 14px; page-break-inside: avoid; }
      .q-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 3px; }
      .options { margin-left: 40px; margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; font-size: 13px; }
      .group-label { font-weight: 700; font-size: 14px; margin: 14px 0 6px; padding: 3px 8px; background: #e8e8e8; }
    </style></head><body>
    <div class="header">
      ${institution?.logo_url && headerConfig.showLogo ? '<img src="' + institution.logo_url + '" style="height:50px;margin:0 auto 8px" />' : ''}
      ${institution && headerConfig.showInstitutionName ? '<h2>' + (language === 'bn' ? institution.name : institution.name_en || institution.name) + '</h2>' : ''}
      ${institution?.address ? '<p style="font-size:11px;color:#555">' + institution.address + '</p>' : ''}
      ${sessionName ? '<p style="font-size:13px;font-weight:600;margin-top:4px">' + sessionName + '</p>' : ''}
      <h1>${language === 'bn' ? selectedPaper.title_bn : selectedPaper.title}</h1>
      ${subjectName ? '<p style="font-size:13px">📖 ' + subjectName + '</p>' : ''}
      <div class="meta"><span>${language === 'bn' ? 'পূর্ণমান' : 'Full Marks'}: ${totalMarks}</span><span>${language === 'bn' ? 'সময়' : 'Time'}: ${selectedPaper.duration_minutes} ${language === 'bn' ? 'মিনিট' : 'min'}</span></div>
    </div>
    ${(selectedPaper.instructions_bn || selectedPaper.instructions) ? '<div class="instructions">' + (language === 'bn' ? selectedPaper.instructions_bn : selectedPaper.instructions) + '</div>' : ''}
    ${buildQuestionsHtml()}
    <script>window.onload=function(){window.print()}<\/script></body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // Filter papers
  let filteredPapers = papers;
  if (filterType !== 'all') filteredPapers = filteredPapers.filter((p: any) => p.subject_id === filterType || p.subject_type === filterType);
  if (filterSession !== 'all') filteredPapers = filteredPapers.filter((p: any) => p.exam_session_id === filterSession);
  if (filterStatus !== 'all') filteredPapers = filteredPapers.filter((p: any) => (p.status || 'pending') === filterStatus);

  // ═══════════════════════════════════════
  // PAPER LIST VIEW
  // ═══════════════════════════════════════
  if (!selectedPaper) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold font-display">
            {language === 'bn' ? '📝 প্রশ্নপত্র বিল্ডার' : '📝 Question Paper Builder'}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{language === 'bn' ? v.labelBn : v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSession} onValueChange={setFilterSession}>
              <SelectTrigger className="w-40"><SelectValue placeholder={language === 'bn' ? 'সেশন' : 'Session'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সকল সেশন' : 'All Sessions'}</SelectItem>
                {examSessions.map((s: any) => (<SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn : s.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="btn-primary-gradient"><Plus className="h-4 w-4 mr-1" />{language === 'bn' ? 'নতুন প্রশ্নপত্র' : 'New Paper'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{language === 'bn' ? 'নতুন প্রশ্নপত্র তৈরি' : 'Create Question Paper'}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>{language === 'bn' ? 'পরীক্ষা সেশন' : 'Exam Session'} <span className="text-destructive">*</span></Label>
                    <Select value={newPaper.exam_session_id} onValueChange={v => setNewPaper(p => ({ ...p, exam_session_id: v }))}>
                      <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সেশন নির্বাচন' : 'Select session'} /></SelectTrigger>
                      <SelectContent>{examSessions.map((s: any) => (<SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn : s.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'bn' ? 'বিভাগ' : 'Division'}</Label>
                      <Select value={newPaper.division_id} onValueChange={v => setNewPaper(p => ({ ...p, division_id: v, class_id: '', subject_id: '' }))}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'নির্বাচন' : 'Select'} /></SelectTrigger>
                        <SelectContent>{divisions.map((d: any) => (<SelectItem key={d.id} value={d.id}>{language === 'bn' ? d.name_bn : d.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'bn' ? 'শ্রেণী' : 'Class'}</Label>
                      <Select value={newPaper.class_id} onValueChange={v => setNewPaper(p => ({ ...p, class_id: v, subject_id: '' }))} disabled={!newPaper.division_id}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'নির্বাচন' : 'Select'} /></SelectTrigger>
                        <SelectContent>{classes.filter((c: any) => !newPaper.division_id || c.division_id === newPaper.division_id).map((c: any) => (<SelectItem key={c.id} value={c.id}>{language === 'bn' ? c.name_bn : c.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'bn' ? 'বিষয়' : 'Subject'}</Label>
                    <Select value={newPaper.subject_id} onValueChange={v => setNewPaper(p => ({ ...p, subject_id: v }))} disabled={!newPaper.class_id}>
                      <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'বিষয় নির্বাচন' : 'Select subject'} /></SelectTrigger>
                      <SelectContent>{subjects.filter((s: any) => !newPaper.class_id || s.class_id === newPaper.class_id).map((s: any) => (<SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn : s.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</Label><Input value={newPaper.title} onChange={e => setNewPaper(p => ({ ...p, title: e.target.value }))} /></div>
                    <div><Label>{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'}</Label><Input value={newPaper.title_bn} onChange={e => setNewPaper(p => ({ ...p, title_bn: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{language === 'bn' ? 'পূর্ণমান' : 'Total Marks'}</Label><Input type="number" value={newPaper.total_marks} onChange={e => setNewPaper(p => ({ ...p, total_marks: Number(e.target.value) }))} /></div>
                    <div><Label>{language === 'bn' ? 'সময় (মিনিট)' : 'Duration (min)'}</Label><Input type="number" value={newPaper.duration_minutes} onChange={e => setNewPaper(p => ({ ...p, duration_minutes: Number(e.target.value) }))} /></div>
                  </div>
                  <div><Label>{language === 'bn' ? 'নির্দেশনা (বাংলা)' : 'Instructions (BN)'}</Label><Textarea value={newPaper.instructions_bn} onChange={e => setNewPaper(p => ({ ...p, instructions_bn: e.target.value }))} rows={2} /></div>
                  <div><Label>{language === 'bn' ? 'নির্দেশনা (ইংরেজি)' : 'Instructions (EN)'}</Label><Textarea value={newPaper.instructions} onChange={e => setNewPaper(p => ({ ...p, instructions: e.target.value }))} rows={2} /></div>
                  <Button onClick={() => createPaper.mutate()} disabled={!newPaper.title_bn || !newPaper.exam_session_id || createPaper.isPending} className="w-full btn-primary-gradient">
                    {language === 'bn' ? 'তৈরি করুন (অপেক্ষমান হিসেবে)' : 'Create (as Pending)'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
        ) : filteredPapers.length === 0 ? (
          <Card className="card-elevated"><CardContent className="py-12 text-center text-muted-foreground">
            {language === 'bn' ? 'কোনো প্রশ্নপত্র নেই' : 'No question papers'}
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper: any) => {
              const subjectName = paper.subjects ? (language === 'bn' ? paper.subjects.name_bn : paper.subjects.name) : null;
              const sessionName = paper.exam_sessions ? (language === 'bn' ? paper.exam_sessions.name_bn : paper.exam_sessions.name) : null;
              const status = paper.status || 'pending';
              return (
                <Card key={paper.id} className="card-elevated cursor-pointer hover:shadow-lg transition-all group" onClick={() => setSelectedPaper(paper)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={status} language={language} />
                        </div>
                        {sessionName && <p className="text-xs text-muted-foreground mb-0.5">📋 {sessionName}</p>}
                        <CardTitle className="text-base leading-tight truncate">{language === 'bn' ? paper.title_bn : paper.title}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); setDeleteTarget(paper.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-1.5 flex-wrap">
                      {subjectName && <Badge variant="secondary" className="text-xs">📖 {subjectName}</Badge>}
                      <Badge variant="outline" className="text-xs">{paper.total_marks} {language === 'bn' ? 'নম্বর' : 'marks'}</Badge>
                      <Badge variant="outline" className="text-xs">{paper.duration_minutes} {language === 'bn' ? 'মি' : 'min'}</Badge>
                    </div>
                    {status === 'rejected' && paper.rejection_note && (
                      <p className="text-xs text-destructive mt-2 line-clamp-2">⚠️ {paper.rejection_note}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deletePaper.mutate(deleteTarget)}
          title={language === 'bn' ? 'প্রশ্নপত্র মুছবেন?' : 'Delete paper?'} description={language === 'bn' ? 'সকল প্রশ্নও মুছে যাবে।' : 'All questions will be deleted.'} />
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SPLIT-VIEW EDITOR
  // ═══════════════════════════════════════
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const status = selectedPaper.status || 'pending';

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedPaper(null); setQuestions([]); setShowArabicKeyboard(false); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display truncate">{language === 'bn' ? selectedPaper.title_bn : selectedPaper.title}</h1>
              <StatusBadge status={status} language={language} />
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'মোট' : 'Total'}: {totalMarks}/{selectedPaper.total_marks}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Arabic Keyboard Toggle */}
          <Button variant={showArabicKeyboard ? 'default' : 'outline'} size="sm" onClick={() => setShowArabicKeyboard(!showArabicKeyboard)}>
            <Keyboard className="h-4 w-4 mr-1" />AR
          </Button>
          {/* Font Panel Toggle */}
          <Button variant={showFontPanel ? 'default' : 'outline'} size="sm" onClick={() => setShowFontPanel(!showFontPanel)}>
            <Type className="h-4 w-4 mr-1" />{language === 'bn' ? 'ফন্ট' : 'Font'}
          </Button>
          {/* Approval actions */}
          {status === 'pending' && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateStatus.mutate({ id: selectedPaper.id, status: 'approved' })}>
                <Check className="h-4 w-4 mr-1" />{language === 'bn' ? 'অনুমোদন' : 'Approve'}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowRejectDialog(true)}>
                <X className="h-4 w-4 mr-1" />{language === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}
              </Button>
            </>
          )}
          {status === 'rejected' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: selectedPaper.id, status: 'pending' })}>
              {language === 'bn' ? 'পুনরায় জমা' : 'Resubmit'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={printPaper}><Printer className="h-4 w-4 mr-1" />{language === 'bn' ? 'প্রিন্ট' : 'Print'}</Button>
          <Button size="sm" onClick={() => saveQuestions.mutate()} disabled={saveQuestions.isPending} className="btn-primary-gradient">
            {language === 'bn' ? 'সংরক্ষণ' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Rejection note */}
      {status === 'rejected' && selectedPaper.rejection_note && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span><strong>{language === 'bn' ? 'প্রত্যাখ্যানের কারণ:' : 'Rejection note:'}</strong> {selectedPaper.rejection_note}</span>
        </div>
      )}

      {/* Font Panel */}
      {showFontPanel && (
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{language === 'bn' ? 'আরবি ফন্ট' : 'Arabic Font'}</Label>
                <Select value={fontConfig.arabic} onValueChange={v => setFontConfig(p => ({ ...p, arabic: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FONT_PRESETS.arabic.map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{language === 'bn' ? 'বাংলা ফন্ট' : 'Bengali Font'}</Label>
                <Select value={fontConfig.bengali} onValueChange={v => setFontConfig(p => ({ ...p, bengali: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FONT_PRESETS.bengali.map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{language === 'bn' ? 'ইংরেজি ফন্ট' : 'English Font'}</Label>
                <Select value={fontConfig.english} onValueChange={v => setFontConfig(p => ({ ...p, english: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FONT_PRESETS.english.map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{language === 'bn' ? 'ফন্ট সাইজ' : 'Font Size'}: {fontConfig.fontSize}px</Label>
                <Slider value={[fontConfig.fontSize]} onValueChange={([v]) => setFontConfig(p => ({ ...p, fontSize: v }))} min={10} max={22} step={1} className="mt-2" />
              </div>
            </div>
            <div className="flex gap-4 mt-3 pt-2 border-t border-border/50">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={headerConfig.showLogo} onCheckedChange={v => setHeaderConfig(p => ({ ...p, showLogo: v }))} />
                {language === 'bn' ? 'লোগো' : 'Logo'}
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={headerConfig.showInstitutionName} onCheckedChange={v => setHeaderConfig(p => ({ ...p, showInstitutionName: v }))} />
                {language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Institution Name'}
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={headerConfig.centered} onCheckedChange={v => setHeaderConfig(p => ({ ...p, centered: v }))} />
                {language === 'bn' ? 'সেন্টার্ড' : 'Centered'}
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split View: Editor (left) + Preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Question Editor */}
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {questions.map((q, qi) => (
            <Card key={qi} className="card-elevated">
              <CardContent className="pt-3 pb-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-1 shrink-0">{qi + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'প্রশ্ন (বাংলা/আরবি)' : 'Question (BN/AR)'}</Label>
                        <Textarea value={q.question_text_bn} onChange={e => updateQuestion(qi, 'question_text_bn', e.target.value)}
                          onFocus={e => setActiveInputRef(e.target)} rows={2} className="text-sm" dir="auto" />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'প্রশ্ন (ইংরেজি)' : 'Question (EN)'}</Label>
                        <Textarea value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)}
                          onFocus={e => setActiveInputRef(e.target)} rows={2} className="text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'ধরন' : 'Type'}</Label>
                        <Select value={q.question_type} onValueChange={v => updateQuestion(qi, 'question_type', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{QUESTION_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{language === 'bn' ? t.labelBn : t.labelEn}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'নম্বর' : 'Marks'}</Label>
                        <Input type="number" value={q.marks} onChange={e => updateQuestion(qi, 'marks', Number(e.target.value))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'গ্রুপ (বাং)' : 'Group (BN)'}</Label>
                        <Input value={q.group_label_bn} onChange={e => updateQuestion(qi, 'group_label_bn', e.target.value)} className="h-8 text-xs" placeholder="ক বিভাগ" onFocus={e => setActiveInputRef(e.target)} />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'bn' ? 'গ্রুপ (ইং)' : 'Group (EN)'}</Label>
                        <Input value={q.group_label} onChange={e => updateQuestion(qi, 'group_label', e.target.value)} className="h-8 text-xs" placeholder="Section A" />
                      </div>
                    </div>
                    {q.question_type === 'mcq' && (
                      <div className="space-y-1.5 pl-2">
                        <Label className="text-xs font-semibold">{language === 'bn' ? 'অপশন' : 'Options'}</Label>
                        {Array.isArray(q.options) && q.options.map((opt: any, oi: number) => (
                          <div key={oi} className="flex gap-1.5 items-center">
                            <span className="text-xs font-medium w-4">{String.fromCharCode(65 + oi)}</span>
                            <Input className="flex-1 h-7 text-xs" placeholder="বাংলা" value={opt.text_bn || ''} onChange={e => updateMcqOption(qi, oi, 'text_bn', e.target.value)} onFocus={e => setActiveInputRef(e.target)} />
                            <Input className="flex-1 h-7 text-xs" placeholder="English" value={opt.text || ''} onChange={e => updateMcqOption(qi, oi, 'text', e.target.value)} />
                            <label className="flex items-center gap-0.5 text-xs whitespace-nowrap">
                              <input type="radio" name={`correct-${qi}`} checked={opt.is_correct} onChange={() => updateMcqOption(qi, oi, 'is_correct', true)} />
                              ✓
                            </label>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMcqOption(qi, oi)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMcqOption(qi)}>
                          <Plus className="h-3 w-3 mr-1" />{language === 'bn' ? 'অপশন' : 'Option'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeQuestion(qi)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-1" />{language === 'bn' ? 'প্রশ্ন যোগ করুন' : 'Add Question'}
          </Button>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="hidden lg:block sticky top-0">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">{language === 'bn' ? 'লাইভ প্রিভিউ (A4)' : 'Live Preview (A4)'}</span>
          </div>
          <LivePreview paper={selectedPaper} questions={questions} fontConfig={fontConfig} headerConfig={headerConfig} institution={institution} language={language} />
        </div>
      </div>

      {/* Arabic Keyboard */}
      {showArabicKeyboard && (
        <ArabicKeyboard onKeyPress={handleArabicKey} onClose={() => setShowArabicKeyboard(false)} />
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{language === 'bn' ? 'প্রত্যাখ্যানের কারণ' : 'Rejection Reason'}</DialogTitle></DialogHeader>
          <Textarea value={rejectionNote} onChange={e => setRejectionNote(e.target.value)} placeholder={language === 'bn' ? 'কারণ লিখুন...' : 'Enter reason...'} rows={3} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={() => updateStatus.mutate({ id: selectedPaper.id, status: 'rejected', note: rejectionNote })} disabled={!rejectionNote.trim()}>
              {language === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuestionPapers;
