var controller = {};

module.exports = function (app) {
    db = app.set('db');
    Post = db.model('posts');
    return controller;
};

controller.list = function(req, res) {
    // Post = db.model('posts');
    Post.find(function (err, posts) {
        res.render(
            'posts/list',
             {
                'title': 'jimmy.hillis.me',
                'posts': posts
             });
    });
};

controller.create = function(req, res) {

    // Create and commit new post
    var post = new Post({
        'name': req.param('name'),
        'title': req.param('title'),
        'date': req.param('date'),
        'copy': req.param('copy')
    });
    // Save the post and redirect to listing
    post.save(function (err) {
        if (err) {
            console.log('What the fuck why?');
        }
        res.redirect('/post');
    });

};

controller.read = function (req, res) {
    var id = req.param('id');
    if (!id) {
        res.send(404);
    }
    Post.findOne({ 'name': id },
        function (err, post) {
            if (err) {
                console.log('Error!');
                res.send(404);
            }

            var markdown = require('markdown').markdown;
            post.html = markdown.toHTML(post.copy);

            res.render('posts/post',
                {
                    'title': 'post',
                    'post': post
                });
        });
}
