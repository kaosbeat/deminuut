App.SharedItemsView = App.MainView.extend({
	el: "#mainview-shareditems",
	
	initialize: function(){
		App.sharedItems.bind("add", this.renderItem, this);
		App.sharedItems.bind("reset", this.renderAll, this);
	},
	
	renderItem: function(model){
		var sharedItemView = new App.SharedItemView({model: model});
		this.$("ul").append(sharedItemView.render().el);
	},
	
	renderAll: function(collection){
		this.$("ul").empty();
		collection.forEach(this.renderItem, this);
	}
});