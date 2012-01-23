﻿//================ ENTRY POINT ==================

$(function(event){
	App.start();
});

window.App = {
	start: function(){
		App.router = new App.Router();
		App.navigationView = new App.NavigationView();
		
		//Remote controll stuff:
		App.fragments = new App.FragmentList();
		App.remoteControlView = new App.RemoteControlView();		
		
		//Share button stuff:
		App.shareView = new App.ShareView();
		
		//Shared Items stuff:
		App.sharedItems = new App.SharedItemList();
		App.sharedItemsView = new App.SharedItemsView();
		
		
		//Add some fragments to the fragmentList (komt normaal van server):
		App.fragments.add([
		    {title: "Benidorm Bastards", url:"http://champ.vrtmedialab.be/videos/benidormb.m4v"},
			{title: "Big Buck Bunny", url:"http://ftp.akl.lt/Video/Big_Buck_Bunny/big_buck_bunny_480p_h264.mov"},
			{title: "Sintel", url:"http://ftp.akl.lt/Video/Sintel/sintel-2048-surround.mp4"},
			{title: "Elephants Dream", url:"http://ftp.akl.lt/Video/Elephants_Dream/Elephants_Dream_1024-h264-st-aac.mov"},
			{title: "Codebreakers", url:"http://ftp.akl.lt/Video/Codebreakers/codebreakers.m4v"}
		]);
		
		
		//Add some shared items to the shared items list (komt normaal van server):
		App.sharedItems.add([	
			{id:0, title: "Benidorm Bastards", user:"Sam", comment:"Vet cool"},
			{id:1, title: "Wat als?", user:"Matthias", comment:"Should've seen this!"}
		]);
		
		//Start monitoring url hashes:
		Backbone.history.start();		
	}
};

//================ ROUTERS ==================

/**
 * App.Router: zorgt voor de routes tussen de (voorlopig) 3 mainviews.
 */
App.Router = Backbone.Router.extend({	
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

//================ VIEWS ==================

/**
 * App.NavigationView: bevat de 3 knoppen onderaan het scherm.
 * Door op de knoppen te klikken wordt via de router de juiste view getoond.
 */
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

// 3 MainViews (met bijhorende onderdelen:
// =======================================

/**
 * App.MainView: parent-object voor alle mainviews.
 * Bevat functies om een view te tonen en te verbergen.
 */
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

/**
 * App.RemoteControlView: de view die als afstandsbediening voor het eerste scherm fungeert.
 */
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
		var fragment = new App.FragmentItemView({model: model});		
		this.$("ul").append(fragment.render().el);
	}
});

/**
 * App.FragmentItemView: stelt een item in de de remoteControlView voor.
 * Kan op geklikt worden en speelt dan iets af op het eerste scherm. 
 */
App.FragmentItemView = Backbone.View.extend({
	tagName: "li",
	
	events:{
		'click':'this_click'
	},
	
	render: function(){
		$(this.el).html(this.model.get("title"));
		return this;
	},
	
	this_click: function(event){
		console.log("will show '" + this.model.get("url") + "' on first screen (username:" + $("#username").val() + ")");
		
		PUBNUB.publish({
	        channel: "vtm",
	        message: {
				"user": $("#username").val(),
				"movie": this.model.get("url")
	        }
		});
		
		App.shareView.updateCurrentlyPlaying(this.model);
		
		//App.router.navigate("share/", true);
	}
});

/**
 * App.ShareView: De view waar de knop op staat om te sharen:
 */
App.ShareView = App.MainView.extend({
	el: "#mainview-share",
	
	events:{
		'click button': 'sharebutton_clickHandler'
	},
	
	updateCurrentlyPlaying: function(fragment){
		this.model = fragment;
		this.$("#currentlyplaying").html(fragment.get("title"));
	},
	
	sharebutton_clickHandler: function(event){
		$.post("/posts/share", {
				movieurl: this.model.get("url"),
				username: $("#username").val(),
				comment: this.$("textarea").val()
			},
			function(data) {
				console.dir(data);
			}
		);
		console.log("sharing '" + this.model.get("title") + "' with comment: '" + this.$("textarea").val() + " (username:" + $("#username").val() + ")");
	}
});

/**
 * App.SharedItemsView: 3e en laatste view, waar de gedeelde items te zien zijn.
 * TODO: moet nog aangepast worden dat er ook een videospelertje inzit.
 */
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

/**
 * App.SharedItemView: is een item die leeft in bovenstaande view.
 * Erop klikken, zorgt ervoor dat het item (videofragment) afgespeeld wordt.
 */
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


//================ MODELS ==================
/**
 * App.Fragment: fragmentje. Wordt gebruikt in de App.FragmentItemView
 */
App.Fragment = Backbone.Model.extend({
	defaults: {
		title: "no-title",
		url: "no-url"
	}
});

/**
 * App.SharedItem: gedeeld item. Wordt gebruikt in de App.SharedItemView.
 */
App.SharedItem = Backbone.Model.extend({
	defaults:{
		title: "no-title",
		user: "some-user",
		comment: "default-comment"
	}
});

//============== COLLECTIONS ================
/**
 * App.FragmentList: collectie van te bekijken fragmenten.
 * Dus dingen die op het eerste scherm getoond kunnen worden.
 */
App.FragmentList = Backbone.Collection.extend({
	model: App.Fragment
});

/**
 * App.SharedItemList: collectie van shareditems.
 * Dus fragmenten die de gebruiker gedeeld heeft.
 */
App.SharedItemList = Backbone.Collection.extend({
	model: App.SharedItem
});
