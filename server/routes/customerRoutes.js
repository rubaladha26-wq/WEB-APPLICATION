const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateCustomer } = require('../validations/customerValidation');

router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(validateCustomer, createCustomer);

router
  .route('/:id')
  .get(getCustomerById)
  .put(validateCustomer, updateCustomer)
  .delete(authorize('Admin', 'Accountant'), deleteCustomer);

module.exports = router;

