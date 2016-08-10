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

import OAuth from 'oauth';
import pjson from '../package.json';
import {NoteStoreClient, UserStoreClient} from './stores';

export default class Client {
  constructor(options = {}) {
    this.consumerKey = options.consumerKey;
    this.consumerSecret = options.consumerSecret;
    this.sandbox = options.sandbox === undefined ? true : options.sandbox;
    this.china = !!options.china;
    this.token = options.token;
    this.secret = options.secret;
    let defaultServiceHost;
    if (this.sandbox) {
      this.defaultServiceHost = 'sandbox.evernote.com';
    } else if (this.china) {
      this.defaultServiceHost = 'app.yinxiang.com';
    } else {
      this.defaultServiceHost = 'www.evernote.com';
    }
    this.serviceHost = options.serviceHost || defaultServiceHost;
  }

  getRequestToken(callbackUrl, callback) {
    const oauth = this.getOAuthClient(callbackUrl);
    oauth.getOAuthRequestToken((err, oauthToken, oauthTokenSecret, results) => {
      callback(err, oauthToken, oauthTokenSecret, results);
    });
  }

  getAuthorizeUrl(oauthToken) {
    return `${this.getEndpoint('OAuth.action')}?oauth_token=${oauthToken}`;
  }

  getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, callback) {
    var oauth = this.getOAuthClient('');
    oauth.getOAuthAccessToken(oauthTokenSecret, oauthTokenSecret, oauthVerifier,
      (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
        callback(err, oauthAccessToken, oauthAccessTokenSecret, results);
        this.token = oauthAccessToken;
    });
  }

  getUserStore() {
    if (!this._userStore) {
      this._userStore = new UserStoreClient({
        token: this.token,
        url: this._getEndpoint('/edam/user'),
      });
    }
    return this._userStore;
  }

  getEndpoint(path) {
    let url = 'https://' + this.serviceHost;
    if (path) {
      url = `${url}/path`;
    }
    return url;
  };

  getOAuthClient(callbackUrl) {
    return new OAuth.OAuth(this.getEndpoint('oauth'), this.getEndpoint('oauth'),
      this.consumerKey, this.consumerSecret, '1.0', callbackUrl, 'HMAC-SHA1');
  }
}

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
    var thisStore = this;
    if (thisStore.sharedToken) {
      callback(null, thisStore.sharedToken, linkedNotebook.noteStoreUrl);
    } else {
      var noteStore = new Store(Evernote.NoteStoreClient, function(cb) {
        cb(null, self.token, linkedNotebook.noteStoreUrl);
      });
      noteStore.authenticateToSharedNotebook(linkedNotebook.shareKey, function(err, sharedAuth) {
        if (err) {
          return callback(err);
        }
        thisStore.sharedToken = sharedAuth.authenticationToken;
        callback(null, thisStore.sharedToken, linkedNotebook.noteStoreUrl);
      });
    }
  });
};

Client.prototype.getBusinessNoteStore = function() {
  var self = this;
  return new Store(Evernote.NoteStoreClient, function(callback) {
    var thisStore = this;
    if (thisStore.bizToken && thisStore.bizNoteStoreUri) {
      callback(null, thisStore.bizToken, thisStore.bizNoteStoreUri);
    } else {
      self.getUserStore().authenticateToBusiness(function(err, bizAuth) {
        if (err) {
          return callback(err);
        }
        thisStore.bizToken = bizAuth.authenticationToken;
        thisStore.bizNoteStoreUri = bizAuth.noteStoreUrl;
        thisStore.bizUser = bizAuth.user;
        callback(null, thisStore.bizToken, thisStore.bizNoteStoreUri);
      });
    }
  });
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
      if (orgArgNames !== null && orgArgs.length + 1 == orgArgNames.length) {
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
    if (err) {
      return callback(err);
    }
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
    callback(null, new self.clientClass(protocol), token);
  });
};

Store.prototype.getParamNames = function(func) {
  var funStr = func.toString();
  return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g);
};

exports.Client = Client;
