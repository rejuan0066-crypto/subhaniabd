export const printIdCard = (cardHtml: string) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Card</title>
  <style>@font-face{font-family:"SutonnyOMJ";src:url("/fonts/SutonnyOMJ.ttf") format("truetype");font-display:swap;}</style><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: 2.125in 3.375in;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 2.125in;
      height: 3.375in;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .id-card-container {
      width: 2.125in !important;
      height: 3.375in !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { background: #fff; }
      .id-card-container {
        box-shadow: none !important;
        border: none !important;
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

  // Wait for fonts and images
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

  Promise.all(imgPromises).then(() => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
  <style>@font-face{font-family:"SutonnyOMJ";src:url("/fonts/SutonnyOMJ.ttf") format("truetype");font-display:swap;}</style><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'SutonnyOMJ', 'Noto Sans Bengali', sans-serif;
      background: #f8fafc;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
      justify-content: center;
    }
    .card-wrapper {
      page-break-inside: avoid;
    }
    .id-card-container {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { background: #fff; padding: 0; gap: 5mm; }
      .id-card-container {
        box-shadow: none !important;
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

  Promise.all(imgPromises).then(() => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  });
};
