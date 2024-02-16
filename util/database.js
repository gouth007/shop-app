// Using My-SQL
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'gonecase'
// })

// module.exports = pool.promise();


// Using Sequelize

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'gonecase', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;