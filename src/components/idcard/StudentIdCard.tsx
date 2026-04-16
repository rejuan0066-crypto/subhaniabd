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
  ({ student, institution, validUntil = 'December 2026', validUntilBn = '', principalName = '', principalNameEn = '', principalSignatureUrl, lang = 'bn' }, ref) => {

    const verifyUrl = `https://subhaniabd.com/verify/student/${student.student_id || ''}`;

    return (
      <div
        ref={ref}
        className="id-card-container"
        style={{
          width: '2.125in',
          height: '3.375in',
          background: '#ffffff',
          borderRadius: '10px',
          overflow: 'hidden',
          fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif",
          fontSize: '7px',
          color: '#1a1a1a',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          border: '1.5px solid #064e3b',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact' as any,
        }}
      >
        {/* ===== GREEN HEADER ===== */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            padding: '6px 8px 5px',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '2px solid #d4af37',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {institution?.logo_url && (
              <img
                src={institution.logo_url}
                alt="Logo"
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover',
                  border: '1.5px solid rgba(212,175,55,0.7)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            )}
            <div>
              <div style={{
                color: '#ffffff', fontWeight: 700, fontSize: '7.5px', lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif",
              }}>
                {institution?.name || 'আল আরাবিয়া সোবহানিয়া হাফিজিয়া মাদ্রাসা'}
              </div>
              {institution?.name_en && (
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '4.5px', fontFamily: "'Inter', sans-serif", letterSpacing: '0.3px' }}>
                  {institution.name_en}
                </div>
              )}
            </div>
          </div>
          {institution?.address && (
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '4px', marginTop: '1px', fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif" }}>
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
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            {lang === 'bn' ? 'ছাত্র পরিচয়পত্র' : 'STUDENT ID CARD'}
          </div>
        </div>

        {/* ===== WHITE BODY ===== */}
        <div style={{
          flex: 1,
          padding: '5px 8px 3px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: '#ffffff',
        }}>
          {/* Subtle watermark logo in body center */}
          {institution?.logo_url && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70px',
              height: '70px',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 0,
            }}>
              <img src={institution.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}

          {/* Photo centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: '52px',
                height: '60px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1.5px solid #d4af37',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                background: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '20px', color: '#064e3b', fontWeight: 700, opacity: 0.4 }}>
                  {student.name_bn?.[0] || student.name_en?.[0] || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Name - bilingual */}
          <div style={{ textAlign: 'center', marginBottom: '3px', position: 'relative', zIndex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: '8px', color: '#111827', lineHeight: 1.2,
              fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif",
            }}>
              {student.name_bn || student.name_en || '—'}
            </div>
            {student.name_en && student.name_bn && (
              <div style={{ fontSize: '5.5px', color: '#6b7280', fontFamily: "'Inter', sans-serif", marginTop: '0.5px' }}>
                {student.name_en}
              </div>
            )}
          </div>

          {/* Info Grid on white */}
          <div style={{
            width: '100%',
            background: '#f9fafb',
            borderRadius: '5px',
            padding: '3px 5px',
            border: '1px solid #e5e7eb',
            position: 'relative',
            zIndex: 1,
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

        {/* ===== GREEN FOOTER ===== */}
        <div
          style={{
            padding: '3px 7px 5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            borderTop: '2px solid #d4af37',
          }}
        >
          {/* Signature */}
          <div style={{ textAlign: 'center', maxWidth: '55px' }}>
            {principalSignatureUrl && (
              <img
                src={principalSignatureUrl}
                alt="Signature"
                style={{ height: '14px', maxWidth: '50px', objectFit: 'contain', marginBottom: '1px', filter: 'brightness(2.5) contrast(0.7)' }}
              />
            )}
            <div style={{ borderTop: '1px solid rgba(212,175,55,0.6)', width: '50px', marginBottom: '1px' }} />
            <div style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif" }}>
              {(lang === 'bn' ? principalName : principalNameEn) || principalName || (lang === 'bn' ? 'প্রিন্সিপাল' : 'Principal')}
            </div>
          </div>

          {/* Valid Until */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'bn' ? 'মেয়াদ' : 'Valid Until'}
            </div>
            <div style={{ fontSize: '5.5px', fontWeight: 600, color: '#d4af37', fontFamily: "'Inter', sans-serif" }}>
              {lang === 'bn' && validUntilBn ? validUntilBn : validUntil}
            </div>
          </div>

          {/* QR Code on white square */}
          <div style={{
            flexShrink: 0,
            background: '#ffffff',
            borderRadius: '3px',
            padding: '2.5px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            <QRCodeSVG
              value={verifyUrl}
              size={28}
              level="M"
              bgColor="#ffffff"
              fgColor="#064e3b"
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
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <span style={{
      fontSize: '5px', color: '#6b7280', fontWeight: 600,
      fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif",
      letterSpacing: '0.2px',
    }}>{label}</span>
    <span
      style={{
        fontSize: accent ? '6.5px' : '6px',
        fontWeight: 700,
        color: blood ? '#dc2626' : accent ? '#064e3b' : '#111827',
        fontFamily: "'SutonnyMJ', 'Noto Sans Bengali', sans-serif",
        textAlign: 'right',
      }}
    >
      {value}
      {valueEn && value !== valueEn && value !== '—' && (
        <span style={{ fontSize: '4.5px', color: '#9ca3af', marginLeft: '2px', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
          ({valueEn})
        </span>
      )}
    </span>
  </div>
);

export default StudentIdCard;
