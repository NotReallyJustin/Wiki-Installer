//Puts all the schools and debaters inside schoolArray
async function organizeFiles(queryArray)
{
	for (var i in queryArray)
	{
		schoolArray.push(new School());

		//Sends a request for the school's page, then we use that to fetch the teams

		//Yes please ignore google chrome's sychronous XMLHttpRequest warning because that thing is :pepega: :brainlet: :dumbPepe:
		var getRequest = new XMLHttpRequest();
		getRequest.open("GET", "https://hspf.debatecoaches.org/" + queryArray[i], false);
		getRequest.send();
		
		var teamTable = new DOMParser().parseFromString(getRequest.responseText, "text/html").getElementById("tblTeams").children[0].children;

		for (var c=1; c<teamTable.length; c++ /*D*/) //1st children is useless description tr
		{
			var tableItems = teamTable[c].children;

			//Array index 0 is the team name, index 1 is aff link, index 2 is neg link, index 3 is the garbage can
			var debaterTeam = new Team(tableItems[0].children[0].children[0].innerText, 
				tableItems[1].children[0].children[0].href.replace("http://127.0.0.1:8081", ""), 
				tableItems[2].children[0].children[0].href.replace("http://127.0.0.1:8081", ""));

			schoolArray[i].debaterDirectories.push(debaterTeam);
		}	
	}

	grabFileLinks();
}

//I figured I would grab the file links seperately in another function outside the for loop so the computer can handle all the processes
async function grabFileLinks()
{
	for (var i in schoolArray)
	{
		for (var c in schoolArray[i].debaterDirectories)
		{
			let ajaxLink = "https://hspf.debatecoaches.org" + schoolArray[i].debaterDirectories[c].affRedirect;
			let targetEvidenceFile = schoolArray[i].debaterDirectories[c].evidenceFilesAff;

			for (var k=0; k<2; k++)
			{
				var getFileLink = new XMLHttpRequest();
				getFileLink.open("GET", ajaxLink, false);
				getFileLink.send();

				var html = new DOMParser().parseFromString(getFileLink.responseText, "text/html");
				
				try
				{
					let linkArray = [];
					var spanArray = html.getElementById("tblOpenSource").getElementsByClassName("wikiexternallink");

					for (var l=0; l<spanArray.length; l++)
					{
						linkArray.push(spanArray[l].children[0].href);
					}

					targetEvidenceFile.push.apply(targetEvidenceFile, linkArray);
				}
				catch(err)
				{
					console.log(err);
				}

				ajaxLink = "https://hspf.debatecoaches.org" + schoolArray[i].debaterDirectories[c].negRedirect;
				targetEvidenceFile = schoolArray[i].debaterDirectories[c].evidenceFilesNeg;
			}
		}
	}

	createTable();
}
async function grabAll() //Downloads everything on the wiki - Or another way to do grabAllFit that involves the backend
{
	infoTable.style.pointerEvents = 'none';
	grabBtn.style.pointerEvents = 'none';
	grabAllBtn.style.pointerEvents = 'none';

	for (var i in schoolArray)
	{
		for (var c in schoolArray[i].debaterDirectories)
		{
			let downloadDirectory = schoolArray[i].debaterDirectories[c].evidenceFilesAff;

			for (var k=0; k<2; k++)
			{
				for (var j of downloadDirectory)
				{
					var downloadRequest = new XMLHttpRequest();
					downloadRequest.open("GET", "http://127.0.0.1:8081/downloadFiles/" + j, false);

					downloadRequest.send();
				}

				downloadDirectory = schoolArray[i].debaterDirectories[c].evidenceFilesNeg;
			}
		}
	}

	infoTable.style.pointerEvents = 'auto';
	grabBtn.style.pointerEvents = 'auto';
	grabAllBtn.style.pointerEvents = 'auto';
}

function grabAllFit() //Downloads all the docs that fit the search query
{
	infoTable.style.pointerEvents = 'none';
	grabBtn.style.pointerEvents = 'none';
	grabAllBtn.style.pointerEvents = 'none';
	
	for (var i=1; i<infoTable.children.length; i++)
	{
		if (infoTable.children[i].style.display != "none")
		{
			try //Children[1] of an infoTable row contains the document link
			{
				var downloadRequest = new XMLHttpRequest();
				downloadRequest.open("GET", "http://127.0.0.1:8081/downloadFiles/https://hspf.debatecoaches.org/download/" + 
					infoTable.children[i].children[1].innerText.replace(/ /gmi, "%20"), true)
				downloadRequest.send();
			}
			catch(err)
			{
				console.log(err);
				console.log(i);
				continue;
			}
		}
	}

	infoTable.style.pointerEvents = 'auto';
	grabBtn.style.pointerEvents = 'auto';
	grabAllBtn.style.pointerEvents = 'auto';
}