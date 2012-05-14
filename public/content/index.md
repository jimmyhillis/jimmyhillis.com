## Initial installation of node.js and express
### (12/May/2012)

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

## Twitter Bootstrap, installation and basics
### (13/May/2012)

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

## Markdown formatting with Jade + Express
### (13/May/2012)

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