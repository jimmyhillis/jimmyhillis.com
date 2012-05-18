/*
 * GET twitter recent feed list
 */
exports.twitter_feed = function (req, res){

	var fs = require('fs');

}

/*
 * GET last.fm recent tracks list
 */
exports.lastfm_feed = function (req, res){

	var fs = require('fs');

	var LastFmNode = require('lastfm').LastFmNode
		, recent_tracks
		, lastfm = new LastFmNode({
	  		api_key: 'c005da8fa06f6eb6e7adadbc477eb0d0',    // sign-up for a key at http://www.last.fm/api
	  		secret: '43b15add6b231357c5381ff1f5df4417',
	  		useragent: 'jimmy.hillis.me/v0.1' // optional. defaults to lastfm-node.
			})
		, cache_path = res.app.settings['static'] + '/cache/last-fm.json';

	res.contentType('json');

	/* We'll do some simple file caching here by checking
	 * for a cache file and loading the JSON if it's not too old.
	 * Load the details about the cache file so we can
	 * run some tests on how old it is. */
	fs.stat(cache_path, function(err, stat) {

		var cache_time
			, now_time = new Date()
			, cache_overdue = false;

		/* Work out if the cache is overdue, currently set to 10 minutes.
		 * @TODO turn this into a system wide variables  */
		if (!err) {	
			cache_time = stat.mtime;
			if ((now_time.getTime() - cache_time.getTime()) > res.app.settings['external_cache_time']) {
				cache_overdue = true;
			}
		}

		if (!err && !cache_overdue) {

			if (!cache_overdue && fs.readFile(cache_path, 'ascii', function(err, data) {

				/* Looks like the cache was broken somehow, better do something.. */
				if (err) {
					throw err;
				}

				if (req.param('callback')) {
					data = req.param('callback') + "(" + data + ")"; 
				}

				res.send(data);

			}));
		
		}
		/* There is no cache, or it's over due */
		else {

			recent_tracks = lastfm.request('user.getRecentTracks', { 
				user: 'ppjim3', 
				limit: 10, 
				handlers: {
					success: function(data) {

						var recent_tracks = data.recenttracks.track
							, track
							, track_strings = []
							, content = "";

						for (var i = recent_tracks.length - 1; i >= 0; i--) {
							track = recent_tracks[i];
							track_strings.push(track.artist['#text'] + ' - ' + track.name);
						};

						/* Create JSON response */
						content = JSON.stringify(track_strings);

						/* Cache the data in async, move on anyway! */
						fs.writeFile(cache_path, content, function() {
							console.log('Cache saved!');
						})

						if (req.param('callback')) {
							content = req.param('callback') + "(" + content + ")"; 
						}

						res.send(content);
					},
					error: function(error) {
						console.log("Error: " + error.message);
						res.send('Error');
					}
		    }
			});

		}

	});

}