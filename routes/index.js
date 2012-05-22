/* 
 * Index controllers are used to build basic
 * content pages (with unique page designs) from 
 * my database.
 */

module.exports = function (app) {

	var controller = {};
	db = app.set('db');

	controller.index = function(req, res){
	  var content;

	  content = _parseMarkdownFile(__dirname + '/../public/content/index.md');
	  res.render('index', { title: 'jimmy.hillis.me', blog: content })
	};

	controller.lab = function(req, res){
		var content;
		
		content = _parseMarkdownFile(__dirname + '/../public/content/lab.md');
		res.render('lab', { title: 'Lab', content: content })
	};

	controller.folio = function(req, res){
		res.render('folio', { title: 'Web folio' })
	} // !controller.folio

	controller.contact = function(req, res) {

		var content = ""
			, Pages = db.model('Pages');

	  // Load the MD content for this page
	  Pages.findOne({ 'title' : 'Contact' }, function(err, this_page) { 

			if (err) {
				console.log("Loading content error");
			}

			content = _parseMarkdown(this_page.copy);
			res.render('contact', { title: 'Contact', content: content })

	  });
		
	}; // !controller.contact

	// Private methods

	function _parseMarkdown(markdown_str) {
		var markdown = require('markdown').markdown;
		return markdown.toHTML(markdown_str);
	}

	function _parseMarkdownFile(markdown_file) {
		var fs = require('fs')
			, markdown = require('markdown').markdown;

		try {
			var markdown_str = fs.readFileSync(markdown_file, 'ascii');
		} catch (err) {
			console.log("Error loading the Blog file");
		}

		return markdown.toHTML(markdown_str);
	} // !_parseMarkdownFile

  return controller;
}	