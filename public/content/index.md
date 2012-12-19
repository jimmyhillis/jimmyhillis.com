## Hashing around
### 19 December 2012

Some funny issues arose from working within a large framework that included some hacky JavaScript today. This site had some JavaScript which added some variables to the end of every link on the page for *cache* reasons. I was to implement a simple tab user interface on a list of links with hash tags pointing to each tab content.

When the tab interface went to grab the hash it would return the altered value `#this_tab_here?val=3136432772` which was stored in the markup. This meant that when looking for the element on the page jQuery would obviously find nothing matching that.

Assuming we can't fix the extra variable issue (we can't, you know what it's like) one simple fix would be to update the markup to use a `data-` variable and save ourselves any tampering of data. This was an old HTML4 codebase so that was not valued and this option would require some extra markup bloat (no big deal) and as long as you leave the href="#this_tab_here" as well it won't break the tab content display in a non-JS environment. Great. That solution however is boring and wasn't possible given a few other restrictions.

Alternatively we can write a function which grabs the `#hash` component from the HTML attribute regardless of the full URL. We're going to use JS' in-built ability to grab the hash from the `window.location` or an `<a>` for this and then run some fixes on it's somewhat broken implementation.

    function _hash(url_string) {
        var a = document.createElement('A');
        a.href = url_string;
        return a.hash.split('?')[0].split('&')[0];
    }

The function property will be an entire URL string made up of as much or as little of the URL as we can get. We might get `http://www.google.com/#this_tab_here?val=whatever` or something as simple as `?value=whatever#this_tab_here`. With that we build an A HTML element and setting the href value.

Once we have that we can pull out the `hash` value which should be the end of it. Unfortunately if the URL string is a little messy and contains some other parts after it (like our examples) then it will be included in the hash like `#this_tab_here?val=whatever` - not done!

To fix any instances where we have further variables we will simply use split on possible separators. That means good by `?` and `&` which are the only valid URL separators. We always grabbing the first element returned (as we know the string starts with #) thanks to returning `<a>.hash`.

Simple function that solved some pretty annoying issues!

## Wordpress shortcodes to the rescue
### 6 September 2012

The other day we were building a simple site for a client using Wordpress and required some simple markup to wrap around a block of copy. For someone who knows HTML this is trivially simple however when working with WP and any other client-facing-CMS having users who know HTML is highly unlikely. To get around this in Wordpress you can quickly and easily knock up some short codes that, while not beginner CMS level, allow users to simply add possibly complicated markup without realising.

For the front-facing user they only need to enter:

    [block title="This is a great block!"]I'd love to tell you about all the amazing content we have at the moment[/block]

Which will allow us to build any HTML markup we want with those elements. To do so we load up our `functions.php` file in the theme we're building and go to it.

    function block_shortcode($atts, $content="") {
         extract(shortcode_atts(array(
              'title' => false
         ), $atts));

        $html = "<div class=\"block\">" .
            $html .= ($title) ? "<h2>$title</h2>" : "";
                    $html .= "<div class=\"copy\">$content</div>";
        $html .= "</div>";

        return $html;

    }
    add_shortcode('block', 'block_shortcode');

The code above is trivially simple, but perfect for this example. We knocked up a simple function which takes the attributes passed to the short code (in this case we're only using title, though you can have as many as you want) and the content which is passed as the short code method's second parameter (but remember it may not be passed at all!).

The function itself simply runs extract to make all the `$attr` array variables local (which I'm not a fan of, but it's standard practice with these short codes. Another PHP-ism I guess… meh). After that we build the HTML markup with some more dirty PHP code. We at least check for an existing title before we use it.

The last line is how we actually add the short code to the Wordpress instance. This method `add_shortcode` takes the short code name to use (e.g. `[block xxx]`) and the function to call when it's placed in users content. With that extremely simple code you can create some really nice user-functions without forcing them to understand any HTML themselves. Win win!

## Running with Twitter Bootstrap leaves me exahusted
#### 24/June/2012

The current look of this site is a simple responsive design template with enough design to call it my own. When starting it off I decided I would try and learn a few new tricks and make some inroads using the Twitter Bootstrap. These CSS frameworks are all the rage right? Having cobled some basic HTML together and throwing the Bootstrap CSS + JS you can immediatly see some really strong layout and design on your page. It was great, really happy with the look after an hour and no design in mind.

After a few weeks of working on other code and happily dealing with the vanilla Twitter Bootstrap look I started to add more and more custom design and CSS to the site. I also wanted to run with my own responsive changes here and there. *This is where the trouble began.*

The more I wanted to make changes to lower level structural styes, the more trouble I ran into. Their grid system allows for some simple partitioning of content through markup and classes (something I'm normally against but for the sake of getting the most out of Bootstrap that's how it went). You might want to have a 3 column area with some gutter between them right? Some HAML markup:

	.row-fluid
		.span5 .my-column-1
			Big content goes here
		.span1.gutter
			// This is a gutter and adds some spacing
		.span3.my-column-2
			Smaller content here
		.span3.my-column-3
			Smaller content here

It's pretty simple markup and, except for the annoying gutter element, isn't too bad. It's relativly clear (if non-descriptive) in the class department too but just go with me on it.

The first major problem I came up against was the specific nature of their classes and the result in trying to overwrite their grid level elements. Some simple CSS:

	.my-column-2,
	.my-column-3 {
		width: 100%;
		float: none;
	}

So this attempts to turn those secondary columns into full width. You might want to do this, like I did, for a mobile device that is not wide enough and we feel the content should really get some whitespace.

Unfortunately due to the way the classes are built in the Twitter Bootstrap you will not, easily, be able to overwrite this code without a horrid !important tag. Why? The spans rely on the row-fluid parent and thus are defined along the lines of

	.row-fluid .span3 {
		// style here
	}

To make your style specific enough to break this you are looking at .row-fluid .my-column-3 (at minimum) which is adding a coupling that means nothing and may actually confuse anyone reading the code. Big no no when thinking about CSS maintainence and modularization.

I've decided, for the time being, to use a few !important tags (much against my better judgement) as I hope the lack of coupling is a little more helpful to me at this iteration. Hell, they're only going to be needed until I go through and refactor out all the Twitter Bootstrap code.

My overall feeling about Twitter Bootstrap? The gains in the short run are lost many time over in the long.

## Load fast, then load the rest.
#### 14/June/2012

*Making sure your page loads fast is important*. There are lots of optimisations you can do server side however when dealing with an external sources (e.g. feed) you are never going to be fast. With that in mind I've decided that loading all my external feeds are absolutely unnecessary for an initial load and can be passed across to the user later. All of this assumes the user is running JavaScript and for my purposes, that's OK.

I've started using JavaScript to to load my feeds (Twitter + Instagram) once the user is already reading the site. Once my standard JS initial complete (setting up UI & any user callbacks that are required) I throw off a few requests. To do this in a very trivial way you can use straight HTML and jQuery:

	$(document).ready(function() {

	// Run all init functionality first
		// ..

		// Load the data required for filling in my third party data and put it where it belongs
		$('.last-fm-feed').load("/feed/lastfm", function() {
			$('.last-fm-feed').slideDown();
		});

	}

In the above code I'm throwing a request back to my own server as I run my feed cache (as described in a previous blog post) to make sure I don't hit third party servers that often. The request will return some basic HTML which is pushed to the right location in the DOM.

This simple process that speed up the initial load of all pages considerably. You can also take this one step further and throw this data into a localStorage cache will means they don't even need to hit the server, and be loaded nearly instantly with the page display.

In my real-life situation I'm using a more complicated verison which grabs JSON and builds HTML directly in the JavaScript rather than rolling with some HTMLr returns. I might even go into more details here soon.

## Having a single DB connection with Express.js and route file seperation
#### 22/May/2012

In the process of setting up my MongoDB connection for storing the content of my site (which will be an early step for building the CMS) I realized I was going to need access to my db object in all of my routes. Having the routes split up into multiple files /rotes/index.js and /routes/feeds.js it became obvious that I would need to pass the data to my routing functions.

To start with we need to define the connection and common schema in the app.js file:

	mongoose.connect('mongodb://localhost/jimmy-hillis-me',
		function(err) {
  		if (err) {
		    console.log("Failed to connect to MongoDB");
  		}
		}
	);

	// Define common schema
	var Schema = mongoose.Schema;
	mongoose.model('Pages', new Schema({
		'title': String,
		'copy': String,
		'order': Number
	}));
	app.set('db', mongoose);

Code is easy to follow but we're connecting to the local MongoDB server and the jimmy-hillis-me database. We can then define our schema (without being in a callback due to the caching features of Mongoose). The Pages schema is a simple content setup we'll use in every route. Then we set it to be an app variable so we can pass the app to build the local context.

Now in my routes file (/routes/index.js) we'll convert the entire process into a function.

	var controller = {};
	module.exports = function (app) {
		db = app.set('db');
		return controller;
	}

With this simple change we're allowing context to be passed into the controller object. We add all public routes to the controller object instead of directly to exports now.

	controller.index = function(req, res) {}

They now have access to db and app and we're good to go. Here's a quick example of using the db in a route to grab some content with Mongoose:

	Pages = db.model('Pages');
  Pages.findOne({ 'title' : 'Contact' },
		function(err, this_page) {
			if (err) {
				console.log("Loading content error");
			}
			content = _parseMarkdown(this_page.copy);
			res.render('contact',
				{ title: this_page.title, content: content }
			)
  });

We're simply pulling our Pages schema out of the Mongoose models and then running a simple find query to pull out the page we want. With that I'm parsing the markdoown copy and the title to the view and we're done.

These changes enable us to keep our app well formatted as well as allowing us access to a single database variable without needing to recreate it each route. Alternatively we could build a database singleton script which is required in each route but I've found using a closure and this method makes more sense with JavaScript scope.

## Having a single DB connection with Express.js and route file seperation

In the process of setting up my MongoDB connection for storing the content of my site (which will be an early step for building the CMS) I realized I was going to need access to my db object in all of my routes. Having the routes split up into multiple files /rotes/index.js and /routes/feeds.js it became obvious that I would need to pass the data to my routing functions.

To start with we need to define the connection and common schema in the app.js file:

	mongoose.connect('mongodb://localhost/jimmy-hillis-me',
		function(err) {
			if (err) {
				console.log("Failed to connect to MongoDB");
			}
		}
	);

	// Define common schema
	var Schema = mongoose.Schema;
	mongoose.model('Pages', new Schema({
		'title': String,
		'copy': String,
		'order': Number
	}));
	app.set('db', mongoose);

Code is easy to follow but we're connecting to the local MongoDB server and the jimmy-hillis-me database. We can then define our schema (without being in a callback due to the caching features of Mongoose). The Pages schema is a simple content setup we'll use in every route. Then we set it to be an app variable so we can pass the app to build the local context.

Now in my routes file (/routes/index.js) we'll convert the entire process into a function.

	var controller = {};
	module.exports = function (app) {
		db = app.set('db');
		return controller;
	}

With this simple change we're allowing context to be passed into the controller object. We add all public routes to the controller object instead of directly to exports now.

	controller.index = function(req, res) {}

They now have access to db and app and we're good to go. Here's a quick example of using the db in a route to grab some content with Mongoose:

	Pages = db.model('Pages');
	Pages.findOne({ 'title' : 'Contact' },
		function(err, this_page) {
			if (err) {
				console.log("Loading content error");
			}
			content = _parseMarkdown(this_page.copy);
			res.render('contact',
				{ title: this_page.title, content: content }
			)
		}
	);

We're simply pulling our Pages schema out of the Mongoose models and then running a simple find query to pull out the page we want. With that I'm parsing the markdoown copy and the title to the view and we're done.

These changes enable us to keep our app well formatted as well as allowing us access to a single database variable without needing to recreate it each route. Alternatively we could build a database singleton script which is required in each route but I've found using a closure and this method makes more sense with JavaScript scope.

## Cache JSON responses from external APIs

I decided to write a really simple file-cache for my feed's just to check out the FS functionality within nodejs. My plan was simple: check if there is a cache file (which isn't too old) and use it. If there isn't one hit the third party and pull down the information I need. Cache it to a flat file. Use it. **Easy!**

To use the nodejs file system functionalit you pull it in as per usual:

	var fs = require('fs')

Once you've got access to it you have a wealth of system level functionality built in. I decided to do everything with the FS in non-block asyc mode which complicates things slightly, but is in line with the nodejs principals.

	fs.stat(cache_path, function(err, stat) {

		// The file exists so we can compare
		// when it was last updated
		if (!err) {
			cache_time = stat.mtime;
			if ((now_time.getTime() - cache_time.getTime())
				> res.app.settings['external_cache_time']) {
					cache_overdue = true;
			}
		}

		if (!err && !cache_overdue) {
			// Read the cache file to extract the response data
			fs.readFile(cache_path, 'ascii', function(err, data) {
				// do what you need to do with the data!
				// do some more error checking too!
			});
		}
	});

While it looks a little long-winded it's extremely simple code to follow. We check if the file exists by running a stat. If the file exists we then check if it's *too old* (which is a system level setting). If it's not too old we open the file and use the cache version.

Obviously if it's not there or it's overdue then you make a API call as per normal. The only difference is to save the file to the cache when you get a response:

	// Cache the file for future use
	fs.writeFile(cache_path, data, function() {
		console.log('Instagram cache saved!');
	});

I'm going to convert all of this to a MongoDB in the next few days but for now it was a good test to see how easily you could deal with files using nodejs. You can see the full list of [fs functionality](nodejs.org/api/fs.html) on the [nodejs docs](http://nodejs.org/api/).

## I'm not a server guy.. normally!

The first time I used any unix OS was in university. I was a massive fan of the terminal throughout my 4 years of study. After I graduated I got a Mac, started developing websites and never truly found my love of unix again.

I spend a decent amount of my work-life in a Terminal - generally smaller stuff with moving files around servers, dealing with GIT, and other CLI apps. Nothing too serious -- I know how to use some *vi* commands and I know how to ssh myself into a mess.

The last few months I've seen myself working more and more closely with the server, writing some bootstrap code and dealing with some tools for building websites faster. With the nodejs stuff I've finally taken the plung and bought myself access to a slice for hosting my own projects and to have as a playground.

My first task today was to setup my Linode slice and get it all prepped for some basic usage. I was able to quickly, and easily, setup the distro, sort out some basic security (disable all, ssh with key access only, no root ssh access, firewall, etc.). I know how it all works (deal with it on a daily basis in the office) but the guide provided by Linode is hands-down the most clear Lunix "guide" to setting up a server I've seen. I highly recommend it, even as a quick read on how to set some baisc tools in unix should be described: [Linode Library](http://library.linode.com/securing-your-server)

From there I needed to install nodejs, and after having a nightmare of a time on the QNAP yesterday I was able to do this with little issues. We need to compile the source so to begin with we make sure all required tools are installed:

	apt-get install build-essential openssl libssl-dev pkg-config

From here we're good to grab the latest nodejs source (check the [website](http://nodejs.org) unzip and check the configuration.

	wget http://nodejs.org/dist/v0.6.17/node-v0.6.17.tar.gz
	tar xzvf node-v0.6.17.tar.gz
	cd cd node-v0.6.17/
	./configure

I had a minor problem with nodejs not finding openssl (due to missing the pkg-config that nodejs uses) which I've added to my intital apt-get command. Once it's happy we make and install this baby:

	make
	make install

Voila! v8, nodejs, and npm all installed and ready for action.

## Setting up Last.fm Feed with

I wanted to pull my Last.fm recently played list directly from the Last.FM API and display it as an aside on this site. To do this I wanted to use a nodejs package, if possible. Luckily there is a simple one that was created a few years back I found on NPM and [github](https://github.com/jammus/lastfm-node)

I used npm to install the package regardless:

	npm install lastfm-node

I wanted to build a route that automatically ran the API calls and cached the return from last-fm (on some time basis) and then use a jQuery to pull the request after the page was loaded. No one should wait for your last.fm feed (or twitter or any other self-involved content) for the real content.

To do this I created a new last-fm route that would return my latest listens in a format I wanted as JSON. I created a new route as per standard Express:

	exports.lastfm_feed = function (req, res){ };

I then used the Last.FM package to make a request an dpull the results I was after.

## Markdown formatting with Jade + Express

I've decided to write this blog purely with Markdown text (http://daringfireball.net/projects/markdown/) which has become a new love of mine over the last few months. It just allows me to worry about basic text without any formatting woes. If I want a few basic tools (lists, emphasis) I can do all of that easily, without any GUI.

I'm using iA writer (http://itunes.apple.com/us/app/ia-writer/id439623248?mt=12) to do my writing as the GUI is extremely simple, it looks great, and it works on all of my devices (over iCloud or Dropbox) whrever I happen to be.

I wanted to get the "blog" up and running on my website so I needed to be able to take a direct copy of the .md file (can even pull it from Dropbox, which I may implement soon) and push that out as formatted HTML.

Node.js doesn't have any default Markdown support however there are plenty of tools already built. I happened across markdown-js first, so that's what I used. I don't imagine it's the best, but for now it's fine.

Jade supports Markdown within it's filter system so you can easily do some basic Markdown to HTML formatting like so:

	div.copy
		:markdown
			*THIS* is markdown!

Which will build the following HTML:

	<div class="copy">
		<em>THIS</em> is markdown!
	</div>

Unforunately to use have the content directly in a variable doesn't work directly within Jade. This is a major shame, but from what I've read there is no non-programatic solution. Fine!

All you need to is compile the Markdown as HTML before passing the content. This was a trivial matter using the _markdown-js_ function that I mentioned.

	npm install markdown
	npm install -g markdown

That installs markdown and all required dependencies onto your machine. Now the code to open the file and convert:

	var fs = require('fs')
	, markdown = require('markdown').markdown;

	try {
		var blog = fs.readFileSync(__dirname + '/../public/blog.md', 'ascii');
	} catch (err) {
		console.log("Error loading the Blog file");
	}

	blog = markdown.toHTML(blog);

You'll see two main pieces. First we open and read the Markdown file using the fs (file system) Node.js methods and then we convert the Markdown string to HTML. The _markdown-js_ setup is a little strange in that there is an Object within Markdown called markdown which has all the methods, but for now it does exactly what I needed. With that I pass the variable to my view and display it, without escaping, the HTML like so:

	.copy !{blog}

This creates a <div> with the Markup HTML within.

## Twitter Bootstrap, installation and basics

I decided this morning to quickly get a few style issues sorted out. I've been meaning to look at a few CSS/HTML frameworks to get a feel for others code so decided to use the Twitter bootstrap on this site, at least initially.

Installation is easy: download the bootstap archive and drop the CSS and JS files where you need them. I've done that in my new express app in public/stylesheets/ and public/javascripts which could easily be added to my app layout.jade:

	link(rel='stylesheet', href='stylesheets/bootstrap.min.css')
	script(src='javascripts/bootstrap.min.js')

I also decided to fall back on the HTML5 Boiler Plate and found a simple conversion from plain HTML to Jade which allowed me to get it up and running immediately.

With all that installed I started building my Views through the layoute.jade (basic layout) as well as my route views. I've currently built the basic blocks for 4 pages and initial positining for aside elements.

My current plans for the site:

1. Build initial pages and allow for simple HTML markup.
2. Build a database model system for storing a few simple pieces of content through my new CMS idea.
3. Build Refléter CMS which will allow me to edit all the content on the page, based on templates, without any need for models.

## Initial installation of node.js and express

I decided after doing research to build my own personal blog and folio website using node.js. It was enough process to get it all up and running and a very basic template for my site setup. I've decided to do everything in a very agile method. My basic plan includes building a modular website that will allow me to add and swap content that I deem useful to ahve on my site. While it is a folio site at it's core, it's hardly the main feature. I want to allow myself to express what I'm currently learning as well as what I'm spending my time on. Initially I will have the following strcuture:

1. *Folio*: A list of all the work that I'm proud of and willing to show off to the world.
2. *Lab*: A list (and examples) of projects that I'm working on. It's my environment to quickly prototype and show off little things that take my fancy.
3. *Timesinks*: My directly non-work related interestes which will include things like my last.fm feed, twitter, instagram and so forth. This section will likely change all the time.

To get the project started I needed to install Node.js which was a simple matter of downloading and installing the Mac package from the website. This also gives me access to the NPM package system for installing more Node code. From here I installed express and a few other features to start my first experiement.

	npm install express

I've started a new folder structure for all my Node work, at least for now.

	xx/node_modules/xx
	xx/node/jimmy.hillis

With express I was able to bootstrap my first site

	$ node_modules/express/bin/express jimmy.hillis

This method build my basic express app file stucture and enough code to get me started. From there I quickly did some reading on th express documentation (http://expressjs.com/guide.html) and built a few routes and a few views.

To build a route was extremely simple and I was able to retrofit some code they already provided for a few more routes.

The views are equally simple and, by default, make use of Jade templates (an extension of haml). Having never used the templates I figured I may as well give them a go and it was smooth sailing. They aren'y exactly difficult to follow and use a very abstract tab-delimited system to build html. For example to build a basic page:

	body
		div.mainwarp
			h1 This is my header
			p This is a great looking page!

This will build some very simple markup:

	<body>
		<div class="mainwrap">
			<h1>This is my header</h1>
			<p>This is a great looking page!</p>
		</div>
	</body>

A few things I really like is the simple way of chaining class and id properties after the element.

	div#component.this-class.active

Is very short and simple and straight to the point.

Having no need to closing tags (though you can manually close them yourself if you want) is a boon as well, saving a huge amount of time and effort. Using tabs and returns also forces the templater to write nicely formatting code.
