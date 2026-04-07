import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Takes receipt HTML string, renders it in a hidden iframe,
 * captures with html2canvas, and saves as PDF.
 * Ensures the output matches the print preview exactly.
 */
export async function downloadReceiptAsPdf(
  htmlContent: string,
  filename: string = 'receipt.pdf'
): Promise<void> {
  // Strip <script> tags
  let cleanHtml = htmlContent.replace(/<script>[\s\S]*?<\/script>/gi, '');

  // Remove @media screen { ... } blocks (handle nested braces)
  cleanHtml = cleanHtml.replace(/@media\s+screen\s*\{([\s\S]*?)\n\s*\}/g, '');

  // Inject PDF-specific overrides to match print layout exactly
  const pdfOverrides = `
    <style>
      html, body {
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 794px !important;
        min-height: 1123px !important;
        overflow: hidden !important;
      }
      .page {
        background: #fff !important;
        margin: 0 !important;
        padding: 6mm 10mm !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 794px !important;
        max-width: 794px !important;
        min-height: 1123px !important;
      }
      /* Ensure mode-single fills the page height */
      .mode-single {
        min-height: calc(1123px - 12mm) !important;
        align-items: stretch !important;
      }
      .mode-single .receipt-card {
        min-height: calc(1123px - 14mm) !important;
      }
      /* Ensure mode-bulk fills properly */
      .mode-bulk {
        height: 1123px !important;
        min-height: 1123px !important;
      }
      .mode-bulk .receipt-row {
        height: calc(33.33% - 2mm) !important;
      }
      /* Force colors to render */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      /* Ensure receipt-card backgrounds and borders show */
      .receipt-card {
        background: #ffffff !important;
      }
      .receipt-header {
        color: #fff !important;
      }
      /* Ensure field capsules render */
      .field-capsule {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
      }
      .field-capsule.amt {
        background: #ecfdf5 !important;
        border-color: #16a34a !important;
      }
      .field-capsule.status-paid {
        background: #ecfdf5 !important;
        border-color: #16a34a !important;
      }
    </style>
  `;
  cleanHtml = cleanHtml.replace('</head>', pdfOverrides + '</head>');

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    // Use pixel dimensions matching A4 at 96dpi
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    let hasCaptured = false;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      cleanup();
      reject(new Error('Could not access iframe'));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(cleanHtml);
    iframeDoc.close();

    const captureAndDownload = async () => {
      if (hasCaptured) return;
      hasCaptured = true;

      try {
        // Wait for fonts to load
        if (iframe.contentWindow?.document?.fonts) {
          await iframe.contentWindow.document.fonts.ready;
        }

        // Wait for all images (logo, QR code, signature images)
        const images = Array.from(iframeDoc.images || []);
        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>((resolveImage) => {
                if (img.complete) {
                  resolveImage();
                  return;
                }
                img.onload = () => resolveImage();
                img.onerror = () => resolveImage();
              })
          )
        );

        // Extra wait for font rendering & layout stabilization
        await new Promise((r) => setTimeout(r, 1200));

        const pages = iframeDoc.querySelectorAll('.page');
        const targets = pages.length > 0 ? Array.from(pages) : [iframeDoc.body];

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = 210;
        const pdfHeight = 297;

        for (let i = 0; i < targets.length; i++) {
          const target = targets[i] as HTMLElement;

          // Force the target to have explicit dimensions for html2canvas
          target.style.width = '794px';
          target.style.minHeight = '1123px';

          const canvas = await html2canvas(target, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            logging: false,
            imageTimeout: 5000,
          });

          const imgData = canvas.toDataURL('image/png');

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(filename);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        cleanup();
      }
    };

    iframe.onload = () => {
      void captureAndDownload();
    };

    // Fallback timeout
    setTimeout(() => {
      void captureAndDownload();
    }, 5000);
  });
}
