var SinglePlayer = (function(){
	function SinglePlayer(){
		sp.init();
	}
	var sp = SinglePlayer.prototype;

	sp.init = function(){
		this.userInput = new UserInput();
		this.editor = new Editor();
		this.toolBox = new Tools();
		this.player = new Player();

		this.input = document.querySelector(".inputContainer");
		this.inputHistory = document.querySelector(".prevInput");

		this.toolsBoxElement = document.querySelector(".toolbox");
		this.toolBox.setToolbox(this.toolsBoxElement);

		this.toolBox.addSubscriber(this.toolAction.bind(this));
		this.userInput.addSubscriber(this.editor.addLine.bind(this.editor));
		
		this.userInput.addSubscriber(this.player.resume.bind(this.player));
		

		this.editor.setPlayer(this.player);
		this.editor.setInput(this.input);
		this.editor.setHistory(this.inputHistory);
		this.userInput.bindElement(this.input);
	};

	sp.toolAction = function(notification){
		console.log(notification.tag);
		if(notification.tag == "download"){
			var data = this.editor.downloadFormat();
			$.post("solo",{data:data,name:"filename2.srt"},function(response){
				var iframe;
				iframe = document.getElementById("download-container");
				if (iframe === null)
				{
					iframe = document.createElement('iframe');
					iframe.id = "download-container";
					iframe.style.visibility = 'hidden';
					document.body.appendChild(iframe);
				}
				iframe.src = response;
				});
		}
		if(notification.tag == "youtube"){
			 //this.toolsBoxElement.querySelector(".youtube_URL").textContent;
			 //this.toolsBoxElement.querySelector("#youtube_URL").style.visibility='visible';
			//this.player.changeVideo(id);
			//TODO: change video title.
		}
		if(notification.tag == "youtube_ingreso"){
			var url = this.toolsBoxElement.querySelector("#url").value;
			//this.toolsBoxElement.querySelector(".youtube").style.display='none';
			var idVideo= youtube_parser(url);
			this.player.changeVideo(idVideo);
			//TODO: change video title.
		}
	};
	return SinglePlayer;
})();

window.onload = function(){
	var SP = new SinglePlayer();
};

