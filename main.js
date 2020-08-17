http = require("http");
url = require("url");
fs = require("fs");
content = require("./content");
client = require("./clientdata");
download = require("download-file");

http.createServer((request, response) => {
	//Access controls are all open, but it doesn't matter because it runs on localhost rn
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
	response.setHeader("Access-Control-Allow-Headers", "X-requested-with, contenttype");
	response.setHeader("Access-Control-Allow-Credentials", true);

	var pathname = url.parse(request.url).pathname.substring(1);
	console.log(`${pathname} recieved!`);

	if (pathname == "") //Apache
	{
		pathname = "index.html";
	}

	var extension = pathname.substring(pathname.indexOf(".") + 1);

	if ((extension != pathname) && (!pathname.includes("downloadFiles")))	
	{
		fs.readFile(pathname, (reject, data) => {
			var contentType = content.getFileTypeObject(extension); //Template from Turner (GnrlWrldWrount if I spell it correctly)

			if (reject)
			{
				console.log(reject);
				response.writeHead(404, {"Content-Type": `${contentType.type}/${contentType.extension}`});
				response.write("404 error brainlet");
			}
			else
			{
				response.writeHead(200, {"Content-Type":`${contentType.type}/${contentType.extension}`});

				if (contentType.type != "text")
				{
					response.write(data, "binary");
				}
				else
				{
					response.write(data.toString());
				}
			}

			response.end();
		})
	}
	else
	{
		if (pathname.includes("downloadFiles")) //Program should only respond to download files
		{
			var fileLink = pathname.substring(pathname.indexOf("/") + 1);
			var options = {
				directory: "./disclosedFiles/" //We can always change this
			}

			download(fileLink, options, (err) =>
			{
				if (err)
				{
					throw err;
				}
				response.end();
			});
		}

		response.end();
	}
}).listen(8081);
	

console.log("Port is up and running");