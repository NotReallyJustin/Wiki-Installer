const HTMLParser = require('node-html-parser');
const https = require('https');

const WIKILINKS = [
	'https://hspf.debatecoaches.org/'
];

//This database contains all file objects
database = [];

class File {
  constructor(link, month, text) {
    this.link = link;
    this.month = month;
    this.text = text;
  }
}

//Top level fetch
module.exports.wikiFetch = () => new Promise((resolve, reject) => {
	let asyncThreads = [];

	for (var i in WIKILINKS)
	{
		asyncThreads[i] = fetchSchool(WIKILINKS[i]);
	}

	Promise.allSettled(asyncThreads).then(() => {
		console.log("resolved")
		resolve();
	});
});

//Fetch each school available in the wiki
const fetchSchool = (wikiLink) => new Promise((resolve, reject) => {
	let threads = [];
	https.get(wikiLink, response => {
		var chunk = "";

		response.on('data', data => {
			chunk += data;
		});

		response.on('end', () => {
			var document = HTMLParser.parse(chunk);
			let schoolLinks = Array.from(document.querySelector('.Schools').querySelectorAll('.wikilink'));

			for (var i in schoolLinks)
			{
				threads[i] = fetchDebater(wikiLink.substring(0, wikiLink.length - 1) + schoolLinks[i].querySelector('a').getAttribute('href'), wikiLink);
			}

			Promise.allSettled(threads).then(() => {
				resolve();
			});
		});

	}).on('error', err => {
		console.error(err);
		reject();
	});
});

//Find le debater - we'll also use this step to just find all the aff and neg stuff
const fetchDebater = (schoolLink, wikiLink) => new Promise((resolve, reject) => {
	let threads = [];
	console.log(schoolLink)

	https.get(schoolLink, response => {
		var chunk = "";

		response.on('data', data => {
			chunk += data;
		});

		response.on('end', () => {
			var document = HTMLParser.parse(chunk);
			let thingy = Array.from(document.querySelector('.grid').querySelectorAll('.wikilink'));

			for (var i in thingy)
			{
				//Node HTML uses bootleg href so we need to manually add the thing and carry it through functions >:(
				//Wiki link is necessary bc the href thing actually just returns the school link again, so we have 2 of them we don't need smh
				threads[i] = fetchFiles(wikiLink.substring(0, schoolLink.length - 1) + thingy[i].querySelector('a').getAttribute('href'));
			}

			Promise.allSettled(threads).then(() => {
				resolve();
			});
		});
	})
});

//Fetches file links in an aff or neg link, and then proceeds to DB that
const fetchFiles = (sideLink) => new Promise((resolve, reject) => {
	console.log(sideLink)
	https.get(sideLink, response => {
		var chunk = "";

		response.on('data', data => {
			chunk += data;
		});

		response.on('end', () => {
			var document = HTMLParser.parse(chunk);
			
			var docArray = joinEO(document, '#tblCites');

			for (var item of docArray)
			{
				var arr = item.querySelector('div').querySelector('div').querySelectorAll('p');
				var txt = "";
				for (var thing of arr)
				{
					txt += thing.textContent.replace("  ", "\n");
				}

				database.push(new File(null, item.querySelectorAll('td')[1].textContent, txt));
			}

			var openArray = joinEO(document, '#tblOpenSource');

			for (var item of openArray)
			{
				var link = item.querySelector('.wikiexternallink').querySelector('a').getAttribute('href');
				database.push(new File(link, item.querySelectorAll('td')[1].querySelector('p').textContent, null));
			}

			resolve();
		})
	})
});

//Takes a table ID, and gives you the tr that has even and odd classes inside an array
const joinEO = (document, tableId) => {
	var a = document.querySelector(tableId).querySelectorAll('.even');
	var b = document.querySelector(tableId).querySelectorAll('.odd');

	return [...a, ...b];
}

module.exports.getDatabase = () => database;