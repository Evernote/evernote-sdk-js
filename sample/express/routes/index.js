var Evernote = require('evernote').Evernote;

var config = require('../config.json');
var callbackUrl = "http://localhost:3000/oauth_callback";

// home page
exports.index = function(req, res) {
  if(req.session.oauth_access_token) {
    var token = req.session.oauth_access_token;
    var client = new Evernote.Client({
      token: token,
      sandbox: config.SANDBOX
    });
    var note_store = client.getNoteStore();
    note_store.listNotebooks(token, function(notebooks){
      req.session.notebooks = notebooks;
      res.render('index');
    });
  } else {
    res.render('index');
  }
};

// OAuth
exports.oauth = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: config.API_CONSUMER_KEY,
    consumerSecret: config.API_CONSUMER_SECRET,
    sandbox: config.SANDBOX
  });

  client.getRequestToken(callbackUrl, function(error, oauth_token, oauth_token_secret, results){
    if(error) {
      req.session.error = JSON.stringify(error);
      res.redirect('/');
    }
    else { 
      // store the tokens in the session
      req.session.oauth_token = oauth_token;
      req.session.oauth_token_secret = oauth_token_secret;

      // redirect the user to authorize the token
      res.redirect(client.getAuthorizeUrl(oauth_token));
    }
  });

};

// OAuth callback
exports.oauth_callback = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: config.API_CONSUMER_KEY,
    consumerSecret: config.API_CONSUMER_SECRET,
    sandbox: config.SANDBOX
  });

  client.getAccessToken(
    req.session.oauth_token, 
    req.session.oauth_token_secret, 
    req.param('oauth_verifier'), 
    function(error, oauth_access_token, oauth_access_token_secret, results) {
      if(error) {
        console.log('error');
        console.log(error);
        res.redirect('/');
      } else {
        // store the access token in the session
        req.session.oauth_access_token = oauth_access_token;
        req.session.oauth_access_token_secret = oauth_access_token_secret;
        req.session.edam_shard = results.edam_shard;
        req.session.edam_userId = results.edam_userId;
        req.session.edam_expires = results.edam_expires;
        req.session.edam_noteStoreUrl = results.edam_noteStoreUrl;
        req.session.edam_webApiUrlPrefix = results.edam_webApiUrlPrefix;
        res.redirect('/');
      }
    });
};

// Clear session
exports.clear = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};
