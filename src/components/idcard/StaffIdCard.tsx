import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface StaffIdCardProps {
  staff: {
    name_bn?: string;
    name_en?: string;
    staff_id?: string;
    photo_url?: string;
    designation?: string;
    department?: string;
    phone?: string;
    blood_group?: string;
    nid?: string;
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
}

const labels = {
  bn: {
    cardTitle: 'কর্মী পরিচয়পত্র',
    id: 'আইডি',
    designation: 'পদবী',
    department: 'বিভাগ',
    blood: 'রক্তের গ্রুপ',
    phone: 'ফোন',
    nid: 'NID',
    address: 'ঠিকানা',
    principal: 'প্রিন্সিপাল',
    validUntil: 'মেয়াদ',
  },
  en: {
    cardTitle: 'STAFF ID CARD',
    id: 'ID',
    designation: 'Designation',
    department: 'Department',
    blood: 'Blood Group',
    phone: 'Phone',
    nid: 'NID',
    address: 'Address',
    principal: 'Principal',
    validUntil: 'Valid Until',
  },
};

const generateQrUrl = (data: string, size = 60) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=1`;

const StaffIdCard = forwardRef<HTMLDivElement, StaffIdCardProps>(
  ({ staff, institution, validUntil = 'December 2026', validUntilBn = '', principalName = '', principalNameEn = '', principalSignatureUrl, lang = 'bn' }, ref) => {
    const l = labels[lang];

    const qrData = JSON.stringify({
      name: staff.name_bn || staff.name_en,
      id: staff.staff_id,
      designation: staff.designation,
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
            background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
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
              background: '#d97706',
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
                border: '1.5px solid #059669',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {staff.photo_url ? (
                <img src={staff.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 700 }}>
                  {staff.name_bn?.[0] || staff.name_en?.[0] || '?'}
                </div>
              )}
            </div>

            {/* Name + basic info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '7.5px', color: '#0f172a', lineHeight: 1.2 }}>
                {lang === 'bn' ? (staff.name_bn || staff.name_en || '—') : (staff.name_en || staff.name_bn || '—')}
              </div>
              {staff.name_bn && staff.name_en && (
                <div style={{ fontSize: '5.5px', color: '#64748b', marginTop: '1px' }}>
                  {lang === 'bn' ? staff.name_en : staff.name_bn}
                </div>
              )}
              <div style={{ fontSize: '5.5px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                {staff.designation || '—'}
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
            <InfoRow label={l.id} value={staff.staff_id || '—'} />
            {staff.designation && <InfoRow label={l.designation} value={staff.designation} />}
            {staff.department && <InfoRow label={l.department} value={staff.department} />}
            {staff.blood_group && <InfoRow label={l.blood} value={staff.blood_group} highlight />}
            {staff.phone && <InfoRow label={l.phone} value={staff.phone} />}
            {staff.nid && <InfoRow label={l.nid} value={staff.nid} />}
            {staff.address && (
              <div style={{ display: 'flex', padding: '1.5px 0', borderBottom: '1px dotted #f1f5f9' }}>
                <span style={{ fontSize: '5.5px', color: '#64748b', whiteSpace: 'nowrap', marginRight: '4px' }}>{l.address}</span>
                <span style={{ fontSize: '5.5px', fontWeight: 500, color: '#0f172a', lineHeight: 1.3, textAlign: 'right', flex: 1, wordBreak: 'break-word' }}>
                  {staff.address}
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
            <div style={{ fontSize: '6px', fontWeight: 600, color: '#064e3b' }}>{lang === 'bn' && validUntilBn ? validUntilBn : validUntil}</div>
          </div>
        </div>
      </div>
    );
  }
);

StaffIdCard.displayName = 'StaffIdCard';

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

export default StaffIdCard;
