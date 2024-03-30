const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51OvxutSG9WBJRi7r3daUzDkUqOn9IqW9k23WVSwUZC3gWDsvjNO7V1dJJDW65QyfGPEL0tneDaKn0lghFJEiTD1Y00d1oeYeqH');

const Product = require('../models/product.js');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getIndex = (req, res, next) => {  
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().count().then((numProducts) => {
        totalItems = numProducts;
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
    }).then((products) => {
        // console.log('products:',products)
        // console.log(sequelize.models)
        res.render('shop/index', {
            prods: products, 
            pageTitle: "MY SHOP", 
            path: '/', 
            isAuthenticated: req.session.isLoggedIn,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().count().then((numProducts) => {
        totalItems = numProducts;
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
    }).then((products) => {
        // console.log('products:',products)
        // console.log(sequelize.models)
        res.render('shop/index', {
            prods: products, 
            pageTitle: "MY SHOP", 
            path: '/products', 
            isAuthenticated: req.session.isLoggedIn,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getProduct = ((req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then((product) => {
        res.render('shop/product-details', {product: product, pageTitle: product.title, path: '/products', isAuthenticated: req.session.isLoggedIn})
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }); 
});

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.product').then((user) => {
        const products = user.cart.items;
        res.render('shop/cart', {products: products, pageTitle: 'MY CART', path: '/cart', isAuthenticated: req.session.isLoggedIn});
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.deleteItemFromCart(productId).then((result) => {
        console.log('Removed from cart');
        res.redirect('/cart');
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then((product) => {
        return req.user.addToCart(product)
    }).then((result) => {
        res.redirect('/cart');
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then((orders) => {
        res.render('shop/orders', {pageTitle: 'MY ORDERS', path: '/orders', orders: orders, isAuthenticated: req.session.isLoggedIn});
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;
    req.user.populate('cart.items.product').then((user) => {
        products = user.cart.items;
        total = 0;
        products.forEach(p => {
            total += p.quantity * p.product.price;
        })
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(p => {
                return {
                    price_data: { 
                        currency: 'INR', 
                        product_data:{ 
                          name: p.product.title,
                            description: p.product.discription
                        }, 
                        unit_amount: p.product.price * 100
                    },
                    quantity: p.quantity
                };
            }),
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
            cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
        })
    }).then(session => {
        res.render('shop/checkout', {products: products, pageTitle: 'CHECKOUT', path: '/checkout', isAuthenticated: req.session.isLoggedIn, totalSum: total, sessionId: session.id});
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getCheckoutSuccess = (req, res, next) => {
    req.user.populate('cart.items.product')
    .then((user) => {
        let totalPrice = 0;
        const products = user.cart.items.map((i) => {
            totalPrice += i.quantity*i.product.price
            return {product: {...i.product._doc}, quantity: i.quantity}
        });
        const order = new Order({
            products: products,
            user: {
                email: req.user.email,
                userId: req.user
            },
            totalPrice: totalPrice
        });
        return order.save();
    }).then((result) =>{
        return req.user.clearCart();
    }).then(() => {
        res.redirect('/orders');
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.product')
    .then((user) => {
        let totalPrice = 0;
        const products = user.cart.items.map((i) => {
            totalPrice += i.quantity*i.product.price
            return {product: {...i.product._doc}, quantity: i.quantity}
        });
        const order = new Order({
            products: products,
            user: {
                email: req.user.email,
                userId: req.user
            },
            totalPrice: totalPrice
        });
        return order.save();
    }).then((result) =>{
        return req.user.clearCart();
    }).then(() => {
        res.redirect('/orders');
    }).catch((err) => {
        // console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then((order) => {
        if(!order) {
            return next(new Error('Order not found!'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-'+orderId+'.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        // Creating new Pdf files and sending
        const pdfDocument = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');
        pdfDocument.pipe(fs.createWriteStream(invoicePath));
        pdfDocument.pipe(res);
        pdfDocument.fontSize(24).text('Invoice');
        pdfDocument.text('--------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDocument.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' * $' + prod.product.price);
        });
        pdfDocument.text('--------------------------------');
        pdfDocument.fontSize(20).text(`Total price   $${totalPrice}`);
        pdfDocument.end();

        // Reading and sending small PDF files
        // fs.readFile(invoicePath, (err, data) => {
        //     if(err) {
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"'); // Replace inline by 'attachment' to download the invoice
        //     res.send(data);
        // });
        // const file = fs.createReadStream(invoicePath);

        // Reading and Sending Large PDF files
        // const file = fs.createReadStream(path.join('data', 'invoices', 'amplifier.g1.pdf'));
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"'); // Replace inline by 'attachment' to download the invoice
        // file.pipe(res);
    }).catch((err) => next(err))
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {pageTitle: 'Checkout', path: '/checkout'});
// }
