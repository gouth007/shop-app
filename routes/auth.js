const express = require('express');
const {check, body} = require('express-validator');

const authController = require('../controller/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',
[
    check('email').isEmail().withMessage('Enter a valid Email').custom((value, {req}) => {
        // if(value.endsWith('yopmail.com')) {
        //     throw new Error('Mail with this domain is forbidden');
        // }
        // return true;
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc) {
                return Promise.reject('E-mail already exists please select different one');
            }
        })
    }),
    body('password', 'Please enter password with characters or numbers and atleast 6 in length')
    .isLength({min: 6})
    .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords should match!');
        }
        return true;
    })
], authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;