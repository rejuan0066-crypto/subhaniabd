import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Takes receipt HTML string, renders it in a hidden iframe,
 * captures with html2canvas, and saves as PDF.
 * Ensures the output matches the designer preview exactly.
 */
export async function downloadReceiptAsPdf(
  htmlContent: string,
  filename: string = 'receipt.pdf'
): Promise<void> {
  // Strip <script> tags and @media screen blocks (handle multiple nested braces)
  let cleanHtml = htmlContent
    .replace(/<script>[\s\S]*?<\/script>/gi, '');

  // Remove @media screen { ... } blocks properly (handles multiple inner rules)
  cleanHtml = cleanHtml.replace(/@media\s+screen\s*\{([\s\S]*?)\n\s*\}/g, '');

  // Inject PDF-specific overrides to match preview exactly
  const pdfOverrides = `
    <style>
      html, body { 
        background: #fff !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        width: 210mm !important;
      }
      .page { 
        background: #fff !important; 
        margin: 0 !important; 
        padding: 6mm 10mm !important;
        box-shadow: none !important; 
        border-radius: 0 !important;
        width: 210mm !important;
        max-width: 210mm !important;
      }
    </style>
  `;
  cleanHtml = cleanHtml.replace('</head>', pdfOverrides + '</head>');

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:none;';
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

        // Wait for all images (logo, QR code)
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
        await new Promise((r) => setTimeout(r, 800));

        const pages = iframeDoc.querySelectorAll('.page');
        const targets = pages.length > 0 ? Array.from(pages) : [iframeDoc.body];

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = 210;
        const pdfHeight = 297;

        for (let i = 0; i < targets.length; i++) {
          const target = targets[i] as HTMLElement;
          const canvas = await html2canvas(target, {
            scale: 3, // Higher quality for sharper text
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            windowWidth: 794,
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png'); // PNG for sharper text
          const imgRatio = canvas.height / canvas.width;
          const imgHeight = pdfWidth * imgRatio;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
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
    }, 4000);
  });
}
