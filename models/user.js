const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    },
    cart: {
        items: [{
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    }
})

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.product.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]

    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;

    } else {
        updatedCartItems.push({product: product._id, quantity: 1 })
    }
    const updatedCart = { items : updatedCartItems };
    this.cart = updatedCart
    return this.save();
}

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(i => {
        return i.product.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//     constructor(name, email, cart, id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart;   // {items: []}
//         this._id = id;
//     }

//     static save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//         .then((user) => {
//             console.log(user);
//         }).catch((err) => {
//             console.log(err);
//         });
//     }

//     addToCart(product) {
        // const cartProductIndex = this.cart.items.findIndex(cp => {
        //     return cp.product.toString() === product._id.toString();
        // });
        // let newQuantity = 1;
        // const updatedCartItems = [...this.cart.items]

        // if(cartProductIndex >= 0) {
        //     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        //     updatedCartItems[cartProductIndex].quantity = newQuantity;

        // } else {
        //     updatedCartItems.push({product: new mongodb.ObjectId(product._id), quantity: 1 })
        // }
        // const updatedCart = { items : updatedCartItems };
        // const db = getDb();
        // return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {
        //     $set: {
        //         cart: updatedCart
        //     }
        // })
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(p => {
//             return p.product;
//         });
//         return db.collection('products').find({_id: { $in: productIds}}).toArray()
//         .then((products) => {
//             return products.map(p => {
//                 return {
//                     ...p,
//                     quantity: this.cart.items.find(i => {
//                         return i.product.toString() === p._id.toString();
//                     }).quantity
//                 };
//             })
//         }).catch((err) => {
//             console.log(err);
//         });
//     }

//     deleteItemFromCart(productId) {
        // const updatedCartItems = this.cart.items.filter(i => {
        //     return i.productId.toString() !== productId.toString();
        // });
//         const db = getDb();
//         return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {
//             $set: {
//                 cart: {
//                     items: updatedCartItems
//                 }
//             }
//         });
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//         .then((products) => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: this._id,
//                     name: this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order)
//         }).then((result) => {
//             const updatedCart = { items: [] };
//             return db.collection('users').updateOne({ _id: this._id }, {
//                 $set: {
//                     cart: updatedCart
//                 }
//             })
//         })
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) })
//         .then((user) => {
//             console.log(user);
//             return user;
//         }).catch((err) => {
//             console.log(err);
//         });
//     }
// }

// module.exports = User;