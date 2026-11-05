import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProduct,
  updateProduct,
  fetchCategories,
} from '../../redux/slices/productSlice';
import Modal from '../common/Modal';

const ProductModal = ({ isOpen, onClose, productToEdit = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.products);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    taxRate: '10',
    stockQuantity: '0',
    unit: 'unit',
    isService: false,
    status: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        description: productToEdit.description || '',
        category: productToEdit.category?._id || productToEdit.category || '',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        costPrice: productToEdit.costPrice !== undefined ? String(productToEdit.costPrice) : '',
        taxRate: productToEdit.taxRate !== undefined ? String(productToEdit.taxRate) : '10',
        stockQuantity: productToEdit.stockQuantity !== undefined ? String(productToEdit.stockQuantity) : '0',
        unit: productToEdit.unit || 'unit',
        isService: Boolean(productToEdit.isService),
        status: productToEdit.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        costPrice: '',
        taxRate: '10',
        stockQuantity: '0',
        unit: 'unit',
        isService: false,
        status: 'active',
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      sku: formData.sku || undefined,
      description: formData.description,
      category: formData.category || undefined,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice || 0),
      taxRate: Number(formData.taxRate || 0),
      stockQuantity: Number(formData.stockQuantity || 0),
      unit: formData.unit,
      isService: formData.isService,
      status: formData.status,
    };

    try {
      if (productToEdit) {
        await dispatch(updateProduct({ id: productToEdit._id, data: payload })).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(`Error saving product: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product / Service' : 'Add Product or Service'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Item / Service Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Cloud Architecture Consulting"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              SKU / Code
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. DEV-WEB-001"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Selling Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Cost Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              placeholder="10"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="checkbox"
            id="isService"
            name="isService"
            checked={formData.isService}
            onChange={handleChange}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
          />
          <label htmlFor="isService" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            This item is an intangible service or consulting (does not track physical stock)
          </label>
        </div>

        {!formData.isService && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Unit (pcs, hrs, box, etc.)
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="unit"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            placeholder="Details or deliverables for invoices..."
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
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-60"
          >
            {loading ? 'Saving...' : productToEdit ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;

