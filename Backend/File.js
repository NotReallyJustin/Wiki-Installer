module.exports.File = class {
	constructor(link, date, text, name) {
	  this.link = link;
	  this.date = date;
	  this.text = text;
	  this.name = name;

	  var splito = date.split('/');
	  this.month = splito[0];
	  this.day = splito[1];
	  this.year = splito[2];
	}

	lowerName() {
		return this.name.toLowerCase();
	}

	constructFile() {

	}
};