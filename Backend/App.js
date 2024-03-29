const Database = require('./Database.js');
const app = require('express')();
const Path = require('path');
const fs = require('fs');
const download = require('download');

//Default send file options - excludes the root because express kinda hates relative pathing
const DEFAULT = {
	headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'x-from': 'Server'
    }
}

const logger = (request, response, next) => {
	var str = `${new Date()} - ${request.originalUrl}`;

	console.log(str);
	next();
}

const startServer = async () => {
	await Database.wikiFetch();
	//console.dir(Database.fetchFiles(undefined, undefined, undefined, undefined));

	app.use('/*', logger);

	app.get('/', (request, response) => {
		var index = Path.resolve(__dirname, '../Frontend/Index.html');
		response.sendFile(index, DEFAULT);
	});

	app.get('/download', (request, response) => {
		var qr = request.query;
		let downloadArr = Database.fetchFiles(qr.year, qr.month, qr.day, qr.name);

		downloadArr.forEach(file => {
			if (file.link)
			{	
				try
				{
					download(file.link, Path.resolve(__dirname, '../Downloads'));
				}
				catch(err)
				{
					//Not really defensive programming lol but worth a shot
					console.error('At internal link download: ' + err);
				}
			}
			else
			{
				try
				{
					fs.writeFileSync(Path.resolve(__dirname, '../Downloads', `./${file.name.replace(/[\.:;]/gmi, '-')}.txt`), file.text, {encoding: 'utf8'});
				}
				catch(err)
				{
					console.error('At internal link write: ' + err);
				}
			}
		});

		response.end();
	});

	//To do: filters based on query strings
	//To do: database checks to see if you're the right person - actually that probably won't matter as there's no OP level perms here
	app.get('/database', (request, response) => {
		var qr = request.query;
		var files = Database.fetchFiles(qr.year, qr.month, qr.day, qr.name);
		response.send(files);
	});

	app.get('/:fileName', (request, response) => {
		var file = Path.resolve(__dirname, '../Frontend', `./${request.params.fileName}`);
		response.sendFile(file, DEFAULT);
	});

	app.get('/:folder/:fileName', (request, response) => {
		var file = Path.resolve(__dirname, '../Frontend', `./${request.params.folder}`, `./${request.params.fileName}`);
		response.sendFile(file, DEFAULT);
	});

	app.listen(8081, () => {
		console.log('Server is open on port 8081');
	});
}

startServer();