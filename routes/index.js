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

    var limit = 5
      , pagination = {
            'prev': false,
            'next': false
      }
      , page = (req.query.page) ? parseInt(req.query.page, 10) : 1;

    // Find out total number of records
    Post.count(function (err, count) {
        // Determine next/previous pagination pages
        if (count > (limit * page)) {
            pagination.next = page + 1;
        }
        if (page > 1) {
            pagination.prev = page - 1;
        }
        // Load correct records from current skip value
        Post.find().sort('-posted').skip((page - 1) * limit).limit(limit).find(function (err, posts) {
            res.render(
                'index',
                 {
                    'page_title': 'Code, music & books',
                    'posts': posts,
                    'pagination': pagination
                 });
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
