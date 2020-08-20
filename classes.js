function School()
{
	this.debaterDirectories = [];
}

function Team(name, affRedirect, negRedirect)
{
	this.teamName = name;
	this.affRedirect = affRedirect;
	this.negRedirect = negRedirect;
	this.evidenceFilesAff = [];
	this.evidenceFilesNeg = [];
}

//Fills in the frontend download table using the team's files
Team.prototype.createTableData = function()
{
	let evidenceFiles = this.evidenceFilesAff;
	
	for (var c=0; c<2; c++)
	{
		for (let i in evidenceFiles)
		{
			let evidenceFilesCurrent = evidenceFiles; //Scoping issues fixed - evidenceFilesCurrent will now stay inside this iteration
			let tempTr = document.createElement("tr");

			let tempTeamName = document.createElement("td");
			tempTeamName.innerText = this.teamName;

			let tempFileName = document.createElement("td");
			tempFileName.innerText = evidenceFiles[i].replace("https://hspf.debatecoaches.org/download/", "")
			tempFileName.innerText = tempFileName.innerText.replace(/%20/gmi, " ");

			let downloadTd = document.createElement("td");
			let tempDownloadButton = document.createElement("button");
			tempDownloadButton.innerText = "Download";
			tempDownloadButton.addEventListener("click", function() {
				let getFile = new XMLHttpRequest();
				getFile.open("GET", "http://127.0.0.1:8081/downloadFiles/" + evidenceFilesCurrent[i], true);
				getFile.send();

				downloadTd.innerHTML = "Downloaded!"; //Completely gets rid of the download button; we don't need to worry abt event triggering again
			})
			downloadTd.appendChild(tempDownloadButton);

			tempTr.appendChild(tempTeamName);
			tempTr.appendChild(tempFileName);
			tempTr.appendChild(downloadTd);

			infoTable.appendChild(tempTr);
		}

		evidenceFiles = this.evidenceFilesNeg;
	}
}