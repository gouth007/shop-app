const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://bgoutham955:gonecase@cluster0.pjvcj4k.mongodb.net/shop')
    .then((client) => {
        console.log('Connected to database!');
        _db = client.db();
        callback();
    }).catch((err) => {
            console.log(err);
            throw err;
    });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'Database is not connected';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;