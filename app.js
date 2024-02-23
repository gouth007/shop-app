const path = require('path');
const express = require('express');
const bodyPraser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')
const error = require('./controller/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.set('view engine', 'pug');
// app.set('views', 'views'); // Default is views

app.use(bodyPraser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('65d73de733dc9757e57d000a').then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
    })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(error.get404);

mongoose.connect('mongodb+srv://bgoutham955:gonecase@cluster0.pjvcj4k.mongodb.net/shop')
.then(() => {
    User.findOne()
    .then((user) => {
        if(!user) {
            const user = new User({
                name: 'James',
                email: 'james@gmailcom',
                cart: {
                    items: []
                }
            });
            user.save();
        }
        app.listen(3000);
    })
    console.log('Connected to database!');
}).catch((err) => {
    console.log(err);
})