import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  confirmEmail,
  updateDetails,
  updatePassword,
  logout,
  logoutOthers,
  adminGetUserSessions,
  adminGetAllSessions,
  adminDeleteSession,
  adminLogoutAllDevices,
} from './auth.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/confirmemail', confirmEmail);

// Private
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// Logout
router.post('/logout', protect, logout);
router.post('/logout-others', protect, logoutOthers);

// Admin Session Management
router.use('/admin/sessions', protect, authorize('ADMIN', 'SUPERADMIN'));
router.get('/admin/sessions', adminGetAllSessions);
router.get('/admin/sessions/:userId', adminGetUserSessions);
router.delete('/admin/sessions/:sessionId', adminDeleteSession);
router.delete('/admin/sessions/user/:userId', adminLogoutAllDevices);

export default router;
