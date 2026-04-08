import { forwardRef } from 'react';

interface StudentIdCardProps {
  student: {
    name_bn?: string;
    name_en?: string;
    student_id?: string;
    roll_number?: string;
    photo_url?: string;
    blood_group?: string;
    class_name?: string;
    division_name?: string;
    father_name?: string;
    mother_name?: string;
    phone?: string;
    guardian_phone?: string;
    address?: string;
  };
  institution?: {
    name?: string;
    name_en?: string;
    logo_url?: string;
    address?: string;
    phone?: string;
  };
  validUntil?: string;
  principalName?: string;
  principalNameEn?: string;
  principalSignatureUrl?: string;
  lang?: 'bn' | 'en';
}

const labels = {
  bn: {
    cardTitle: 'ছাত্র পরিচয়পত্র',
    id: 'আইডি',
    className: 'শ্রেণী',
    roll: 'রোল',
    division: 'বিভাগ',
    blood: 'রক্তের গ্রুপ',
    father: 'পিতা',
    phone: 'ফোন',
    address: 'ঠিকানা',
    principal: 'প্রিন্সিপাল',
    validUntil: 'মেয়াদ',
  },
  en: {
    cardTitle: 'STUDENT ID CARD',
    id: 'ID',
    className: 'Class',
    roll: 'Roll',
    division: 'Division',
    blood: 'Blood Group',
    father: 'Father',
    phone: 'Phone',
    address: 'Address',
    principal: 'Principal',
    validUntil: 'Valid Until',
  },
};

const generateQrUrl = (data: string, size = 60) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=1`;

const StudentIdCard = forwardRef<HTMLDivElement, StudentIdCardProps>(
  ({ student, institution, validUntil = 'December 2026', principalName = '', principalSignatureUrl, lang = 'bn' }, ref) => {
    const l = labels[lang];

    const qrData = JSON.stringify({
      name: student.name_bn || student.name_en,
      id: student.student_id,
      roll: student.roll_number,
      class: student.class_name,
      institution: institution?.name,
    });

    return (
      <div
        ref={ref}
        className="id-card-container"
        style={{
          width: '2.125in',
          height: '3.375in',
          background: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif",
          fontSize: '7px',
          color: '#1a1a2e',
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
            padding: '5px 8px 4px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {institution?.logo_url && (
              <img
                src={institution.logo_url}
                alt="Logo"
                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.4)' }}
              />
            )}
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '7.5px', lineHeight: 1.2 }}>
                {lang === 'bn' ? (institution?.name || 'প্রতিষ্ঠানের নাম') : (institution?.name_en || institution?.name || 'Institution Name')}
              </div>
            </div>
          </div>
          {institution?.address && (
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '4.5px', marginTop: '1px' }}>
              {institution.address}
            </div>
          )}
          <div
            style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '5px',
              fontWeight: 700,
              padding: '1px 8px',
              borderRadius: '2px',
              marginTop: '2px',
              display: 'inline-block',
              letterSpacing: lang === 'en' ? '1px' : '0.5px',
              textTransform: lang === 'en' ? 'uppercase' : 'none',
            }}
          >
            {l.cardTitle}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '4px 8px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Photo + QR row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', width: '100%', marginBottom: '3px' }}>
            {/* Photo */}
            <div
              style={{
                width: '46px',
                height: '54px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1.5px solid #2563eb',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 700 }}>
                  {student.name_bn?.[0] || student.name_en?.[0] || '?'}
                </div>
              )}
            </div>

            {/* Name + basic info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '7.5px', color: '#0f172a', lineHeight: 1.2 }}>
                {lang === 'bn' ? (student.name_bn || student.name_en || '—') : (student.name_en || student.name_bn || '—')}
              </div>
              {lang === 'en' && student.name_bn && (
                <div style={{ fontSize: '5.5px', color: '#64748b', marginTop: '1px' }}>{student.name_bn}</div>
              )}
              <div style={{ fontSize: '5.5px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                {l.id}: {student.student_id || '—'}
              </div>
            </div>

            {/* QR Code */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <img
                src={generateQrUrl(qrData, 80)}
                alt="QR"
                style={{ width: '38px', height: '38px', borderRadius: '2px' }}
              />
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '2px' }}>
            <InfoRow label={l.className} value={student.class_name || '—'} />
            <InfoRow label={l.roll} value={student.roll_number || '—'} />
            <InfoRow label={l.division} value={student.division_name || '—'} />
            {student.blood_group && <InfoRow label={l.blood} value={student.blood_group} highlight />}
            {student.father_name && <InfoRow label={l.father} value={student.father_name} />}
            {(student.guardian_phone || student.phone) && (
              <InfoRow label={l.phone} value={student.guardian_phone || student.phone || ''} />
            )}
            {student.address && (
              <div style={{ display: 'flex', padding: '1.5px 0', borderBottom: '1px dotted #f1f5f9' }}>
                <span style={{ fontSize: '5.5px', color: '#64748b', whiteSpace: 'nowrap', marginRight: '4px' }}>{l.address}</span>
                <span style={{ fontSize: '5.5px', fontWeight: 500, color: '#0f172a', lineHeight: 1.3, textAlign: 'right', flex: 1, wordBreak: 'break-word' }}>
                  {student.address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '3px 8px 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {principalSignatureUrl && (
              <img
                src={principalSignatureUrl}
                alt="Signature"
                style={{ height: '16px', maxWidth: '55px', objectFit: 'contain', marginBottom: '1px' }}
              />
            )}
            <div style={{ borderTop: '1px dashed #94a3b8', width: '55px', marginBottom: '1px' }} />
            <div style={{ fontSize: '5px', color: '#64748b' }}>
              {(lang === 'bn' ? principalName : principalNameEn) || principalName || l.principal}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '5px', color: '#64748b' }}>{l.validUntil}</div>
            <div style={{ fontSize: '6px', fontWeight: 600, color: '#1e3a5f' }}>{validUntil}</div>
          </div>
        </div>
      </div>
    );
  }
);

StudentIdCard.displayName = 'StudentIdCard';

const InfoRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5px 0',
      borderBottom: '1px dotted #f1f5f9',
    }}
  >
    <span style={{ fontSize: '5.5px', color: '#64748b' }}>{label}</span>
    <span
      style={{
        fontSize: '6px',
        fontWeight: 600,
        color: highlight ? '#dc2626' : '#0f172a',
        background: highlight ? '#fef2f2' : 'transparent',
        padding: highlight ? '0 3px' : '0',
        borderRadius: '2px',
      }}
    >
      {value}
    </span>
  </div>
);

export default StudentIdCard;
