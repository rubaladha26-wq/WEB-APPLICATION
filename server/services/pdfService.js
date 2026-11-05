const PDFDocument = require('pdfkit');

/**
 * Generates a clean, professional PDF invoice as a buffer
 * @param {Object} invoice - Populated invoice document
 * @param {Object} setting - Company settings
 */
const generateInvoicePDFBuffer = (invoice, setting) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const companyName = setting?.companyName || 'Nexus Billing Solutions Inc.';
      const companyAddress = setting?.companyAddress
        ? `${setting.companyAddress.street || ''}, ${setting.companyAddress.city || ''}, ${setting.companyAddress.state || ''} ${setting.companyAddress.postalCode || ''}, ${setting.companyAddress.country || ''}`
        : 'San Francisco, CA, USA';
      const companyEmail = setting?.companyEmail || 'billing@nexusbill.com';
      const companyPhone = setting?.companyPhone || '+1 (555) 234-5678';
      const currency = invoice.currency || setting?.currencySymbol || '$';

      // Primary header
      doc.fillColor('#1e293b').fontSize(22).font('Helvetica-Bold').text(companyName, 40, 40);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
        .text(companyAddress, 40, 68)
        .text(`Email: ${companyEmail} | Tel: ${companyPhone}`, 40, 80)
        .text(`Tax ID / GST: ${setting?.taxId || 'N/A'}`, 40, 92);

      // Invoice badge on right
      doc.fillColor('#2563eb').fontSize(24).font('Helvetica-Bold').text('INVOICE', 400, 40, { align: 'right' });
      doc.fillColor('#334155').fontSize(10).font('Helvetica')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 68, { align: 'right' })
        .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 400, 82, { align: 'right' })
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 96, { align: 'right' })
        .text(`Status: ${invoice.status.toUpperCase()}`, 400, 110, { align: 'right' });

      doc.moveTo(40, 130).lineTo(555, 130).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Bill To & Terms section
      doc.fillColor('#475569').fontSize(11).font('Helvetica-Bold').text('BILLED TO:', 40, 145);
      const customer = invoice.customer || {};
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(customer.name || 'Valued Client', 40, 160);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b');
      if (customer.companyName) doc.text(customer.companyName, 40, 174);
      if (customer.email) doc.text(`Email: ${customer.email}`, 40, 186);
      if (customer.phone) doc.text(`Phone: ${customer.phone}`, 40, 198);
      if (customer.gstNumber) doc.text(`Tax / GST: ${customer.gstNumber}`, 40, 210);

      // Payment terms on right
      doc.fillColor('#475569').fontSize(10).font('Helvetica-Bold').text('PAYMENT DETAILS:', 380, 145);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
        .text(`Terms: ${invoice.paymentTerms || 'Due on Receipt'}`, 380, 160)
        .text(`Currency: ${invoice.currency || 'USD'}`, 380, 174)
        .text(`Balance Due: ${currency} ${invoice.balanceDue.toFixed(2)}`, 380, 188);

      // Table Header
      const tableTop = 235;
      doc.rect(40, tableTop, 515, 24).fill('#f1f5f9');
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold')
        .text('Item & Description', 50, tableTop + 7)
        .text('Qty', 300, tableTop + 7, { width: 40, align: 'center' })
        .text('Rate', 350, tableTop + 7, { width: 60, align: 'right' })
        .text('Tax %', 420, tableTop + 7, { width: 40, align: 'right' })
        .text('Amount', 470, tableTop + 7, { width: 75, align: 'right' });

      // Table rows
      let rowY = tableTop + 28;
      (invoice.items || []).forEach((item, index) => {
        if (rowY > 700) {
          doc.addPage();
          rowY = 50;
        }

        const isEven = index % 2 === 0;
        if (isEven) {
          doc.rect(40, rowY - 4, 515, 22).fill('#fafafa');
        }

        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(item.name, 50, rowY, { width: 240 });
        if (item.description) {
          doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(item.description, 50, rowY + 11, { width: 240 });
        }

        doc.fillColor('#334155').fontSize(9).font('Helvetica')
          .text(String(item.quantity), 300, rowY, { width: 40, align: 'center' })
          .text(`${currency} ${Number(item.unitPrice).toFixed(2)}`, 350, rowY, { width: 60, align: 'right' })
          .text(`${item.taxRate || 0}%`, 420, rowY, { width: 40, align: 'right' })
          .text(`${currency} ${Number(item.total).toFixed(2)}`, 470, rowY, { width: 75, align: 'right' });

        rowY += item.description ? 26 : 20;
      });

      doc.moveTo(40, rowY + 5).lineTo(555, rowY + 5).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Calculation summary box
      const calcY = rowY + 15;
      const leftCol = 360;
      const rightCol = 470;
      const colWidth = 75;

      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
        .text('Subtotal:', leftCol, calcY)
        .text(`${currency} ${invoice.subtotal.toFixed(2)}`, rightCol, calcY, { width: colWidth, align: 'right' });

      let currentCalcY = calcY + 16;

      if (invoice.discountAmount > 0) {
        doc.text(`Discount (${invoice.discountType === 'percentage' ? invoice.discountValue + '%' : 'Fixed'}):`, leftCol, currentCalcY)
          .text(`-${currency} ${invoice.discountAmount.toFixed(2)}`, rightCol, currentCalcY, { width: colWidth, align: 'right' });
        currentCalcY += 16;
      }

      if (invoice.taxAmount > 0) {
        doc.text(`Tax (${invoice.taxRate ? invoice.taxRate + '%' : 'Calculated'}):`, leftCol, currentCalcY)
          .text(`+${currency} ${invoice.taxAmount.toFixed(2)}`, rightCol, currentCalcY, { width: colWidth, align: 'right' });
        currentCalcY += 16;
      }

      if (invoice.shippingCost > 0) {
        doc.text('Shipping / Delivery:', leftCol, currentCalcY)
          .text(`+${currency} ${invoice.shippingCost.toFixed(2)}`, rightCol, currentCalcY, { width: colWidth, align: 'right' });
        currentCalcY += 16;
      }

      // Grand total highlight
      doc.rect(leftCol - 10, currentCalcY, 205, 26).fill('#2563eb');
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
        .text('Grand Total:', leftCol, currentCalcY + 7)
        .text(`${currency} ${invoice.grandTotal.toFixed(2)}`, rightCol - 5, currentCalcY + 7, { width: colWidth, align: 'right' });

      currentCalcY += 34;

      doc.fillColor('#64748b').fontSize(9).font('Helvetica')
        .text('Total Paid:', leftCol, currentCalcY)
        .text(`${currency} ${(invoice.totalPaid || 0).toFixed(2)}`, rightCol, currentCalcY, { width: colWidth, align: 'right' });

      currentCalcY += 16;

      doc.fillColor(invoice.balanceDue > 0 ? '#dc2626' : '#16a34a').fontSize(10).font('Helvetica-Bold')
        .text('Balance Due:', leftCol, currentCalcY)
        .text(`${currency} ${invoice.balanceDue.toFixed(2)}`, rightCol, currentCalcY, { width: colWidth, align: 'right' });

      // Notes & terms in bottom left
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Notes & Instructions:', 40, calcY);
      doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(invoice.notes || 'Thank you for your business.', 40, calcY + 12, { width: 280 });

      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Terms & Conditions:', 40, calcY + 45);
      doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(invoice.terms || setting?.invoiceTermsAndConditions || 'Payment due on receipt.', 40, calcY + 57, { width: 280 });

      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text('Generated by Nexus Billing System | System Verified & Digitally Signed', 40, 780, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDFBuffer };

