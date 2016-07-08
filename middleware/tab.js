var set_tab = function(tab, res, next) {
    res.locals.tab = tab;
    next();
};

exports.init = function(req, res, next) {
    res.locals.tab = '';
    next();
};

exports.tab_open = function(req, res, next) {
    set_tab('open', res, next);
};

exports.tab_cards = function(req, res, next) {
    set_tab('cards', res, next);
};