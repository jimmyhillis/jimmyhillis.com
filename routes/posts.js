/**
 * RESTful controller views for blog Post objects.
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
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.list = function(req, res) {
    Post.find().sort('-posted').find(function (err, posts) {
        // Content negotiation
        if (req.params.format === 'json') {
            res.json(posts);
        }
        res.render(
            'posts/list',
             {
                'page_title': 'Posts',
                'posts': posts
             });
    });
};

/**
 * Edit view builds form page for editing specific post resource
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.add = function (req, res) {
    res.render('posts/new',
        {
            'page_title': 'New Post'
        });
};

/**
 * Create view builds form page for adding a new post resource
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.create = function(req, res) {
    // Create and commit new post
    var post = new Post({
        'name': req.param('name'),
        'title': req.param('title'),
        'date': new Date(req.param('date')),
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
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.read = function (req, res) {
    var id = req.param('id');
    if (!id) {
        res.send(404);
    }
    // Convert to valid Mongo ID
    Post.findOne({ 'name': id },
        function (err, post) {
            if (err || !post) {
                res.send(404);
            }
            var headline = post.copy.split("\n")[0]
              , social_media = _social_media(post, req);
            // Content negotiation
            if (req.params.format === 'json') {
                return res.json(post);
            }
            res.render('posts/post',
                {
                    'page_title': post.title,
                    'page_description': headline,
                    'post': post,
                    'social_media': social_media
                });
        });
};

/**
 * Edit view builds form page for editing specific post resource
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.edit = function (req, res) {
    var id = req.param('id');
    if (!id) {
        res.send(404);
    }
    // Load request to fill form
    Post.findOne({ 'name': id },
        function (err, post) {
            if (err || !post) {
                res.send(404);
            }
            res.render('posts/edit',
                {
                    'page_title': 'Editing ' + post.title,
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
            if (err || !post) {
                res.send(404);
            }
            // Update post with new settings
            post.name = req.body.name;
            post.title = req.body.title;
            post.posted = new Date(req.body.posted);
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
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.remove = function (req, res) {
    var id = req.body._id;
    if (!id) {
        res.send(404);
    }
    // Convert to mongooseID type
    id = db.Types.ObjectId(id);
    // Load request to fill form
    Post.findById(id,
        function (err, post) {
            if (err || !post) {
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

/**
 * Return social media links required for post views
 * @param  {object}      post Post link for building related `share` URLs
 * @param  {express.req} req  Express JS request object
 * @return {object}           Object of social media share links
 */
function _social_media(post, req) {
    var headline = post.copy.split("\n")[0].replace('\r', '');
    // Share links for social media based on this post
    var tweet_vars = {
          'text': '"' + post.title + '" ' + headline,
          'url': req.current_url,
          'via': 'ppjim3'
        }
      , facebook_vars = {
          'app_id': '184017585073361',
          'link': req.current_url,
          'name': post.title,
          'description': headline,
          'redirect_uri': req.current_url
        }
      , tweet_link = 'http://twitter.com/intent/tweet'
                   + '?text=' + encodeURIComponent(tweet_vars.text)
                   + '&url=' + encodeURIComponent(tweet_vars.url)
                   + '&via=' + encodeURIComponent(tweet_vars.via)
      , facebook_link = 'https://www.facebook.com/dialog/feed'
                      + '?app_id=' + encodeURIComponent(facebook_vars.app_id)
                      + '&link=' + encodeURIComponent(facebook_vars.link)
                      + '&name=' + encodeURIComponent(facebook_vars.name)
                      + '&description=' + encodeURIComponent(facebook_vars.description)
                      + '&redirect_uri=' + encodeURIComponent(facebook_vars.redirect_uri);
    // Social media links for the template
    return {
        'twitter': tweet_link,
        'facebook': facebook_link
    };
}
