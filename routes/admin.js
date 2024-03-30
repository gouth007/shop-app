const path = require('path');
const express = require('express');
const { check } = require('express-validator');

const adminController = require('../controller/admin');
const isAuth = require('../middleware/auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);
// // /admin/add-product => GET
router.get('/products', isAuth, adminController.getProducts)
// // /admin/add-product => POST
router.post('/add-product',[
    check('title').isString().isLength({min: 3}).withMessage('Title should have minimum length of 3').trim(),
    check('price').isFloat().withMessage('Price should not be empty'),
    check('discription').isLength({min: 10, max: 500}).withMessage('Discription minimum length is 10 characters')
],
isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',[
    check('title', 'Title should have minimum length of 3').isString().isLength({min: 3}).trim(),
    check('price', 'Price should not be empty').isFloat(),
    check('discription').isLength({min: 10, max: 500}).withMessage('Discription minimum length is 10 characters')
], 
isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
