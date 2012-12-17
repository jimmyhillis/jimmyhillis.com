var controller = {};

module.exports = function (app) {
    db = app.set('db');
    return controller;
};

controller.list = function(req, res) {
    Post = db.model('posts');
    Post.find(function (err, posts) {
        res.render('posts/list', { 'title': 'jimmy.hillis.me', 'posts': posts });
    });
};
