const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err) {
            nextTick(err);
        }
    })
}

exports.deleteFile = deleteFile;