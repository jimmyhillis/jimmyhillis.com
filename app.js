/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  // routes
  , routes = require('./routes')
  , posts = require('./routes/posts')
  , feeds = require('./routes/feeds');

var app = module.exports = express.createServer();

// Server configation

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // Enable JSONP for my feeds
    app.set('jsonp callback', true);
    // Setup variables for caching in my feeds
    app.set('cache', __dirname + '/cache');
    app.set('external_cache_time', 600000); // the time to update cache files from external sources
    // Setup sessions for .flash messages
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'topsecret' }));
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Database connection

mongoose.connect('mongodb://localhost/jimmy-hillis-me', function(err) {
    if (err) {
        console.log('Failed to connect to MongoDB');
    }
});

// Log success cases for testing purposes
mongoose.connection.on('open', function() {
    console.log('mongodb is connected');
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
//app.del('/post/:id.:format?', blogroutes.delete);
//app.put('/post.:format?', blogroutes.update);

// 404 error page
app.use(function(req,res) {
	res.render('404', { 'title': 'Page Not Found' });
});

app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
