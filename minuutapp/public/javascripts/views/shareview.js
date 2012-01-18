App.ShareView = App.MainView.extend({
	el: "#mainview-share",
	
	events:{
		'click button': 'sharebutton_clickHandler'
	},
	
	sharebutton_clickHandler: function(event){
		console.log("sharing this minute with comment: '" + this.$("textarea").val());
	}
});