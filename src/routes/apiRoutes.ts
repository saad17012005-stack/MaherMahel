import { Router } from 'express';
import {
  getStoreSettings,
  getCategories,
  getHeroSlides,
  getProducts,
  getProductBySlug,
  calculateCustomAbaya,
  applyCoupon,
  createStoreOrder,
  trackOrder,
  subscribeNewsletter,
} from '../controllers/storeController.js';
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getCustomAbayaOrders,
  updateCustomOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getHeroSlidesAdmin,
  updateHeroSlide,
  updateStoreSettings,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUser,
  suspendUser,
  triggerPasswordReset,
  deleteAdminUser,
  exportUserData,
  getAuditLogs,
} from '../controllers/adminController.js';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';
import {
  getProfile,
  updateProfile,
  getUserOrders,
  getUserCustomOrders,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  syncWishlist,
} from '../controllers/userController.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront Endpoints
router.get('/settings', getStoreSettings);
router.get('/categories', getCategories);
router.get('/hero-slides', getHeroSlides);
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/custom-abaya/calculate', calculateCustomAbaya);
router.post('/coupons/apply', applyCoupon);
router.post('/orders/create', optionalAuth, createStoreOrder);
router.get('/orders/track/:orderNumber', trackOrder);
router.post('/newsletter/subscribe', subscribeNewsletter);

// Authentication Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getMe);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/verify-email', verifyEmail);
router.put('/auth/change-password', requireAuth, changePassword);
router.delete('/auth/account', requireAuth, deleteAccount);

// Protected Customer Account Endpoints
router.get('/user/profile', requireAuth, getProfile);
router.put('/user/profile', requireAuth, updateProfile);
router.get('/user/orders', requireAuth, getUserOrders);
router.get('/user/custom-orders', requireAuth, getUserCustomOrders);
router.get('/user/addresses', requireAuth, getAddresses);
router.post('/user/addresses', requireAuth, createAddress);
router.put('/user/addresses/:id', requireAuth, updateAddress);
router.delete('/user/addresses/:id', requireAuth, deleteAddress);
router.get('/user/wishlist', requireAuth, getWishlist);
router.post('/user/wishlist/toggle', requireAuth, toggleWishlist);
router.post('/user/wishlist/sync', requireAuth, syncWishlist);

// Admin Dashboard Endpoints (Protected with requireAdmin)
router.get('/admin/stats', getAdminStats);
router.get('/admin/orders', getAdminOrders);
router.put('/admin/orders/:id/status', updateOrderStatus);
router.get('/admin/custom-orders', getCustomAbayaOrders);
router.put('/admin/custom-orders/:id/status', updateCustomOrderStatus);
router.post('/admin/products', createProduct);
router.put('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);
router.get('/admin/hero-slides', getHeroSlidesAdmin);
router.put('/admin/hero-slides/:id', updateHeroSlide);
router.put('/admin/settings', updateStoreSettings);

// Admin User Management Endpoints
router.get('/admin/users', getAdminUsers);
router.get('/admin/users/:id', getAdminUserDetails);
router.put('/admin/users/:id', updateAdminUser);
router.post('/admin/users/:id/suspend', suspendUser);
router.post('/admin/users/:id/reset-password', triggerPasswordReset);
router.delete('/admin/users/:id', deleteAdminUser);
router.get('/admin/users/:id/export', exportUserData);
router.get('/admin/audit-logs', getAuditLogs);

export default router;
