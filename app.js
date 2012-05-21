
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , feeds = require('./routes/feeds');

var app = module.exports = express.createServer();

// Configuration

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

// Routes

app.get('/', routes.index);
app.get('/lab', routes.lab);
app.get('/contact', routes.contact);

// Feed routs
app.get('/instagram', feeds.instagram_feed);
app.get('/last-fm', feeds.lastfm_feed);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
