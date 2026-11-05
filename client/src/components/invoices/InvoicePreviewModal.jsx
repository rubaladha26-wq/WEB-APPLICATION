import React from 'react';
import { useSelector } from 'react-redux';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadElementAsPDF } from '../../utils/pdfExport';
import { Printer, Download, Mail, Building, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const InvoicePreviewModal = ({ isOpen, onClose, invoice, onOpenEmailModal }) => {
  const settings = useSelector((state) => state.settings?.settings);

  if (!invoice) return null;

  const company = {
    name: settings?.companyName || 'Nexus Global Billing & Solutions Inc.',
    address: settings?.companyAddress
      ? `${settings.companyAddress.street || ''}, ${settings.companyAddress.city || ''}, ${settings.companyAddress.state || ''} ${settings.companyAddress.postalCode || ''}, ${settings.companyAddress.country || ''}`
      : '750 Market Street, Suite 500, San Francisco, CA 94102',
    phone: settings?.companyPhone || '+1 (415) 890-1234',
    email: settings?.companyEmail || 'finance@nexusbilling.com',
    taxId: settings?.taxId || 'US-EIN-948271032',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadElementAsPDF('printable-invoice', `Invoice_${invoice.invoiceNumber}`);
  };

  const qrPayload = JSON.stringify({
    invoiceNumber: invoice.invoiceNumber,
    customer: invoice.customer?.name,
    amount: invoice.grandTotal,
    dueDate: invoice.dueDate,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${invoice.invoiceNumber}`} maxWidth="max-w-4xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="flex items-center gap-2">
          <Badge status={invoice.status} />
          {invoice.isRecurring && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200">
              Recurring ({invoice.recurringFrequency})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          {onOpenEmailModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmailModal(invoice);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Mail className="w-4 h-4 text-brand-500" /> Send Email
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Body */}
      <div
        id="printable-invoice"
        className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm font-sans"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{company.address}</p>
            <p className="text-xs text-slate-500 mt-1">
              Email: {company.email} | Phone: {company.phone}
            </p>
            <p className="text-xs text-slate-500">Tax ID / GST: {company.taxId}</p>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
              INVOICE
            </h1>
            <p className="text-base font-mono font-bold text-slate-800 mt-1">
              #{invoice.invoiceNumber}
            </p>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
              <p>
                <strong>Date:</strong> {formatDate(invoice.issueDate)}
              </p>
              <p>
                <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
              </p>
              <p>
                <strong>Terms:</strong> {invoice.paymentTerms || 'Due on Receipt'}
              </p>
            </div>
          </div>
        </div>

        {/* Bill To & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-200">
          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To:
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {invoice.customer?.name || 'Customer Name'}
            </h3>
            {invoice.customer?.companyName && (
              <p className="text-xs font-semibold text-slate-700">
                {invoice.customer.companyName}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {invoice.customer?.billingAddress?.street}
              {invoice.customer?.billingAddress?.city && `, ${invoice.customer.billingAddress.city}`}
              {invoice.customer?.billingAddress?.state && ` ${invoice.customer.billingAddress.state}`}
              {invoice.customer?.billingAddress?.postalCode && ` ${invoice.customer.billingAddress.postalCode}`}
            </p>
            <p className="text-xs text-slate-500">Email: {invoice.customer?.email}</p>
            {invoice.customer?.phone && (
              <p className="text-xs text-slate-500">Phone: {invoice.customer.phone}</p>
            )}
            {invoice.customer?.gstNumber && (
              <p className="text-xs text-slate-500">Tax ID: {invoice.customer.gstNumber}</p>
            )}
          </div>

          {/* QR Code Verification Box */}
          <div className="flex flex-col items-center sm:items-end justify-center">
            <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center">
              <QRCodeSVG value={qrPayload} size={88} />
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1">
                Scan to Verify / Pay
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Tax %</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-mono">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {item.taxRate || 0}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Block */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
          <div className="max-w-xs space-y-3">
            {invoice.notes && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Notes & Remarks:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Terms & Conditions:
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {invoice.terms || settings?.invoiceTermsAndConditions || 'Payment is due upon receipt.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Fixed'}):</span>
                <span className="font-mono font-semibold">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span className="font-mono font-semibold">+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}

            {invoice.shippingCost > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-mono font-semibold">+{formatCurrency(invoice.shippingCost, invoice.currency)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Grand Total:</span>
              <span className="text-lg font-extrabold text-blue-600 font-mono">
                {formatCurrency(invoice.grandTotal, invoice.currency)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Total Paid:</span>
              <span className="font-mono font-semibold">{formatCurrency(invoice.totalPaid, invoice.currency)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-800">Balance Due:</span>
              <span className={`text-base font-extrabold font-mono ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(invoice.balanceDue, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Nexus Invoicing Engine | Secure Electronic Billing Document
        </div>
      </div>
    </Modal>
  );
};

export default InvoicePreviewModal;

