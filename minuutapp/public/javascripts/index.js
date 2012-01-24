//================ ENTRY POINT ==================

$(function(event){
	App.start();
});

window.App = {
	 checkFirstScreen: function(){
		//check of er iets aant spelen is op het eerste scherm van mij:
		$.getJSON( "/getwhatsplayingonfirstscreen",
				{
					username: $("#username").val()
				},
				function(data, textStatus, jqXHR){
					if(data != "nothings-playing"){	
						var currentFragment = App.fragments.find(function(model){
							return model.get("url") == data.url;
						});
						console.log("you are currently playing: "  + currentFragment.get("title"));
						
						//updating de shareview:
						App.shareView.updateCurrentlyPlaying(currentFragment);
					}else{
						App.shareView.updateCurrentlyPlaying(null);
					}
				});
	},
		
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
		
		
		//Add some fragments to the fragmentList (kan van de server komen, maar zit hier nu statisch n):
		App.fragments.add([
		    {title: "Benidorm Bastards", url:"http://www.neat.be/down/benidorm.bastards.2x07.m4v"},
			{title: "Big Buck Bunny", url:"http://ftp.akl.lt/Video/Big_Buck_Bunny/big_buck_bunny_480p_h264.mov"},
			{title: "Sintel", url:"http://ftp.akl.lt/Video/Sintel/sintel-2048-surround.mp4"},
			{title: "Elephants Dream", url:"http://ftp.akl.lt/Video/Elephants_Dream/Elephants_Dream_1024-h264-st-aac.mov"},
			{title: "Codebreakers", url:"http://ftp.akl.lt/Video/Codebreakers/codebreakers.m4v"}
		]);
		
		/*
		//Test items:
		App.sharedItems.add([	
			{title: "Big Buck Bunny", user:"Sam", comment:"Vet cool", url:"http://ftp.akl.lt/Video/Big_Buck_Bunny/big_buck_bunny_480p_h264.mov", starttime:0, endtime:80},
			{title: "Sintel", user:"Matthias", comment:"Should've seen this!", url:"http://ftp.akl.lt/Video/Sintel/sintel-2048-surround.mp4", startime:0, endtime:200},
			{title: "Sam", user:"Matthias", comment:"Should've seen this!", url:"http://10.10.129.186:8888", startime:0, endtime:0}	
		]);
		*/
		
		//bestaande SharedItems van de server halen:
		App.sharedItems.fetch();
		
		//check of er iets aant spelen is op het eerste scherm van mij:
		App.checkFirstScreen();
		
		//check voor verandering in username:
		$("#username").change(function(event){
			App.checkFirstScreen();
		});
		
		//Start monitoring url hashes:
		Backbone.history.start();
		
		//start listening for new shared items:
	    PUBNUB.subscribe({
	        channel  : "newshareditems",      // CONNECT TO THIS CHANNEL.
	        error    : function() {        // LOST CONNECTION (auto reconnects)
	            alert("Connection Lost. Will auto-reconnect when Online.")
	        },
	        callback : function(message) { // RECEIVED A MESSAGE.
	        	var newSharedItem = new App.SharedItem({
	        		title: message.title,
	        		user: message.user,
	        		comment: message.comment,
	        		url: message.url,
	        		starttime: message.starttime,
	        		endtime: message.endtime
	        	});
	        	
	        	//toevoegen aan collection:
	        	App.sharedItems.add(newSharedItem);
	        }
	    })
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
	        channel: "playingonfirstscreen",
	        message: {
				username: $("#username").val(),
				title: this.model.get("title"),
				url: this.model.get("url")
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
		if(this.model != null)
			this.$("#currentlyplaying").html(fragment.get("title"));
		else
			this.$("#currentlyplaying").html("");
	},
	
	sharebutton_clickHandler: function(event){
		if(this.model != null){
			$.post("/posts/share", {
					title: this.model.get("title"),
					url: this.model.get("url"),
					username: $("#username").val(),
					comment: this.$("textarea").val()
				},
				function(data) {
					console.dir(data);
					App.router.navigate("shareditems/", true); //doorgaan naar shared items
				}
			);
			console.log("sharing '" + this.model.get("title") + "' with comment: '" + this.$("textarea").val() + " (username:" + $("#username").val() + ")");
		}else{
			alert("Er speelt niets op je eerste scherm!");
		}
	}
});

/**
 * App.SharedItemsView: 3e en laatste view, waar de gedeelde items te zien zijn.
 * TODO: moet nog aangepast worden dat er ook een videospelertje inzit.
 */
App.SharedItemsView = App.MainView.extend({
	el: "#mainview-shareditems",
	
	showVideo: function(sharedItem){
		this.$("#myvideo").show();
		console.log("showing shared item: " + sharedItem.get("url") + " from " +  sharedItem.get("starttime") + " to " + sharedItem.get("endtime") + " ms");
		var thevideo = new Video(sharedItem.get("url"), sharedItem.get("starttime"), sharedItem.get("endtime"));
		thevideo.play();
	},
	
	initialize: function(){
		App.sharedItems.bind("add", this.renderItem, this);
		App.sharedItems.bind("reset", this.renderAll, this);
		
		this.$("#myvideo").hide();
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
		console.log("will show shared item: "  + this.model.get("url"));
		App.sharedItemsView.showVideo(this.model);
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
		comment: "default-comment",
		url: "no-url",
		starttime: "no-starttime",
		endtime: "no-endtime"
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
	model: App.SharedItem,
	url: '/getshareditems'
});
