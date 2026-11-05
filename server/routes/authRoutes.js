const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../validations/authValidation');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgotpassword', authLimiter, validateForgotPassword, forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, validateResetPassword, resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin-only management of system users
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id', protect, authorize('Admin'), updateUser);

module.exports = router;

