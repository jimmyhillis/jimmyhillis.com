/**
 * JS COMIC BOX
 * 
 * This is a practice application that allows me to
 * build and work through a basic Comic Book database
 * made up of a number of Objects which are linked 
 * together. The purpose being the ability to propagate
 * and load all related comics. 
 * 
 * @author Jimmy Hillis <jimmy.hillis@me.com>
 * @see https://github.com/jimmyhillis/comicbox.js
 * @version 0.1
 * @update 19/03/2012
 */

// Default settings for loading the JSComicBox app
var s = { 'output_element': 'dbcontent' };

/**
 * The COMICBOX is a global utility for managing
 * a database of Comic Books.
 */
var COMICBOX = (function JsComicBox(settings) {
	"use strict";
	
	var output, clear, Comic, Series,
		
		// private variables
		comics = [], // array of comics in your personal
		comic_series = [],

		// public object
		comicbox = { }; // array of comic series e.g. Amazing Spider-Man (1999)

	comicbox.version = "0.1";
	comicbox.author = "jimmy.hillis@me.com";
	comicbox.output_element = "dbcontent";

	// Function allows me to write simple markup (generally HTML) to the browser
	// for client + testing purposes
	output = function (str, element) {
		var content = document.getElementById(comicbox.output_element);
		var element = document.createElement('p');
		element.innerHTML = str;
		content.appendChild(element);
	}

	// Clears the current database markup with nothing
	clear = function (element_id) {
		
		// DOM element to clear
		var element; 

		if (typeof element_id === "undefined") {
			element_id = comicbox.output_element;
		}

		element = document.getElementById(element_id);
		element.innerHTML = '';
	}

	/* == OBJECT TYPES FOR COMIC BOX == */

	// Comic constructor
	Comic = function (issue, month, year, writer, penciller) {
		this.issue = parseInt(issue,10) || 1;
		this.month = parseInt(month,10) || 1;
		this.year = parseInt(year,10) || 1969;
		this.writer = writer || "";
		this.penciller = penciller || "";
	}
	// Return the title of the comic issue based on SERIES #ISSUE {YEAR}
	Comic.prototype.getTitle = function () {
		return '#' + this.issue + ' ' + this.month + '/' + this.year;
	};

	// Comic series constructor {e.g. The Amazing Spider-Man (1999)}
	Series = function (name, year, publisher) {
		this.name = name;
		this.year = year;
		this.publisher = publisher;
		this.comics = [];
	};
	
	// Returns the complete title for this Series (e.g. Avengers (2011))
	Series.prototype.getTitle = function () {
		return this.name + ' [' + this.year + ']';
	}

	// Determines the equality of 2 series objects
	Series.prototype.isEqual = function (series) { 
		if (this.constructor !== "Series") {
			return false;
		} else if (this.getTitle() === series.getTitle()) {
			return true;
		};
		return false;
	}

	// Adds a new Comic to the current series
	Series.prototype.addComic = function (comic) {
		// Confirm param is a Comic object
		if (typeof comic !== "object") {
			return false;
		} else if (!(comic instanceof Comic)) {
			return false;
		};
		// Add the comic object to this Series array of scomics
		this.comics.push(comic);
		this.sortComics();
		return this;
	}

	// Sort the current comics by numeric order
	Series.prototype.sortComics = function sortComics() {
		this.comics.sort(byIssue);
	}

	// Returns a {String} list of all current Issues of this Series
	// This list depicts the numbers in a logical numeric order with -
	// representing a range of issues e.g. 1-3 means you have issues 
	// 1, 2, and 3 within your collection.
	Series.prototype.listComics = function listComics() {
		
		var i, sequential = false, issues = "";

		for (i = this.comics.length; i--;) {
			
			// First entry, just list it otherwise run checks
			if (i === (this.comics.length - 1)) {

				issues = "#" + this.comics[i].issue;

			} else {

				// If this issue is in sequential order of the last one based
				// on the comics ISSUE NUMBER then start the sequence
				if ((this.comics[i].issue - this.comics[i+1].issue) === 1) {
				
					// This is the 2nd sequenced number, put a - in
					if (!sequential) {						
						sequential = true;
						issues = issues + "-";
					} 

					// If this is the last in the record you must list it
					// regardless of anything, this is to catch a new sequence 
					// on the final issue
					if (i === 0) {
						issues = issues + this.comics[i].issue;
					}
				
				// This issue is NOT in sequence with the last
				} else {
				
					// Break the last sequence and end the final
					// number before this issue
					if (sequential) {
						issues = issues + this.comics[i+1].issue + ' ';
					}

					// Add a new issue with a comma to separate the last
					// issue or the last sequence
					issues = issues.trim() + ", " + this.comics[i].issue;
					sequential = false;
				
				} // end sequenced comics

			} // end first or other comic
	
		}; // end loop through all this series comics

		return issues;
	}

	// == TEMPLATES FOR MARKUP == //

	Series.templates = [];
	Comic.templates = [];

	Series.templates['single'] = Handlebars.compile("{{name}} [<em>{{year}}</em>] - {{comics.length}} issues <br /> listComics");
	Series.templates['all'] = Handlebars.compile("<ul>{{#each comic_series}}<li><span class=\"series_title\">{{this.getTitle}}</span> <span class=\"icon deleteAction\">I</span> <div class=\"comics\"> {{this.comics.length}} issues. {{this.listComics}}</div></li>{{/each}}</ul>");
	Comic.templates['single'] = Handlebars.compile("{{../name}} #{{issue}}");

	/* == COMIC BOX PUBLIC METHODS == */

	// Creates and adds a new Series to the current database
	// @param name {String} The name of this series
	// @param year {Number} The year this series started
	// @param publisher {Object} The publisher of this series
	// @return new Series object
	comicbox.addSeries = function (name, year, publisher) {
		
		var new_index, new_series, i;
		
		// Create a new Series object
		new_series = new Series(name, year, publisher);
		// Check if series already exists, and return that if so
		for (i = comic_series.length; i--;) {
			if (comic_series[i].isEqual(new_series)) {
				console.log('It\'s here, so lets not bother!');
				return comic_series[i];
			}
		}
		// Not found, add a new one
		new_index = comic_series.push(new Series(name, year, publisher));
		new_series = comic_series[new_index-1];
		this.sortSeries();
		return new_series;
	}

	comicbox.removeSeries = function (name, year, publisher) {

		var series_id;

		series_id = comicbox.findSeriesID(name);
		if (series_id) {
			console.log('I have it... I think!');
			comic_series.splice(series_id,1);
		}
		else {
			console.log('Cannot find it!');
		}

		return comicbox;

	}

	// Searches existing Series for a matching title
	// @param title {String} Entire specified title in the Name [YYYY] format
	// @return Series object if found false if not
	comicbox.findSeries = function (title, exact) {
		return comic_series[comicbox.findSeriesID(title, exact)];
	}

	// Searches existing Series for a matching title
	// @param title {String} Entire specified title in the Name [YYYY] format
	// @return Series object if found false if not
	comicbox.findSeriesID = function (title, exact) {
		
		var i;
		exact = exact || false;
		
		for (i = comic_series.length; i--;) {
			if(!exact) {
				if (comic_series[i].getTitle().toLowerCase() === title.toLowerCase()) {
					return i;
				}
			} else {
				if (comic_series[i].name.toLowerCase().indexOf(title.toLowerCase()) !== -1) {
					return i;
				}
			}
		}
		return false;
	}

	// Orders the comic series database in order by the supplied property
	// @param field {String} ["name", "year"]
	// @return this
	// @chainable
	comicbox.sortSeries = function (field) {
		
		field = typeof field !== "undefined" ? field : "name";
		
		// Sort the Comic Series array by supplied field
		switch(field) {
			case "name":
				comic_series.sort(byName);
				break;
			case "year":
				comic_series.sort(byYear);
				break;
			default:
				break;
		}
		return this;
	}

	var byYear = function (a, b) {
		if (a.year < b.year) {
			return 1;
		} else if (a.year > b.year) {
			return -1;
		} else {
			return 0;
		}
	};
	var byName = function (a, b) {
		if (a.getTitle() > b.getTitle()) {
			return 1;
		} else if (a.getTitle() < b.getTitle()) {
			return -1;
		} else {
			return 0;
		}
	};
	var byIssue = function byIssue(a, b) {
		if (a.issue < b.issue) {
			return 1;
		} else if (a.issue > b.issue) {
			return -1;
		} else {
			return 0;
		}
	}

	// Outputs an HTML markup of all series in the database
	// @return this
	// @chainable
	comicbox.listSeries = function (with_comics) {
		
		var list = "";
		with_comics = with_comics || true;

		list = Series.templates['all']({'comic_series': comic_series});
		clear();
		output(list);

		return this;
	}

	// Adds a Comic to the specified Series within your database
	// @param series {Series Object} The series this new issue belongs too
	// @param issue {Number} The issue number of this comic, this can be a 
	// sequence or list of issues (eg. 1,2-3,4) which would add issues 1-4
	// @return new Comic
	comicbox.addComic = function (title, issue) {

		var series = {}, 
			new_comic = {},
			matches,
			i, j, issue_numbers, low, high;

		// Validate input
		if (!title || !issue) {
			return false;
		}

		// Look for an index and load the actual Series
		if (typeof title === "string") {
			series = this.findSeries(title);
		} else {
			return false;
		}

		// Confirm the issue format doesn't contain any non-expected characters
		// ONLY allows numbers 1-9 or commas or hyphen characters
		if (/^([1-9\-\,])+$/.test(issue) === false) {
			alert('Bad user input!\nYour input can only be numeric 1-9 characters separated by a (,) or sequened by a (-)');
			return false;
		}

		// Split the provided issues up by each sequence break
		issue_numbers = issue.split(',');

		// Go through each provided "sequence" of issues
		i = issue_numbers.length
		for (i; i--;) {
			
			// If this sequence is a single issue add it as is
			if (/^[0-9]+$/.test(issue_numbers[i])) {
				
				new_comic = new Comic(issue_numbers[i]);
				series.addComic(new_comic);

			// Add each issue between the two provided
			} else {

				// Look for a range of issues
				matches = issue_numbers[i].split('-');

				// Confirm there is only one specific sequence provided
				if (matches.length === 2) {

					// Work out which is the highest and lowest to loop through
					if(parseInt(matches[0],10) > parseInt(matches[1],10)) {
						high = matches[0];
						low = matches[1]; 
					} else {
						high = matches[1];
						low = matches[0];
					}

					// Add each number within the sequence from low to high
					for (low; low <= high; low++) {
						new_comic = new Comic(low);
						series.addComic(new_comic);
					}
					
				} else {
					
					alert('Bad user input!\nYou can only have 2 numbers surrounding a single (-) character!');
					return false;

				}

			}

		}

		return comicbox;
	
	} // end addComic

	// Saves the current database to localStorage for persistence 
	// @return this
	// @chainable
	comicbox.commit = function () {
		if (comic_series.length > 0) {
			localStorage.setItem('comic_series', JSON.stringify(comic_series));
		}
		if (comics.length > 0) {
			localStorage.setItem('comic', JSON.stringify(comics));
		}
		return this;
	}

	// Launch initial comic box functionality and list
	comicbox.init = function () {
		var i = 0, 
			series = {},
			comic = {}, 
			comic_data = {},
			comics_count = 0;

		// Search for existing database within localStorage
		if (localStorage.getItem('comic_series')) {
			console.log('Loading existing database from localStorage.');
			JSON.parse(localStorage.getItem('comic_series')).forEach(function (element, index) {
				series = new Series(element.name, element.year, element.publisher);
				for(i = element.comics.length; i--;) {
					comic_data = element.comics[i];
					comic = new Comic(comic_data.issue, comic_data.month, comic_data.year, comic_data.writer, comic_data.penciller);
					series.addComic(comic);
				}
				comic_series.push(series);
			});
		} 
		// Nothing found, so create a basic example database
		else {
			if(confirm('No DB exists, should I create some demo data for you?')) {
				comic_series.push(new Series('Uncanny X-Men', 1969, 'Marvel'));
				comic_series.push(new Series('Fantastic Four', 1962, 'Marvel'));
			}
		}
		this.sortSeries().listSeries();
	};

	return comicbox;

}(s));

COMICBOX.init();