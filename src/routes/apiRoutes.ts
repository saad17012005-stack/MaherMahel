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
} from '../controllers/adminController.js';

const router = Router();

// Storefront Endpoints
router.get('/settings', getStoreSettings);
router.get('/categories', getCategories);
router.get('/hero-slides', getHeroSlides);
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/custom-abaya/calculate', calculateCustomAbaya);
router.post('/coupons/apply', applyCoupon);
router.post('/orders/create', createStoreOrder);
router.get('/orders/track/:orderNumber', trackOrder);
router.post('/newsletter/subscribe', subscribeNewsletter);

// Admin Dashboard Endpoints
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

export default router;
