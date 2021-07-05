const Database = require("./Database.js");

//First have it go through Database parser so we kinda know the info
Database.wikiFetch().then(() => {
	console.dir(Database.getDatabase());
});

/*const https = require('https');
https.get('https://hspf.debatecoaches.org/Basis%20Peoria/Lal-Parau%20Aff', response => {
	response.setEncoding('utf8');
	response.on('data', data => {
		console.log(data.toString());
	})

	response.on('end', () => {
		console.log('end')
	})
}).on('error', err => {
	console.dir(err)
})*/