// notice middleware


exports.alertMessage = function(req, res, next) {

    res.render404 = function(message) {
         return res.status(404).render('notice/notice', {
            alertType: 'alert-danger',
            message: message
        });
    };

    res.renderError = function(statusCode, message) {
        if (statusCode === undefined) {
            statusCode = 400;
        }
         return res.status(statusCode).render('notice/notice', {
            alertType: 'alert-danger',
            message: message
        });
    };
    next();
};