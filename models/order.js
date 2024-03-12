const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = Schema({
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
    }],
    user: {
        email: {
            type: String, 
            required: true
        },
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    totalPrice: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);