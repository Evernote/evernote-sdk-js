Evernote SDK for JavaScript
===========================
Evernote API version 2.0.0-beta

What is this
--------------
A JavaScript API around the Evernote Cloud API.

Required reading
----------------
Please check out the [Evernote Developers portal page](https://dev.evernote.com/doc/).

Installing
----------

Download via npm - `npm i --save evernote`

### Use OAuth for authentication

Details on the OAuth process are available [here](https://dev.evernote.com/doc/articles/authentication.php).

Here are the basic steps for OAuth using the Evernote client:
```javascript
var callbackUrl = "http://localhost:3000/oauth_callback"; // your endpoint

// initialize OAuth
var Evernote = require('evernote');
var client = new Evernote.Client({
  consumerKey: 'my-consumer-key',
  consumerSecret: 'my-consumer-secret',
  sandbox: true, // change to false when you are ready to switch to production
  china: false, // change to true if you wish to connect to YXBJ - most of you won't
});

client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret) {
  if (error) {
    // do your error handling here
  }
  // store your token here somewhere - for this example we use req.session
  req.session.oauthToken = oauthToken;
  req.session.oauthTokenSecret = oauthTokenSecret;
  res.redirect(client.getAuthorizeUrl(oauthToken)); // send the user to Evernote
});

// at callbackUrl - "http://localhost:3000/oauth_callback" in our example. User sent here after Evernote auth
var client = new Evernote.Client({
  consumerKey: 'my-consumer-key',
  consumerSecret: 'my-consumer-secret',
  sandbox: true,
  china: false,
});
client.getAccessToken(req.session.oauthToken,
  req.session.oauthTokenSecret,
  req.query.oauth_verifier,
function(error, oauthToken, oauthTokenSecret, results) {
  if (error) {
    // do your error handling
  } else {
    // oauthAccessToken is the token you need;
    var authenticatedClient = new Evernote.Client({
      token: oauthToken,
      sandbox: true,
      china: false,
    });
    var noteStore = authenticatedClient.getNoteStore();
    noteStore.listNotebooks().then(function(notebooks) {
      console.log(notebooks); // the user's notebooks!
    });
  }
});
```

Use with Node
-------------

### Install

You can install the module using npm.
```sh
npm install evernote
```

You can see the actual OAuth sample code in `sample/express` - most of the relevant code is in routes/index.js.

### UserStore ###
Once you acquire a token, you can get a handle to the UserStore client, with all the methods documented in our [api](https://dev.evernote.com/doc/reference/UserStore.html). For example, if you want to call UserStore.getUser:
```javascript
var client = new Evernote.Client(token: token);
var userStore = client.getUserStore();
userStore.getUser().then(function(user) {
  // user is the returned User object
});
```
All methods return [Promises/A+](https://promisesaplus.com/). The authentication token is injected into the method call, so you should omit the auth token argument for all UserStore API calls.

### NoteStore ###
Once you acquire a token, you can get a handle to the NoteStore client, with all the methods documented in our [api](https://dev.evernote.com/doc/reference/NoteStore.html). For example, if you want to call NoteStore.listNotebooks:
If you want to call NoteStore.listNotebooks:
```javascript
var client = new Evernote.Client(token: token);
var noteStore = client.getNoteStore();
noteStore.listNotebooks().then(function(notebooks) {
  // notebooks is the list of Notebook objects
});
```
If you want to search for notes with specific content (using NoteStore.findNotesMetadata), you must create a filter and a spec object first:
```javascript
var Evernote = require('evernote');
var client = new Evernote.Client(token: token);
var noteStore = client.getNoteStore();
var filter = new Evernote.NoteStore.NoteFilter({
  words: ['one', 'two', 'three'],
  ascending: true
});
var spec = new Evernote.NoteStore.NotesMetadataResultSpec({
  includeTitle: true,
  includeContentLength: true,
  includeCreated: true,
  includeUpdated: true,
  includeDeleted: true,
  includeUpdateSequenceNum: true,
  includeNotebookGuid: true,
  includeTagGuids: true,
  includeAttributes: true,
  includeLargestResourceMime: true,
  includeLargestResourceSize: true,
});

noteStore.findNotesMetadata(filter, 0, 500, spec).then(function(notesMetadataList) {
  // data.notes is the list of matching notes
});
```

### NoteStore for linked notebooks ###
Similar to above, you can get a handle to other NoteStores, eg a NoteStore for a linked notebook. Here's an example of getting tags for a notebook you have joined:
```javascript
var linkedNotebook = noteStore.listLinkedNotebooks().then(function(linkedNotebooks) {
  // just pick the first LinkedNotebook for this example
  return client.getSharedNoteStore(linkedNotebooks[0]);
}).then(function(sharedNoteStore) {
  return sharedNoteStore.listNotebooks().then(function(notebooks) {
    return sharedNoteStore.listTagsByNotebook(notebooks[0].guid);
  }).then(function(tags) {
    // tags here is a list of Tag objects
  });
});
```

### NoteStore for Business ###
Simiarl to above, you can get a handle to a NoteStore for a business, if the user is a business user
If you want to get the list of notebooks in your business account:
```javascript
var client = new Evernote.Client(token: token);
var noteStore = client.getBusinessNoteStore();
noteStore.listNotebooks(function(notebooks) {
  // notebooks here is the list of notebook objects
});
```

### Example

You can find a sample app with express under 'sample/express'. `npm install` there, copy config.json.template to config.json and add your info in it, then `npm run start` to test the sample app.

BUILDING FROM SOURCE
--------------------

To build from source, `npm run build` from the root. This will create a `lib` directory with the module. `npm pack` will create a tarball with the artifacts that get deployed to the npm registry, and the sample express app is helpful to verify it - just unzip the tarball into the sample/express/node_modules/evernote directory and use that for testing.


CONTRIBUTING
------------
Things that we need help on:
* Unit tests
* Documentation


FAQ
---

### Does the API support CORS (Cross origin resource sharing)

No.

### I can't figure out how to do something

Check [stackoverflow](https://stackoverflow.com/questions/tagged/evernote) first, and if you don't find your answer there, open up an issue. Please note that a few of us devs are taking time out of our regular jobs to support this SDK - we don't currently have a dedicated SDK team.

### Think you found a bug in our client?

Awesome. Create an issue and submit a PR (be sure to run our linter first) and we'll take a look. If you can't figure out how to fix it, create an issue and we'll take a look when we have a moment.
