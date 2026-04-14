import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Plus, Trash2, Printer, GripVertical, ArrowLeft } from 'lucide-react';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

const SUBJECT_TYPES = [
  { value: 'bangla', labelBn: 'বাংলা', labelEn: 'Bengali', icon: '🇧🇩' },
  { value: 'english', labelBn: 'ইংরেজি', labelEn: 'English', icon: '🇬🇧' },
  { value: 'math', labelBn: 'গণিত', labelEn: 'Mathematics', icon: '🔢' },
  { value: 'arabic', labelBn: 'আরবি', labelEn: 'Arabic', icon: '🕌' },
];

const QUESTION_TYPES = [
  { value: 'descriptive', labelBn: 'বর্ণনামূলক', labelEn: 'Descriptive' },
  { value: 'mcq', labelBn: 'বহুনির্বাচনী (MCQ)', labelEn: 'MCQ' },
  { value: 'short', labelBn: 'সংক্ষিপ্ত', labelEn: 'Short Answer' },
  { value: 'fill_blank', labelBn: 'শূন্যস্থান পূরণ', labelEn: 'Fill in the Blank' },
  { value: 'true_false', labelBn: 'সত্য/মিথ্যা', labelEn: 'True/False' },
  { value: 'matching', labelBn: 'মিলকরণ', labelEn: 'Matching' },
];

interface Question {
  id?: string;
  question_text: string;
  question_text_bn: string;
  question_type: string;
  marks: number;
  sort_order: number;
  group_label: string;
  group_label_bn: string;
  options: any;
  answer: string;
}

const AdminQuestionPapers = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');

  const [newPaper, setNewPaper] = useState({
    title: '', title_bn: '', subject_type: 'bangla',
    total_marks: 100, duration_minutes: 120,
    instructions: '', instructions_bn: '',
    exam_session_id: '', class_id: '', division_id: '',
    subject_id: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch exam sessions
  const { data: examSessions = [] } = useQuery({
    queryKey: ['exam-sessions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('id, name, name_bn, academic_session_id, exam_type, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name, name_bn, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch classes filtered by division
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

  // Fetch subjects filtered by class
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-list', newPaper.class_id],
    queryFn: async () => {
      let q = supabase.from('subjects').select('id, name, name_bn, class_id, sort_order').eq('is_active', true);
      if (newPaper.class_id) q = q.eq('class_id', newPaper.class_id);
      const { data, error } = await q.order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch papers with exam session join
  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['question-papers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_papers')
        .select('*, exam_sessions(id, name, name_bn)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch questions for selected paper
  const { data: paperQuestions = [] } = useQuery({
    queryKey: ['questions', selectedPaper?.id],
    queryFn: async () => {
      if (!selectedPaper?.id) return [];
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('paper_id', selectedPaper.id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPaper?.id,
  });

  // Sync questions when paperQuestions change
  useEffect(() => {
    if (selectedPaper && paperQuestions) {
      setQuestions(paperQuestions.map((q: any) => ({
        id: q.id,
        question_text: q.question_text || '',
        question_text_bn: q.question_text_bn || '',
        question_type: q.question_type || 'descriptive',
        marks: q.marks || 5,
        sort_order: q.sort_order || 0,
        group_label: q.group_label || '',
        group_label_bn: q.group_label_bn || '',
        options: q.options,
        answer: q.answer || '',
      })));
    }
  }, [selectedPaper?.id, paperQuestions]);

  // Create paper
  const createPaper = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('question_papers').insert({
        title: newPaper.title,
        title_bn: newPaper.title_bn,
        subject_type: newPaper.subject_type,
        total_marks: newPaper.total_marks,
        duration_minutes: newPaper.duration_minutes,
        instructions: newPaper.instructions,
        instructions_bn: newPaper.instructions_bn,
        exam_session_id: newPaper.exam_session_id || null,
        class_id: newPaper.class_id || null,
        division_id: newPaper.division_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-papers'] });
      setShowCreateDialog(false);
      setNewPaper({ title: '', title_bn: '', subject_type: 'bangla', total_marks: 100, duration_minutes: 120, instructions: '', instructions_bn: '', exam_session_id: '', class_id: '', division_id: '' });
      toast.success(language === 'bn' ? 'প্রশ্নপত্র তৈরি হয়েছে' : 'Question paper created');
    },
    onError: () => toast.error(language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred'),
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
      await supabase.from('questions').delete().eq('paper_id', selectedPaper.id);
      if (questions.length > 0) {
        const rows = questions.map((q, i) => ({
          paper_id: selectedPaper.id,
          question_text: q.question_text,
          question_text_bn: q.question_text_bn,
          question_type: q.question_type,
          marks: q.marks,
          sort_order: i,
          group_label: q.group_label,
          group_label_bn: q.group_label_bn,
          options: q.options,
          answer: q.answer,
        }));
        const { error } = await supabase.from('questions').insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedPaper?.id] });
      toast.success(language === 'bn' ? 'প্রশ্ন সংরক্ষিত হয়েছে' : 'Questions saved');
    },
    onError: () => toast.error(language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred'),
  });

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
      if (field === 'is_correct' && value) {
        opts.forEach((o, oi) => { if (oi !== optIndex) o.is_correct = false; });
      }
      return { ...q, options: opts };
    }));
  };

  const removeMcqOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = Array.isArray(q.options) ? q.options.filter((_: any, oi: number) => oi !== optIndex) : [];
      return { ...q, options: opts };
    }));
  };

  const printPaper = () => {
    if (!selectedPaper) return;
    const subjectInfo = SUBJECT_TYPES.find(s => s.value === selectedPaper.subject_type);
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const buildQuestionsHtml = () => {
      let currentGroup = '';
      return questions.map((q, i) => {
        let groupHtml = '';
        const gl = language === 'bn' ? q.group_label_bn : q.group_label;
        if (gl && gl !== currentGroup) {
          currentGroup = gl;
          groupHtml = '<div class="group-label">' + gl + '</div>';
        }
        const opts = Array.isArray(q.options) ? q.options.map((o: any, oi: number) =>
          '<div class="option">' + String.fromCharCode(2453 + oi) + '। ' + (language === 'bn' ? o.text_bn || o.text : o.text) + '</div>'
        ).join('') : '';
        const qText = language === 'bn' ? q.question_text_bn || q.question_text : q.question_text;
        return groupHtml + '<div class="question"><div class="q-header"><span>' + (i + 1) + '। ' + qText + '</span><span>[' + q.marks + ']</span></div>' +
          (opts ? '<div class="options">' + opts + '</div>' : '') + '</div>';
      }).join('');
    };

    const sessionName = selectedPaper.exam_sessions
      ? (language === 'bn' ? selectedPaper.exam_sessions.name_bn : selectedPaper.exam_sessions.name)
      : '';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Noto Sans Bengali', sans-serif; padding: 40px; font-size: 14px; }
      .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #000; padding-bottom: 16px; }
      .header h1 { font-size: 20px; margin-bottom: 4px; }
      .header .session { font-size: 15px; font-weight: 600; margin-bottom: 4px; color: #333; }
      .header .meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; }
      .instructions { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 13px; }
      .question { margin-bottom: 16px; page-break-inside: avoid; }
      .question .q-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px; }
      .options { margin-left: 48px; margin-top: 4px; }
      .option { margin-bottom: 2px; }
      .group-label { font-weight: 700; font-size: 15px; margin: 16px 0 8px; padding: 4px 8px; background: #e8e8e8; }
      @media print { body { padding: 20px; } @page { margin: 15mm; } }
    </style></head><body>
    <div class="header">
      ${sessionName ? `<div class="session">${sessionName}</div>` : ''}
      <h1>${language === 'bn' ? selectedPaper.title_bn : selectedPaper.title}</h1>
      <div style="font-size:14px">${subjectInfo ? (language === 'bn' ? subjectInfo.labelBn : subjectInfo.labelEn) : ''}</div>
      <div class="meta">
        <span>${language === 'bn' ? 'পূর্ণমান' : 'Full Marks'}: ${totalMarks}</span>
        <span>${language === 'bn' ? 'সময়' : 'Time'}: ${selectedPaper.duration_minutes} ${language === 'bn' ? 'মিনিট' : 'min'}</span>
      </div>
    </div>
    ${(selectedPaper.instructions_bn || selectedPaper.instructions) ? `<div class="instructions">${language === 'bn' ? selectedPaper.instructions_bn : selectedPaper.instructions}</div>` : ''}
    ${buildQuestionsHtml()}
    <script>window.onload=function(){window.print()}<\/script></body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // Filter papers
  let filteredPapers = papers;
  if (filterType !== 'all') filteredPapers = filteredPapers.filter((p: any) => p.subject_type === filterType);
  if (filterSession !== 'all') filteredPapers = filteredPapers.filter((p: any) => p.exam_session_id === filterSession);

  // Paper list view
  if (!selectedPaper) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold">
            {language === 'bn' ? '📝 প্রশ্নপত্র তৈরি' : '📝 Question Paper Builder'}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterSession} onValueChange={setFilterSession}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={language === 'bn' ? 'পরীক্ষা সেশন' : 'Exam Session'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সকল সেশন' : 'All Sessions'}</SelectItem>
                {examSessions.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {language === 'bn' ? s.name_bn : s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সকল বিষয়' : 'All Subjects'}</SelectItem>
                {SUBJECT_TYPES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.icon} {language === 'bn' ? s.labelBn : s.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" />{language === 'bn' ? 'নতুন প্রশ্নপত্র' : 'New Paper'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'bn' ? 'নতুন প্রশ্নপত্র তৈরি' : 'Create Question Paper'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {/* Exam Session */}
                  <div>
                    <Label>{language === 'bn' ? 'পরীক্ষা সেশন' : 'Exam Session'} <span className="text-destructive">*</span></Label>
                    <Select value={newPaper.exam_session_id} onValueChange={v => setNewPaper(p => ({ ...p, exam_session_id: v }))}>
                      <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'সেশন নির্বাচন করুন' : 'Select session'} /></SelectTrigger>
                      <SelectContent>
                        {examSessions.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{language === 'bn' ? s.name_bn : s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Division & Class */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'bn' ? 'বিভাগ' : 'Division'}</Label>
                      <Select value={newPaper.division_id} onValueChange={v => setNewPaper(p => ({ ...p, division_id: v, class_id: '' }))}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
                        <SelectContent>
                          {divisions.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{language === 'bn' ? d.name_bn : d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'bn' ? 'শ্রেণী' : 'Class'}</Label>
                      <Select value={newPaper.class_id} onValueChange={v => setNewPaper(p => ({ ...p, class_id: v }))} disabled={!newPaper.division_id}>
                        <SelectTrigger><SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} /></SelectTrigger>
                        <SelectContent>
                          {classes.filter((c: any) => !newPaper.division_id || c.division_id === newPaper.division_id).map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{language === 'bn' ? c.name_bn : c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</Label>
                      <Input value={newPaper.title} onChange={e => setNewPaper(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'}</Label>
                      <Input value={newPaper.title_bn} onChange={e => setNewPaper(p => ({ ...p, title_bn: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'bn' ? 'বিষয়ের ধরন' : 'Subject Type'}</Label>
                    <Select value={newPaper.subject_type} onValueChange={v => setNewPaper(p => ({ ...p, subject_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SUBJECT_TYPES.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.icon} {language === 'bn' ? s.labelBn : s.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'bn' ? 'পূর্ণমান' : 'Total Marks'}</Label>
                      <Input type="number" value={newPaper.total_marks} onChange={e => setNewPaper(p => ({ ...p, total_marks: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label>{language === 'bn' ? 'সময় (মিনিট)' : 'Duration (min)'}</Label>
                      <Input type="number" value={newPaper.duration_minutes} onChange={e => setNewPaper(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'bn' ? 'নির্দেশনা (বাংলা)' : 'Instructions (Bengali)'}</Label>
                    <Textarea value={newPaper.instructions_bn} onChange={e => setNewPaper(p => ({ ...p, instructions_bn: e.target.value }))} rows={2} />
                  </div>
                  <div>
                    <Label>{language === 'bn' ? 'নির্দেশনা (ইংরেজি)' : 'Instructions (English)'}</Label>
                    <Textarea value={newPaper.instructions} onChange={e => setNewPaper(p => ({ ...p, instructions: e.target.value }))} rows={2} />
                  </div>
                  <Button onClick={() => createPaper.mutate()} disabled={!newPaper.title_bn || !newPaper.exam_session_id || createPaper.isPending} className="w-full">
                    {language === 'bn' ? 'তৈরি করুন' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
        ) : filteredPapers.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            {language === 'bn' ? 'কোনো প্রশ্নপত্র নেই' : 'No question papers yet'}
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper: any) => {
              const subjectInfo = SUBJECT_TYPES.find(s => s.value === paper.subject_type);
              const sessionName = paper.exam_sessions
                ? (language === 'bn' ? paper.exam_sessions.name_bn : paper.exam_sessions.name)
                : null;
              return (
                <Card key={paper.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPaper(paper)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        {sessionName && (
                          <p className="text-xs text-muted-foreground mb-1">📋 {sessionName}</p>
                        )}
                        <CardTitle className="text-base leading-tight">
                          {language === 'bn' ? paper.title_bn : paper.title}
                        </CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={e => { e.stopPropagation(); setDeleteTarget(paper.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {subjectInfo?.icon} {language === 'bn' ? subjectInfo?.labelBn : subjectInfo?.labelEn}
                      </Badge>
                      <Badge variant="outline">
                        {paper.total_marks} {language === 'bn' ? 'নম্বর' : 'marks'}
                      </Badge>
                      <Badge variant="outline">
                        {paper.duration_minutes} {language === 'bn' ? 'মিনিট' : 'min'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deletePaper.mutate(deleteTarget)}
          title={language === 'bn' ? 'প্রশ্নপত্র মুছবেন?' : 'Delete paper?'}
          description={language === 'bn' ? 'এটি মুছে ফেললে সকল প্রশ্নও মুছে যাবে।' : 'All questions will also be deleted.'}
        />
      </div>
    );
  }

  // Question editor view
  const subjectInfo = SUBJECT_TYPES.find(s => s.value === selectedPaper.subject_type);
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const sessionName = selectedPaper.exam_sessions
    ? (language === 'bn' ? selectedPaper.exam_sessions.name_bn : selectedPaper.exam_sessions.name)
    : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedPaper(null); setQuestions([]); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{language === 'bn' ? selectedPaper.title_bn : selectedPaper.title}</h1>
            <div className="flex gap-2 text-sm text-muted-foreground flex-wrap">
              {sessionName && <span>📋 {sessionName}</span>}
              <span>{subjectInfo?.icon} {language === 'bn' ? subjectInfo?.labelBn : subjectInfo?.labelEn}</span>
              <span>•</span>
              <span>{language === 'bn' ? 'মোট নম্বর' : 'Total'}: {totalMarks}/{selectedPaper.total_marks}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printPaper}><Printer className="h-4 w-4 mr-1" />{language === 'bn' ? 'প্রিন্ট' : 'Print'}</Button>
          <Button onClick={() => saveQuestions.mutate()} disabled={saveQuestions.isPending}>
            {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
          </Button>
        </div>
      </div>

      {questions.map((q, qi) => (
        <Card key={qi}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />
              <span className="font-bold text-lg mt-1 shrink-0">{qi + 1}.</span>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'প্রশ্ন (বাংলা/আরবি)' : 'Question (Bengali/Arabic)'}</Label>
                    <Textarea value={q.question_text_bn} onChange={e => updateQuestion(qi, 'question_text_bn', e.target.value)} rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'প্রশ্ন (ইংরেজি)' : 'Question (English)'}</Label>
                    <Textarea value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)} rows={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'ধরন' : 'Type'}</Label>
                    <Select value={q.question_type} onValueChange={v => updateQuestion(qi, 'question_type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{language === 'bn' ? t.labelBn : t.labelEn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'নম্বর' : 'Marks'}</Label>
                    <Input type="number" value={q.marks} onChange={e => updateQuestion(qi, 'marks', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'গ্রুপ (বাংলা)' : 'Group (Bn)'}</Label>
                    <Input value={q.group_label_bn} onChange={e => updateQuestion(qi, 'group_label_bn', e.target.value)} placeholder={language === 'bn' ? 'যেমন: ক বিভাগ' : 'e.g. Section A'} />
                  </div>
                  <div>
                    <Label className="text-xs">{language === 'bn' ? 'গ্রুপ (ইংরেজি)' : 'Group (En)'}</Label>
                    <Input value={q.group_label} onChange={e => updateQuestion(qi, 'group_label', e.target.value)} placeholder="Section A" />
                  </div>
                </div>

                {q.question_type === 'mcq' && (
                  <div className="space-y-2 ml-2">
                    <Label className="text-xs font-semibold">{language === 'bn' ? 'অপশনসমূহ' : 'Options'}</Label>
                    {Array.isArray(q.options) && q.options.map((opt: any, oi: number) => (
                      <div key={oi} className="flex gap-2 items-center">
                        <span className="text-sm font-medium w-5">{String.fromCharCode(65 + oi)}.</span>
                        <Input className="flex-1" placeholder={language === 'bn' ? 'বাংলা' : 'Bengali'} value={opt.text_bn || ''} onChange={e => updateMcqOption(qi, oi, 'text_bn', e.target.value)} />
                        <Input className="flex-1" placeholder={language === 'bn' ? 'ইংরেজি' : 'English'} value={opt.text || ''} onChange={e => updateMcqOption(qi, oi, 'text', e.target.value)} />
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input type="radio" name={`correct-${qi}`} checked={opt.is_correct} onChange={() => updateMcqOption(qi, oi, 'is_correct', true)} />
                          {language === 'bn' ? 'সঠিক' : 'Correct'}
                        </label>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMcqOption(qi, oi)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addMcqOption(qi)}>
                      <Plus className="h-3 w-3 mr-1" />{language === 'bn' ? 'অপশন যোগ' : 'Add Option'}
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeQuestion(qi)}>
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
  );
};

export default AdminQuestionPapers;
