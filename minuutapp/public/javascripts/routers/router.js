App.Router = Backbone.Router.extend({
	currentFragment: null,
	
	routes: {
		'': 'defaultRoute',
		'remotecontrol/' : 'showRemoteControlView',
		'share/' : 'showShareView',
		'shareditems/' : 'showSharedItemsView',
	},
	
	defaultRoute: function(){
		App.router.navigate("remotecontrol/", true);
	},
	
	showRemoteControlView: function(){
		App.remoteControlView.show();
		App.shareView.hide();
		App.sharedItemsView.hide();
	},
	
	showShareView: function(){
		App.remoteControlView.hide();
		App.shareView.show();
		App.sharedItemsView.hide();
	},
	
	showSharedItemsView: function(){
		App.remoteControlView.hide();
		App.shareView.hide();
		App.sharedItemsView.show();
	}
});