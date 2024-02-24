const path = require('path');
const express = require('express');
const bodyPraser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const error = require('./controller/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://bgoutham955:gonecase@cluster0.pjvcj4k.mongodb.net/shop'

const app = express();
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.set('view engine', 'pug');
// app.set('views', 'views'); // Default is views

app.use(bodyPraser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}))

app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
    });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(error.get404);

mongoose.connect(MONGODB_URI)
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