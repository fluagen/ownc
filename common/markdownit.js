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
var linkify = md.linkify;
linkify.add('@', {
    validate: function(text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.twitter) {
            self.re.twitter = new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
            );
        }
        if (self.re.twitter.test(tail)) {
            // Linkifier allows punctuation chars before prefix,
            // but we additionally disable `@` ("@@mention" is invalid)
            if (pos >= 2 && tail[pos - 2] === '@') {
                return false;
            }
            return tail.match(self.re.twitter)[0].length;
        }
        return 0;
    },
    normalize: function(match) {
        match.url = '/user/' + match.url.replace(/^@/, '');
    }
});

exports.md = md;
exports.linkify = linkify;