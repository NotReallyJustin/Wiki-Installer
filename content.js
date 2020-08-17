//src: Ivan Turner
const CONTENT_TYPES = [
	{extension: "html", type: "text"},
	{extension: "js", type: "text"},
	{extension: "css", type: "text"},
	{extension: "jpg", type: "image"},
	{extension: "png", type: "image"},
	{extension: "ico", type: "image"}
];

exports.getFileTypeObject = (ext) => {
	for (var c in CONTENT_TYPES)
	{
		if (CONTENT_TYPES[c].extension == ext)
		{
			return CONTENT_TYPES[c];
		}
	}
}
