const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1];
    res.render('auth/login', {path: '/login', pageTitle: 'Login', isAuthenticated: req.isLoggedIn});
}

exports.postLogin = (req, res, next) => {
    User.findById('65d73de733dc9757e57d000a').then((user) => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
            console.log(err);
            res.redirect('/');
        });
    }).catch((err) => {
        console.log(err);
    });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
}