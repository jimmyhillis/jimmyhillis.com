/**
* tweets.js
*
* @author Jimmy Hillis <jimmy.hillis@me.com>
* @see http://github.com/jimmyhillis/tweets.js
* @version 0.1
*
* For API information and guides:
* @see http://github.com/jimmyhillis/tweets.js/README.md 
* 
* A very simple async Twitter tweet pulling script for quickly 
* loading a number of tweets into your page (or any JS script). 
* This module will create NO markup and should be used when a
* dev wants to setup their own markup or use the tweets for
* another JS purpose (counting, searching, etc.)
*
*/

var TWEETS = (function (username) {

	var 
		// depdendancies

		// constants
		API_URL = "https://api.twitter.com/1/statuses/user_timeline.json?",
		
		// public
		getTweets = function () {},

		// private
		userCallback = function () {},
		buildRequest = function () {},
		passTweetToCallback = function () {};

	/* Builds a Twitter API request string for retrieving
	 * the latest Tweets from a users feed
	 *
	 * @return string
	 *		Returns a HTTP request URL for the users feed via Twitter REST API
	 */
	buildRequest = function(local) {
		
		return API_URL + "include_entities=true&include_rts=true" +
			"&screen_name=" + local.screen_name + "&count=" + local.tweetcount;

	}

	/* Calls user callback function after ensuring the
	 * feed was cached in localStore for further
	 * requestes to the same feed.
	 */
	passTweetToCallback = function(twitterTweets) {

		cachedTweets = {}

		/* Cache the returned Tweets for
		 * any other load within 30 minutes. 
		 */

		cachedTweets.cachetime = new Date().getTime();
		cachedTweets.tweets = twitterTweets;

		localStorage.setItem('TWEETS', JSON.stringify(cachedTweets));
		userCallback(cachedTweets.tweets);

	}

	getTweets = function(username, count, callback) {

		var twitter_api_call,
			twitter_api_url = '',
			cachedTweets,
			refreshCacheTime = new Date();

		/* If user hasn't provided a callback 
		 * then don't bother and return false
		 */
		if (typeof callback === "function") {
			userCallback = callback;
		}
		else {
			return false;
		}

		/* Lets be sure we haven't already cached 
		 * the users Tweet stream in localStorage
		 * for the current session.
		 */
		if (localStorage.getItem('TWEETS')) {

			/* If the feed hasn't been updated for 3 hours
			 * then you can refresh it.
			 */
			refreshCacheTime.setHours(refreshCacheTime.getHours() - 3);
			cachedTweets = JSON.parse(localStorage.getItem('TWEETS'));

			if (cachedTweets.cachetime >= refreshCacheTime) {
				console.log('use local cache');
				return userCallback(cachedTweets.tweets);
			}			

		} 

		console.log("No tweets, let's do this oldschool!");
		
		/* Build a TWITTER API request and load it 
		 * with JSONP and pass the data to the callback */
		twitter_api_call = buildRequest({ 'screen_name': username, 'tweetcount': count });
		loadJSONP(twitter_api_call, passTweetToCallback);

	}

	return {
		'getTweets': getTweets
	};

})();

/* 
loadJSOP Gist from Github
https://gist.github.com/132080
*/

var loadJSONP = (function() {

  var unique = 0;
  
  return function (url, callback, context) {
    
    // Initalize the URL and append callback function
    var name = "_jsonp_" + unique++;
    
    // Check if the URL already has GET variables attached
    if (url.match(/\?/)) {
    	url = url + "&callback=" + name;
    } else {
    	url = url + "?callback=" + name;
    }
    
    // Create script
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    // Setup handler
    window[name] = function(data){
    	console.log('aha');
      callback.call((context || window), data);
      document.getElementsByTagName('head')[0].removeChild(script);
      script = null;
      delete window[name];
    };
    
    console.log(script);

    // Load JSON
    document.getElementsByTagName('head')[0].appendChild(script);

  };

})();

(function () {

	var appendTweets = function appendTweets(tweets) {

		var i
			, max
			, element
			, tweet_txt
			, url
			, real_url
			, tweet
			, tweet_feed = $('.twitter-feed');

			tweet_feed.html('');

		for(i = 0, max = tweets.length; i < max; i++) {

			tweet = '';

			if (tweets[i].entities.urls.length > 0) {
				url = tweets[i].text.substring(tweets[i].entities.urls[0].indices[0], tweets[i].entities.urls[0].indices[1]);
				real_url = '<a href="' + url + '">' + url + '</a>';
				tweets[i].text = tweets[i].text.replace(url, real_url);
			}

			tweet = '<div class="tweet">' + tweets[i].text + '</div>';
			tweet_feed.append($(tweet));

		}

	}

	TWEETS.getTweets("ppjim3", 5, appendTweets);




	// LAST.FM RECENTLY PLAYED LIST

	var appendPlays = function appendPlays(plays) {

		var $lastfm_feed = $('.last-fm-feed')
			, $plays_list = $('<ul></ul>').addClass('last-fm-plays') // the list of plays you can append to your HTML
			, $play // a specific play li element
			, i // the iterator for the for loop
		;

		if (plays.length) {

			for (i = plays.length - 1; i > 0; i--) {
				$play = $('<li></li>').addClass('last-fm-play').text(plays[i]);
				$plays_list.append($play);
			}

			$lastfm_feed.append($plays_list);

		}

	}

	// Load LAST.FM RECENT TRACKS LIST
	loadJSONP("/last-fm", appendPlays);

}());