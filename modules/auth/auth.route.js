import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  confirmEmail,
  updateDetails,
  updateAvatar,
  deleteAvatar,
  updatePassword,
  logout,
  logoutOthers,
  adminGetUserSessions,
  adminGetAllSessions,
  adminDeleteSession,
  adminLogoutAllDevices,
} from './auth.controller.js';

import { protect, authorize } from '../../middleware/auth.js';
import avatarUpload from '../../middleware/avatarUpload.js';
import imageProcess from '../../middleware/imageProcess.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/updatedetails', protect, avatarUpload.single('avatar'), imageProcess, updateDetails);
router.put('/avatar', protect, avatarUpload.single('avatar'), imageProcess, updateAvatar);
router.delete('/avatar', protect, deleteAvatar);
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
