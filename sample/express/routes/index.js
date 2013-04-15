var OAuth = require('oauth').OAuth,
    Evernote = require('evernote').Evernote;

var config = require('../config.json');
var base_url = config.SANDBOX ? 'https://sandbox.evernote.com' : 'https://www.evernote.com';
var request_token_path = "/oauth";
var access_token_path = "/oauth";
var authorize_path = "/OAuth.action";

// home page
exports.index = function(req, res) {
  if(req.session.oauth_access_token) {
    var token = req.session.oauth_access_token;
    var transport = new Evernote.Thrift.NodeBinaryHttpTransport(req.session.edam_noteStoreUrl);
    var protocol = new Evernote.Thrift.BinaryProtocol(transport);
    var note_store = new Evernote.NoteStoreClient(protocol);
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

  var oauth = new OAuth(base_url + request_token_path,
      base_url + access_token_path,
      config.API_CONSUMER_KEY,
      config.API_CONSUMER_SECRET,
      "1.0",
      "http://localhost:3000/oauth_callback",
      "HMAC-SHA1");

  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error) {
      console.log('error');
      console.log(error);
    }
    else { 
      // store the tokens in the session
      req.session.oauth = oauth;
      req.session.oauth_token = oauth_token;
      req.session.oauth_token_secret = oauth_token_secret;

      // redirect the user to authorize the token
      res.redirect(base_url + authorize_path + "?oauth_token=" + oauth_token);
    }
  });

};

// OAuth callback
exports.oauth_callback = function(req, res) {
  var oauth = new OAuth(req.session.oauth._requestUrl,
      req.session.oauth._accessUrl,
      req.session.oauth._consumerKey,
      req.session.oauth._consumerSecret,
      req.session.oauth._version,
      req.session.oauth._authorize_callback,
      req.session.oauth._signatureMethod);

  oauth.getOAuthAccessToken(
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
