Evernote SDK for JavaScript
==================================
Evernote API version 1.25

What is this
--------------
A JavaScript API around the Evernote Cloud API.

Required reading
----------------
Please check out the [Evernote Developers portal page](http://dev.evernote.com/documentation/cloud/).

Installing
----------

Get the minified version of the SDK [here](https://github.com/evernote/evernote-sdk-js/blob/master/evernote-sdk-js/production/evernote-sdk-minified.js).

### Use OAuth for authentication

We recommend using the jsOAuth library for OAuth. It can be downloaded [here](https://github.com/bytespider/jsOAuth).

Details on the OAuth process are available [here](http://dev.evernote.com/start/core/authentication.php).

Here are the basic steps for OAuth using the jsOAuth library.

(Change this to http://www.evernote.com, when you are ready to activate on production).
    
    var hostName = "http://sandbox.evernote.com"; 

Step 1:

    var options,oauth;
     options = {
        consumerKey: <your consumer key>,
        consumerSecret: <your consumer secret>,
        callbackUrl : <your callback url>,
        signatureMethod : "HMAC-SHA1",
    };
    oauth = OAuth(options);
    oauth.request({'method': 'GET', 'url': hostName + '/oauth', 'success': success, 'failure': failure});

Step 2:

   In the callback `success`, get the `oauth_token` and the `oauth_token_secret`.
   Redirect the user for authorization to :  `evernoteHostName + '/OAuth.action?oauth_token=' + <token from step 1>`

Step 3:

In your callback url, get the `oauth_verifier` and the `oauth_token` from the query string.

    var verifier = <your verifier>;
    var oauth_token = <your oauth token>;
    var secret = <oauth secret from step 1>;
    oauth.setVerifier(verifier);
    oauth.setAccessToken([got_oauth,secret]);

Now get the final token.

    oauth.request({'method': 'GET', 'url': hostName + '/oauth',
                   'success': success, 'failure': failure});

Step 4:

  Parse the `success` callback to get the authentication token.

### Example

Once you get the authentication token, note store URL and user store URL from the OAuth step,

    var noteStoreURL = <note store url>;
    var authenticationToken = <authentication token>;
    var noteStoreTransport = new Thrift.BinaryHttpTransport(noteStoreURL);
    var noteStoreProtocol = new Thrift.BinaryProtocol(noteStoreTransport);
    var noteStore = new NoteStoreClient(noteStoreProtocol);

    noteStore.listNotebooks(authenticationToken, function (notebooks) {
    		console.log(notebooks);
    	},
    	function onerror(error) {
    		console.log(error);
    	}
    );

Use with Node
-------------

### Install

You can install the module using npm.
```sh
npm install evernote
```
### OAuth ###
```javascript
var client = new Evernote.Client.new({
  consumerKey: 'YOUR API CONSUMER KEY',
  consumerSecret: 'YOUR API CONSUMER SECRET',
  sandbox: [true or false] // Optional (default: true)
});
client.getRequestToken('YOUR CALLBACK URL', function(error, oauthToken, oauthTokenSecret, results) {
  // store tokens in the session
  // and then redirect to client.getAuthorizeUrl(oauthToken)
});
```
To obtain the access token
```javascript
client.getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
  // store 'oauthAccessToken' somewhere
});
```
Now you can make other API calls
```javascript
var client = new Evernote.Client({token: oauthAccessToken});
var noteStore = client.getNoteStore();
notebooks = noteStore.listNotebooks(function(err, notebooks) {
  // run this code
});
```

You can see the actual OAuth sample code in `sample/express`.

### UserStore ###
Once you acquire token, you can use UserStore. For example, if you want to call UserStore.getUser:
```javascript
var client = new Evernote.Client(token: token);
var userStore = client.getUserStore();
userStore.getUser(function(err, user) {
  // run this code
});
```
You can omit authenticationToken in the arguments of UserStore/NoteStore functions.

### NoteStore ###
If you want to call NoteStore.listNotebooks:
```javascript
var noteStore = client.getNoteStore();
noteStore.listNotebooks(function(err, notebooks) {
  // run this code
});
```

### NoteStore for linked notebooks ###
If you want to get tags for linked notebooks:
```javascript
var linkedNotebook = noteStore.listLinkedNotebooks[0]; // any notebook
var sharedNoteStore = client.sharedNoteStore(linkedNotebook);
sharedNoteStore.getSharedNotebookByAuth(function(err, sharedNotebook) {
  sharedNoteStore.listTagsByNotebook(err2, sharedNotebook.notebookGuid, function(tags) {
    // run this code
  });
});
```

### NoteStore for Business ###
If you want to get the list of notebooks in your business account:
```javascript
userStore.getUser(function(err, user) {
  if (user.isBusinessUser) {
    client.getBusinessNoteStore().listNotebooks(function(err, notebooks) {
      // run this code
    });
  }
});
```

Utility methods for Business
----------------------------
This module provides some utility methods to deal with Evernote Business.

### List business notebooks ###
To list all business notebooks the user can access
```javascript
var client = new Evernote.Client({token: token})
client.listBusinessNotebooks(function(err, businessNotebooks) {
  // run this code
});
```

### Create a business note ###
To create a business note in a business notebook
```javascript
var note = new Evernote.Note();
client.listBusinessNotebooks(function(err, notebooks) {
  client.createNoteInBusinessNotebook(note, businessNotebooks[0], function(err, createdNote) {
    // run this code
  });
});
```

### Create a business notebook ###
To create a business notebook
```javascript
var notebook = new Evernote.Notebook();
client.createBusinessNotebook(notebook, function(err, createdNotebook) {
  // run this code
});
```

### Get a notebook corresponding to the given business notebook ###
```javascript
client.listBusinessNotebooks(function(err, businessNotebooks) {
  client.getCorrespondingNotebook(businessNotebooks[0], function(err, notebook) {
    // run this code
  });
});
```

### Determine if the user is a part of a business ###
```javascript
user.isBusinessUser();
```

### Example

You can find a simple client app and a sample app with express under 'sample/express'. Please note that you have to use `NodeBinaryHttpTransport` instead of `BinaryHttpTransport`.

FAQ
---

### Does the API support CORS (Cross origin resource sharing)

Not yet. However, there are an increasing number of platforms(phonegap,node.js, etc) that use JavaScript as their language. This SDK works well with those platforms.

### Can I test my code in the browser

Yes. You can test your code in Chrome. Open Chrome using open /Applications/Google\ Chrome.app/ --args --disable-web-security . 
