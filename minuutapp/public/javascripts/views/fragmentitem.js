App.FragmentItem = Backbone.View.extend({
	tagName: "li",
	
	events:{
		'click':'this_click'
	},
	
	render: function(){
		$(this.el).html(this.model.get("title"));
		return this;
	},
	
	this_click: function(event){
		App.router.currentFragment = this.model;
		console.log("will show '" + this.model.id + "' on first screen");
		App.router.navigate("share/", true);
	}
});