
/*
 * GET home page.
 */

exports.index = function(req, res){

	var fs = require('fs')
	, markdown = require('markdown').markdown;

	try {
		var blog = fs.readFileSync(__dirname + '/../public/blog.md', 'ascii');
	} catch (err) {
		console.log("Error loading the Blog file");
	}

	blog = markdown.toHTML(blog);

  res.render('index', { title: 'jimmy.hillis.me', blog: blog,  })
};

exports.lab = function(req, res){
	res.render('lab', { title: 'Lab' })
};

exports.folio = function(req, res){
	res.render('folio', { title: 'Web folio' })
}

exports.contact = function(req, res){
	res.render('contact', { title: 'Contact', dirname: __dirname })
};

exports.lastfm_feed = function (req, res){

	var LastFmNode = require('lastfm').LastFmNode
		, recent_tracks
		, lastfm = new LastFmNode({
	  		api_key: 'c005da8fa06f6eb6e7adadbc477eb0d0',    // sign-up for a key at http://www.last.fm/api
	  		secret: '43b15add6b231357c5381ff1f5df4417',
	  		useragent: 'jimmy.hillis.me/v0.1' // optional. defaults to lastfm-node.
			});

	res.contentType('json');

	recent_tracks = lastfm.request('user.getRecentTracks', { 
		user: 'ppjim3', 
		limit: 10, 
		handlers: {
			success: function(data) {

				var recent_tracks = data.recenttracks.track
					, track
					, track_strings = [];

				for (var i = recent_tracks.length - 1; i >= 0; i--) {
					track = recent_tracks[i];
					track_strings.push(track.artist['#text'] + ' - ' + track.name);
				};

				res.send(req.param('callback') + "(" + JSON.stringify(track_strings) + ")");

			},
			error: function(error) {
				console.log("Error: " + error.message);
				res.send('Error');
				//res.send(req.param('callback') + "(['Failed to load stream'])");
			}
    }
	});

}