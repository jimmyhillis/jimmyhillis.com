/*
 * Index controllers are used to build basic
 * content pages (with unique page designs) from
 * my database.
 */

var controller = {};

module.exports = function (app) {
    db = app.set('db');
    return controller;
};

controller.index = function(req, res) {
    var content;
    content = _parseMarkdownFile(__dirname + '/../public/content/index.md');
    res.render('index', { title: 'jimmy.hillis.me', blog: content });
};

controller.lab = function(req, res) {
    var content;
    content = _parseMarkdownFile(__dirname + '/../public/content/lab.md');
    res.render('lab', { title: 'Lab', content: content });
};

controller.music = function(req, res) {
    var content;
    content = _parseMarkdownFile(__dirname + '/../public/content/music.md');
    res.render('music', { title: 'Music', content: content });
};

controller.folio = function(req, res) {
    res.render('folio', { title: 'Web folio' });
};

controller.contact = function(req, res) {
    var content;
    content = _parseMarkdownFile(__dirname + '/../public/content/contact.md');
    res.render('contact', { title: 'Contact', content: content });
};

controller.error = function(req, res) {
    res.send("404. Page not found");
};

// Private methods

function _parseMarkdown(copy) {
    var markdown = require('markdown').markdown;
    return markdown.toHTML(copy);
}

function _parseMarkdownFile(markdown_file) {
    var fs = require('fs')
      , markdown = require('markdown').markdown
      , copy = '';

    try {
        copy = fs.readFileSync(markdown_file, 'ascii');
    }
    catch (err) {
        console.log("Error loading the Blog file");
    }

    return markdown.toHTML(copy);
} // !_parseMarkdownFile
