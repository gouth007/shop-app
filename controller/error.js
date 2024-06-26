exports.get404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
    res.status(404).render('404', {pageTitle: 'Page not found!!', path: '/404', isAuthenticated: req.session.isLoggedIn });
}

exports.get500 = (req, res, next) => {
    // res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
    res.status(500).render('500', {pageTitle: 'Internal server error', path: '/500', isAuthenticated: req.session.isLoggedIn });
}