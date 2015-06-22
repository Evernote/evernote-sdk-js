var callback, logout;
callback = function() {
  var pattern, verifier;
  pattern = new RegExp(/oauth_verifier=([^&=\?]+)/);
  verifier = this.querystring.match(pattern)[1];
  if (verifier.length === 0) {
    console.log("Missing OAuth verifier.");
    console.log(JSON.stringify(err));
    return;
  }
  return Meteor.call('handleCallback', localStorage.getItem('oauthToken'), localStorage.getItem('oauthTokenSecret'), verifier, function(err, res) {
    localStorage.removeItem('oauthToken');
    localStorage.removeItem('oauthTokenSecret');
    if (err) {
      console.log(JSON.stringify(err));
      return;
    }
    if (!res) {
      console.log("Couldn't get OAuth access token.");
      console.log(JSON.stringify(err));
      return;
    }
    Session.set('oauthAccessToken', res['oauthAccessToken']);
    Session.set('oauthAccessTokenSecret', res['oauthAccessTokenSecret']);
    Session.set('edamUserId', res['edamUserId']);
    Session.set('edamShard', res['edamShard']);
    Session.set('edamExpires', res['edamExpires']);
    Session.set('edamNoteStoreUrl', res['edamNoteStoreUrl']);
    Session.set('edamWebApiUrlPrefix', res['edamWebApiUrlPrefix']);
    Meteor.Router.to('/');
    return Meteor.call("listNotebooks", Session.get('oauthAccessToken'), function(err, res) {
      if (err) {
        console.log(JSON.stringify(err));
        return;
      }
      return Session.set('notebooks', res);
    });
  });
};
logout = function() {
  Session.set('oauthAccessToken', void 0);
  Session.set('oauthAccessTokenSecret', void 0);
  Session.set('edamUserId', void 0);
  Session.set('edamShard', void 0);
  Session.set('edamExpires', void 0);
  Session.set('edamNoteStoreUrl', void 0);
  Session.set('edamWebApiUrlPrefix', void 0);
  Session.set('notebooks', void 0);
  return Meteor.Router.to('/');
};
Meteor.Router.add({
  '/': 'home',
  '/callback': callback,
  '/logout': logout
});
Template.home.helpers({
  'loggedIn': function() {
    return Session.get('oauthAccessToken');
  },
  'notebooks': function() {
    return Session.get('notebooks');
  },
  'oauthAccessToken': function() {
    return Session.get('oauthAccessToken');
  },
  'oauthAccessTokenSecret': function() {
    return Session.get('oauthAccessTokenSecret');
  },
  'edamNoteStoreUrl': function() {
    return Session.get('edamNoteStoreUrl');
  },
  'edamWebApiUrlPrefix': function() {
    return Session.get('edamWebApiUrlPrefix');
  },
  'edamUserId': function() {
    return Session.get('edamUserId');
  },
  'edamExpires': function() {
    return Session.get('edamExpires');
  }
});
Template.home.events({
  'click .login': function(evt) {
    evt.preventDefault();
    Meteor.call("startOAuth", function(err, res) {
      if (err) {
        console.log(JSON.stringify(err));
        return;
      }
      localStorage.setItem('oauthToken', res['oauthToken']);
      localStorage.setItem('oauthTokenSecret', res['oauthTokenSecret']);
      return window.location = res['authorizeUrl'];
    });
    return false;
  },
  'click .logout': function(evt) {
    evt.preventDefault();
    logout();
    return false;
  }
});