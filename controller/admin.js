const Product = require('../models/product.js');

exports.getAddProduct = (req, res, next) => {
    // res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Click to add</button></form>');
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html')); --> Serving Html files
    res.render('admin/edit-product', {pageTitle: "Add Product", path: '/admin/add-product', editing: false})
}

exports.postAddProduct = (req, res, next) => {
    // console.log(req.body);
    const title = req.body.title;
    const price = req.body.price;
    const imageURL = req.body.imageURL;
    const discription = req.body.discription;
    const product = new Product({title: title, price: price, imageURL: imageURL, discription: discription, userId: req.user});
    product.save().then((result) => {
        console.log('Created product');
        res.redirect('/admin/products');
    }).catch((error) => {
        console.log(error);
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
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    }).catch((err) => {
        console.log(err);
    });
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageURL = req.body.imageURL;
    const updatedDescription = req.body.discription;
    
    Product.findById(productId)
    .then((product) => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageURL = updatedImageURL;
        product.discription = updatedDescription;
        return product.save();
    }).then((result) => {
        console.log('Product Updated');
        res.redirect('/admin/products');
    }).catch((err) => {
        console.log(err)
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    // Product.destroy({where: {id: productId}}).then((result) => {
    //     res.redirect('/admin/products');
    // }).catch((err) => {
    //     console.log(err);
    // })
    // Same as

    Product.deleteOne({_id: productId})
    .then((result) => {
        console.log('PRODUCT DESTROYED');
        res.redirect('/admin/products');
    }).catch((err) => {
        console.log(err);
    })
}

exports.getProducts = (req, res, next) => {
    Product.find().then((products) => {
        res.render('admin/products', {prods: products, pageTitle: "ADMIN PRODUCTS", path: '/admin/products'});
    }).catch((error) => {
        console.log(error);
        res.status(500).json({message: error});
    });
}