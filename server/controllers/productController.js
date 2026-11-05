const Product = require('../models/Product');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/logger');

// @desc    Get all products & services with search & filters
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const isService = req.query.isService;
    const lowStock = req.query.lowStock === 'true';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isService !== undefined && isService !== '') {
      query.isService = isService === 'true';
    }

    if (lowStock) {
      query.isService = false;
      query.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product or service
// @route   POST /api/products
// @access  Private (Admin & Accountant)
const createProduct = async (req, res, next) => {
  try {
    const { sku } = req.body;
    if (sku) {
      const existing = await Product.findOne({ sku });
      if (existing) {
        return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists.` });
      }
    }

    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: product._id,
      description: `Created product/service: ${product.name} (SKU: ${product.sku || 'N/A'})`,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin & Accountant)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.sku && req.body.sku !== product.sku) {
      const existing = await Product.findOne({ sku: req.body.sku });
      if (existing) {
        return res.status(400).json({ success: false, message: `SKU '${req.body.sku}' is already in use.` });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    // Trigger low stock notification if physical product drops below threshold
    if (!product.isService && product.stockQuantity <= product.lowStockThreshold) {
      await Notification.create({
        user: null,
        title: 'Low Stock Alert',
        message: `Product "${product.name}" is running low on stock (${product.stockQuantity} remaining).`,
        type: 'low_stock',
        referenceId: product._id.toString(),
        referenceModel: 'Product',
      });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: product._id,
      description: `Updated product: ${product.name}`,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin & Accountant)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_PRODUCT',
      entityType: 'Product',
      entityId: product._id,
      description: `Deleted product: ${product.name}`,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// --- Category Management ---

// @desc    Get all categories
// @route   GET /api/products/categories/all
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Create category
// @route   POST /api/products/categories
// @access  Private (Admin & Accountant)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.create({
      name,
      description: description || '',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
};

