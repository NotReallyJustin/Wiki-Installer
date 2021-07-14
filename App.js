	const HTMLParser = require('node-html-parser');
	const https = require('https');
function b()
{
	const Database = require("./Database.js");
 
	//First have it go through Database parser so we kinda know the info
	Database.wikiFetch().then(() => {
		console.dir(Database.getDatabase());
	});
}

function a() {
	const HTMLParser = require('node-html-parser');
	const https = require('https');

	class File {
	  constructor(link, month, text) {
	    this.link = link;
	    this.month = month;
	    this.text = text;
	  }
	}

	database = [];

	https.get('https://hspf20.debatecoaches.org/Bergen%20Academies/Chun-Kreibich%20Aff', response => {
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
					var txt = "";
					for (var thing of arr)
					{
						txt += thing.innerHTML.replace(/<br>/gm, '\n').replace(/&nbsp;/gmi, ' ');
					}

					database.push(new File(null, item.querySelectorAll('td')[1].textContent, txt));
				}

				var openArray = Array.from(document.querySelector('#tblOpenSource').querySelectorAll('tr')).slice(1);

				for (var item of openArray)
				{
					var link = item.querySelector('.wikiexternallink').querySelector('a').getAttribute('href');
					database.push(new File(link, item.querySelectorAll('td')[1].querySelector('p').textContent, null));
				}
				console.dir(database)
			}
			catch(err)
			{
				console.error(err);
			}
		});
	})
}

i=0;
cont = true;
function c() {
	https.get('https://hspf20.debatecoaches.org/Bentonville/Beck-Brumbelow%20Aff', response => {
		i++;
		var chunk = "";

		response.on('data', data => {
			chunk += data;
		});

		response.on('end', () => {
			if (cont)
			{
				console.log('ok')
				try
				{
					var document = HTMLParser.parse(chunk);
					var docArray = Array.from(document.querySelector('#tblCites').querySelectorAll('tr')).slice(1);
					//console.log(chunk.toString())
				}
				catch(err)
				{
					cont = false;
					console.log("nope at " + i);
					console.dir(response.headers)
					console.error(err);
				}
			}
		});
	}).on('error', err => {
		console.error('Error thing at ' + i);
		console.error(err);
	})
}

function e() {
	for (var i=0; i < 1500; i++)
	{
		//c();
		setTimeout(c, 400 * i);
	}
}

//e();
b();