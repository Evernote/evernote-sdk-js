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
import {NoteStoreClient, UserStoreClient} from './stores';

class WrappedNoteStoreClient {
  constructor(enInfoFunc) {
    this.enInfoFunc = enInfoFunc;

    for (let key in NoteStoreClient.prototype) {
      if (key.indexOf('_') === -1 && typeof NoteStoreClient.prototype[key] === 'function') {
        this[key] = this.createWrapperFunction(key);
      }
    }
  }

  getThriftClient() {
    if (!this._thriftClient) {
      this._thriftClient = this.enInfoFunc().then(({token, url}) => {
        return new NoteStoreClient({token, url});
      });
    }
    return this._thriftClient;
  }

  createWrapperFunction(name) {
    return (...orgArgs) => {
      return this.getThriftClient().then(client => {
        return client[name].apply(client, orgArgs);
      });
    };
  }

  getParamNames(func) {
    const funStr = func.toString();
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
  }
}

class Client {
  constructor(options = {}) {
    this.consumerKey = options.consumerKey;
    this.consumerSecret = options.consumerSecret;
    this.sandbox = options.sandbox === undefined ? true : options.sandbox;
    this.china = !!options.china;
    this.token = options.token;
    let defaultServiceHost;
    if (this.sandbox) {
      defaultServiceHost = 'sandbox.evernote.com';
    } else if (this.china) {
      defaultServiceHost = 'app.yinxiang.com';
    } else {
      defaultServiceHost = 'www.evernote.com';
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
    oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier,
    (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
      this.token = oauthAccessToken;
      callback(err, oauthAccessToken, oauthAccessTokenSecret, results);
    });
  }

  getUserStore() {
    if (!this._userStore) {
      this._userStore = new UserStoreClient({
        token: this.token,
        url: this.getEndpoint('/edam/user'),
      });
    }
    return this._userStore;
  }

  getNoteStore(noteStoreUrl) {
    if (noteStoreUrl) {
      this.noteStoreUrl = noteStoreUrl;
    }
    return new WrappedNoteStoreClient(() => {
      if (this.noteStoreUrl) {
        return Promise.resolve({token: this.token, url: this.noteStoreUrl});
      } else {
        return this.getUserStore().getUserUrls().then(userUrls => {
          this.noteStoreUrl = userUrls.noteStoreUrl; // cache for later calls
          return {token: this.token, url: userUrls.noteStoreUrl};
        });
      }
    });
  }

  getSharedNoteStore(linkedNotebook) {
    return new WrappedNoteStoreClient(() => {
      const cache = this[linkedNotebook.sharedNotebookGlobalId];
      if (cache.sharedToken) {
        return Promise.resolve({token: cache.sharedToken, url: linkedNotebook.noteStoreUrl});
      } else {
        return this.getNoteStore().authenticateToSharedNotebook(linkedNotebook.sharedNotebookGlobalId)
        .then(sharedAuth => {
          const token = sharedAuth.authenticationToken;
          // cache for later calls
          this[linkedNotebook.sharedNotebookGlobalId] = {sharedToken: token};
          return {token, url: linkedNotebook.noteStoreUrl};
        });
      }
    });
  }

  getBusinessNoteStore() {
    return new WrappedNoteStoreClient(() => {
      if (this.bizToken && this.bizNoteStoreUrl) {
        return Promise.resolve({token: this.bizToken, url: this.bizNoteStoreUrl});
      } else {
        return this.getUserStore().authenticateToBusiness().then(bizAuth => {
          this.bizToken = bizAuth.authenticationToken;
          this.bizNoteStoreUrl = bizAuth.noteStoreUrl;
          this.bizUser = bizAuth.user;
          return {token: bizAuth.authenticationToken, url: bizAuth.noteStoreUrl};
        });
      }
    });
  }

  getEndpoint(path) {
    let url = 'https://' + this.serviceHost;
    if (path) {
      url = `${url}/${path}`;
    }
    return url;
  }

  getOAuthClient(callbackUrl) {
    return new OAuth.OAuth(this.getEndpoint('oauth'), this.getEndpoint('oauth'),
      this.consumerKey, this.consumerSecret, '1.0', callbackUrl, 'HMAC-SHA1');
  }
}

export default Client;
