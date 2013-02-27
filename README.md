Evernote SDK for JavaScript version 0.0.1
==================================

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
   Redirect the user for authorization to :  evernoteHostName + '/OAuth.action?oauth_token=' + <token from step 1>

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

    noteStore.listNotebooks(authToken, function (notebooks) {
    		console.log(notebooks);
    	},
    	function onerror(error) {
    		console.log(error);
    	}
    );

FAQ
---

### Does the API support CORS (Cross origin resource sharing)

Not yet. However, there are an increasing number of platforms(phonegap,node.js, etc) that use JavaScript as their language. This SDK works well with those platforms.

### Can I test my code in the browser

Yes. You can test your code in Chrome. Open Chrome using open /Applications/Google\ Chrome.app/ --args --disable-web-security . 
