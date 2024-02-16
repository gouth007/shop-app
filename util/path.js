const path = require('path');
// console.log(path.dirname(process));
// console.log(path.dirname(process.mainModule));
// console.log(path.dirname(process.mainModule.filename).split('\\'));

module.exports = path.dirname(process.mainModule.filename);