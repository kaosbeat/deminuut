App.MainView = Backbone.View.extend({
	hide: function(){
		$(this.el).hide();
	},
	
	show: function(){
		var that = this;
		$(this.el).hide(0, function(){
			$(that.el).fadeIn(200);
		});
	}
});