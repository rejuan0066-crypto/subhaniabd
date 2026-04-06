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
import ClassResultStatusList from '@/components/results/ClassResultStatusList';
import { useGradingSystem } from '@/hooks/useGradingSystem';
import IndividualMarksheet from '@/components/results/IndividualMarksheet';
import GradingChart from '@/components/results/GradingChart';
import { GraduationCap } from 'lucide-react';
import { exportResultCSV, exportResultPDF, printResultSheet } from '@/lib/resultExport';

const AdminResults = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { checkApproval } = useApprovalCheck('/admin/results', 'results');
  const { canAddItem, canEditItem } = usePagePermissions('/admin/results');
  const { getGrade, getOverallGrade } = useGradingSystem();

  const [searchMode, setSearchMode] = useState<'class' | 'individual'>('class');
  const [examYear, setExamYear] = useState(searchParams.get('year') || '');
  const [examSessionId, setExamSessionId] = useState(searchParams.get('session') || '');
  const [selectedClass, setSelectedClass] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [exportingClassId, setExportingClassId] = useState<string | null>(null);

  // Show class list when we have year+session from URL but no class selected
  const showClassList = !!examYear && !!examSessionId && !selectedClass && !showResults;

  const loadResultsForExam = async (examId: string) => {
    const { data, error } = await supabase.from('results').select('*').eq('exam_id', examId);
    if (error) throw error;
    const map: Record<string, number> = {};
    data?.forEach((result: any) => {
      map[`${result.student_id}_${result.subject_id}`] = result.marks ?? 0;
    });
    setMarksMap(map);
    return data || [];
  };

  // Fetch academic sessions
  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academic-sessions-results'],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_sessions').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch exam sessions
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

  // Fetch result status for each class (check if exams+results exist)
  const { data: classResultStatus = {} } = useQuery({
    queryKey: ['class-result-status', examSessionId, examClasses.map((c: any) => c.id)],
    queryFn: async () => {
      const examSession = examSessions.find((es: any) => es.id === examSessionId);
      if (!examSession) return {};

      // Get all exams matching this session
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('id, division_id')
        .eq('exam_session', examSession.name)
        .eq('exam_type', examSession.exam_type);
      if (examsError) throw examsError;

      if (!exams?.length) {
        const map: Record<string, boolean> = {};
        examClasses.forEach((c: any) => { map[c.id] = false; });
        return map;
      }

      // Get result counts per exam
      const examIds = exams.map(e => e.id);
      const { data: results, error: resultsError } = await supabase
        .from('results')
        .select('exam_id')
        .in('exam_id', examIds);
      if (resultsError) throw resultsError;

      const examHasResults = new Set<string>();
      results?.forEach(r => examHasResults.add(r.exam_id));

      // Map class -> has results (via division_id matching)
      const divisionExamMap: Record<string, boolean> = {};
      exams.forEach(e => {
        if (e.division_id) {
          divisionExamMap[e.division_id] = examHasResults.has(e.id);
        }
      });

      const map: Record<string, boolean> = {};
      examClasses.forEach((c: any) => {
        map[c.id] = divisionExamMap[c.division_id] || false;
      });
      return map;
    },
    enabled: showClassList && examClasses.length > 0 && examSessions.length > 0,
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['exam-session-subjects', examSessionId, selectedClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_session_subjects')
        .select('subject_id, subjects(*)')
        .eq('exam_session_id', examSessionId);
      if (error) throw error;
      const selectedClassObj = examClasses.find((c: any) => c.id === selectedClass);
      const divId = selectedClassObj?.division_id;
      const allSubjects = data?.map((es: any) => es.subjects).filter(Boolean) || [];
      return allSubjects
        .filter((s: any) => s.division_id === divId || s.class_id === selectedClass)
        .sort((a: any, b: any) => (a.name_bn || '').localeCompare(b.name_bn || ''));
    },
    enabled: !!examSessionId && !!selectedClass && examClasses.length > 0,
  });

  // Fetch students
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

  // When class is selected from the list, auto-trigger search
  const handleClassFromList = async (classId: string) => {
    setSelectedClass(classId);
    // We need to wait for students/subjects queries, so set state and trigger search after
    setShowResults(false);
    setSelectedExamId(null);
    setMarksMap({});

    // Trigger search after state updates via effect
    setTimeout(async () => {
      const examSession = examSessions.find((es: any) => es.id === examSessionId);
      if (!examSession) return;

      const cls = examClasses.find((c: any) => c.id === classId);
      const classDivisionId = cls?.division_id;

      const { data: existing } = await supabase
        .from('exams')
        .select('*')
        .eq('exam_session', examSession.name)
        .eq('exam_type', examSession.exam_type)
        .eq('division_id', classDivisionId)
        .maybeSingle();

      let examId = existing?.id;

      if (!examId) {
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

        if (error) {
          toast.error(error.message);
          return;
        }
        examId = newExam.id;
      }

      try {
        setSelectedExamId(examId);
        await loadResultsForExam(examId);
        setShowResults(true);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load results');
      }
    }, 100);
  };

  const handleSearch = async () => {
    if (!examYear || !examSessionId || !selectedClass) {
      toast.error(bn ? 'শিক্ষাবর্ষ, সেশন ও ক্লাস নির্বাচন করুন' : 'Select year, session and class');
      return;
    }
    if (searchMode === 'individual' && !rollNumber.trim()) {
      toast.error(bn ? 'রোল / রেজিস্ট্রেশন নম্বর দিন' : 'Enter roll or registration number');
      return;
    }

    const examSession = examSessions.find((es: any) => es.id === examSessionId);
    if (!examSession) return;

    const selectedClassObj = examClasses.find((c: any) => c.id === selectedClass);
    const classDivisionId = selectedClassObj?.division_id;

    const { data: existing, error: existingError } = await supabase
      .from('exams')
      .select('*')
      .eq('exam_session', examSession.name)
      .eq('exam_type', examSession.exam_type)
      .eq('division_id', classDivisionId)
      .maybeSingle();

    if (existingError) { toast.error(existingError.message); return; }

    let examId = existing?.id;
    if (!examId) {
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
      examId = newExam.id;
    }

    try {
      setSelectedExamId(examId);
      await loadResultsForExam(examId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load saved results');
      return;
    }

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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['class-result-status'] });
      if (selectedExamId) {
        await loadResultsForExam(selectedExamId);
      }
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

  const getExamSessionName = () => {
    const session = examSessions.find((es: any) => es.id === examSessionId);
    const year = academicSessions.find((s: any) => s.id === examYear);
    return `${bn ? session?.name_bn : session?.name} — ${bn ? (year?.name_bn || year?.name) : year?.name}`;
  };

  const { data: institution } = useQuery({
    queryKey: ['institution-default'],
    queryFn: async () => {
      const { data } = await supabase.from('institutions').select('name, name_en, logo_url, address, phone').eq('is_default', true).maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleClassExport = async (classId: string, type: 'csv' | 'pdf' | 'print') => {
    setExportingClassId(classId);
    try {
      const examSession = examSessions.find((es: any) => es.id === examSessionId);
      if (!examSession) return;

      const cls = examClasses.find((c: any) => c.id === classId);
      const classDivisionId = cls?.division_id;

      // Get exam
      const { data: existing } = await supabase
        .from('exams')
        .select('id')
        .eq('exam_session', examSession.name)
        .eq('exam_type', examSession.exam_type)
        .eq('division_id', classDivisionId)
        .maybeSingle();

      if (!existing?.id) { toast.error(bn ? 'পরীক্ষা পাওয়া যায়নি' : 'Exam not found'); return; }

      // Load results
      const { data: results } = await supabase.from('results').select('*').eq('exam_id', existing.id);
      const exportMarksMap: Record<string, number> = {};
      results?.forEach((r: any) => { exportMarksMap[`${r.student_id}_${r.subject_id}`] = r.marks ?? 0; });

      // Load students
      const { data: studentData } = await supabase
        .from('exam_session_students')
        .select('student_id, students(*)')
        .eq('exam_session_id', examSessionId)
        .eq('class_id', classId);
      const exportStudents = studentData?.map((es: any) => es.students).filter(Boolean).sort((a: any, b: any) => (a.roll_number || 0) - (b.roll_number || 0)) || [];

      // Load subjects
      const { data: subjectData } = await supabase
        .from('exam_session_subjects')
        .select('subject_id, subjects(*)')
        .eq('exam_session_id', examSessionId);
      const allSubjects = subjectData?.map((es: any) => es.subjects).filter(Boolean) || [];
      const exportSubjects = allSubjects
        .filter((s: any) => s.division_id === classDivisionId || s.class_id === classId)
        .sort((a: any, b: any) => (a.name_bn || '').localeCompare(b.name_bn || ''));

      const year = academicSessions.find((s: any) => s.id === examYear);
      const exportTitle = `${bn ? examSession.name_bn : examSession.name} — ${bn ? cls?.name_bn : cls?.name} — ${bn ? (year?.name_bn || year?.name) : year?.name}`;
      const instName = bn ? institution?.name : (institution?.name_en || institution?.name);

      const params = {
        title: exportTitle,
        students: exportStudents,
        subjects: exportSubjects,
        marksMap: exportMarksMap,
        getOverallGrade,
        bn,
        institutionName: instName,
        institutionLogo: institution?.logo_url || undefined,
        institutionAddress: institution?.address || undefined,
        institutionPhone: institution?.phone || undefined,
      };

      if (type === 'csv') exportResultCSV(params);
      else if (type === 'pdf') exportResultPDF(params);
      else if (type === 'print') printResultSheet(params);
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setExportingClassId(null);
    }
  };

  const viewingStudent = viewingStudentId ? students.find((st: any) => st.id === viewingStudentId) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{bn ? 'ফলাফল ব্যবস্থাপনা' : 'Result Management'}</h1>
            <p className="text-sm text-muted-foreground">{bn ? 'ক্লাস-ওয়াইজ বা ব্যক্তিগত ফলাফল অনুসন্ধান করুন' : 'Search class-wise or individual results'}</p>
          </div>
        </div>

        <ResultSearchFilters
          searchMode={searchMode}
          onSearchModeChange={(m) => {
            setSearchMode(m);
            setShowResults(false);
            setSelectedExamId(null);
            setMarksMap({});
            setViewingStudentId(null);
          }}
          examYear={examYear}
          onExamYearChange={(v) => {
            setExamYear(v);
            setExamSessionId('');
            setSelectedClass('');
            setSelectedExamId(null);
            setMarksMap({});
            setShowResults(false);
          }}
          examSession={examSessionId}
          onExamSessionChange={(v) => {
            setExamSessionId(v);
            setSelectedClass('');
            setSelectedExamId(null);
            setMarksMap({});
            setShowResults(false);
          }}
          selectedClass={selectedClass}
          onClassChange={(v) => {
            setSelectedClass(v);
            setSelectedExamId(null);
            setMarksMap({});
            setShowResults(false);
          }}
          rollNumber={rollNumber}
          onRollNumberChange={setRollNumber}
          academicSessions={academicSessions}
          classes={examClasses}
          examSessions={examSessions}
          onSearch={handleSearch}
        />

        {/* Class list with status when year+session selected but no class */}
        {showClassList && examClasses.length > 0 && (
          <ClassResultStatusList
            classes={examClasses}
            resultStatusMap={classResultStatus as Record<string, boolean>}
            onClassClick={handleClassFromList}
            onExport={handleClassExport}
            exportingClassId={exportingClassId}
            examSessionName={getExamSessionName()}
          />
        )}

        {showResults && <GradingChart />}

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
            onClose={() => {
              setShowResults(false);
              setSelectedExamId(null);
              setSelectedClass('');
              setMarksMap({});
            }}
          />
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminResults;
