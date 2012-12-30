/**
 * Standard content controller views, each with unique design/templates
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
 * Standard blog/homepage view with mutliple posts and pagination
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.index = function(req, res) {

    var limit = 4
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

/**
 * Standard content page for The Lab: working code examples
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.lab = function(req, res) {
    res.render('lab', {
        page_title: 'Lab'
    });
};

/**
 * Standard content page for Music: links and band information
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.music = function(req, res) {
    res.render('music', {
        page_title: 'Music'
    });
};

/**
 * Standard content page for Contact: images and social media
 * @param  {express.req} req HTTP request object
 * @param  {express.res} res HTTP response object to return to requester
 * @return {object}          HTTP response render
 */
controller.contact = function(req, res) {
    res.render('contact', {
        page_title: 'Moi, Jimmy Hillis'
    });
};
