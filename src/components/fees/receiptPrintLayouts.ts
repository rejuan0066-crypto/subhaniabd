/**
 * Professional রশিদ বই (Receipt Book) Print Layouts
 * TABLE-BASED layout for DomPDF / html2canvas compatibility
 * Mode 1: Single student → 2 copies (Office + Student) side by side on one A4 Landscape
 * Mode 2: Bulk class → 6 receipts per A4 (3 rows × 2 cols)
 */

export interface ReceiptData {
  studentName: string;
  studentId: string;
  rollNumber: string;
  className: string;
  sessionName: string;
  feeType: string;
  amount: string;
  transactionId: string;
  receiptSerial: string;
  gatewayTrxId: string;
  paymentTimestamp: string;
  date: string;
  status: string;
  statusColor: string;
  paymentMethod: string;
  collectorName: string;
  approverName: string;
  institutionName: string;
  institutionNameEn: string;
  institutionAddress: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionOtherInfo: string;
  logoUrl: string;
  bn: boolean;
}

export interface ReceiptStyleConfig {
  primaryColor: string;
  fontSize: number;
  receiptTitle: string;
  showWatermark: boolean;
  showQr: boolean;
  showTrxId: boolean;
  showTimestamp: boolean;
  principalName?: string;
  principalSignatureUrl?: string;
}

const DEFAULT_STYLE: ReceiptStyleConfig = {
  primaryColor: '#1a5c2e',
  fontSize: 100,
  receiptTitle: 'রশিদ বই',
  showWatermark: true,
  showQr: true,
  showTrxId: true,
  showTimestamp: true,
};

function buildReceipt(data: ReceiptData, copyLabel: string, style: ReceiptStyleConfig = DEFAULT_STYLE): string {
  const pc = style.primaryColor || '#1a5c2e';
  const fs = (style.fontSize || 100) / 100;
  const qrData = encodeURIComponent(`TXN:${data.transactionId}|AMT:${data.amount}|STU:${data.studentId}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrData}`;

  return `
    <td class="receipt-cell" style="border:2px solid ${pc};">
      <!-- Watermark (absolute positioned inside td via relative wrapper) -->
      <div style="position:relative;width:100%;height:100%;">
        ${style.showWatermark !== false ? (data.logoUrl
          ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.06;z-index:0;pointer-events:none;"><img src="${data.logoUrl}" style="width:70px;height:70px;object-fit:contain;" /></div>`
          : `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:18px;font-weight:700;color:rgba(0,0,0,0.05);white-space:nowrap;pointer-events:none;z-index:0;">${data.institutionName}</div>`) : ''}

        <!-- Header Table -->
        <table cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg, ${pc} 0%, ${pc}dd 100%);border-collapse:collapse;">
          <tr>
            <td style="width:22px;padding:2mm;vertical-align:middle;">
              ${data.logoUrl
                ? `<img src="${data.logoUrl}" style="height:20px;width:20px;object-fit:contain;border-radius:2px;background:rgba(255,255,255,0.15);padding:1px;" />`
                : `<div style="height:20px;width:20px;"></div>`}
            </td>
            <td style="text-align:center;padding:1mm 2mm;vertical-align:middle;">
              <div style="font-weight:700;color:#fff;font-size:${8.5 * fs}px;line-height:1.2;">${data.institutionName}</div>
              ${data.institutionNameEn ? `<div style="font-weight:600;color:rgba(255,255,255,0.9);font-size:${5.5 * fs}px;text-transform:uppercase;letter-spacing:0.5px;">${data.institutionNameEn}</div>` : ''}
              <div style="color:rgba(255,255,255,0.8);font-size:${4.5 * fs}px;line-height:1.2;">${data.institutionAddress}${data.institutionPhone ? ` | যোগাযোগ: ${data.institutionPhone}` : ''}</div>
            </td>
            <td style="width:18px;padding:2mm;vertical-align:middle;">
              <div style="border:1.5px solid ${pc};background:#fff;border-radius:3px;padding:2px 1.5px;text-align:center;writing-mode:vertical-rl;text-orientation:mixed;min-height:28px;">
                <span style="font-size:6px;font-weight:700;color:${pc};letter-spacing:0.5px;white-space:nowrap;">${copyLabel}</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Title Row Table -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:1mm;">
          <tr>
            <td style="width:33%;text-align:left;padding:0 2.5mm;vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
                ${style.showQr !== false ? `<td style="vertical-align:middle;padding-right:2px;"><img src="${qrUrl}" style="width:22px;height:22px;border-radius:2px;" alt="QR" /></td>` : ''}
                <td style="vertical-align:middle;padding-right:2px;"><span style="font-weight:600;color:#555;font-size:${5 * fs}px;white-space:nowrap;">ক্রমিক নং:</span></td>
                <td style="vertical-align:middle;"><span style="font-weight:700;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:0.5px 5px;font-size:${5 * fs}px;color:${pc};display:inline-block;min-width:36px;text-align:center;">${data.receiptSerial || ''}</span></td>
              </tr></table>
            </td>
            <td style="width:34%;text-align:center;vertical-align:middle;">
              <span style="background:${pc};color:#fff;font-weight:700;font-size:${7 * fs}px;padding:0.5px 10px;border-radius:6px;white-space:nowrap;display:inline-block;">${style.receiptTitle || 'রশিদ বই'}</span>
            </td>
            <td style="width:33%;text-align:right;padding:0 2.5mm;vertical-align:middle;">
              <span style="font-weight:600;color:#555;font-size:${5 * fs}px;white-space:nowrap;">তারিখ:</span>
              <span style="font-weight:600;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:0.5px 5px;font-size:${5 * fs}px;color:#333;display:inline-block;min-width:48px;">${data.date || ''}</span>
            </td>
          </tr>
        </table>

        <!-- TrxID & Timestamp Row -->
        ${(style.showTrxId !== false && data.gatewayTrxId) || (style.showTimestamp !== false && data.paymentTimestamp) ? `
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="text-align:center;padding:0.5mm 2.5mm;font-family:monospace,'Noto Sans Bengali',sans-serif;">
              ${style.showTrxId !== false && data.gatewayTrxId ? `<span style="color:#777;font-size:${4.5 * fs}px;margin-right:3mm;">TrxID: <strong style="color:#333;">${data.gatewayTrxId}</strong></span>` : ''}
              ${style.showTimestamp !== false && data.paymentTimestamp ? `<span style="color:#777;font-size:${4.5 * fs}px;">সময়: ${data.paymentTimestamp}</span>` : ''}
            </td>
          </tr>
        </table>` : ''}

        <!-- Form Fields Table -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:1.5mm 0 1mm;">
          ${[
            { label: 'নাম:', value: data.studentName },
            { label: 'আইডি / রোল:', value: data.studentId || data.rollNumber ? [data.studentId, data.rollNumber ? 'রোল: ' + data.rollNumber : ''].filter(Boolean).join(' | ') : '' },
            { label: 'ক্লাস / সেশন:', value: data.className || data.sessionName ? [data.className, data.sessionName].filter(Boolean).join(' | ') : '' },
            { label: 'বাবদ:', value: data.feeType },
          ].map(f => `
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${6 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">${f.label}</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:5px;padding:1px 6px;font-size:${6 * fs}px;color:#1a1a1a;line-height:14px;overflow:visible;white-space:nowrap;">${f.value}</div>
            </td>
          </tr>`).join('')}
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${6 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">টাকা:</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;background:#ecfdf5;border:1px solid #16a34a;border-radius:5px;padding:1px 6px;font-size:${6.5 * fs}px;font-weight:700;color:#16a34a;line-height:14px;overflow:visible;white-space:nowrap;">৳ ${data.amount}</div>
            </td>
          </tr>
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${6 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">স্ট্যাটাস:</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;${data.statusColor === '#22c55e' ? 'background:#ecfdf5;border:1px solid #16a34a;' : 'background:#f8f9fa;border:1px solid #e0e0e0;'}border-radius:5px;padding:1px 6px;font-size:${6 * fs}px;font-weight:700;color:${data.statusColor === '#22c55e' ? '#16a34a' : data.statusColor};line-height:14px;overflow:visible;white-space:nowrap;">${data.status}</div>
            </td>
          </tr>
        </table>

        <!-- Signatures Table -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:6mm;">
          <tr>
            <td style="width:30%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${4.5 * fs}px;">আদায়কারী স্বাক্ষর</div>
              <div style="color:#777;font-size:${4 * fs}px;">${data.collectorName}</div>
            </td>
            <td style="width:${data.approverName ? '30' : '70'}%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              ${style.principalSignatureUrl ? `<img src="${style.principalSignatureUrl}" style="height:20px;max-width:50px;object-fit:contain;display:block;margin:0 auto 1px;" />` : ''}
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${4.5 * fs}px;">মুহতামিম / প্রিন্সিপাল</div>
              <div style="color:#777;font-size:${4 * fs}px;">${style.principalName || ''}</div>
            </td>
            ${data.approverName ? `
            <td style="width:30%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${4.5 * fs}px;">গ্রহণকারী স্বাক্ষর</div>
              <div style="color:#777;font-size:${4 * fs}px;">${data.approverName}</div>
            </td>` : ''}
          </tr>
        </table>
      </div>
    </td>`;
}

function getCSS(style: ReceiptStyleConfig = DEFAULT_STYLE): string {
  const pc = style.primaryColor || '#1a5c2e';
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Sans Bengali', sans-serif;
    background: #f0f2f5;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .page {
    width: 297mm;
    height: 210mm;
    padding: 4mm 6mm;
    page-break-after: always;
    overflow: hidden;
    position: relative;
    background: #fff;
  }
  .page:last-child { page-break-after: auto; }

  .receipt-outer-table {
    width: 100%;
    height: 100%;
    border-collapse: separate;
    border-spacing: 3mm 0;
    table-layout: fixed;
  }

  .receipt-cell {
    width: 50%;
    vertical-align: top;
    border-radius: 6px;
    padding: 0;
    position: relative;
    overflow: hidden;
    background: #ffffff;
  }

  /* Cut line between receipts */
  .cut-cell {
    width: 0;
    border-left: 1.5px dashed #bbb;
    position: relative;
    padding: 0;
  }
  .cut-cell::after {
    content: '✂';
    position: absolute;
    top: 4px;
    left: -7px;
    font-size: 10px;
    color: #999;
    background: #fff;
    padding: 2px 0;
  }

  /* Bulk mode: 3 rows */
  .bulk-outer-table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .bulk-row-cell {
    height: 33.33%;
    padding: 1mm 0;
    vertical-align: top;
  }
  .bulk-inner-table {
    width: 100%;
    height: 100%;
    border-collapse: separate;
    border-spacing: 2mm 0;
    table-layout: fixed;
  }
  .cut-h-row td {
    border-top: 1.5px dashed #bbb;
    padding: 0;
    height: 0;
    position: relative;
  }
  .cut-h-row td::after {
    content: '✂';
    position: absolute;
    left: 4px;
    top: -7px;
    font-size: 10px;
    color: #999;
    background: #fff;
    padding: 0 3px;
  }

  @media print {
    @page { size: A4 landscape; margin: 0; }
    html, body { width: 297mm; background: #fff !important; }
    body { padding: 0; }
    .page { padding: 4mm 6mm; break-inside: avoid; box-shadow: none !important; }
    nav, header, aside, footer, .sidebar, .no-print { display: none !important; }
  }
  @media screen {
    body { background: #e8e8e8; padding: 20px; }
    .page { margin: 0 auto 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.12); max-width: 297mm; border-radius: 8px; }
  }
`;
}

function wrapInHtml(title: string, body: string, style?: ReceiptStyleConfig): string {
  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${getCSS(style)}</style>
</head><body>
${body}
<script>document.fonts.ready.then(()=>{setTimeout(()=>window.print(),800)});</script>
</body></html>`;
}

/**
 * Mode 1: Single student → 2 copies (Office + Student) side by side on one A4 Landscape.
 */
export function buildSingleStudentPrintHtml(receiptData: ReceiptData, style?: ReceiptStyleConfig): string {
  const s = { ...DEFAULT_STYLE, ...style };
  const officeCopy = buildReceipt(receiptData, 'অফিস কপি', s);
  const studentCopy = buildReceipt(receiptData, 'ছাত্র কপি', s);

  const page = `<div class="page">
    <table class="receipt-outer-table">
      <tr>
        ${officeCopy}
        <td class="cut-cell"></td>
        ${studentCopy}
      </tr>
    </table>
  </div>`;

  return wrapInHtml('রশিদ বই', page, s);
}

/**
 * Mode 2: Bulk class → 6 receipts per A4 (3 rows × 2 cols).
 * Each row = 1 student (office + student copy side by side).
 */
export function buildBulkClassPrintHtml(allReceipts: ReceiptData[], style?: ReceiptStyleConfig): string {
  const s = { ...DEFAULT_STYLE, ...style };
  const pages: string[] = [];

  for (let i = 0; i < allReceipts.length; i += 3) {
    const chunk = allReceipts.slice(i, i + 3);
    const rows = chunk.map((rd, idx) => {
      const office = buildReceipt(rd, 'অফিস কপি', s);
      const student = buildReceipt(rd, 'ছাত্র কপি', s);
      const cutH = idx < chunk.length - 1 ? '<tr class="cut-h-row"><td colspan="3"></td></tr>' : '';
      return `<tr><td class="bulk-row-cell"><table class="bulk-inner-table"><tr>${office}<td class="cut-cell"></td>${student}</tr></table></td></tr>${cutH}`;
    }).join('');

    pages.push(`<div class="page"><table class="bulk-outer-table">${rows}</table></div>`);
  }

  return wrapInHtml('রশিদ বই - বাল্ক', pages.join(''), s);
}

/* ===================== DONATION RECEIPT ===================== */

export interface DonationReceiptData {
  donorName: string;
  donorPhone: string;
  donorAddress: string;
  donationAmount: string;
  donationType: string;
  purpose: string;
  receiptSerial: string;
  date: string;
  transactionId: string;
  gatewayTrxId: string;
  paymentTimestamp: string;
  paymentMethod: string;
  collectorName: string;
  approverName: string;
  institutionName: string;
  institutionNameEn: string;
  institutionAddress: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionOtherInfo: string;
  logoUrl: string;
  bn: boolean;
}

function buildDonationReceipt(data: DonationReceiptData, copyLabel: string, style: ReceiptStyleConfig = DEFAULT_STYLE): string {
  const pc = style.primaryColor || '#1a5c2e';
  const fs = (style.fontSize || 100) / 100;
  const qrData = encodeURIComponent(`DON:${data.transactionId}|AMT:${data.donationAmount}|NAME:${data.donorName}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrData}`;

  return `
    <td class="receipt-cell" style="border:2px solid ${pc};">
      <div style="position:relative;width:100%;height:100%;">
        ${style.showWatermark !== false ? (data.logoUrl
          ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.06;z-index:0;pointer-events:none;"><img src="${data.logoUrl}" style="width:70px;height:70px;object-fit:contain;" /></div>`
          : `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:18px;font-weight:700;color:rgba(0,0,0,0.05);white-space:nowrap;pointer-events:none;z-index:0;">${data.institutionName}</div>`) : ''}

        <!-- Header -->
        <table cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg, ${pc} 0%, ${pc}dd 100%);border-collapse:collapse;">
          <tr>
            <td style="width:22px;padding:2mm;vertical-align:middle;">
              ${data.logoUrl ? `<img src="${data.logoUrl}" style="height:20px;width:20px;object-fit:contain;border-radius:2px;background:rgba(255,255,255,0.15);padding:1px;" />` : '<div style="height:20px;width:20px;"></div>'}
            </td>
            <td style="text-align:center;padding:1mm 2mm;vertical-align:middle;">
              <div style="font-weight:700;color:#fff;font-size:${10 * fs}px;line-height:1.2;">${data.institutionName}</div>
              ${data.institutionNameEn ? `<div style="font-weight:600;color:rgba(255,255,255,0.9);font-size:${6.5 * fs}px;text-transform:uppercase;letter-spacing:0.5px;">${data.institutionNameEn}</div>` : ''}
              <div style="color:rgba(255,255,255,0.8);font-size:${5.5 * fs}px;line-height:1.2;">${data.institutionAddress}${data.institutionPhone ? ` | যোগাযোগ: ${data.institutionPhone}` : ''}</div>
            </td>
            <td style="width:18px;padding:2mm;vertical-align:middle;">
              <div style="border:1.5px solid ${pc};background:#fff;border-radius:3px;padding:2px 1.5px;text-align:center;writing-mode:vertical-rl;text-orientation:mixed;min-height:28px;">
                <span style="font-size:6px;font-weight:700;color:${pc};letter-spacing:0.5px;white-space:nowrap;">${copyLabel}</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Title Row -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:1mm;">
          <tr>
            <td style="width:33%;text-align:left;padding:0 2.5mm;vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
                ${style.showQr !== false ? `<td style="vertical-align:middle;padding-right:2px;"><img src="${qrUrl}" style="width:22px;height:22px;border-radius:2px;" alt="QR" /></td>` : ''}
                <td style="vertical-align:middle;padding-right:2px;"><span style="font-weight:600;color:#555;font-size:${6 * fs}px;white-space:nowrap;">ক্রমিক নং:</span></td>
                <td style="vertical-align:middle;"><span style="font-weight:700;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:0.5px 5px;font-size:${6 * fs}px;color:${pc};display:inline-block;min-width:36px;text-align:center;">${data.receiptSerial || ''}</span></td>
              </tr></table>
            </td>
            <td style="width:34%;text-align:center;vertical-align:middle;">
              <span style="background:${pc};color:#fff;font-weight:700;font-size:${8.5 * fs}px;padding:0.5px 10px;border-radius:6px;white-space:nowrap;display:inline-block;">${style.receiptTitle || 'দানের রশিদ'}</span>
            </td>
            <td style="width:33%;text-align:right;padding:0 2.5mm;vertical-align:middle;">
              <span style="font-weight:600;color:#555;font-size:${6 * fs}px;white-space:nowrap;">তারিখ:</span>
              <span style="font-weight:600;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:0.5px 5px;font-size:${6 * fs}px;color:#333;display:inline-block;min-width:48px;">${data.date || ''}</span>
            </td>
          </tr>
        </table>

        <!-- TrxID -->
        ${(style.showTrxId !== false && data.gatewayTrxId) || (style.showTimestamp !== false && data.paymentTimestamp) ? `
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr><td style="text-align:center;padding:0.5mm 2.5mm;font-family:monospace,'Noto Sans Bengali',sans-serif;">
            ${style.showTrxId !== false && data.gatewayTrxId ? `<span style="color:#777;font-size:${5.5 * fs}px;margin-right:3mm;">TrxID: <strong style="color:#333;">${data.gatewayTrxId}</strong></span>` : ''}
            ${style.showTimestamp !== false && data.paymentTimestamp ? `<span style="color:#777;font-size:${5.5 * fs}px;">সময়: ${data.paymentTimestamp}</span>` : ''}
          </td></tr>
        </table>` : ''}

        <!-- Form Fields -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:1.5mm 0 1mm;">
          ${[
            { label: 'দাতার নাম:', value: data.donorName },
            { label: 'মোবাইল:', value: data.donorPhone },
            { label: 'ঠিকানা:', value: data.donorAddress },
            { label: 'দানের ধরন:', value: data.donationType },
            { label: 'উদ্দেশ্য:', value: data.purpose },
          ].map(f => `
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${7 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">${f.label}</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:5px;padding:1px 6px;font-size:${7 * fs}px;color:#1a1a1a;line-height:14px;overflow:visible;white-space:nowrap;">${f.value}</div>
            </td>
          </tr>`).join('')}
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${7 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">টাকা:</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;background:#ecfdf5;border:1px solid #16a34a;border-radius:5px;padding:1px 6px;font-size:${7.5 * fs}px;font-weight:700;color:#16a34a;line-height:14px;overflow:visible;white-space:nowrap;">৳ ${data.donationAmount}</div>
            </td>
          </tr>
          <tr>
            <td style="font-weight:600;color:#555;white-space:nowrap;font-size:${7 * fs}px;padding:1px 4px 1px 8px;text-align:left;vertical-align:middle;">পদ্ধতি:</td>
            <td style="padding:1px 8px 1px 4px;">
              <div style="height:14px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:5px;padding:1px 6px;font-size:${7 * fs}px;color:#1a1a1a;line-height:14px;overflow:visible;white-space:nowrap;">${data.paymentMethod}</div>
            </td>
          </tr>
        </table>

        <!-- Signatures -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:6mm;">
          <tr>
            <td style="width:30%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${5.5 * fs}px;">আদায়কারী স্বাক্ষর</div>
              <div style="color:#777;font-size:${5 * fs}px;">${data.collectorName}</div>
            </td>
            <td style="width:${data.approverName ? '30' : '70'}%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              ${style.principalSignatureUrl ? `<img src="${style.principalSignatureUrl}" style="height:20px;max-width:50px;object-fit:contain;display:block;margin:0 auto 1px;" />` : ''}
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${5.5 * fs}px;">মুহতামিম / প্রিন্সিপাল</div>
              <div style="color:#777;font-size:${5 * fs}px;">${style.principalName || ''}</div>
            </td>
            ${data.approverName ? `
            <td style="width:30%;text-align:center;vertical-align:bottom;padding:0 3mm 1.5mm;">
              <div style="border-top:1px dashed ${pc};margin-bottom:0.5mm;"></div>
              <div style="font-weight:600;color:#555;font-size:${5.5 * fs}px;">গ্রহণকারী স্বাক্ষর</div>
              <div style="color:#777;font-size:${5 * fs}px;">${data.approverName}</div>
            </td>` : ''}
          </tr>
        </table>
      </div>
    </td>`;
}

export function buildDonationReceiptHtml(data: DonationReceiptData, style?: ReceiptStyleConfig): string {
  const s = { ...DEFAULT_STYLE, receiptTitle: 'দানের রশিদ', ...style };
  const officeCopy = buildDonationReceipt(data, 'অফিস কপি', s);
  const donorCopy = buildDonationReceipt(data, 'দাতা কপি', s);

  const page = `<div class="page">
    <table class="receipt-outer-table">
      <tr>
        ${officeCopy}
        <td class="cut-cell"></td>
        ${donorCopy}
      </tr>
    </table>
  </div>`;

  return wrapInHtml('দানের রশিদ', page, s);
}
