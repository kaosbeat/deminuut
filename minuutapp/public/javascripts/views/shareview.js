App.ShareView = App.MainView.extend({
	el: "#mainview-share",
	
	events:{
		'click button': 'sharebutton_clickHandler'
	},
	
	sharebutton_clickHandler: function(event){
		/*
		$.post("/", {
				comment: this.$("textarea").val()
			},
				function(data) {
					console.dir(data);
				}
		);
		*/
		console.log("sharing '" + App.router.currentFragment.get("title") + "' with comment: '" + this.$("textarea").val());
	}
});