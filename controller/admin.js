const { default: mongoose } = require('mongoose');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    // res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Click to add</button></form>');
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html')); --> Serving Html files
    res.render('admin/edit-product', {pageTitle: "Add Product", path: '/admin/add-product', editing: false, hasError: false, isAuthenticated: req.session.isLoggedIn, errorMessage: null, validationErrors: []});
}

exports.postAddProduct = (req, res, next) => {
    // console.log(req.body);
    const title = req.body.title;
    const price = req.body.price;
    const image = req.file;
    const discription = req.body.discription;
    const errors = validationResult(req);
    console.log(errors.array())

    if(!image) {
        console.log('Error uploading image')
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: 'Attached file in not an image',
            product: {
                title: title,
                price: price,
                discription: discription
            }, 
            isAuthenticated: req.session.isLoggedIn,
            validationErrors: []
        });
    }

    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                discription: discription
            }, 
            isAuthenticated: req.session.isLoggedIn,
            validationErrors: [],
            errorMessage: errors.array()[0].msg
        });
    }
    const imageURL = image.path;
    const product = new Product({title: title, price: price, imageURL: imageURL, discription: discription, userId: req.user});
    product.save().then((result) => {
        console.log('Created product');
        console.log(result)
        res.redirect('/admin/products');
    }).catch((err) => {
        // console.log(error);
        // return res.status(422).render('admin/edit-product', {
        //     pageTitle: 'Add Product',
        //     path: '/admin/add-product',
        //     editing: false,
        //     hasError: true,
        //     errorMessage: 'Database Issue',
        //     product: {
        //         title: title,
        //         price: price,
        //         imageURL: imageURL,
        //         discription: discription
        //     }, 
        //     isAuthenticated: req.session.isLoggedIn,
        //     validationErrors: errors.array()
        // });
        // return res.redirect('/500')
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId).then((product) => {
        if(!product) {
            return res.redirect('/');
            // return Product.find({userId: req.user._id})
            // .then((products) => {
            //     res.render('admin/products', {prods: products, 
            //         pageTitle: "ADMIN PRODUCTS", 
            //         path: '/admin/products', 
            //         isAuthenticated: req.session.isLoggedIn, 
            //         errorMessage: 'Product not found',
            //         validationErrors: []
            //     });
            // })
            // .catch((err) => {
            //     console.log(err);
            // })
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            hasError: false,
            product: product, 
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: null,
            validationErrors: []
        });
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDescription = req.body.discription;
    const errors = validationResult(req);
    console.log(errors.array())

    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                discription: updatedDescription,
                _id: productId
            }, 
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    Product.findById(productId)
    .then((product) => {
        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        if(image) {
            fileHelper.deleteFile(product.imageURL);
            product.imageURL = image.path;
        }
        product.discription = updatedDescription;
        return product.save().then((result) => {
            console.log('Product Updated');
            res.redirect('/admin/products');
        });
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then((product) => {
        if(!product) {
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageURL);
        return Product.deleteOne({_id: productId, userId: req.user._id})
    }).then((result) => {
        console.log('PRODUCT DESTROYED');
        res.status(200).json({ message: 'Success!' });
    }).catch((err) => {
        // console.log(err)
        res.status(500).json({ message: 'Deleting product is failed' })
    });
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id}).then((products) => {
        res.render('admin/products', {prods: products, pageTitle: "ADMIN PRODUCTS", path: '/admin/products', isAuthenticated: req.session.isLoggedIn, errorMessage: null});
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
