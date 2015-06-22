Meteor.startup(function() {
  var Evernote, Future;
  Evernote = Meteor.require('evernote').Evernote;
  Future = Meteor.require('fibers/future');
  return Meteor.methods({
    'listNotebooks': function(token) {
      var client, f, noteStore;
      client = new Evernote.Client({
        token: token,
        sandbox: Meteor.settings.sandbox
      });
      noteStore = client.getNoteStore();
      f = new Future();
      noteStore.listNotebooks(function(err, notebooks) {
        if (err) {
          return console.log("Error: " + JSON.stringify(err));
        } else {
          return f["return"](notebooks);
        }
      });
      return f.wait();
    },
    'startOAuth': function() {
      var client, f;
      client = new Evernote.Client({
        consumerKey: Meteor.settings.apiConsumerKey,
        consumerSecret: Meteor.settings.apiConsumerSecret,
        sandbox: Meteor.settings.sandbox
      });
      f = new Future();
      setTimeout(function() {
        return client.getRequestToken(Meteor.settings.callbackUrl, function(error, oauthToken, oauthTokenSecret, results) {
          if (error) {
            return console.log("Error: " + JSON.stringify(error));
          } else {
            return f["return"]({
              'oauthToken': oauthToken,
              'oauthTokenSecret': oauthTokenSecret,
              'authorizeUrl': client.getAuthorizeUrl(oauthToken)
            });
          }
        });
      }, 3 * 1000);
      return f.wait();
    },
    'handleCallback': function(oauthToken, oauthTokenSecret, verifier) {
      var client, f;
      client = new Evernote.Client({
        consumerKey: Meteor.settings.apiConsumerKey,
        consumerSecret: Meteor.settings.apiConsumerSecret,
        sandbox: Meteor.settings.sandbox
      });
      f = new Future();
      setTimeout(function() {
        return client.getAccessToken(oauthToken, oauthTokenSecret, verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
          if (error) {
            return console.log("Error: " + JSON.stringify(error));
          } else {
            return f["return"]({
              'oauthAccessToken': oauthAccessToken,
              'oauthAccessTokenSecret': oauthAccessTokenSecret,
              'edamShard': results.edam_shard,
              'edamUserId': results.edam_userId,
              'edamExpires': results.edam_expires,
              'edamNoteStoreUrl': results.edam_noteStoreUrl,
              'edamWebApiUrlPrefix': results.edam_webApiUrlPrefix
            });
          }
        });
      }, 3 * 1000);
      return f.wait();
    }
  });
});
