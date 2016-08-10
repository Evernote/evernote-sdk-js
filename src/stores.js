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

import {NoteStore as EDAMNoteStore} from './thrift/gen-js2/NoteStore'
import {UserStore as EDAMUserStore} from './thrift/gen-js2/UserStore'
import BinaryHttpTransport from './thrift/transport/BinaryHttpTransport'
import BinaryProtocol from './thrift/protocol/BinaryProtocol'

const AUTH_PLACEHOLDER = 'AUTH_TOKEN'
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm
const ARGUMENT_NAMES = /([^\s,]+)/g

/**
 * Finds parameter names for a given function.
 * @return {Object[]}
 */
function getParamNames(fn) {
  let fnString = fn.toString().replace(STRIP_COMMENTS, '');
  let paramNames = fnString.slice(fnString.indexOf('(') + 1, fnString.indexOf(')'))
      .match(ARGUMENT_NAMES);
  return paramNames === null ? [] : paramNames;
}

/**
 * Takes in a Store Client function, and supplies it with an authentication token when
 * necessary. Will return a Promise instead of using callbacks.
 *
 * @param {Function} fn
 * @return {Promise}
 */
function makeProxyPromise(fn) {
  return function() {
    let self = this;
    let newArgs = [];
    let paramNames = getParamNames(fn);
    let requiresAuthToken = false;
    paramNames.pop(); // Remove the callback parameter, will use Promise instead.
    for (let i = 0; i < paramNames.length; i++) {
      let param = paramNames[i];
      if (param === 'authenticationToken') {
        newArgs.push(AUTH_PLACEHOLDER);
        requiresAuthToken = true;
      }
      if (i < arguments.length) {
        newArgs.push(arguments[i]);
      }
    }
    return new Promise(function(resolve, reject) {
      if (requiresAuthToken) {
        self.getAuthToken()
          .then((authToken) => {
            newArgs[newArgs.indexOf(AUTH_PLACEHOLDER)] = authToken;
            finishPromiseCreation();
          })
          .catch((err) => reject(err));
      } else {
        finishPromiseCreation();
      }

      function finishPromiseCreation() {
        newArgs.push(function(err, response) {
          if (err) {
            return reject(err);
          }
          resolve(response);
        });
        fn.apply(self, newArgs);
      }
    });
  };
}

function extendClientWithEdamClient(Client, EDAMClient) {
  for (let key in EDAMClient.prototype) {
    if (typeof EDAMClient.prototype[key] === 'function') {
      Client.prototype[key] = makeProxyPromise(EDAMClient.prototype[key]);
    }
  }
}

class UserStoreClient extends EDAMUserStore.Client {
  constructor(opts={}) {
    if (opts.url) {
      const transport = new BinaryHttpTransport(opts.url);
      const protocol = new BinaryProtocol(transport);
      super(protocol);
      this.url = opts.url;
    } else {
      throw Error('UserStoreClient requires a UserStore Url when initialized');
    }
    if (opts.token) {
      this.token = opts.token;
    }
  }

  getAuthToken() {
    return new Promise(resolve => resolve(this.token))
  }
}
extendClientWithEdamClient(UserStoreClient, EDAMUserStore.Client);

class NoteStoreClient extends EDAMNoteStore.Client {
  constructor(opts={}) {
    if (opts.url) {
      const transport = new BinaryHttpTransport(opts.url);
      const protocol = new BinaryProtocol(transport);
      super(protocol);
      this.url = opts.url;
    } else {
      throw Error('NoteStoreClient requires a NoteStore Url when initialized');
    }
    if (opts.token) {
      this.token = opts.token;
    }
  }

  getAuthToken() {
    return new Promise(resolve => resolve(this.token))
  }
}

extendClientWithEdamClient(NoteStoreClient, EDAMNoteStore.Client)

export {NoteStoreClient, UserStoreClient}
