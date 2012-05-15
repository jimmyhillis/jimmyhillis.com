COMIC BOX
=========

###PURPOSE

This vanilla JavaScript app is a testing bed for me to practice my JavaScript skills while studying and learning about the language and the past practices within that. It's applicative purpose is to be a working and persistant Comic Book tracking system that maps series, issues, etc. using pure JavaScript, JSON storage and localStorage.

###API

The basic JSComicBox app supports a number of functions that can be used within any user interface that you've built. The current public API consists of the following methods.

##### listSeries ()

	Outputs an HTML markup of all series in the database
	@return this
	@chainable

##### addSeries (name, year, publisher)

	Creates and adds a new Series to the current database
	@param name {String} The name of this series
	@param year {Number} The year this series started
	@param publisher {Object} The publisher of this series
	@return new Series object

##### findSeries (title, Series)
	
	Searches existing Series for a matching title
	@param title {String} Entire specified title in the Name [YYYY] format
	@return Series object if found false if not

##### sortSeries (by)

	Orders the comic series database in order by the supplied property
	@param field {String} ["name", "year"]
	@return this
	@chainable

##### addComic (Series, Comic)
	Adds a Comic to the specified Series within your database
	@param series {Series Object} The series this new issue belongs too
	@param issue {Number} The issue number of this comic
	@return new Comic

##### commit ()
	Saves the current database to localStorage for persistence 
	@return this
	@chainable