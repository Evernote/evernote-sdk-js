/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var OAuth = require('oauth').OAuth,
    pjson = require('../../../package.json'),
    Evernote = require('../../../base.js').Evernote;

var Client = function(options) {
  this.consumerKey = options.consumerKey;
  this.consumerSecret = options.consumerSecret;
  this.sandbox = typeof(options.sandbox) !== 'undefined' ? options.sandbox : true;
  if (this.sandbox) {
    var defaultServiceHost = 'sandbox.evernote.com';
  } else {
    var defaultServiceHost = 'www.evernote.com';
  }
  this.serviceHost = options.serviceHost || defaultServiceHost;
  this.additionalHeaders = options.additionalHeaders || {};
  this.token = options.token;
  this.secret = options.secret;
};

Client.prototype.getRequestToken = function(callbackUrl, callback) {
  var self = this;
  var oauth = self.getOAuthClient(callbackUrl);
  oauth.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results) {
    callback(err, oauthToken, oauthTokenSecret, results)
  });
};

Client.prototype.getAuthorizeUrl = function(oauthToken) {
  var self = this;
  return self.getEndpoint('OAuth.action') + '?oauth_token=' + oauthToken;
};

Client.prototype.getAccessToken = function(oauthToken, oauthTokenSecret, oauthVerifier, callback) {
  var self = this;
  var oauth = self.getOAuthClient('');
  oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier,
    function(err, oauthAccessToken, oauthAccessTokenSecret, results) {
      callback(err, oauthAccessToken, oauthAccessTokenSecret, results);
      self.token = oauthAccessToken;
    });
};

Client.prototype.getUserStore = function() {
  var self = this;
  return new Store(Evernote.UserStoreClient, function(callback) {
    callback(null, self.token, self.getEndpoint("/edam/user"));
  });
};

Client.prototype.getNoteStore = function(noteStoreUrl) {
  var self = this;
  if (typeof noteStoreUrl !== 'undefined') {
    self.noteStoreUrl = noteStoreUrl;
  }
  return new Store(Evernote.NoteStoreClient, function(callback) {
    if (self.noteStoreUrl) {
      callback(null, self.token, self.noteStoreUrl);
    } else {
      self.getUserStore().getNoteStoreUrl(function(err, noteStoreUrl) {
        self.noteStoreUrl = noteStoreUrl;
        callback(err, self.token, self.noteStoreUrl);
      });
    }
  });
};

Client.prototype.getSharedNoteStore = function(linkedNotebook) {
  var self = this;
  return new Store(Evernote.NoteStoreClient, function(callback) {
    if (self.sharedToken) {
      callback(null, self.sharedToken, linkedNotebook.noteStoreUrl);
    } else {
      var noteStore = new Store(Evernote.NoteStoreClient, function(cb) {
        cb(null, self.token, linkedNotebook.noteStoreUrl);
      });
      noteStore.authenticateToSharedNotebook(linkedNotebook.shareKey, function(err, sharedAuth) {
        self.sharedToken = sharedAuth.authenticationToken;
        callback(err, self.sharedToken, linkedNotebook.noteStoreUrl);
      });
    }
  });
};

Client.prototype.getBusinessNoteStore = function() {
  var self = this;
  return new Store(Evernote.NoteStoreClient, function(callback) {
    if (self.bizToken && self.bizNoteStoreUrl) {
      callback(null, self.bizToken, self.bizNoteStoreUrl);
    } else {
      self.getUserStore().authenticateToBusiness(function(err, bizAuth) {
        self.bizToken = bizAuth.authenticationToken;
        self.bizNoteStoreUri = bizAuth.noteStoreUrl;
        self.bizUser = bizAuth.user;
        callback(err, self.bizToken, self.bizNoteStoreUri);
      });
    }
  });
};

Client.prototype.getOAuthClient = function(callbackUrl) {
  var self = this;
  return new OAuth(
    self.getEndpoint('oauth'),
    self.getEndpoint('oauth'),
    self.consumerKey,
    self.consumerSecret,
    "1.0",
    callbackUrl,
    "HMAC-SHA1");
};

Client.prototype.getEndpoint = function(path) {
  var self = this;
  var url = 'https://' + self.serviceHost;
  if (path) {
    url += '/' + path;
  }
  return url
};

var Store = function(clientClass, enInfoFunc) {
  var self = this;
  self.clientClass = clientClass;
  self.enInfoFunc = enInfoFunc;

  for (var key in self.clientClass.prototype) {
    if (key.indexOf('_') != -1 || typeof(self.clientClass.prototype[key]) != 'function') continue;
    self[key] = self.createWrapperFunction(key);
  }
};

Store.prototype.createWrapperFunction = function(name) {
  var self = this;
  return function() {
    var orgArgs = arguments;
    self.getThriftClient(function(err, client, token) {
      if (err) {
        callback = orgArgs[orgArgs.length - 1];
        if (callback && typeof(callback) === "function") {
          callback(err);
        } else {
          throw "Evernote SDK for Node.js doesn't support synchronous calls";
        }
        return;
      }
      var orgFunc = client[name];
      var orgArgNames = self.getParamNames(orgFunc);
      if (orgArgNames != null && orgArgs.length + 1 == orgArgNames.length) {
        try {
          var newArgs = [];
          for (var i in orgArgNames) {
            if (orgArgNames[i] == 'authenticationToken') newArgs.push(token);
            if (i < orgArgs.length) newArgs.push(orgArgs[i]);
          }
          orgFunc.apply(client, newArgs);
        } catch (e) {
          orgFunc.apply(client, orgArgs);
        }
      } else {
        orgFunc.apply(client, orgArgs);
      }
    });
  };
};

Store.prototype.getThriftClient = function(callback) {
  var self = this;
  self.enInfoFunc(function(err, token, url) {
    var m = token.match(/:A=([^:]+):/);
    if (m) {
      self.userAgentId = m[1];
    } else {
      self.userAgentId = '';
    }
    var transport = new Evernote.Thrift.NodeBinaryHttpTransport(url);
    transport.addHeaders(
      {'User-Agent':
        self.userAgentId + ' / ' + pjson.version + '; Node.js / ' + process.version});
    var protocol = new Evernote.Thrift.BinaryProtocol(transport);
    callback(err, new self.clientClass(protocol), token);
  });
};

Store.prototype.getParamNames = function(func) {
  var funStr = func.toString();
  return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g);
};

exports.Client = Client;
