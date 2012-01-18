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
		    {id:"benidorm", title: "Benidorm Bastards"},
			{id:"watals", title: "Wat als?"},
			{id:"akb", title: "Alles kan beter"}
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