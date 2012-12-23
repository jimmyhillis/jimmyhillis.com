/**
 * [controller description]
 * @type {Object}
 * @author Jimmy Hillis <jimmy@hillis.me>
 */

var controller = {};

/**
 * Exports function returns object for this node module
 * @param  {object} app Current node app settings
 * @return {object}     Controller object with set of route controller methods
 */
module.exports = function (app) {
    db = app.set('db');
    Post = db.model('posts');
    return controller;
};

/**
 * List view builds page displaying all existing posts
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.list = function(req, res) {

    console.log('okay...');
    if (req.isAuthenticated()) {
        console.log('yep!');
    }
    else {
        console.log('nope!');
    }

    Post.find(function (err, posts) {
        // Content negotiation
        if (req.params.format === 'json') {
            res.json(posts);
        }
        res.page_title = 'Posts';
        res.render(
            'posts/list',
             {
                'posts': posts
             });
    });
};

/**
 * Create view builds form page for adding a new post resource
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.create = function(req, res) {
    // Create and commit new post
    var post = new Post({
        'name': req.param('name'),
        'title': req.param('title'),
        'date': req.param('date'),
        'copy': req.param('copy')
    });
    // Save the post and redirect to listing, if it worked otherwise
    // reload the same page with validation errors
    // @todo validation
    post.save(function (err) {
        if (err) {
            console.log('What the fuck why?');
        }
        res.redirect('/post');
    });
};

/**
 * Read view builds page for a single post in HTML and JSON.
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.read = function (req, res) {
    var id = req.param('id');
    if (!id) {
        res.send(404);
    }
    // Convert to valid Mongo ID
    Post.findOne({ 'name': id },
        function (err, post) {
            if (err) {
                res.send(404);
            }
            // Content negotiation
            if (req.params.format === 'json') {
                return res.json(post);
            }
            res.page_title = post.title;
            var markdown = require('markdown').markdown;
            post.html = markdown.toHTML(post.copy);
            res.render('posts/post',
                {
                    'post': post
                });
        });
};

/**
 * Edit view builds form page for editing specific post resource
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.edit = function (req, res) {
    var id = req.param('id');
    if (!id) {
        res.send(404);
    }
    // Load request to fill form
    Post.findOne({ 'name': id },
        function (err, post) {
            if (err) {
                res.send(404);
            }
            res.page_title = post.title;
            res.render('posts/edit',
                {
                    'post': post
                });
        });
};

/**
 * Update post record and redirect back to the post page
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.update = function (req, res) {
    var id = req.body._id;
    if (!id) {
        res.send(404);
    }
    // Convert to mongooseID type
    id = db.Types.ObjectId(id);
    // Load request to fill form
    Post.findById(id,
        function (err, post) {
            if (err) {
                res.send(404);
            }
            // Update post with new settings
            post.name = req.body.name;
            post.title = req.body.title;
            post.date = req.body.date;
            post.copy = req.body.copy;
            post.save(function (err) {
                if (err) {
                    console.log('Couldn\'t save this shit!');
                }
                res.redirect('/post/' + post.name);
            });
        });
};

/**
 * Delete post record and redirect back to the post listing
 * @param  {object} req HTTP request object
 * @param  {object} res HTTP response object to return to requester
 * @return {object}     HTTP response render
 */
controller.remove = function (req, res) {
    var id = req.body._id;
    console.log('DELETE ME!');
    if (!id) {
        res.send(404);
    }
    // Convert to mongooseID type
    id = db.Types.ObjectId(id);
    // Load request to fill form
    Post.findById(id,
        function (err, post) {
            if (err) {
                res.send(404);
            }
            // Delete post
            post.remove(function (err) {
                if (err) {
                    console.log('Couldn\'t delete that fucking stuff!');
                }
                res.redirect('/post/');
            });
        });
};
