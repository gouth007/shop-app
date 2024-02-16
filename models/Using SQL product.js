const db = require('../util/database');

const Cart = require('./cart');

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        if(err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product {
    constructor(id, title, price, imageURL, discription) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.discription = discription;
        this.imageURL = imageURL;
    }
    
    save() {
        return db.execute('INSERT INTO products (title, price, discription, imageURL) VALUES (?, ?, ?, ?)',
        [this.title, this.price, this.discription, this.imageURL]);
    }

    static deleteById(id) {
    }
    
    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static fetchById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
}