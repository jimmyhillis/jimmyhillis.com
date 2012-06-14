/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')

  // routes
  , routes = require('./routes')
  //, blogroutes = require('./routes/blog')
  , feeds = require('./routes/feeds');
  
var app = module.exports = express.createServer();

// == CONFIG == //

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

// == DATABASE == //

mongoose.connect('mongodb://localhost/jimmy-hillis-me', function(err) {
  if (err) {
    console.log("Failed to connect to MongoDB");
  }
});
// Log success cases for testing purposes
mongoose.connection.on("open", function() {
  console.log("mongodb is connected");
});

// Define common schema
var Schema = mongoose.Schema;
mongoose.model('pages', new Schema({ 'title': String, 'copy': String, 'order': Number }));
mongoose.model('blogposts', new Schema({ 'title': String, 'date': String, 'copy': String }));
app.set('db', mongoose);

// == ROUTING == //

// Content page routes
routes = routes(app);
app.get('/', routes.index);
app.get('/lab', routes.lab);
app.get('/contact', routes.contact);

// Blog routes
//app.get('/blog.:format?', blogroutes.list);
//app.post('/blog.:format?', blogroutes.create);
//app.get('/blog/:id.:format?', blogroutes.read);
//app.del('/blog/:id.:format?', blogroutes.delete);
//app.put('/blog.:format?', blogroutes.update);

// Feed routes
app.get('/feed/instagram.:format?', feeds.cache, feeds.instagram);
app.get('/feed/lastfm.:format?', feeds.cache, feeds.lastfm);

// 404 error page
app.use(function(req,res) {
	res.render('404', { 'title': 'Page Not Found' });
});

// Middleware auth method
function authUser(req, res, next) {
  var url = require('url');
  url = req.urlp = urlparser.parse(req.url, true);
  console.log(url);
}

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});