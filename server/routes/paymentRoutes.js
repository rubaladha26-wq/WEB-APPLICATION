const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getPaymentById,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validatePayment } = require('../validations/invoiceValidation');

router.use(protect);

router
  .route('/')
  .get(getPayments)
  .post(authorize('Admin', 'Accountant'), validatePayment, recordPayment);

router.get('/:id', getPaymentById);

module.exports = router;

