/* Filters should be in JSON form and all lowercase
Possible keys: month, year, day, name
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

//Should have all the filters filled out
async function download(filters, dc3)
{
	if (filters.month && filters.day && filters.year && filters.name)
	{
		//filters.name.replace('%20', ' ');
		var arr = await fetchQuery(filters);
		var file = arr[0];

		if (file.link)
		{
			window.open(file.link);
		}
		else
		{
			let str = `data:text/plain;charset=utf-8,${encodeURIComponent(file.text)}`;
			/*downloads.download({
				allowHttpErrors: false,
				conflictAction: "uniquify",
				fileName: file.name,
				method: "GET",
				saveAs: true,
				url: str
			}); brrrt chrome API trash*/

			let a = document.createElement('a');
			a.href = str;
			a.download = file.name;
			a.click();
		}
	}
	else
	{
		alert("404 Error - Download failed. See console for error data.");
		console.dir(filters);
	}

	dc3.src = 'https://thumbs.dreamstime.com/b/green-check-mark-icon-checkmark-circle-checklist-tick-colored-flat-style-vector-illustration-eps-154721515.jpg';
}

//Should have all the filters filled out
async function remoteDownload(filters, d4)
{
	if (filters.month && filters.day && filters.year && filters.name)
	{
		var req = 'http://127.0.0.1:8081/download';

		Object.keys(filters).forEach((val, idx) => {
			req += idx == 0 ? '?' : '&';
			req += `${val}=${filters[val]}`;
		});

		await fetch(req);
	}
	else
	{
		alert("404 Error - Download failed + Missing query data. See console for error data.");
		console.dir(filters);
	}

	d4.src = 'https://thumbs.dreamstime.com/b/green-check-mark-icon-checkmark-circle-checklist-tick-colored-flat-style-vector-illustration-eps-154721515.jpg';
}