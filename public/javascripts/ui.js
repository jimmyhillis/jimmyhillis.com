$(document).ready(function() {

	// INSTAGRAM LATEST PHOTOS

	var appendPhotos = function appendPhotos(photos) {

		var $instagram_feed = $('.instagram-feed')
			, $photo_list = $('<ul></ul>')
					.addClass('instagram-photos') // list of all photos to build before adding
			, $photo // single photo li element
			, $image // photo element to add to stream
			, i // iterator for the loop
		;

		if (photos.length) {

			photos = photos.reverse();
			for (i = photos.length - 1; i > 0; i--) {
				//console.log(photos[i].images.thumbnail.url);
				$photo = $('<img />').addClass('instagram-photo').attr('src', photos[i].images.thumbnail.url);
				$photo_list.append($('<li></li>').append($photo));
			}

			$instagram_feed.append($photo_list);

		}

	}

	loadJSONP("/feed/instagram.json", appendPhotos);

	// LAST.FM RECENTLY PLAYED LIST

	var appendPlays = function appendPlays(plays) {

		var $lastfm_feed = $('.last-fm-feed')
			, $plays_list = $('<ul></ul>').addClass('last-fm-plays') // the list of plays you can append to your HTML
			, $play // a specific play li element
			, i // the iterator for the for loop
		;

		if (plays.length) {

			for (i = plays.length - 1; i > 0; i--) {
				$play = $('<li></li>')
					.addClass('last-fm-play')
						.addClass('well')
							.text(plays[i]);
				$plays_list.append($play);
			}

			$lastfm_feed.append($plays_list);

		}

	}

	// Load LAST.FM RECENT TRACKS LIST
	loadJSONP("/feed/lastfm.json", appendPlays);

});