const Database = require('./Database.js');
const app = require('express')();
const Path = require('path');

//Default send file options - excludes the root because express kinda hates relative pathing
const DEFAULT = {
	headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'x-from': 'Server'
    }
}

const startServer = async () => {
	await Database.wikiFetch();

	app.get('/', (request, response) => {
		var index = Path.resolve(__dirname, '../Frontend/Index.html');
		response.sendFile(index, DEFAULT);
	});

	app.get('/:fileName', (request, response) => {
		var file = Path.resolve(__dirname, '../Frontend', `./${request.params.fileName}`);
		response.sendFile(file, DEFAULT);
	});

	app.get('/download/:fileName')

	app.listen(8081, () => {
		console.log('Server is open on port 8081');
	});
}

startServer();