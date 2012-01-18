App.RemoteControlView = App.MainView.extend({
	el: "#mainview-remotecontrol",
	
	initialize: function(){
		App.fragments.bind("add", this.renderItem, this);
		App.fragments.bind("reset", this.renderAll, this);
	},
	
	renderAll: function(collection){
		this.$("ul").empty();
		collection.forEach(this.renderItem, this);
	},
	
	renderItem: function(model){
		var fragment = new App.FragmentItem({model: model});		
		this.$("ul").append(fragment.render().el);
	}
});