var MarkdownIt = require('markdown-it');

// Set default options
var md = new MarkdownIt();

md.set({
    html: false, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: false, // Convert '\n' in paragraphs into <br>
    linkify: true, // Autoconvert URL-like text to links
    typographer: true, // Enable smartypants and other sweet transforms
});

exports.markdown = function(text) {
    return md.render(text);
};