exports.cache = function(req, res, next) {

	var fs = require('fs')
		, route_name = req.route.path.split('.')[0].split('/').pop()
		, cache_path = res.app.settings.cache + "/" + route_name + '-feed'
		, cache = {};

	// Set default values to send to feed method
	cache.data = false;
	/* 
	 * This public method is used by the feed method
	 * to cache a return for following requests
	 */
	cache.save = function(data) {
		// Data is async so throw a completion notice for testing
		fs.writeFile(cache_path, data, function() {
			// Only log success in development environment
			req.app.configure('development', function(){
    		console.log(route_name + ' cache saved.');
			});
		});
	};

	// Set public accessible data for next function
	req.cache = cache;

	/* We'll do some simple file caching here by checking
	 * for a cache file and loading the JSON if it's not too old.
	 * Load the details about the cache file so we can
	 * run some tests on how old it is. */
	fs.stat(cache_path, function(err, cache_stat) {

		var now_time = new Date()
			, cache_overdue = false;

		// File doesn't exist.. probably. Might do a check for that here?
		if (err) {
			return next();
		}
		
		if ((now_time.getTime() - cache_stat.mtime.getTime()) > res.app.settings.external_cache_time) {
			next();
		}

		// Cache is good, let's grab the data
		fs.readFile(cache_path, 'ascii', function(err, data) {

			// Cache file is broken somehow, throw an error?
			if (err) {
				return next(err);
			}
			// No cache data so move on
			else if (data === "") {
				return next();
			}

			// Better turn it into an object before passing it
			cache.data = JSON.parse(data);
			next();

		});

	});

}
/*
 * GET twitter recent feed list
 */
exports.twitter = function (req, res) {
	var fs = require('fs');	
}
/* GET instagram latest photos 
 */
exports.instagram = function (req, res) {

	var Instagram = require('instagram-node-lib')
		, cache = req.cache || false
		, data = cache.data || false;

	Instagram.set('client_id', "76fdd68757a74e76bdafaf69ea4d7e79");
	Instagram.set('client_secret', "19aaee33c26e4382a99a7b556c0474fd");
	Instagram.set('access_token', "29667524.76fdd68.22c97f05f88f4af6adb3b81482fcd6f9");

	function handleData(data) {

		// Provide JSON version of this data
		// and not the HTML version
		if (req.param('format') === "json") {

			res.json(data, { 'Content-Type': 'text/javascript' });

		} // !if (json)

		// Provide an HTML version for
		// standard browser clients
		else {

			res.render('feed/instagram', { 
				title: 'Instagram feed', 
				copy: 'Here are my latest photos', 
				photos: data 
			});

		} // !else (html)		
	}

	// No data provided by the cache
	if (!data) {

		// Only log success in development environment
		req.app.configure('development', function(){
  		console.log('This feed has no cache. Making full request.');
		});

		Instagram.users.recent({ 
			user_id: 29667524, 
			'complete': function(data) {

				var _ = require('underscore');

				/* I only want the captions and images for now so I
				 * will save time by only keeping them in the cache */
				//data = _.zip(_.pluck(data, 'images'), _.pluck(data, 'caption'));

				// Save the returned data to the cache object
				cache.save(JSON.stringify(data));

				// While saving handle and display data
				handleData(data);
			}
		});

	}
	
	// We have the feed data required
	else {
	
		handleData(data);

	} // !else (we have data)

} // instagram

/*
 * GET last.fm recent tracks list
 * JSON/HTML
 * This route will take a request with the
 * after a caching middleware call. If no
 * data is provided by the cache it will
 * automatically pull the data and update the
 * cache while providing a response to the
 * user.
 * @dependencies
 * - LastFmNode
 */
exports.lastfm = function (req, res) {

	var 
	// dependencies
		  LastFmNode = require('lastfm').LastFmNode

	// data
		, lastfm = new LastFmNode({
	  		api_key: 'c005da8fa06f6eb6e7adadbc477eb0d0', // sign-up for a key at http://www.last.fm/api
	  		secret: '43b15add6b231357c5381ff1f5df4417',
	  		useragent: 'jimmy.hillis.me/v0.1' // optional. defaults to lastfm-node.
			})
		, cache = req.cache || false
		, data = cache.data || false;

	function handleData(data) {

		// Provide JSON version of this data
		// and not the HTML version
		if (req.param('format') === "json") {
			res.json(data, { 'Content-Type': 'text/javascript' });
		} // !if (json)

		// Provide an HTML version for
		// standard browser clients
		else {

			res.render('feed/lastfm', { 
				title: 'Last.fm Feed', 
				copy: "Here is the latest music I've been listening too!",
				plays: data 
			});

		} // !else (html)

	}

	// No data provided by the cache
	if (!data) {

		// Only log success in development environment
		req.app.configure('development', function(){
  		console.log('This feed has no cache. Making full request.');
		});

		lastfm.request('user.getRecentTracks', {
			user: 'ppjim3', 
			limit: 10, 
			handlers: {
				success: function(data) {

					var recent_tracks = data.recenttracks.track
						, track_strings = [];

					for (var i = recent_tracks.length - 1; i >= 0; i--) {
						track_strings.push(recent_tracks[i].artist['#text'] + ' - ' + recent_tracks[i].name);
					};

					// Save the returned data to the cache object
					cache.save(JSON.stringify(track_strings));

					// While saving handle and display data
					handleData(data);

				},
				error: function(err) {
					throw err;
				}
	    }
		});

	} // !if (no cache data)

	// We have the feed data required
	else {
	
		handleData(data);

	} // !else (we have data)	

} // !lastfm