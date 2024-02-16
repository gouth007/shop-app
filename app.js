const path = require('path');
// const http = require('http');
const express = require('express');
const bodyPraser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')
const error = require('./controller/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.set('view engine', 'pug');
// app.set('views', 'views'); // Default is views

app.use(bodyPraser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1).then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(error.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// sequelize.sync({ force: true }).then((result) => { --> When you want to overwrite the table then froce attripute should set to true
sequelize.sync().then((result) => {
    // console.log(result);
    return User.findByPk(1)
}).then((user) => {
    if(!user) {
        return User.create({ name: 'Test', email: 'test@test.com'});
    }
    return user;
}).then((user) => {
    return user.createCart();
}).then((user)=> {
    console.log('Connected to database');
    // console.log(user);
    app.listen(3000);
}).catch((error) => {
    console.log(error);
})
