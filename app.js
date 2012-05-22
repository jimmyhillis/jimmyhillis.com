
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , feeds = require('./routes/feeds')
  , mongoose = require('mongoose');

var app = module.exports = express.createServer();


// == CONFIG == //

app.configure(function(){
  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.set('static', __dirname + '/public')
  app.set('external_cache_time', 600000); // the time to update cache files from external sources

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(app.set('static')));

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
mongoose.model('Pages', new Schema({ 'title': String, 'copy': String, 'order': Number }));
app.set('db', mongoose);

// == ROUTING == //

routes = routes(app);

// Main page routes
app.get('/', routes.index);
app.get('/lab', routes.lab);
app.get('/contact', routes.contact);

// Feed routes
app.get('/instagram', feeds.instagram_feed);
app.get('/last-fm', feeds.lastfm_feed);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
