import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordPayment } from '../../redux/slices/paymentSlice';
import { fetchInvoiceById } from '../../redux/slices/invoiceSlice';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign } from 'lucide-react';

const PaymentRecordModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.balanceDue || 0));
      setTransactionId('');
      setNotes('');
    }
  }, [invoice, isOpen]);

  const handlePayFull = () => {
    if (invoice) {
      setAmount(String(invoice.balanceDue));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoice) return;

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    if (numAmount > invoice.balanceDue) {
      alert(`Amount cannot exceed the remaining balance of ${formatCurrency(invoice.balanceDue)}.`);
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        recordPayment({
          invoice: invoice._id,
          amount: numAmount,
          paymentMethod,
          transactionId,
          notes,
          paymentDate: new Date(),
        })
      ).unwrap();

      // Refresh invoice data
      dispatch(fetchInvoiceById(invoice._id));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(`Error recording payment: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Invoice Payment" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Invoice #: <strong className="text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</strong></span>
            <span>Customer: <strong className="text-slate-800 dark:text-slate-200">{invoice.customer?.name}</strong></span>
          </div>
          <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Total Invoiced</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-rose-500 font-semibold block">Outstanding Balance</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
              Payment Amount *
            </label>
            <button
              type="button"
              onClick={handlePayFull}
              className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Pay Full Balance ({formatCurrency(invoice.balanceDue, invoice.currency)})
            </button>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.balanceDue}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="Bank Transfer">Bank Wire / Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / Instant Pay</option>
              <option value="PayPal">PayPal</option>
              <option value="Stripe">Stripe</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Transaction / Ref ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN-8932014"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Payment Notes / Remarks
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cleared via client chase bank account"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-60"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentRecordModal;

