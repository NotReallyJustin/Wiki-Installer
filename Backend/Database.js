const HTMLParser = require('node-html-parser');
const https = require('https');
const { File } = require('./File.js');

const WIKILINKS = [
	//'https://hspf20.debatecoaches.org/'
	'https://hspf.debatecoaches.org/'
];

//Beating rate limiter
sent = 0;

//This database contains all file objects
files = [];
database = new Map();

//Top level fetch
module.exports.wikiFetch = () => new Promise((resolve, reject) => {
	//Temporarily exists to test out server
	//resolve();

	let asyncThreads = [];

	for (var i in WIKILINKS)
	{
		asyncThreads[i] = fetchSchool(WIKILINKS[i]);
	}

	Promise.allSettled(asyncThreads).then(() => {
		constructDatabase(sortFiles());
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
	sent++;

	setTimeout(() => {
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
					threads[i] = fetchFiles(wikiLink.substring(0, wikiLink.length - 1) + thingy[i].querySelector('a').getAttribute('href'))
				}

				Promise.allSettled(threads).then(() => {
					resolve();
				});
			});
		}).on('error', err => {
			console.error(err);
			reject();
		});
	}, 400 * sent);
});

//Fetches file links in an aff or neg link, and then proceeds to DB that
const fetchFiles = (sideLink) => new Promise((resolve, reject) => {
	sent++;
	let ent = sent;
	setTimeout(() => {
		https.get(sideLink, response => {
			var chunk = "";

			response.on('data', data => {
				chunk += data;
			});

			response.on('end', () => {
				try
				{
					var document = HTMLParser.parse(chunk);
					var docArray = Array.from(document.querySelector('#tblCites').querySelectorAll('tr')).slice(1);

					for (var item of docArray)
					{
						var arr = item.querySelector('div').querySelector('div').querySelectorAll('p');
						var name = sanitize(sideLink.split('/').pop().replace('%20', ' ') + item.querySelector('div').querySelector('span'));
						var txt = "";
						for (var thing of arr)
						{
							txt += sanitize(thing.innerHTML);
						}

						files.push(new File(null, item.querySelectorAll('td')[1].textContent, txt, name));
					}

					var openArray = Array.from(document.querySelector('#tblOpenSource').querySelectorAll('tr')).slice(1);

					for (var item of openArray)
					{
						var a = item.querySelector('.wikiexternallink').querySelector('a');
						files.push(new File(a.getAttribute('href'), item.querySelectorAll('td')[1].querySelector('p').textContent, null, sanitize(a.textContent)));
					}
				}
				catch(err)
				{
					console.error(`${err} at ${ent}`);
				}
				resolve();
			})
		}).on('error', err => {
			console.error(err + ` at ${ent}`);
			reject();
		})
	}, 400 * sent);
});

//We try to sanitize DOM stuff we fetched .-.
const sanitize = (dom) => dom.replace(/<br>/gm, '\n').replace(/&nbsp;/gmi, ' ').replace(/<span>/gmi, '').replace(/<\/span>/gmi, '');

module.exports.getDatabase = () => database;
module.exports.getFiles = () => files;

//Sorts the files in files[] alphabetically
//Hence when we just yeet this in the database map later, everything will be alphabetized
const sortFiles = (arr) => {
	if (arr == undefined) 
	{
		arr = files;
	}

	if (arr.length == 1 || arr.length == 0) 
	{
		return arr;
	}

	let left = sortFiles(arr.slice(0, Math.floor(arr.length / 2)));
	let right = sortFiles(arr.slice(Math.floor(arr.length / 2)));

	for (var l = 0, r = 0, i = 0; l < left.length || r < right.length; i++)
	{
		if (l >= left.length)
		{
			arr[i] = right[r];
			r++;
		}
		else if (r >= right.length || left[l].lowerName() < right[r].lowerName())
		{
			arr[i] = left[l];
			l++;
		}
		else //if right has lesser date or lesser lexicographic name
		{
			arr[i] = right[r];
			r++;
		}
	}

	return arr;
}

//Creates a "tree" like thing
//Map of year --> Map of month --> Map of Day --> Array of files
const constructDatabase = (sortedFiles) => {
	sortedFiles.forEach(file => {
		//Could use recursion here but like this method saves 5 lines of code
		database.has(file.year) || database.set(file.year, new Map());
		database.get(file.year).has(file.month) || database.get(file.year).set(file.month, new Map());
		database.get(file.year).get(file.month).has(file.day) || database.get(file.year).get(file.month).set(file.day, []);

		database.get(file.year).get(file.month).get(file.day).push(file);
	});
}

//Takes the params and returns an array with items that match the query available
module.exports.fetchFiles = (year, month, day, name) => {
	let ret = [];
	fetch(database, [year, month, day, name], 0, ret);

	return ret;
}

const fetch = (currMap, args, tierNum, ret) => {
	//tierNum 3 is an array instead of a map, so we need to adjust the recursion
	if (tierNum == 3)
	{
		if (args[3])
		{
			//Maybe to be fixed when the wiki blows up in user population, but the wiki contribution size on a given day is so smol
			//that O(n) is faster than by binary linear search thing from srs bot 🤔
			let regEx = new RegExp(`${args[3]}`, 'gmi');
			Array.prototype.push.apply(ret, currMap.filter(file => 
				regEx.test(item.replace(/-/gm, ' '))
			));
		}
		else
		{
			Array.prototype.push.apply(ret, currMap);
		}
	}
	else
	{
		if (args[tierNum])
		{
			fetch(currMap.get(args[tierNum]), args, tierNum + 1, ret);
		}
		else
		{
			for (var values of currMap)
			{
				fetch(values, args, tierNum + 1, ret);
			}
		}
	}
}