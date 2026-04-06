import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApprovalCheck } from '@/hooks/useApprovalCheck';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import ResultSearchFilters from '@/components/results/ResultSearchFilters';
import ClassResultTable from '@/components/results/ClassResultTable';
import { useGradingSystem } from '@/hooks/useGradingSystem';
import IndividualMarksheet from '@/components/results/IndividualMarksheet';
import GradingChart from '@/components/results/GradingChart';
import { GraduationCap } from 'lucide-react';

const AdminResults = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { checkApproval } = useApprovalCheck('/admin/results', 'results');
  const { canAddItem, canEditItem } = usePagePermissions('/admin/results');
  const { getGrade } = useGradingSystem();

  const [searchMode, setSearchMode] = useState<'class' | 'individual'>('class');
  const [examYear, setExamYear] = useState(searchParams.get('year') || '');
  const [examSessionId, setExamSessionId] = useState(searchParams.get('session') || '');
  const [selectedClass, setSelectedClass] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Fetch academic sessions
  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academic-sessions-results'],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch exam sessions based on selected academic year
  const { data: examSessions = [] } = useQuery({
    queryKey: ['exam-sessions', examYear],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_sessions').select('*').eq('academic_session_id', examYear).eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!examYear,
  });

  // Fetch classes linked to exam session
  const { data: examClasses = [] } = useQuery({
    queryKey: ['exam-session-classes', examSessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_session_classes').select('*, classes(*)').eq('exam_session_id', examSessionId);
      if (error) throw error;
      return data?.map((ec: any) => ec.classes).filter(Boolean) || [];
    },
    enabled: !!examSessionId,
  });

  // Fetch subjects from exam_session_subjects (selected during exam session creation)
  const { data: subjects = [] } = useQuery({
    queryKey: ['exam-session-subjects', examSessionId, selectedClass],
    queryFn: async () => {
      // Get subjects linked to this exam session
      const { data, error } = await supabase
        .from('exam_session_subjects')
        .select('subject_id, subjects(*)')
        .eq('exam_session_id', examSessionId);
      if (error) throw error;
      
      // Filter: include subjects that match the selected class's division or class_id
      const selectedClassObj = examClasses.find((c: any) => c.id === selectedClass);
      const divId = selectedClassObj?.division_id;
      
      const allSubjects = data?.map((es: any) => es.subjects).filter(Boolean) || [];
      
      // Filter subjects relevant to selected class (by division_id or class_id match)
      return allSubjects.filter((s: any) => 
        s.division_id === divId || s.class_id === selectedClass
      ).sort((a: any, b: any) => (a.name_bn || '').localeCompare(b.name_bn || ''));
    },
    enabled: !!examSessionId && !!selectedClass && examClasses.length > 0,
  });

  // Fetch students for selected class
  const { data: students = [] } = useQuery({
    queryKey: ['exam-students', examSessionId, selectedClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_session_students')
        .select('student_id, students(*)')
        .eq('exam_session_id', examSessionId)
        .eq('class_id', selectedClass);
      if (error) throw error;
      return data?.map((es: any) => es.students).filter(Boolean).sort((a: any, b: any) => (a.roll_number || 0) - (b.roll_number || 0)) || [];
    },
    enabled: !!examSessionId && !!selectedClass,
  });

  // Fetch results for exam
  useQuery({
    queryKey: ['results', selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data, error } = await supabase.from('results').select('*').eq('exam_id', selectedExamId);
      if (error) throw error;
      const map: Record<string, number> = {};
      data?.forEach((r: any) => { map[`${r.student_id}_${r.subject_id}`] = r.marks ?? 0; });
      setMarksMap(map);
      return data;
    },
    enabled: !!selectedExamId,
  });

  const handleSearch = async () => {
    if (!examYear || !examSessionId || !selectedClass) {
      toast.error(bn ? 'শিক্ষাবর্ষ, সেশন ও ক্লাস নির্বাচন করুন' : 'Select year, session and class');
      return;
    }

    if (searchMode === 'individual' && !rollNumber.trim()) {
      toast.error(bn ? 'রোল / রেজিস্ট্রেশন নম্বর দিন' : 'Enter roll or registration number');
      return;
    }

    // Get exam session details
    const examSession = examSessions.find((es: any) => es.id === examSessionId);
    if (!examSession) return;

    // Find or create exam for this session + class
    const selectedClassObj = examClasses.find((c: any) => c.id === selectedClass);
    const classDivisionId = selectedClassObj?.division_id;

    const { data: existing } = await supabase.from('exams').select('*')
      .eq('exam_session', examSession.name)
      .eq('exam_type', examSession.exam_type)
      .eq('division_id', classDivisionId)
      .maybeSingle();

    if (existing) {
      setSelectedExamId(existing.id);
    } else {
      const academicSession = academicSessions.find((s: any) => s.id === examYear);
      const yearStr = academicSession?.name || '';
      const { data: newExam, error } = await supabase.from('exams').insert({
        name: `${examSession.name} ${yearStr}`,
        name_bn: `${examSession.name_bn} ${yearStr}`,
        exam_year: parseInt(yearStr) || new Date().getFullYear(),
        exam_session: examSession.name,
        exam_type: examSession.exam_type,
        division_id: classDivisionId,
      }).select().single();
      if (error) { toast.error(error.message); return; }
      setSelectedExamId(newExam.id);
    }

    // For individual search, find student
    if (searchMode === 'individual') {
      const found = students.find((st: any) =>
        String(st.roll_number) === rollNumber.trim() ||
        st.student_id === rollNumber.trim() ||
        st.registration_number === rollNumber.trim()
      );
      if (found) {
        setViewingStudentId(found.id);
      } else {
        toast.error(bn ? 'ছাত্র পাওয়া যায়নি' : 'Student not found');
        return;
      }
    } else {
      setViewingStudentId(null);
    }

    setShowResults(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedExamId) return;
      const upserts = Object.entries(marksMap).map(([key, marks]) => {
        const [student_id, subject_id] = key.split('_');
        const { grade, gpa } = getGrade(marks);
        return { exam_id: selectedExamId, student_id, subject_id, marks, grade, gpa: parseFloat(gpa) };
      });
      if (await checkApproval('edit', { exam_id: selectedExamId, results_count: upserts.length, results: upserts }, selectedExamId, `ফলাফল সংরক্ষণ`)) return;
      const { error } = await supabase.from('results').upsert(upserts, { onConflict: 'exam_id,student_id,subject_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success(bn ? 'ফলাফল সংরক্ষিত হয়েছে' : 'Results saved');
    },
    onError: (e: any) => toast.error(e.message || 'Error'),
  });

  const getExamTitle = () => {
    const session = examSessions.find((es: any) => es.id === examSessionId);
    const year = academicSessions.find((s: any) => s.id === examYear);
    const cls = examClasses.find((c: any) => c.id === selectedClass);
    return `${bn ? session?.name_bn : session?.name} — ${bn ? cls?.name_bn : cls?.name} — ${bn ? (year?.name_bn || year?.name) : year?.name}`;
  };

  const viewingStudent = viewingStudentId ? students.find((st: any) => st.id === viewingStudentId) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{bn ? 'ফলাফল ব্যবস্থাপনা' : 'Result Management'}</h1>
            <p className="text-sm text-muted-foreground">{bn ? 'ক্লাস-ওয়াইজ বা ব্যক্তিগত ফলাফল অনুসন্ধান করুন' : 'Search class-wise or individual results'}</p>
          </div>
        </div>

        {/* Search Filters */}
        <ResultSearchFilters
          searchMode={searchMode}
          onSearchModeChange={(m) => { setSearchMode(m); setShowResults(false); setViewingStudentId(null); }}
          examYear={examYear}
          onExamYearChange={(v) => { setExamYear(v); setExamSessionId(''); setSelectedClass(''); setShowResults(false); }}
          examSession={examSessionId}
          onExamSessionChange={(v) => { setExamSessionId(v); setSelectedClass(''); setShowResults(false); }}
          selectedClass={selectedClass}
          onClassChange={(v) => { setSelectedClass(v); setShowResults(false); }}
          rollNumber={rollNumber}
          onRollNumberChange={setRollNumber}
          academicSessions={academicSessions}
          classes={examClasses}
          examSessions={examSessions}
          onSearch={handleSearch}
        />

        {/* Grading Chart */}
        {showResults && <GradingChart />}

        {/* Results */}
        {showResults && viewingStudent ? (
          <IndividualMarksheet
            student={viewingStudent}
            subjects={subjects}
            marksMap={marksMap}
            examTitle={getExamTitle()}
            onBack={() => setViewingStudentId(null)}
          />
        ) : showResults ? (
          <ClassResultTable
            students={students}
            subjects={subjects}
            marksMap={marksMap}
            onMarksChange={(key, value) => setMarksMap(prev => ({ ...prev, [key]: value }))}
            onSave={() => saveMutation.mutate()}
            isSaving={saveMutation.isPending}
            title={getExamTitle()}
            onViewMarksheet={(id) => setViewingStudentId(id)}
            onClose={() => { setShowResults(false); setMarksMap({}); }}
          />
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminResults;
