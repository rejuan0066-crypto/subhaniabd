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
    session_year?: string;
    session_year_bn?: string;
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

/* ── Arabic ornamental band (top) ── */
const arabicBandSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='14' viewBox='0 0 200 14'%3E%3Cdefs%3E%3Cpattern id='ab' patternUnits='userSpaceOnUse' width='20' height='14'%3E%3Cpath d='M0 7 Q5 0 10 7 T20 7' fill='none' stroke='%23d4af37' stroke-width='0.6' opacity='0.9'/%3E%3Ccircle cx='10' cy='7' r='1.2' fill='%23d4af37' opacity='0.6'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='14' fill='%23022c22'/%3E%3Crect width='200' height='14' fill='url(%23ab)'/%3E%3C/svg%3E")`;

const BN = "'SutonnyOMJ', 'SutonnyMJ', 'Noto Sans Bengali', sans-serif";
const EN = "'Inter', sans-serif";

const StudentIdCard = forwardRef<HTMLDivElement, StudentIdCardProps>(
  ({ student, institution, validUntil = 'December 2026', validUntilBn = '', principalName = '', principalNameEn = '', principalSignatureUrl, lang = 'bn' }, ref) => {

    const verifyUrl = `https://subhaniabd.com/verify/student/${student.student_id || ''}`;
    const f = lang === 'bn' ? BN : EN;

    return (
      <div
        ref={ref}
        className="id-card-container"
        style={{
          width: '2.125in',
          maxWidth: '100%',
          minHeight: '3.375in',
          height: 'auto',
          background: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
          fontFamily: BN,
          fontSize: '7px',
          color: '#1a1a1a',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact' as any,
        }}
      >
        {/* ═══ TOP: Arabic ornamental band ═══ */}
        <div style={{
          height: '14px',
          backgroundImage: arabicBandSvg,
          backgroundSize: 'cover',
          flexShrink: 0,
        }} />

        {/* ═══ WAVY HEADER WITH CURVES ═══ */}
        <div style={{ position: 'relative', height: '70px', flexShrink: 0, overflow: 'hidden', background: '#ffffff' }}>
          {/* SVG layered waves — emerald + teal/cyan */}
          <svg
            viewBox="0 0 200 70"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          >
            {/* Back layer — emerald deep */}
            <path
              d="M0,0 L200,0 L200,42 Q150,62 100,46 Q50,30 0,52 Z"
              fill="#047857"
            />
            {/* Mid layer — teal */}
            <path
              d="M0,0 L200,0 L200,30 Q150,52 100,36 Q50,20 0,40 Z"
              fill="#0d9488"
              opacity="0.9"
            />
            {/* Front layer — cyan */}
            <path
              d="M0,0 L200,0 L200,18 Q150,40 100,24 Q50,10 0,28 Z"
              fill="#22d3ee"
              opacity="0.55"
            />
            {/* Bottom curve highlight */}
            <path
              d="M0,52 Q50,30 100,46 Q150,62 200,42 L200,55 Q150,72 100,55 Q50,40 0,60 Z"
              fill="#064e3b"
              opacity="0.7"
            />
          </svg>

          {/* Header text */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '6px',
            zIndex: 2,
          }}>
            <div style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '9.5px',
              fontFamily: BN,
              textShadow: '0 1px 3px rgba(0,0,0,0.45)',
              letterSpacing: '0.2px',
              textAlign: 'center',
              padding: '0 6px',
              lineHeight: 1.15,
            }}>
              {institution?.name || 'আল আরাবিয়া সোবহানিয়া হাফিজিয়া মাদ্রাসা'}
            </div>
            {institution?.name_en && (
              <div style={{
                color: '#fde047',
                fontFamily: EN,
                fontWeight: 700,
                fontSize: '6px',
                marginTop: '2px',
                letterSpacing: '0.6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}>
                {institution.name_en}
              </div>
            )}
          </div>
        </div>

        {/* ═══ BODY ═══ */}
        <div style={{
          flex: '1 1 auto',
          padding: '4px 10px 6px',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          position: 'relative',
          minHeight: 0,
        }}>
          {/* ── Circular photo with yellow half-ring ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-32px', marginBottom: '4px', position: 'relative', zIndex: 3 }}>
            <div style={{
              position: 'relative',
              width: '64px',
              height: '64px',
            }}>
              {/* Yellow accent half-ring behind photo */}
              <div style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                right: '-3px',
                bottom: '-3px',
                borderRadius: '50%',
                background: 'conic-gradient(from 200deg, #facc15 0deg, #facc15 140deg, transparent 140deg, transparent 360deg)',
                zIndex: 0,
              }} />
              {/* White inner ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#ffffff',
                padding: '2px',
                zIndex: 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #ffffff',
                }}>
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '22px', color: '#0369a1', fontWeight: 700, opacity: 0.4 }}>
                      {student.name_bn?.[0] || student.name_en?.[0] || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Name in bold blue ── */}
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{
              fontWeight: 800,
              fontSize: '11px',
              color: '#1d4ed8',
              fontFamily: BN,
              lineHeight: 1.25,
            }}>
              {student.name_bn || student.name_en || '—'}
            </div>
            {student.name_en && student.name_bn && (
              <div style={{ fontSize: '6.5px', color: '#64748b', fontFamily: EN, marginTop: '1px', fontWeight: 500 }}>
                {student.name_en}
              </div>
            )}
          </div>

          {/* ── Info rows: label : value ── */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {student.father_name && <Row label={lang === 'bn' ? 'পিতা' : 'Father'} value={student.father_name} />}
            <Row label={lang === 'bn' ? 'জামাত' : 'Class'} value={student.class_name || '—'} />
            <Row label={lang === 'bn' ? 'আইডি নং' : 'ID No'} value={student.student_id || '—'} bold />
            {student.roll_number && <Row label={lang === 'bn' ? 'রোল' : 'Roll'} value={student.roll_number} />}
            {student.session_year && (
              <Row
                label={lang === 'bn' ? 'শিক্ষাবর্ষ' : 'Session'}
                value={lang === 'bn' && student.session_year_bn ? `${student.session_year_bn} খ্রিস্টাব্দ` : student.session_year}
              />
            )}
            {(student.guardian_phone || student.phone) && (
              <Row label={lang === 'bn' ? 'মোবাইল' : 'Mobile'} value={student.guardian_phone || student.phone || ''} />
            )}
            {student.blood_group && <Row label={lang === 'bn' ? 'রক্ত' : 'Blood'} value={student.blood_group} blood />}
          </div>
        </div>

        {/* ═══ WAVY FOOTER WITH SIGNATURE & QR ═══ */}
        <div style={{ position: 'relative', flexShrink: 0, marginTop: 'auto' }}>
          {/* SVG wave footer background */}
          <svg
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          >
            <path
              d="M0,18 Q50,0 100,14 Q150,28 200,8 L200,60 L0,60 Z"
              fill="#22d3ee"
              opacity="0.45"
            />
            <path
              d="M0,26 Q50,10 100,22 Q150,36 200,18 L200,60 L0,60 Z"
              fill="#0d9488"
              opacity="0.85"
            />
            <path
              d="M0,34 Q50,18 100,30 Q150,44 200,26 L200,60 L0,60 Z"
              fill="#047857"
            />
          </svg>

          {/* Footer content overlay */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '20px 8px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '4px',
          }}>
            {/* Signature */}
            <div className="signature-container" style={{ textAlign: 'center', flex: '0 0 auto', maxWidth: '52px' }}>
              {principalSignatureUrl && (
                <img
                  src={principalSignatureUrl}
                  alt="Signature"
                  style={{ height: '12px', maxWidth: '46px', objectFit: 'contain', marginBottom: '1px', filter: 'brightness(2.5) contrast(0.8)' }}
                />
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.85)', width: '46px', marginBottom: '1px' }} />
              <div style={{ fontSize: '5.5px', color: '#ffffff', fontFamily: f, fontWeight: 600, lineHeight: 1.1 }}>
                {(lang === 'bn' ? principalName : principalNameEn) || principalName || (lang === 'bn' ? 'প্রিন্সিপাল' : 'Principal')}
              </div>
            </div>

            {/* Validity */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.85)', fontFamily: f, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {lang === 'bn' ? 'মেয়াদ' : 'Valid Until'}
              </div>
              <div style={{ fontSize: '7px', fontWeight: 800, color: '#fde047', fontFamily: f, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {lang === 'bn' && validUntilBn ? validUntilBn : validUntil}
              </div>
            </div>

            {/* QR */}
            <div className="qr-code-container" style={{
              flex: '0 0 auto',
              background: '#ffffff',
              borderRadius: '4px',
              padding: '2.5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
              border: '0.5px solid rgba(212,175,55,0.4)',
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
      </div>
    );
  }
);

StudentIdCard.displayName = 'StudentIdCard';

/* ── Row: label : value ── */
const Row = ({ label, value, bold, blood }: {
  label: string; value: string; bold?: boolean; blood?: boolean;
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    fontSize: '7.5px',
    lineHeight: 1.4,
  }}>
    <span style={{
      color: '#475569',
      fontWeight: 600,
      fontFamily: BN,
      width: '46px',
      flexShrink: 0,
    }}>
      {label}
    </span>
    <span style={{ color: '#475569', fontWeight: 600 }}>:</span>
    <span style={{
      color: blood ? '#dc2626' : '#0f172a',
      fontWeight: bold ? 800 : 700,
      fontFamily: BN,
      flex: 1,
    }}>
      {value}
    </span>
  </div>
);

export default StudentIdCard;
