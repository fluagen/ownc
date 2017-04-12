///////////////////////////
// 加密解密算法
///////////////////////////
var crypto = require('crypto');

var algorithm = "des";
var key = "ownc@qun";



var cipher = crypto.createCipher(algorithm, key);
var decipher = crypto.createDecipher(algorithm, key);

exports.encrypt = function(text, callback) {
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return callback(null, encrypted);
};

exports.dencrypt = function(encrypted, callback) {
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return callback(null, decrypted);
};

