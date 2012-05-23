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
  });

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

## Apr/5th

I made some changes to the TWEETS application I've been working on to get it cacheing for a little imrpvoed speed. I intended to use localStorage (keeping with my JS only! guideline) to track my feed any time you reloaded a page -- at least for a time.

The process of using localStorage is a simple 2 part process:

1. Before I contact the Twitter API check if I have a cached version already (and if it's recent *enough* to be valid)
2. When I get a response from the Twitter API store it in locaLStorage for the next page load.

Pretty simple goals so to implement it I first had to rearrange the way the JSONP callback was working. Currently it simlpy calls the user provided callback with the response from Twitter. I needed something in middle to cache that response in a way that was useful to the TWEETS application. I ended up creating a new function called 

	passTweetsToCallback()

This private method takes the response from Twitter and does a few things. Firstly I add a timestamp to the response so that next time I load a page I know how old they are, don't wait to keep a single cache for weeks do we?

After that I simply stringify the response and throw it into localStorage.

	localStorage.setItem('TWEETS', JSON.stringify(cachedTweets));

I should have a better naming convention to allow for multiple feeds but for now there is no functionality to support that. It could be done as simply as appending the username to the localStorage variable but I think storing multiple feeds within an array within the single TWEETS has more legs -- less crowding of the localStorage keys pace.

After that I call the callback function with the response tweets. To do this my call back needed access to that function which is provided to getTweets. I don't have direct access so I set the call back as a hidden variale userCallback which is accessible throughout my application.

To check if this exists I run a few simple test. Check if the localStorage key for TWEETS exists and then make sure it's recent enough. I've used 3 hours as my base point as it's pretty reasonably to see a few tweets wthin a few hours, but shouldn't cause any damage if they aren't shown immediatley.

To do this I used the built in JavaScript data functions to build a new date and remove 3 hours from it. If the cache time is less than 3 hours old we can use the cache.

	var refreshCacheTime = new Date();
	refreshCacheTime.setHours(refreshCacheTime.getHours() - 3);
	if (cachedTweets.cachetime >= refreshCacheTime) {
		/* Great! Let's use the cache */
	}

These simple changes have increase the speed and decreased the depndencies on a third party greatly across a single session on any site that needs to hit Twitter. I've written this same functionality in PHP and stored it in a file but I like the simplicity and async nature of doing this with JavaScript.

## 20/Mar

localStorage was the main purpose of the code I was working on today. One of my biggest goals with this project was to creates a persistent database for each user through user side code. I needed a way to store each users data on their own machine without them knowing/doing anything.

Most modern browsers have support for localStorage which is simply a key/value based storage system that allows you to store 4mb worth of data. All data is stored as a string, no matter what.

I needed to store arrays of objects. To do this I needed only look at the JSON library for the following functions

	strngify()
	parseJSON()

With these two functions you are able to take any JSON (e.g. A JavaScript Object) and turn it into a string. ParsesJSON does the opposite.

Getting an array of object into localStorage was as trivial as:

	window.localStorage(comics.stringfy)));

To get the data out wasn't quite so easy. The main reason for that was simple. The parseJSON function returns an object but it doesn't return the methods, and therefore prototype/constructor of the Object that it was created from. As a simple solution I pulled each Object out of the array and through the data into my constructor function on each page load.

%%

## 23/Mar

Today's progress entailed a few simple additions to the code in hopes of getting through jsLint. This proved more difficult than I'd hoped or expected so I left the code with a few errors remaining. This was, for now, due to the cryptic nature of some of the errors which I was unable to process at the hour I ran through them.

## 24/Mar

I was able to write some more API functions for the app this morning as well as write a starting document to go with it. I've never used the Markdown style scripting text files that GitHub uses so I learned a few new tricks there. Most importantly how to style text with some very basic markdown. ## represents a title and any per tabbed content becomes code. Simple. Got all of the public functions commented within matching code on the site and README. Hopefully I will keep the updated and matching!

## 25/Mar

Today say me make a few larger feature changes in hopes of increasing the scope of the project. Most importantly I managed to write a nice method for sorting and displaying the issues collected within a given series. I wanted to make sure this formatting was as small and useful as possible. In the past I've found many sites list them 1, 2, 3 etc. A verbose and unnecessary way. I wanted to break them down into sequences where possible. 1-3, 5, 7-9 which I have done. This is through a looping method which moves through each issue. Within that issue is checks to see if it belongs in a sequence and builds a string based on that feature. Was harder than anticipated, due to the backwards movement of JS looping (done for efficiency).

I also started the process of incorporating a JS templating system for quicker, and nicer, markup from my App. I picked up and used Handlebars.js which is a very simple library for templating. It uses similar notation to Smarty with its {{}} notation and has a simple set of methods for compiling templates and providing data. It allows for basic looping and string replacement out of the box and plenty of room to build your own functions, none of which I've needed as yet. Currently the Templates are thrown into the App code however this will obviously need to be removed to keep any resemblance to a MVC structure in the coming days.

## 27/Mar

While I was finishing up some of the front end work on the app yesterday I wanted to incorporate my twitter feed into a footer section. Didn't want anything too fancy. Just a simple text feed (maybe some links) and nothing more. Obviously wantd to do an asynchronous JS setup to keep inline with the whole project. Seemed simple enough.

Unfortunately the Twitter provided stuff requires special markup and creates a lot of bloated HTML code to build a feed. After a quick look on GitHub without much luck I decided to build my own. I've done so in PHP before so this would be easy.

Basically up need to build a REST api call through a standard URL with a query string. It basically looks like:

	Api.twitter.com/xxxx.json?name=ppjim3

Now the problem at hand is that you can't use JS to make an Ajax call to a different server due to security restrictions (....). The solution is to use JSONP which allows you to circumvent this restriction by adding a new <script> tag which calls a global function (or sorts) on return with the Object wrapped inside. You basically get something like this in return.

	callback({ data: [{ tweet},{tweet},...])

Which calls a local function passing the data which you can use. Most JS frameworks have a JSONP function built in as there is no default support for it. I used a little gist %% which made a simple JSONP call with a callback function. I built a basic JS function called tweet.js which you can find on GitHub.

Fundamentally you create an object called TWTR and can call buildFeed(username, contentElement) which will build a simple HTML markup of the tweets. Alternatively you can pass a callback function which will be provided an array of Tweets using getTweets(username, callback).

## 30/Mar

My main goal today was to allow users to input issues in a sequence format smilar to the way I list comics. An example of this sequence would be

	1,3-5,8

This would add issues 1,3,4,5,8 into the database for a specific series which would increase the speed and usability for users.

To do this I ran a few string comparisons and regular expression for validating the input as well as to pull out the required information. I'm not particularly good at regular expressions (have attempted to teach myself on and off for years always forgetting bits and re-learning them as I go).

The basic process I'm using is to break the string down into relevant sequences and then acting upon them. First of all I validate the input to confirm there are no rogue characters. My acceptable character range is all numbers, commas, and hyphens. So a quick regex will validate that:

	/(^[1-9]\,\-)+/

That simple regular expression will return false if there are any non acceptable characters in the string. Simple starting point.

Next I split the string into valid blocks on the comma character so we can go through each single issue or sequence on its own. Using the above example:

	"1,3-5,8".split(',') // returns ["1","3-5","8"]

Great! Now we need to go through each new string and break it down further. If the string is a single number (has no hyphen) simply add that issue into the database as is. The harder case is when there is a hypen and we have a sequence! Okay let's split on that.

	"3-5".split('-') // ["3","5"]

Now we know what we're doing. Just a simple for loop that runs from the low number to the high number adding in all the issues inbetween.

	for (low; low <= high; low++)
		addComic(series, low)

That's the logic behind how I've got the sequencer working. There are a few other gotchas to be aware of though:

* Make sure the sequences are low to high, must order the array before doing the sequence slit.
* what if there is more than 1 hyphen in the sequence? Probably should throw it away however if you split the same after ordering and use the first and last element you will still get a valid entry, based on a correct if strange input.
* you could likely use a single regex to run through and parse the entire string for both elements however I find it a lot simpler and logical to break it down into 2 sub problems, even with the compounded loops.

## 31/March

Working on some minor changes today including:

* Made sure the comic search helper (for adding new comics) was case insensitive so you don't have to be so exact!
* added in some iconography using some OTF web fonts. A new and nice way to insure good support and easy management.