const path = require('path');
const express = require('express');

const adminController = require('../controller/admin');
const isAuth = require('../middleware/auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);
// // /admin/add-product => GET
router.get('/products', isAuth, adminController.getProducts)
// // /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
