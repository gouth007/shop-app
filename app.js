const path = require('path');
// const http = require('http');
const express = require('express');
const bodyPraser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')
const error = require('./controller/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.set('view engine', 'pug');
// app.set('views', 'views'); // Default is views

app.use(bodyPraser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('65d2f968a8c5a6faaf5e0d01').then((user) => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    }).catch((err) => {
        console.log(err);
    })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(error.get404);

mongoConnect(() => {
    console.log();
    app.listen(3000);
});