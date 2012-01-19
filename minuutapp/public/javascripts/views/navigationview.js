App.NavigationView = Backbone.View.extend({
	el: "nav",
	
	events:{
		'click #remotecontrol': 'showRemoteControlView',
		'click #share': 'showShareView',
		'click #shareditems': 'showSharedItemsView'
	},
	
	showRemoteControlView: function(){
		App.router.navigate("remotecontrol/", true);
	},
	
	showShareView: function(){
		App.router.navigate("share/", true);
	},
	
	showSharedItemsView: function(){
		App.router.navigate("shareditems/", true);
	}
});