/* Filters should be in JSON form and all lowercase
Possible items: month, year, team name
If nothing is in filters, this defaults to returning everything in Database.js*/
async function fetchQuery(filters)
{
	filters = filters == undefined ? {} : filters;
	let req = 'http://127.0.0.1:8081/database';

	Object.keys(filters).forEach((val, idx) => {
		req += idx == 0 ? '?' : '&';
		req += `${val}=${filters[val]}`;
	});

	/*
	let ajax = new XMLHTTPRequest();
	ajax.open('GET', req, true);
	ajax.onreadystatechange = function() {
		if (this.readyState == 4)
		{
			return JSON.parse(this.responseText);
		}
	}
	*/

	try
	{
		var response = await fetch(req);
		return await response.json();
	}
	catch(err)
	{
		console.error(err);
		return err;
	}
}