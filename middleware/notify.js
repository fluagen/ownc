// notify middleware
exports.errorMessage = function(req, res, next) {

    res.render404 = function(error) {
        return res.status(404).render('notify/notify', {
            error: error
        });
    };

    res.renderError = function(statusCode, error) {
        if (statusCode === undefined) {
            statusCode = 400;
        }
        return res.status(statusCode).render('notify/notify', {
            error: error
        });
    };

    next();
};