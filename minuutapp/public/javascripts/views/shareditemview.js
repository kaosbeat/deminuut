App.SharedItemView = Backbone.View.extend({
	tagName: "li",
	
	events:{
		'click': 'this_clickHandler'
	},
	
	initialize: function(){
		this.template = $("#shareditem-template");
	},
	
	render: function(){
		var html = this.template.tmpl(this.model.toJSON());
		$(this.el).html(html);
		return this;
	},
	
	this_clickHandler: function(event){
		console.log("will show shared item: "  + this.model.get("title"));
	}
});