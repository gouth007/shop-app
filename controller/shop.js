const Product = require('../models/product.js');
const Order = require('../models/order');
// const Cart = require('../models/cart.js');
// const sequelize = require('../util/database.js');

exports.getIndex = (req, res, next) => {  
    Product.find().then((products) => {
        // console.log('products:',products)
        // console.log(sequelize.models)
        res.render('shop/index', {prods: products, pageTitle: "MY SHOP", path: '/', isAuthenticated: req.session.isLoggedIn});
    }).catch((error) => {
        console.log(error);
    });
}

exports.getProducts = (req, res, next) => {
    Product.find().then((products) => {
        // console.log('products:',products)
        res.render('shop/product-list', {prods: products, pageTitle: "MY SHOP", path: '/products', isAuthenticated: req.session.isLoggedIn});
    }).catch((error) => {
        console.log(error);
    });
}

exports.getProduct = ((req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then((product) => {
        res.render('shop/product-details', {product: product, pageTitle: product.title, path: '/products', isAuthenticated: req.session.isLoggedIn})
    }).catch((err) => {
        console.log(err);
    }); 
});

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.product').then((user) => {
        const products = user.cart.items;
        res.render('shop/cart', {products: products, pageTitle: 'MY CART', path: '/cart', isAuthenticated: req.session.isLoggedIn});
    }).catch((err) => {
        console.log(err);
    })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.deleteItemFromCart(productId).then((result) => {
        console.log('Removed from cart');
        res.redirect('/cart');
    }).catch((err) => {
        console.log(err);
    })
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then((product) => {
        return req.user.addToCart(product)
    }).then((result) => {
        res.redirect('/cart');
    }).catch((err) => {
        console.log(err);
    });
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then((orders) => {
        res.render('shop/orders', {pageTitle: 'MY ORDERS', path: '/orders', orders: orders, isAuthenticated: req.session.isLoggedIn});
    }).catch((err) => {
        console.log(err);
    })
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
                name: req.user.name,
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
        console.log(err);
    })
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {pageTitle: 'Checkout', path: '/checkout'});
// }
