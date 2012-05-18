
/* 
 * Load required Routes for the site
 */

exports.index = function(req, res){
	var content;
	
	content = _parseMarkdown(__dirname + '/../public/content/index.md');
  res.render('index', { title: 'jimmy.hillis.me', blog: content })
};

exports.lab = function(req, res){
	var content;
	
	content = _parseMarkdown(__dirname + '/../public/content/lab.md');
	res.render('lab', { title: 'Lab', content: content })
};

exports.folio = function(req, res){
	res.render('folio', { title: 'Web folio' })
}

exports.contact = function(req, res){
	var content;
	
	content = _parseMarkdown(__dirname + '/../public/content/contact.md');
	res.render('contact', { title: 'Contact', content: content })
};

function _parseMarkdown(markdown_file) {

	var fs = require('fs')
		, markdown = require('markdown').markdown;

	try {
		var markdown_str = fs.readFileSync(markdown_file, 'ascii');
	} catch (err) {
		console.log("Error loading the Blog file");
	}

	return markdown.toHTML(markdown_str);

}