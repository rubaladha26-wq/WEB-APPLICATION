import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures a DOM container and exports it as an A4 PDF document
 */
export const downloadElementAsPDF = async (elementId, fileName = 'Invoice') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (err) {
    console.error('Error generating PDF with html2canvas:', err);
    window.print();
  }
};

