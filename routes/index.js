/*
 * Index controllers are used to build basic
 * content pages (with unique page designs) from
 * my database.
 */

var controller = {};

module.exports = function (app) {
    db = app.set('db');
    Post = db.model('posts');
    return controller;
};



controller.index = function(req, res) {
    Post.find().sort('-posted').find(function (err, posts) {
        res.render(
            'index',
             {
                'page_title': 'Code, music & books',
                'posts': posts
             });
    });
};

controller.lab = function(req, res) {
    res.render('lab', {
        page_title: 'Lab'
    });
};

controller.music = function(req, res) {
    res.render('music', {
        page_title: 'Music'
    });
};

controller.contact = function(req, res) {
    res.render('contact', {
        page_title: 'Contact'
    });
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
