import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Calendar, FileText, DollarSign, Calculator, RotateCw } from 'lucide-react';

const InvoiceForm = ({
  initialData = null,
  onSubmit,
  loading = false,
  onOpenCustomerModal,
}) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const { products } = useSelector((state) => state.products);
  const settings = useSelector((state) => state.settings?.settings);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentTerms: 'Due on Receipt',
    currency: 'USD',
    status: 'Draft',
    items: [
      {
        product: '',
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 10,
        discountRate: 0,
        total: 0,
      },
    ],
    discountType: 'percentage',
    discountValue: 0,
    taxType: 'percentage',
    taxRate: 0,
    shippingCost: 0,
    notes: 'Thank you for your business! Please remit payment within terms.',
    terms: 'Payment is due on receipt. Unpaid invoices past 30 days are subject to a 1.5% late fee.',
    isRecurring: false,
    recurringFrequency: 'monthly',
  });

  useEffect(() => {
    dispatch(fetchCustomers({ limit: 100 }));
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        invoiceNumber: initialData.invoiceNumber || '',
        customer: initialData.customer?._id || initialData.customer || '',
        issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().slice(0, 10) : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : '',
        paymentTerms: initialData.paymentTerms || 'Due on Receipt',
        currency: initialData.currency || 'USD',
        status: initialData.status || 'Draft',
        items: initialData.items && initialData.items.length > 0 ? initialData.items.map((it) => ({
          product: it.product?._id || it.product || '',
          name: it.name || '',
          description: it.description || '',
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0,
          taxRate: it.taxRate || 0,
          discountRate: it.discountRate || 0,
          total: it.total || 0,
        })) : [{ product: '', name: '', description: '', quantity: 1, unitPrice: 0, taxRate: 10, discountRate: 0, total: 0 }],
        discountType: initialData.discountType || 'percentage',
        discountValue: initialData.discountValue || 0,
        taxType: initialData.taxType || 'percentage',
        taxRate: initialData.taxRate || 0,
        shippingCost: initialData.shippingCost || 0,
        notes: initialData.notes || '',
        terms: initialData.terms || '',
        isRecurring: Boolean(initialData.isRecurring),
        recurringFrequency: initialData.recurringFrequency || 'monthly',
      });
    } else if (settings) {
      setFormData((prev) => ({
        ...prev,
        currency: settings.defaultCurrency || 'USD',
        notes: settings.invoiceFooterNotes || prev.notes,
        terms: settings.invoiceTermsAndConditions || prev.terms,
      }));
    }
  }, [initialData, settings]);

  // Handle line item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // If product was selected from dropdown, populate name, price, and taxRate
    if (field === 'product' && value) {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        updatedItems[index].name = selectedProd.name;
        updatedItems[index].description = selectedProd.description || '';
        updatedItems[index].unitPrice = selectedProd.price;
        updatedItems[index].taxRate = selectedProd.taxRate || 0;
      }
    }

    // Auto calculate item total
    const qty = Number(updatedItems[index].quantity) || 1;
    const price = Number(updatedItems[index].unitPrice) || 0;
    const discRate = Number(updatedItems[index].discountRate) || 0;
    const taxRate = Number(updatedItems[index].taxRate) || 0;

    const base = qty * price;
    const disc = (base * discRate) / 100;
    const taxable = base - disc;
    const tax = (taxable * taxRate) / 100;
    updatedItems[index].total = Math.round((taxable + tax) * 100) / 100;

    setFormData({ ...formData, items: updatedItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product: '',
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 10,
          discountRate: 0,
          total: 0,
        },
      ],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  // Dynamic Totals Calculation
  const calculateTotals = () => {
    let subtotal = 0;
    let itemsTaxSum = 0;

    formData.items.forEach((it) => {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitPrice) || 0;
      const d = Number(it.discountRate) || 0;
      const t = Number(it.taxRate) || 0;

      const base = q * p;
      const disc = (base * d) / 100;
      const taxable = base - disc;
      const tax = (taxable * t) / 100;

      subtotal += base;
      itemsTaxSum += tax;
    });

    let discountAmt = 0;
    if (formData.discountType === 'percentage') {
      discountAmt = (subtotal * (Number(formData.discountValue) || 0)) / 100;
    } else {
      discountAmt = Number(formData.discountValue) || 0;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmt);
    let totalTax = 0;
    if (Number(formData.taxRate) > 0) {
      totalTax = (afterDiscount * Number(formData.taxRate)) / 100;
    } else {
      totalTax = itemsTaxSum;
    }

    const shipping = Number(formData.shippingCost) || 0;
    const grandTotal = Math.round((afterDiscount + totalTax + shipping) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmt * 100) / 100,
      taxAmount: Math.round(totalTax * 100) / 100,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (statusToSet = null) => {
    if (!formData.customer) {
      alert('Please select a customer for this invoice.');
      return;
    }

    if (formData.items.some((it) => !it.name.trim())) {
      alert('All line items must have a name or description.');
      return;
    }

    const payload = {
      ...formData,
      status: statusToSet || formData.status,
      ...totals,
    };

    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      {/* Primary Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" /> Invoice Header Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Customer *
              </label>
              {onOpenCustomerModal && (
                <button
                  type="button"
                  onClick={onOpenCustomerModal}
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  + Quick Add
                </button>
              )}
            </div>
            <select
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.companyName ? `(${c.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Leave blank for auto-generation"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Net 45">Net 45 Days</option>
              <option value="Net 60">Net 60 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Recurring Billing Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="isRecurring" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-purple-500" />
              Enable Recurring Subscription Billing
            </label>
          </div>

          {formData.isRecurring && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Frequency:</span>
              <select
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Line Items Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Invoice Line Items
          </h3>
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Select Product / Custom Name *
                  </label>
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    className="w-full mb-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Existing Item (Optional) --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Item / service title..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Description / Deliverables
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Details for this line item..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-right font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Tax%
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={item.taxRate}
                    onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                    className="w-full px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-between md:flex-col md:items-end gap-1">
                  <span className="text-[11px] font-semibold uppercase text-slate-500">
                    Total
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(item.total, formData.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={formData.items.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustments & Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes & Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Customer Notes / Payment Instructions
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Calculation Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-brand-600" /> Financial Summary
          </h4>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatCurrency(totals.subtotal, formData.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span>Discount:</span>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px]"
              >
                <option value="percentage">%</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-mono"
              />
              <span className="font-mono text-emerald-600">
                -{formatCurrency(totals.discountAmount, formData.currency)}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Estimated Tax:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              +{formatCurrency(totals.taxAmount, formData.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600 dark:text-slate-400">Shipping / Handling:</span>
            <input
              type="number"
              min="0"
              value={formData.shippingCost}
              onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
              className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              Grand Total:
            </span>
            <span className="text-xl font-extrabold text-brand-600 font-mono">
              {formatCurrency(totals.grandTotal, formData.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => handleSubmit('Draft')}
          disabled={loading}
          className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('Sent')}
          disabled={loading}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          {loading ? 'Saving...' : 'Save & Issue Invoice'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;

