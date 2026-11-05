const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePDF,
  emailInvoice,
  triggerRecurring,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateInvoice } = require('../validations/invoiceValidation');

router.use(protect);

router.post('/process-recurring', authorize('Admin', 'Accountant'), triggerRecurring);

router
  .route('/')
  .get(getInvoices)
  .post(validateInvoice, createInvoice);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(validateInvoice, updateInvoice)
  .delete(authorize('Admin', 'Accountant'), deleteInvoice);

router.get('/:id/pdf', getInvoicePDF);
router.post('/:id/send', emailInvoice);

module.exports = router;

