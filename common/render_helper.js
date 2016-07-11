var markdownit = require('./markdownit');
var md = markdownit.md;

exports.markdown = function(text) {
    return md.render(text);
};