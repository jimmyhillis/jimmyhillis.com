/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  // routes
  , routes = require('./routes')
  , posts = require('./routes/posts')
  , feeds = require('./routes/feeds')
  , path = require('path');

// Build express application

var app = module.exports = express();

// Server configation

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // User JADE for markup template lang
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, 'views'));

    app.use(express.logger('dev'));

    var static = path.join(__dirname, 'public');
    app.use(express.static(static));
    app.get(/\/js/, express.static(path.join(static,'js')));
    app.get(/\/css/, express.static(path.join(static,'css')));
    app.get(/\/images/, express.static(path.join(static,'images')));

    // app.use(express.static(__dirname + '/public'));

    // Enable JSONP for my feeds
    // app.set('jsonp callback', true);
    // app.set('cache', __dirname + '/cache');
    // app.set('external_cache_time', 600000);

    // app.use(app.router);
});

app.configure('development', function() {
    console.log('-- DEVELOPMENT SERVER');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Database connection

mongoose.connect('mongodb://localhost/jimmy-hillis-me', function(err) {
    if (err) {
        console.log('Failed to connect to MongoDB');
    }
});

// Model definitions

mongoose.model(
    'pages',
    new mongoose.Schema({
       'name': String,
       'title': String,
       'copy': String,
       'order': Number
    }));

mongoose.model(
    'posts',
    new mongoose.Schema({
        'name': String,
        'title': String,
        'date': String,
        'copy': String
    }));

app.set('db', mongoose);

// Routes

routes = routes(app);
app.get('/', routes.index);
app.get('/lab', routes.lab);
app.get('/music', routes.music);
app.get('/contact', routes.contact);

// Blog routes

posts = posts(app);
app.get('/post.:format?', posts.list);
app.post('/post.:format?', posts.create);
app.get('/post/:id.:format?', posts.read);
app.get('/post/:id/edit.:format?', posts.edit);
app.del('/post/:id.:format?', posts.remove);
app.put('/post.:format?', posts.update);

// 404 error page

app.use(function(req,res) {
	res.render('404', { 'title': 'Page Not Found' });
});

var running = app.listen(3000, function () {
    console.log("Express server listening on port " + app.get('port'));
});
