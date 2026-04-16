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

/* ── Inline SVG Islamic geometric pattern for header/footer texture ── */
const islamicPatternSvg = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' patternUnits='userSpaceOnUse' width='20' height='20'%3E%3Cpath d='M0 10 L10 0 L20 10 L10 20Z' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='0.5'/%3E%3Ccircle cx='10' cy='10' r='3' fill='none' stroke='rgba(212,175,55,0.08)' stroke-width='0.3'/%3E%3Cpath d='M0 0L20 20M20 0L0 20' stroke='rgba(255,255,255,0.03)' stroke-width='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='40' height='40' fill='url(%23p)'/%3E%3C/svg%3E")`;

/* ── Watermark Islamic motif SVG for body ── */
const watermarkMotifSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23064e3b' stroke-width='0.4' opacity='0.07'%3E%3Ccircle cx='40' cy='40' r='35'/%3E%3Ccircle cx='40' cy='40' r='28'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Cpath d='M40 5L40 75M5 40L75 40'/%3E%3Cpath d='M15.15 15.15L64.85 64.85M64.85 15.15L15.15 64.85'/%3E%3Cpolygon points='40,8 72,40 40,72 8,40'/%3E%3Cpolygon points='40,16 64,40 40,64 16,40'/%3E%3Cpath d='M40 5 Q55 20 40 40 Q25 20 40 5Z'/%3E%3Cpath d='M40 75 Q55 60 40 40 Q25 60 40 75Z'/%3E%3Cpath d='M5 40 Q20 25 40 40 Q20 55 5 40Z'/%3E%3Cpath d='M75 40 Q60 25 40 40 Q60 55 75 40Z'/%3E%3C/g%3E%3C/svg%3E")`;

/* ── Fine linen texture for body background ── */
const linenTexture = `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='4' fill='%23faf9f6'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23f5f3ef' opacity='0.5'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%23f0ede8' opacity='0.3'/%3E%3C/svg%3E")`;

const BN = "'SutonnyOMJ', 'Noto Sans Bengali', sans-serif";
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
          height: '3.375in',
          background: '#faf9f6',
          borderRadius: '10px',
          overflow: 'hidden',
          fontFamily: BN,
          fontSize: '7px',
          color: '#1a1a1a',
          position: 'relative',
          boxShadow: '0 6px 28px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(212,175,55,0.4)',
          border: '1px solid #064e3b',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact' as any,
        }}
      >
        {/* ═══ PREMIUM HEADER ═══ */}
        <div
          style={{
            background: `${islamicPatternSvg}, linear-gradient(160deg, #022c22 0%, #064e3b 40%, #047857 100%)`,
            padding: '7px 8px 6px',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '2.5px solid transparent',
            borderImage: 'linear-gradient(90deg, #b8860b, #d4af37, #f0d78c, #d4af37, #b8860b) 1',
          }}
        >
          {/* Top gold accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {institution?.logo_url && (
              <img
                src={institution.logo_url}
                alt="Logo"
                style={{
                  width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover',
                  border: '1.5px solid rgba(212,175,55,0.8)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              />
            )}
            <div>
              <div style={{
                color: '#d4af37', fontWeight: 800, fontSize: '9.5px', lineHeight: 1.25,
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                fontFamily: BN,
                letterSpacing: '0.2px',
              }}>
                {institution?.name || 'আল আরাবিয়া সোবহানিয়া হাফিজিয়া মাদ্রাসা'}
              </div>
              {institution?.name_en && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '6px', fontFamily: EN, letterSpacing: '0.5px', fontWeight: 500, marginTop: '1px' }}>
                  {institution.name_en}
                </div>
              )}
            </div>
          </div>
          {institution?.address && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '5px', marginTop: '2px', fontFamily: BN }}>
              {institution.address}
            </div>
          )}
          <div
            style={{
              background: 'linear-gradient(135deg, #d4af37, #c9a84c, #b8860b)',
              color: '#ffffff',
              fontSize: '6.5px',
              fontWeight: 700,
              padding: '2px 12px',
              borderRadius: '10px',
              marginTop: '4px',
              display: 'inline-block',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontFamily: lang === 'bn' ? BN : EN,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {lang === 'bn' ? 'ছাত্র পরিচয়পত্র' : 'STUDENT ID CARD'}
          </div>
        </div>

        {/* ═══ TEXTURED BODY ═══ */}
        <div style={{
          flex: 1,
          padding: '6px 9px 4px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundImage: linenTexture,
          backgroundColor: '#faf9f6',
        }}>
          {/* Islamic watermark motif */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90px',
            height: '90px',
            backgroundImage: watermarkMotifSvg,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Watermark logo overlay */}
          {institution?.logo_url && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '50px',
              height: '50px',
              opacity: 0.04,
              pointerEvents: 'none',
              zIndex: 0,
            }}>
              <img src={institution.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}

          {/* ── Photo with premium frame ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px', position: 'relative', zIndex: 1 }}>
            <div style={{
              padding: '2px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #d4af37, #b8860b, #d4af37)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(212,175,55,0.3)',
            }}>
              <div
                style={{
                  width: '52px',
                  height: '60px',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  background: '#f0ede8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '20px', color: '#064e3b', fontWeight: 700, opacity: 0.3 }}>
                    {student.name_bn?.[0] || student.name_en?.[0] || '?'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Name bilingual ── */}
          <div style={{ textAlign: 'center', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
            <div style={{
              fontWeight: 800, fontSize: '10px', color: '#0f172a', lineHeight: 1.3,
              fontFamily: BN,
            }}>
              {student.name_bn || student.name_en || '—'}
            </div>
            {student.name_en && student.name_bn && (
              <div style={{ fontSize: '6.5px', color: '#6b7280', fontFamily: EN, marginTop: '1px', fontWeight: 500 }}>
                {student.name_en}
              </div>
            )}
          </div>

          {/* ── Info grid ── */}
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '6px',
            padding: '4px 6px',
            border: '1px solid rgba(212,175,55,0.15)',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
            {student.session_year && <InfoRow label={lang === 'bn' ? 'সেশন' : 'Session'} value={lang === 'bn' && student.session_year_bn ? student.session_year_bn : student.session_year} />}
          </div>
        </div>

        {/* ═══ PREMIUM FOOTER ═══ */}
        <div
          style={{
            padding: '4px 7px 5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            background: `${islamicPatternSvg}, linear-gradient(160deg, #022c22 0%, #064e3b 40%, #047857 100%)`,
            borderTop: '2.5px solid transparent',
            borderImage: 'linear-gradient(90deg, #b8860b, #d4af37, #f0d78c, #d4af37, #b8860b) 1',
            position: 'relative',
          }}
        >
          {/* Bottom gold accent */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
          }} />

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
            <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,0.85)', fontFamily: f }}>
              {(lang === 'bn' ? principalName : principalNameEn) || principalName || (lang === 'bn' ? 'প্রিন্সিপাল' : 'Principal')}
            </div>
          </div>

          {/* Valid Until */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: lang === 'bn' ? '5.5px' : '5px', color: 'rgba(255,255,255,0.55)', fontFamily: f, textTransform: lang === 'bn' ? 'none' as any : 'uppercase', letterSpacing: lang === 'bn' ? '0' : '0.5px' }}>
              {lang === 'bn' ? 'মেয়াদ' : 'Valid Until'}
            </div>
            <div style={{ fontSize: '7px', fontWeight: 700, color: '#d4af37', fontFamily: f, textShadow: '0 0 4px rgba(212,175,55,0.3)' }}>
              {lang === 'bn' && validUntilBn ? validUntilBn : validUntil}
            </div>
          </div>

          {/* QR */}
          <div style={{
            flexShrink: 0,
            background: '#ffffff',
            borderRadius: '4px',
            padding: '2.5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            border: '0.5px solid rgba(212,175,55,0.3)',
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

/* ── Premium Info Row ── */
const InfoRow = ({ label, value, valueEn, accent, blood }: {
  label: string; value: string; valueEn?: string; accent?: boolean; blood?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2.5px 0',
      borderBottom: '1px solid rgba(6,78,59,0.06)',
    }}
  >
    <span style={{
      fontSize: '6.5px', color: '#78716c', fontWeight: 600,
      fontFamily: BN,
      letterSpacing: '0.2px',
    }}>{label}</span>
    <span
      style={{
        fontSize: accent ? '8px' : '7.5px',
        fontWeight: 800,
        color: blood ? '#dc2626' : accent ? '#064e3b' : '#1e293b',
        fontFamily: BN,
        textAlign: 'right',
      }}
    >
      {value}
      {valueEn && value !== valueEn && value !== '—' && (
        <span style={{ fontSize: '5.5px', color: '#a8a29e', marginLeft: '2px', fontFamily: EN, fontWeight: 400 }}>
          ({valueEn})
        </span>
      )}
    </span>
  </div>
);

export default StudentIdCard;
