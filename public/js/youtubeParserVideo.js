function youtube_parser(url){
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
	var idVideo = "";
	if (match&&match[7].length==11){
		idVideo = match[7];
	}
	/*else{
	console.log("Url incorrecta - Se pone por defecto un video");
	//idVideo= "qu1RjE_2zhQ";
	}
	*/
	return idVideo;
}