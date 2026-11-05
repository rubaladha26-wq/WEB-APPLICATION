const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateProduct } = require('../validations/productValidation');

router.use(protect);

router.get('/categories/all', getCategories);
router.post('/categories', authorize('Admin', 'Accountant'), createCategory);

router
  .route('/')
  .get(getProducts)
  .post(authorize('Admin', 'Accountant'), validateProduct, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(authorize('Admin', 'Accountant'), validateProduct, updateProduct)
  .delete(authorize('Admin', 'Accountant'), deleteProduct);

module.exports = router;

