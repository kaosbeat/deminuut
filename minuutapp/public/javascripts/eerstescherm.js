(function() {

  $(document).ready(function() {
    return PUBNUB.subscribe({
      channel: "vtm",
      error: function() {
        return console.log("connection lost, will reconnect");
      },
      connect: function() {
        return console.log("connected");
      },
      callback: function(message) {
        return console.log(message);
      }
    });
  });

}).call(this);
