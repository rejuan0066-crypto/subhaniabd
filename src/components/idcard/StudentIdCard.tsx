import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface StudentIdCardProps {
  student: {
    name_bn?: string;
    name_en?: string;
    student_id?: string;
    roll_number?: string;
    photo_url?: string;
    blood_group?: string;
    class_name?: string;
    class_name_en?: string;
    division_name?: string;
    division_name_en?: string;
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
  validUntilBn?: string;
  principalName?: string;
  principalNameEn?: string;
  principalSignatureUrl?: string;
  lang?: 'bn' | 'en';
  profileUrl?: string;
}

const StudentIdCard = forwardRef<HTMLDivElement, StudentIdCardProps>(
  ({ student, institution, validUntil = 'December 2026', validUntilBn = '', principalName = '', principalNameEn = '', principalSignatureUrl, lang = 'bn', profileUrl }, ref) => {

    const verifyUrl = `https://subhaniabd.com/verify/student/${student.student_id || ''}`;

    return (
      <div
        ref={ref}
        className="id-card-container"
        style={{
          width: '2.125in',
          height: '3.375in',
          background: 'linear-gradient(160deg, #064e3b 0%, #022c22 40%, #0a3d2e 70%, #041f17 100%)',
          borderRadius: '10px',
          overflow: 'hidden',
          fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
          fontSize: '7px',
          color: '#ffffff',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(212,175,55,0.4)',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact' as any,
        }}
      >
        {/* Watermark Logo */}
        {institution?.logo_url && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            opacity: 0.06,
            pointerEvents: 'none',
            zIndex: 0,
          }}>
            <img src={institution.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.01) 8px, rgba(255,255,255,0.01) 9px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Header - Glassmorphism */}
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '6px 8px 5px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            borderBottom: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {institution?.logo_url && (
              <img
                src={institution.logo_url}
                alt="Logo"
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover',
                  border: '1.5px solid rgba(212,175,55,0.6)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            )}
            <div>
              <div style={{
                color: '#ffffff', fontWeight: 700, fontSize: '7.5px', lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                fontFamily: "'Hind Siliguri', sans-serif",
              }}>
                {institution?.name || 'আল আরাবিয়া সোবহানিয়া হাফিজিয়া মাদ্রাসা'}
              </div>
              {institution?.name_en && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '4.5px', fontFamily: "'Inter', sans-serif", letterSpacing: '0.3px' }}>
                  {institution.name_en}
                </div>
              )}
            </div>
          </div>
          {institution?.address && (
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '4px', marginTop: '1px', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {institution.address}
            </div>
          )}
          <div
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8860b)',
              color: '#ffffff',
              fontSize: '5px',
              fontWeight: 700,
              padding: '1.5px 10px',
              borderRadius: '8px',
              marginTop: '3px',
              display: 'inline-block',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {lang === 'bn' ? 'ছাত্র পরিচয়পত্র' : 'STUDENT ID CARD'}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '5px 8px 3px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Photo centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <div
              style={{
                width: '52px',
                height: '60px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '2px solid rgba(212,175,55,0.7)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.15)',
                background: '#1a3d2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '20px', color: 'rgba(212,175,55,0.5)', fontWeight: 700 }}>
                  {student.name_bn?.[0] || student.name_en?.[0] || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Name - bilingual */}
          <div style={{ textAlign: 'center', marginBottom: '3px' }}>
            <div style={{
              fontWeight: 700, fontSize: '8px', color: '#ffffff', lineHeight: 1.2,
              fontFamily: "'Hind Siliguri', sans-serif",
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              {student.name_bn || student.name_en || '—'}
            </div>
            {student.name_en && student.name_bn && (
              <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', sans-serif", marginTop: '0.5px' }}>
                {student.name_en}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: '5px',
            padding: '3px 5px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <InfoRow label={lang === 'bn' ? 'আইডি' : 'ID'} value={student.student_id || '—'} accent />
            <InfoRow label={lang === 'bn' ? 'শ্রেণী' : 'Class'} value={student.class_name || '—'} valueEn={student.class_name_en} />
            <InfoRow label={lang === 'bn' ? 'রোল' : 'Roll'} value={student.roll_number || '—'} />
            <InfoRow label={lang === 'bn' ? 'বিভাগ' : 'Division'} value={student.division_name || '—'} valueEn={student.division_name_en} />
            {student.blood_group && <InfoRow label={lang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood'} value={student.blood_group} blood />}
            {student.father_name && <InfoRow label={lang === 'bn' ? 'পিতা' : 'Father'} value={student.father_name} />}
            {(student.guardian_phone || student.phone) && (
              <InfoRow label={lang === 'bn' ? 'ফোন' : 'Phone'} value={student.guardian_phone || student.phone || ''} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '3px 7px 5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          {/* Signature */}
          <div style={{ textAlign: 'center', maxWidth: '55px' }}>
            {principalSignatureUrl && (
              <img
                src={principalSignatureUrl}
                alt="Signature"
                style={{ height: '14px', maxWidth: '50px', objectFit: 'contain', marginBottom: '1px', filter: 'brightness(2) contrast(0.8)' }}
              />
            )}
            <div style={{ borderTop: '1px solid rgba(212,175,55,0.5)', width: '50px', marginBottom: '1px' }} />
            <div style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {(lang === 'bn' ? principalName : principalNameEn) || principalName || (lang === 'bn' ? 'প্রিন্সিপাল' : 'Principal')}
            </div>
          </div>

          {/* Valid Until */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'bn' ? 'মেয়াদ' : 'Valid Until'}
            </div>
            <div style={{ fontSize: '5.5px', fontWeight: 600, color: '#d4af37', fontFamily: "'Inter', sans-serif" }}>
              {lang === 'bn' && validUntilBn ? validUntilBn : validUntil}
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            flexShrink: 0,
            background: '#ffffff',
            borderRadius: '3px',
            padding: '2px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            <QRCodeSVG
              value={verifyUrl}
              size={30}
              level="M"
              bgColor="#ffffff"
              fgColor="#022c22"
            />
          </div>
        </div>
      </div>
    );
  }
);

StudentIdCard.displayName = 'StudentIdCard';

const InfoRow = ({ label, value, valueEn, accent, blood }: {
  label: string; value: string; valueEn?: string; accent?: boolean; blood?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <span style={{
      fontSize: '5px', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
      fontFamily: "'Hind Siliguri', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    }}>{label}</span>
    <span
      style={{
        fontSize: accent ? '6.5px' : '6px',
        fontWeight: 700,
        color: blood ? '#ef4444' : accent ? '#d4af37' : '#ffffff',
        fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
        textAlign: 'right',
      }}
    >
      {value}
      {valueEn && value !== valueEn && value !== '—' && (
        <span style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.45)', marginLeft: '2px', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
          ({valueEn})
        </span>
      )}
    </span>
  </div>
);

export default StudentIdCard;
