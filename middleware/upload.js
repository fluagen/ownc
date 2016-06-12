var config = require('../config');
var multer = require('multer');

var limits = {
    fileSize: 500 * 1024 // 500k
};

var fileFilter = function(req, file, cb) {
    if (file.mimetype !== 'image/png' &&
       	file.mimetype !== 'image/jpg' &&
       	file.mimetype !== 'image/jpeg' &&
        	file.mimetype !== 'image/gif') {

        req.fileValidationError = 'goes wrong on the mimetype';
        return cb(null, false);
    }
    cb(null, true);
};

var upload = multer({
    dest: 'public/uploads/',
    limits: limits,
    fileFilter: fileFilter
}).single('file_image');

exports.image = function(req, res, next) {
    return upload(req, res, function(err) {
        if (err) {
            console.debug('upload error : ' + err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.send({
                    status: 'fail',
                    error: {
                        code: 1001,
                        message: '上传文件太大'
                    }
                });
            }
            return;
        }
        if (req.fileValidationError) {
            console.debug('upload error : ' + req.fileValidationError);
            return res.send({
                status: 'fail',
                error: {
                    code: 1002,
                    message: '只接收图片格式的文件'
                }
            });
        }
        if (req.file && req.file.path) {
            var path = req.file.path;
            path = 'http://' + config.host + ':' + config.port + '/' + path;
            res.send({
                'status': 'success',
                'path': path
            });
        } else {
            next();
        }

    });
};