export const printIdCard = (cardHtml: string) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Card</title>
  <style>@font-face{font-family:"Kalpurush";src:url("https://cdn.jsdelivr.net/gh/maateen/bangla-web-fonts/fonts/kalpurush/Kalpurush-v0.258.ttf") format("truetype");font-display:swap;}@font-face{font-family:"SolaimanLipi";src:url("https://cdn.jsdelivr.net/gh/maateen/bangla-web-fonts/fonts/solaiman-lipi/solaimanlipi-normal-v1.0.ttf") format("truetype");font-display:swap;}@font-face{font-family:"SutonnyOMJ";src:url("/fonts/SutonnyOMJ.ttf") format("truetype");font-display:swap;}</style><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: 54mm 86mm;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      width: 54mm;
      height: 86mm;
      margin: 0;
      padding: 0;
      background: #fff;
      overflow: hidden;
    }
    body {
      display: flex;
      align-items: stretch;
      justify-content: center;
    }
    .no-print { display: none !important; }
    .id-card-container {
      width: 54mm !important;
      height: 86mm !important;
      min-height: 86mm !important;
      max-height: 86mm !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      animation: none !important;
      transition: none !important;
    }
    .id-card-container svg path {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .id-card-container img,
    .id-card-container svg {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      shape-rendering: geometricPrecision;
    }
    .signature-container,
    .qr-code-container {
      position: relative !important;
      inset: auto !important;
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .id-card-container {
        width: 54mm !important;
        height: 86mm !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden !important;
        animation: none !important;
        transition: none !important;
        filter: none !important;
      }
    }
  </style>
</head>
<body>
  ${cardHtml}
</body>
</html>
  `);
  printWindow.document.close();

  // Wait for fonts AND images before printing — prevents Bangla text falling
  // back to a non-Bangla glyph and rendering as garbage.
  const imgs = printWindow.document.querySelectorAll('img');
  const imgPromises = Array.from(imgs).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      })
  );

  const fontReady = (printWindow.document as any).fonts?.ready
    ? (printWindow.document as any).fonts.ready
    : Promise.resolve();

  Promise.all([Promise.all(imgPromises), fontReady]).then(() => {
    setTimeout(() => {
      printWindow.print();
    }, 600);
  });
};

export const printMultipleIdCards = (cardHtmls: string[]) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const cardsGrid = cardHtmls
    .map((html) => `<div class="card-wrapper">${html}</div>`)
    .join('');

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Cards</title>
  <style>@font-face{font-family:"Kalpurush";src:url("https://cdn.jsdelivr.net/gh/maateen/bangla-web-fonts/fonts/kalpurush/Kalpurush-v0.258.ttf") format("truetype");font-display:swap;}@font-face{font-family:"SolaimanLipi";src:url("https://cdn.jsdelivr.net/gh/maateen/bangla-web-fonts/fonts/solaiman-lipi/solaimanlipi-normal-v1.0.ttf") format("truetype");font-display:swap;}</style><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      font-family: 'Kalpurush', 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif;
      background: #f8fafc;
      display: flex;
      flex-wrap: wrap;
      gap: 4mm;
      padding: 8mm;
      justify-content: center;
      overflow: hidden;
    }
    .no-print { display: none !important; }
    .card-wrapper {
      page-break-inside: avoid;
      overflow: hidden;
    }
    .id-card-container {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      width: 54mm !important;
      height: 86mm !important;
      min-height: 86mm !important;
      max-height: 86mm !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      animation: none !important;
      transition: none !important;
    }
    .id-card-container > *:nth-child(2) {
      flex: 1 1 auto !important;
      min-height: 0 !important;
    }
    .id-card-container img,
    .id-card-container svg {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      shape-rendering: geometricPrecision;
    }
    .signature-container,
    .qr-code-container {
      position: relative !important;
      inset: auto !important;
    }
    @media print {
      body { background: #fff; padding: 0; gap: 4mm; }
      .no-print { display: none !important; }
      .id-card-container {
        width: 54mm !important;
        height: 86mm !important;
        box-shadow: none !important;
        overflow: hidden !important;
        animation: none !important;
        transition: none !important;
        filter: none !important;
      }
    }
  </style>
</head>
<body>
  ${cardsGrid}
</body>
</html>
  `);
  printWindow.document.close();

  const imgs = printWindow.document.querySelectorAll('img');
  const imgPromises = Array.from(imgs).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      })
  );

  const fontReady = (printWindow.document as any).fonts?.ready
    ? (printWindow.document as any).fonts.ready
    : Promise.resolve();

  Promise.all([Promise.all(imgPromises), fontReady]).then(() => {
    setTimeout(() => {
      printWindow.print();
    }, 600);
  });
};
