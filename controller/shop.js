const Product = require('../models/product.js');
// const Cart = require('../models/cart.js');
// const sequelize = require('../util/database.js');

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then((products) => {
        // console.log('products:',products)
        // console.log(sequelize.models)
        res.render('shop/index', {prods: products, pageTitle: "MY SHOP", path: '/'});
    }).catch((error) => {
        console.log(error);
    });
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then((products) => {
        // console.log('products:',products)
        res.render('shop/product-list', {prods: products, pageTitle: "MY SHOP", path: '/products'});
    }).catch((error) => {
        console.log(error);
    });
}

exports.getProduct = ((req, res, next) => {
    const productId = req.params.productId;
    Product.fetchById(productId).then((product) => {
        res.render('shop/product-details', {product: product, pageTitle: product.title, path: '/products'})
    }).catch((err) => {
        console.log(err);
    }); 
    
    // Is same as
    // Product.findAll({where: {id: productId}}).then(products => {
    //     res.render('shop/product-details', {product: products[0], pageTitle: products[0].title, path: '/products'})
    // }).catch((error) => {
    //     console.log(error);
    // });
})

exports.getCart = (req, res, next) => {
    req.user.getCart().then((products) => {
        res.render('shop/cart', {products: products, pageTitle: 'MY CART', path: '/cart'});
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
    Product.fetchById(prodId).then((product) => {
        return req.user.addToCart(product)
    }).then((result) => {
        console.log(result);
        res.redirect('/cart');
    }).catch((err) => {
        console.log(err);
    });
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders().then((orders) => {
        res.render('shop/orders', {pageTitle: 'MY ORDERS', path: '/orders', orders: orders});
    }).catch((err) => {
        console.log(err);
    })
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder().then((result) =>{
        res.redirect('/orders');
    }).catch((err) => {
        console.log(err);
    })
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {pageTitle: 'Checkout', path: '/checkout'});
// }
