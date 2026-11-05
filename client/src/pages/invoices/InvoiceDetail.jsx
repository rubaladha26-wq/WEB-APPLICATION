import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchInvoiceById } from '../../redux/slices/invoiceSlice';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaymentRecordModal from '../../components/invoices/PaymentRecordModal';
import SendEmailModal from '../../components/invoices/SendEmailModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadElementAsPDF } from '../../utils/pdfExport';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  DollarSign,
  Edit,
  Building,
  CheckCircle,
  CreditCard,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentInvoice, payments, loading } = useSelector((state) => state.invoices);
  const settings = useSelector((state) => state.settings?.settings);
  const { isAccountant } = useAuth();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchInvoiceById(id));
  }, [dispatch, id]);

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${currentInvoice?.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      downloadElementAsPDF('invoice-sheet', `Invoice_${currentInvoice?.invoiceNumber}`);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading && !currentInvoice) {
    return <LoadingSpinner text="Loading invoice profile..." />;
  }

  if (!currentInvoice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Invoice not found</h3>
        <Link to="/invoices" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Return to Invoices
        </Link>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    invoiceNumber: currentInvoice.invoiceNumber,
    customer: currentInvoice.customer?.name,
    amount: currentInvoice.grandTotal,
    balance: currentInvoice.balanceDue,
    status: currentInvoice.status,
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Invoice {currentInvoice.invoiceNumber}
              </h1>
              <Badge status={currentInvoice.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Issued {formatDate(currentInvoice.issueDate)} • Due {formatDate(currentInvoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentInvoice.balanceDue > 0 && isAccountant && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <DollarSign className="w-4 h-4" /> Record Payment
            </button>
          )}

          <button
            onClick={() => setEmailModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Mail className="w-4 h-4 text-brand-600" /> Email Customer
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
          >
            {pdfLoading ? (
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
            Download PDF
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print
          </button>

          <Link
            to={`/invoices/${currentInvoice._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4 text-amber-500" /> Edit
          </Link>
        </div>
      </div>

      {/* Main Printable Invoice Sheet */}
      <div
        id="invoice-sheet"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md font-sans"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-sm">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {settings?.companyName || 'Nexus Global Solutions Inc.'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              {settings?.companyAddress?.street || '750 Market Street, Suite 500'}
              {settings?.companyAddress?.city && `, ${settings.companyAddress.city}`}
              {settings?.companyAddress?.state && ` ${settings.companyAddress.state}`}
              {settings?.companyAddress?.postalCode && ` ${settings.companyAddress.postalCode}`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Email: {settings?.companyEmail || 'billing@nexusbilling.com'} | Phone: {settings?.companyPhone || '+1 (415) 890-1234'}
            </p>
            <p className="text-xs text-slate-500 font-medium">Tax ID / GST: {settings?.taxId || 'TAX-US-987654321'}</p>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-4xl font-black text-blue-600 tracking-tight">
              INVOICE
            </h1>
            <p className="text-lg font-mono font-bold text-slate-900 mt-1">
              #{currentInvoice.invoiceNumber}
            </p>
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>
                <strong>Date Issued:</strong> {formatDate(currentInvoice.issueDate)}
              </p>
              <p>
                <strong>Payment Due:</strong> {formatDate(currentInvoice.dueDate)}
              </p>
              <p>
                <strong>Payment Terms:</strong> {currentInvoice.paymentTerms || 'Due on Receipt'}
              </p>
            </div>
          </div>
        </div>

        {/* Billed to & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-200">
          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To:
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {currentInvoice.customer?.name}
            </h3>
            {currentInvoice.customer?.companyName && (
              <p className="text-xs font-semibold text-slate-700">
                {currentInvoice.customer.companyName}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {currentInvoice.customer?.billingAddress?.street}
              {currentInvoice.customer?.billingAddress?.city && `, ${currentInvoice.customer.billingAddress.city}`}
              {currentInvoice.customer?.billingAddress?.state && ` ${currentInvoice.customer.billingAddress.state}`}
              {currentInvoice.customer?.billingAddress?.postalCode && ` ${currentInvoice.customer.billingAddress.postalCode}`}
            </p>
            <p className="text-xs text-slate-500">Email: {currentInvoice.customer?.email}</p>
            {currentInvoice.customer?.phone && (
              <p className="text-xs text-slate-500">Phone: {currentInvoice.customer.phone}</p>
            )}
            {currentInvoice.customer?.gstNumber && (
              <p className="text-xs text-slate-500">Tax ID: {currentInvoice.customer.gstNumber}</p>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center">
            <div className="p-3 border border-slate-200 rounded-2xl bg-slate-50 text-center">
              <QRCodeSVG value={qrPayload} size={96} />
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1.5">
                Scan to Verify / Settle
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50">
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Tax %</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentInvoice.items && currentInvoice.items.length > 0 ? (
                currentInvoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-mono">
                      {formatCurrency(item.unitPrice, currentInvoice.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {item.taxRate || 0}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(item.total, currentInvoice.currency)}
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Calculation summary block */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-sm space-y-4">
            {currentInvoice.notes && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Notes / Payment Instructions:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{currentInvoice.notes}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Terms & Conditions:
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {currentInvoice.terms || settings?.invoiceTermsAndConditions}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-80 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(currentInvoice.subtotal, currentInvoice.currency)}</span>
            </div>

            {currentInvoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({currentInvoice.discountType === 'percentage' ? `${currentInvoice.discountValue}%` : 'Fixed'}):</span>
                <span className="font-mono font-semibold">-{formatCurrency(currentInvoice.discountAmount, currentInvoice.currency)}</span>
              </div>
            )}

            {currentInvoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span className="font-mono font-semibold">+{formatCurrency(currentInvoice.taxAmount, currentInvoice.currency)}</span>
              </div>
            )}

            {currentInvoice.shippingCost > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-mono font-semibold">+{formatCurrency(currentInvoice.shippingCost, currentInvoice.currency)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Grand Total:</span>
              <span className="text-2xl font-black text-blue-600 font-mono">
                {formatCurrency(currentInvoice.grandTotal, currentInvoice.currency)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Total Paid:</span>
              <span className="font-mono font-semibold">{formatCurrency(currentInvoice.totalPaid, currentInvoice.currency)}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-800">Balance Due:</span>
              <span className={`text-lg font-extrabold font-mono ${currentInvoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(currentInvoice.balanceDue, currentInvoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Sub-table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm no-print">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" /> Payment & Settlement History
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          All recorded settlements for invoice {currentInvoice.invoiceNumber}
        </p>

        {payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Receipt #</th>
                  <th className="pb-3">Payment Date</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Transaction Ref</th>
                  <th className="pb-3">Recorded By</th>
                  <th className="pb-3 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-brand-600">{p.receiptNumber}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(p.paymentDate, true)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{p.transactionId || 'N/A'}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{p.recordedBy?.name || 'System'}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount, currentInvoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No payments recorded yet for this invoice.
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentRecordModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={currentInvoice}
        onSuccess={() => dispatch(fetchInvoiceById(id))}
      />
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        invoice={currentInvoice}
        onSuccess={() => dispatch(fetchInvoiceById(id))}
      />
    </div>
  );
};

export default InvoiceDetail;

