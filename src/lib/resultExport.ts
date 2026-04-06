import jsPDF from 'jspdf';

interface ExportData {
  title: string;
  students: any[];
  subjects: any[];
  marksMap: Record<string, number>;
  getOverallGrade: (marks: number[]) => { grade: string; gpa: string; title?: string; title_bn?: string; hasFail: boolean };
  bn: boolean;
  institutionName?: string;
}

export const exportResultCSV = ({ title, students, subjects, marksMap, getOverallGrade, bn }: ExportData) => {
  const headers = [
    bn ? 'ক্রম' : '#',
    bn ? 'রোল' : 'Roll',
    bn ? 'নাম' : 'Name',
    ...subjects.map((s: any) => bn ? s.name_bn : s.name),
    bn ? 'মোট' : 'Total',
    bn ? 'গড়' : 'Avg',
    bn ? 'গ্রেড' : 'Grade',
    'GPA',
    bn ? 'মর্যাদা' : 'Title',
  ];

  const rows = students.map((st: any, idx: number) => {
    const marks = subjects.map((sub: any) => marksMap[`${st.id}_${sub.id}`] ?? 0);
    const total = marks.reduce((a, b) => a + b, 0);
    const avg = subjects.length > 0 ? total / subjects.length : 0;
    const { grade, gpa, title: gradeTitle, title_bn } = getOverallGrade(marks);
    return [
      idx + 1,
      st.roll_number || '-',
      bn ? st.name_bn : (st.name_en || st.name_bn),
      ...marks,
      total,
      avg.toFixed(1),
      grade,
      gpa,
      bn ? title_bn : gradeTitle,
    ];
  });

  const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const exportResultPDF = ({ title, students, subjects, marksMap, getOverallGrade, bn, institutionName }: ExportData) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Header
  doc.setFontSize(14);
  doc.text(institutionName || '', pageW / 2, 12, { align: 'center' });
  doc.setFontSize(11);
  doc.text(title, pageW / 2, 19, { align: 'center' });

  // Table setup
  const colHeaders = [
    '#', bn ? 'Roll' : 'Roll', bn ? 'Name' : 'Name',
    ...subjects.map((s: any) => (bn ? s.name_bn : s.name).substring(0, 8)),
    'Total', 'Avg', 'Grade', 'GPA', 'Title',
  ];

  const fixedCols = 3;
  const endCols = 5;
  const subjectCols = subjects.length;
  const totalCols = fixedCols + subjectCols + endCols;
  const availW = pageW - margin * 2;
  const colW = Math.min(availW / totalCols, 22);
  const startX = margin;
  let y = 26;
  const rowH = 6;
  const headerH = 7;

  // Draw header row
  doc.setFontSize(6);
  doc.setTextColor(100);
  colHeaders.forEach((h, i) => {
    doc.text(h, startX + i * colW + colW / 2, y + headerH / 2 + 1, { align: 'center', maxWidth: colW - 1 });
  });
  y += headerH;
  doc.setDrawColor(200);
  doc.line(startX, y, startX + totalCols * colW, y);

  // Data rows
  doc.setTextColor(30);
  doc.setFontSize(6);

  students.forEach((st: any, idx: number) => {
    if (y + rowH > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 15;
    }

    const marks = subjects.map((sub: any) => marksMap[`${st.id}_${sub.id}`] ?? 0);
    const total = marks.reduce((a, b) => a + b, 0);
    const avg = subjects.length > 0 ? total / subjects.length : 0;
    const { grade, gpa, title: gradeTitle, title_bn } = getOverallGrade(marks);

    const rowData = [
      String(idx + 1),
      String(st.roll_number || '-'),
      (bn ? st.name_bn : (st.name_en || st.name_bn) || '').substring(0, 14),
      ...marks.map(String),
      String(total),
      avg.toFixed(1),
      grade,
      gpa,
      ((bn ? title_bn : gradeTitle) || '').substring(0, 10),
    ];

    rowData.forEach((val, i) => {
      doc.text(val, startX + i * colW + colW / 2, y + rowH / 2 + 1, { align: 'center', maxWidth: colW - 1 });
    });

    y += rowH;
    doc.setDrawColor(230);
    doc.line(startX, y, startX + totalCols * colW, y);
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, footerY);

  doc.save(`${title.replace(/[^a-zA-Z0-9\s]/g, '_')}.pdf`);
};
