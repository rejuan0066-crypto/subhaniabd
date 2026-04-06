import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Plus, Loader2, Trash2, Users, BookOpen, Edit2, Check, X, Settings2, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePagePermissions } from '@/hooks/usePagePermissions';

const AdminExamSessions = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();
  const { canAddItem, canDeleteItem } = usePagePermissions('/admin/exam-sessions');

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [academicSessionId, setAcademicSessionId] = useState('');
  const [examType, setExamType] = useState('');
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Exam type manager state
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeNameBn, setNewTypeNameBn] = useState('');
  const [newTypeKey, setNewTypeKey] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeNameBn, setEditTypeNameBn] = useState('');

  // Fetch exam types from DB
  const { data: examTypes = [] } = useQuery({
    queryKey: ['exam_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_types').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch academic sessions
  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academic_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('divisions').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all classes with divisions
  const { data: classes = [] } = useQuery({
    queryKey: ['classes_with_divisions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*, divisions(name, name_bn)').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filteredClasses = (selectedDivisionIds.length > 0
    ? classes.filter((c: any) => selectedDivisionIds.includes(c.division_id))
    : classes
  ).sort((a: any, b: any) => {
    const divA = divisions.findIndex((d: any) => d.id === a.division_id);
    const divB = divisions.findIndex((d: any) => d.id === b.division_id);
    if (divA !== divB) return divA - divB;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  // Fetch subjects for selected classes/divisions
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects_for_exam', selectedClassIds],
    queryFn: async () => {
      if (selectedClassIds.length === 0) return [];
      const divIds = [...new Set(selectedClassIds.map(cid => {
        const cls = classes.find((c: any) => c.id === cid);
        return cls?.division_id;
      }).filter(Boolean))] as string[];

      // Get subjects matching selected divisions or classes
      let query = supabase.from('subjects').select('*').eq('is_active', true);
      const orParts: string[] = [];
      divIds.forEach(d => orParts.push(`division_id.eq.${d}`));
      selectedClassIds.forEach(c => orParts.push(`class_id.eq.${c}`));
      if (orParts.length > 0) {
        query = query.or(orParts.join(','));
      }
      const { data, error } = await query.order('name_bn');
      if (error) throw error;
      return data;
    },
    enabled: selectedClassIds.length > 0,
  });

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev => prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]);
  };


    queryKey: ['student_counts_by_class', academicSessionId],
    queryFn: async () => {
      if (!academicSessionId) return {};
      const { data, error } = await supabase.from('students').select('id, class_id').eq('status', 'active').eq('session_id', academicSessionId);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((s: any) => { if (s.class_id) counts[s.class_id] = (counts[s.class_id] || 0) + 1; });
      return counts;
    },
    enabled: !!academicSessionId,
  });

  const { data: examSessions = [] } = useQuery({
    queryKey: ['exam_sessions_list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_sessions').select('*, academic_sessions(name, name_bn)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: examSessionClasses = [] } = useQuery({
    queryKey: ['exam_session_classes_all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_session_classes').select('*, classes(name, name_bn)');
      if (error) throw error;
      return data;
    },
  });

  const toggleClass = (classId: string) => {
    setSelectedClassIds(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
  };

  const handleCreate = async () => {
    if (!nameBn.trim() || !academicSessionId || selectedClassIds.length === 0 || !examType) {
      toast.error(bn ? 'নাম, শিক্ষাবর্ষ, পরীক্ষার ধরন ও ক্লাস নির্বাচন করুন' : 'Enter name, select session, exam type & classes');
      return;
    }
    setIsCreating(true);
    try {
      const { data: examSession, error: esError } = await supabase.from('exam_sessions').insert({
        name: name.trim() || nameBn.trim(),
        name_bn: nameBn.trim(),
        academic_session_id: academicSessionId,
        exam_type: examType,
      }).select().single();
      if (esError) throw esError;

      const classMappings = selectedClassIds.map(classId => ({
        exam_session_id: examSession.id, class_id: classId,
        student_count: (studentCounts as Record<string, number>)[classId] || 0,
      }));
      const { error: classError } = await supabase.from('exam_session_classes').insert(classMappings);
      if (classError) throw classError;

      const { data: students, error: studError } = await supabase.from('students')
        .select('id, class_id').eq('status', 'active').eq('session_id', academicSessionId).in('class_id', selectedClassIds);
      if (studError) throw studError;

      if (students && students.length > 0) {
        const studentMappings = students.map((s: any) => ({ exam_session_id: examSession.id, student_id: s.id, class_id: s.class_id }));
        const { error: mapError } = await supabase.from('exam_session_students').insert(studentMappings);
        if (mapError) throw mapError;
      }

      toast.success(bn ? `এক্সাম সেশন তৈরি হয়েছে — ${students?.length || 0} জন ছাত্র যোগ হয়েছে` : `Exam session created — ${students?.length || 0} students added`);
      setName(''); setNameBn(''); setSelectedClassIds([]);
      queryClient.invalidateQueries({ queryKey: ['exam_sessions_list'] });
      queryClient.invalidateQueries({ queryKey: ['exam_session_classes_all'] });
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setIsCreating(false); }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('exam_sessions').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_sessions_list'] });
      queryClient.invalidateQueries({ queryKey: ['exam_session_classes_all'] });
      toast.success(bn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // --- Exam Type CRUD ---
  const addTypeMutation = useMutation({
    mutationFn: async () => {
      if (!newTypeNameBn.trim() || !newTypeKey.trim()) throw new Error(bn ? 'নাম ও কী দিন' : 'Name & key required');
      const maxSort = examTypes.length > 0 ? Math.max(...examTypes.map((t: any) => t.sort_order || 0)) : 0;
      const { error } = await supabase.from('exam_types').insert({
        name: newTypeName.trim() || newTypeNameBn.trim(),
        name_bn: newTypeNameBn.trim(),
        key: newTypeKey.trim().toLowerCase().replace(/\s+/g, '_'),
        sort_order: maxSort + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_types'] });
      setNewTypeName(''); setNewTypeNameBn(''); setNewTypeKey('');
      toast.success(bn ? 'পরীক্ষার ধরন যোগ হয়েছে' : 'Exam type added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTypeMutation = useMutation({
    mutationFn: async ({ id, name, name_bn }: { id: string; name: string; name_bn: string }) => {
      const { error } = await supabase.from('exam_types').update({ name, name_bn, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_types'] });
      setEditingTypeId(null);
      toast.success(bn ? 'আপডেট হয়েছে' : 'Updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('exam_types').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_types'] });
      toast.success(bn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getTypeLabel = (key: string) => {
    const t = examTypes.find((et: any) => et.key === key);
    return t ? (bn ? t.name_bn : t.name) : key;
  };

  const totalSelected = selectedClassIds.reduce((sum, cid) => sum + ((studentCounts as Record<string, number>)[cid] || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            <BookOpen className="inline w-6 h-6 mr-2" />
            {bn ? 'এক্সাম সেশন ব্যবস্থাপনা' : 'Exam Session Management'}
          </h1>
          <Button variant="outline" size="sm" onClick={() => setShowTypeManager(!showTypeManager)} className="gap-1.5">
            <Settings2 className="w-4 h-4" />
            {bn ? 'পরীক্ষার ধরন' : 'Exam Types'}
          </Button>
        </div>

        {/* Exam Type Manager */}
        {showTypeManager && (
          <div className="card-elevated p-5 space-y-4 border-l-4 border-l-primary">
            <h3 className="font-display font-bold text-foreground">
              <Settings2 className="inline w-4 h-4 mr-1" />
              {bn ? 'পরীক্ষার ধরন ব্যবস্থাপনা' : 'Exam Type Management'}
            </h3>

            {/* Add new type */}
            {canAddItem && (
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</label>
                  <Input value={newTypeNameBn} onChange={e => setNewTypeNameBn(e.target.value)} placeholder={bn ? 'যেমন: নির্বাচনী' : 'e.g. নির্বাচনী'} className="bg-background w-44" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'নাম (ইংরেজি)' : 'Name (English)'}</label>
                  <Input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder="e.g. Selective" className="bg-background w-44" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{bn ? 'কি' : 'Key'} *</label>
                  <Input value={newTypeKey} onChange={e => setNewTypeKey(e.target.value)} placeholder="e.g. selective" className="bg-background w-36" />
                </div>
                <Button size="sm" onClick={() => addTypeMutation.mutate()} disabled={addTypeMutation.isPending} className="btn-primary-gradient">
                  {addTypeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {bn ? 'যোগ' : 'Add'}
                </Button>
              </div>
            )}

            {/* List existing types */}
            <div className="space-y-1.5">
              {examTypes.map((et: any) => (
                <div key={et.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background hover:bg-secondary/30 transition-colors">
                  {editingTypeId === et.id ? (
                    <>
                      <Input value={editTypeNameBn} onChange={e => setEditTypeNameBn(e.target.value)} className="bg-background h-8 w-40 text-sm" />
                      <Input value={editTypeName} onChange={e => setEditTypeName(e.target.value)} className="bg-background h-8 w-40 text-sm" />
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => updateTypeMutation.mutate({ id: et.id, name: editTypeName, name_bn: editTypeNameBn })}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTypeId(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {bn ? et.name_bn : et.name}
                        <span className="text-xs text-muted-foreground ml-2">({et.key})</span>
                      </span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingTypeId(et.id); setEditTypeName(et.name); setEditTypeNameBn(et.name_bn); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {canDeleteItem && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteTypeMutation.mutate(et.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
              {examTypes.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{bn ? 'কোনো পরীক্ষার ধরন নেই' : 'No exam types'}</p>}
            </div>
          </div>
        )}

        {/* Create Form */}
        {canAddItem && (
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-display font-bold text-foreground">
              <Plus className="inline w-4 h-4 mr-1" />
              {bn ? 'নতুন এক্সাম সেশন তৈরি' : 'Create New Exam Session'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{bn ? 'শিক্ষাবর্ষ' : 'Academic Session'} *</label>
                <Select value={academicSessionId} onValueChange={setAcademicSessionId}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder={bn ? 'শিক্ষাবর্ষ নির্বাচন' : 'Select session'} /></SelectTrigger>
                  <SelectContent>
                    {academicSessions.map((s: any) => <SelectItem key={s.id} value={s.id}>{bn ? (s.name_bn || s.name) : s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{bn ? 'পরীক্ষার ধরন' : 'Exam Type'} *</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder={bn ? 'ধরন নির্বাচন' : 'Select type'} /></SelectTrigger>
                  <SelectContent>
                    {examTypes.filter((t: any) => t.is_active).map((t: any) => (
                      <SelectItem key={t.id} value={t.key}>{bn ? t.name_bn : t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{bn ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</label>
                <Input value={nameBn} onChange={e => setNameBn(e.target.value)} placeholder={bn ? 'যেমন: বার্ষিক পরীক্ষা ২০২৬' : 'e.g. Annual Exam 2026'} className="bg-background" />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{bn ? 'নাম (ইংরেজি)' : 'Name (English)'}</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={bn ? 'যেমন: Annual Exam 2026' : 'e.g. Annual Exam 2026'} className="bg-background" />
              </div>
            </div>

            {/* Class Selection */}
            {academicSessionId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">{bn ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedDivisionIds.length === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <Checkbox checked={selectedDivisionIds.length === 0} onCheckedChange={() => { setSelectedDivisionIds([]); setSelectedClassIds([]); }} />
                    <span className="text-sm font-medium text-foreground">{bn ? 'সকল বিভাগ' : 'All Divisions'}</span>
                  </label>
                  {divisions.map((d: any) => (
                    <label key={d.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedDivisionIds.includes(d.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <Checkbox checked={selectedDivisionIds.includes(d.id)} onCheckedChange={() => {
                        setSelectedDivisionIds(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id]);
                        setSelectedClassIds([]);
                      }} />
                      <span className="text-sm font-medium text-foreground">{bn ? d.name_bn : d.name}</span>
                    </label>
                  ))}
                </div>

                <label className="text-sm font-medium text-muted-foreground mb-2 block mt-3">{bn ? 'ক্লাস নির্বাচন করুন' : 'Select Classes'} *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredClasses.map((cls: any) => {
                    const count = (studentCounts as Record<string, number>)[cls.id] || 0;
                    const divName = cls.divisions ? (bn ? cls.divisions.name_bn : cls.divisions.name) : '';
                    return (
                      <label key={cls.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedClassIds.includes(cls.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <Checkbox checked={selectedClassIds.includes(cls.id)} onCheckedChange={() => toggleClass(cls.id)} />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{bn ? cls.name_bn : cls.name}</span>
                          {divName && <span className="text-xs text-muted-foreground ml-1">({divName})</span>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${count > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          <Users className="inline w-3 h-3 mr-0.5" />{count}
                        </span>
                      </label>
                    );
                  })}
                  {filteredClasses.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full py-4 text-center">{bn ? 'এই বিভাগে কোনো ক্লাস নেই' : 'No classes in this division'}</p>
                  )}
                </div>

                {selectedClassIds.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                      {bn ? `মোট নির্বাচিত: ${selectedClassIds.length} টি ক্লাস — ${totalSelected} জন ছাত্র` : `Total selected: ${selectedClassIds.length} classes — ${totalSelected} students`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleCreate} disabled={isCreating} className="btn-primary-gradient">
              {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {bn ? 'এক্সাম সেশন তৈরি করুন' : 'Create Exam Session'}
            </Button>
          </div>
        )}

        {/* Existing Exam Sessions List */}
        <div className="card-elevated p-5">
          <h3 className="font-display font-bold text-foreground mb-4">{bn ? 'এক্সাম সেশন তালিকা' : 'Exam Sessions List'}</h3>
          {examSessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">{bn ? 'কোনো এক্সাম সেশন নেই' : 'No exam sessions yet'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">{bn ? 'নাম' : 'Name'}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">{bn ? 'শিক্ষাবর্ষ' : 'Session'}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">{bn ? 'ধরন' : 'Type'}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">{bn ? 'ক্লাস' : 'Classes'}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">{bn ? 'ছাত্র' : 'Students'}</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">{bn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {examSessions.map((es: any) => {
                    const esClasses = examSessionClasses.filter((c: any) => c.exam_session_id === es.id);
                    const totalStudents = esClasses.reduce((s: number, c: any) => s + (c.student_count || 0), 0);
                    return (
                      <tr key={es.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">{bn ? es.name_bn : es.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{bn ? (es.academic_sessions?.name_bn || es.academic_sessions?.name) : es.academic_sessions?.name || '-'}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{getTypeLabel(es.exam_type)}</span></td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {esClasses.map((c: any) => (
                              <span key={c.id} className="text-xs bg-secondary px-2 py-0.5 rounded">{bn ? c.classes?.name_bn : c.classes?.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-foreground">{totalStudents}</td>
                        <td className="px-4 py-3 text-right">
                          {canDeleteItem && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(es.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminExamSessions;
