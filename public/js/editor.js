var Editor = (function(){
	function Editor(){
		this.init();
	}
	var editor = Editor.prototype;
	
	editor.init = function(){
		this.formatter = new Formatter();
		this.transcription = [];
		this.loadSavedTranscription();
	};

	editor.addLine = function(keyCode){
		if(keyCode == 13){
			var content  = this.input.textContent;
			if(content.trim() !== ""){
				var seconds = this.player.getCurrentTime();
				
				var entry = {
					text:content,
					time:seconds
				};

				this.transcription.push(entry);

				var inputUser = this.createTranscriptionElement(entry);

				this.previn.insertBefore(inputUser,this.previn.childNodes[0]);
				this.input.textContent = "";


				if(this.transcription.length > 10){
					var lastVisibleChild = this.previn.children[10];
					lastVisibleChild.className = lastVisibleChild.className + " hidden";
				}

				fadeIn();
			}
		}
	};

	editor.createTranscriptionElement = function(entry){
		var content = entry.text;
		var seconds = entry.time;

		var hour = (seconds/3600) >> 0;
		var min = (seconds-(3600*hour))/60 >> 0;
		var secs = (seconds%60) >> 0;

		var prevInput = document.createElement("div");
		var inputUser = document.createElement("div");
		var timestamp = document.createElement("div");

		timestamp.className = "timestamp";
		prevInput.className = "text";
		inputUser.className = "transcripcion";

		timestamp.textContent = hour + ":" + min + ":" + secs;
		prevInput.textContent = content;

		inputUser.appendChild(timestamp);
		inputUser.appendChild(prevInput);

		return inputUser;
	};

	editor.loadSavedTranscription = function(){
		var urlPath = window.location.pathname;
		urlPath = urlPath.substring(1,urlPath.length);
		var parts = urlPath.split("/");
		if(parts[0] == "solo" && parts[1]){
			var transcriptionId = parts[1];
			var that = this;
			if(transcriptionId !== "new"){
				$.get("/temp/files/"+transcriptionId+".srt",function(data){
					//TODO: notify user of data retrieval.
				})
				.done(function(data){
					var entries = that.formatter.deformat(data);
					var content = document.createElement("div");
					for(var e = 0; e < entries.length; e++){
						var entry = entries[e];
						that.transcription.push(entry);
						var element =	that.createTranscriptionElement(entry);
						content.appendChild(element);
					}
					that.previn.appendChild(content);
				})
				.fail(function(){
					console.log("Could not find resource");
				});
			}
		}
	};

	editor.setInput = function(input)
	{
		this.input = input;
	};
	editor.setHistory = function(prevInput){
		this.previn = prevInput;
	};
	editor.setPlayer = function(player){
		this.player = player;
	};
	editor.downloadFormat = function(){
		if(this.transcription.length!==0){
			return this.formatter.format(this.transcription);
		}
	};
	editor.getTranscription = function(){
		return this.transcription;
	};

	return Editor;
})();
