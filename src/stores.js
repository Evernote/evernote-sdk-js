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
/* eslint-env node */

import {NoteStore as EDAMNoteStore} from './thrift/gen-js2/NoteStore';
import {UserStore as EDAMUserStore} from './thrift/gen-js2/UserStore';
import BinaryHttpTransport from './thrift/transport/binaryHttpTransport';
import BinaryProtocol from './thrift/protocol/binaryProtocol';
import pjson from '../package.json';

const AUTH_PLACEHOLDER = 'AUTH_TOKEN';
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

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
 * @param {String} fnName
 * @return {Promise}
 */
function makeProxyPromise(fn, fnName) {
  return function() {
    let newArgs = [];
    let paramNames = getParamNames(fn);
    let requiresAuthToken = false;
    paramNames.pop(); // remove the callback parameter, will use Promise instead.
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
    return new Promise((resolve, reject) => {
      const expectedNum = requiresAuthToken ? paramNames.length - 1 : paramNames.length;
      const actualNum = requiresAuthToken ? newArgs.length - 1 : newArgs.length;
      if (expectedNum !== actualNum) {
        reject(`Incorrect number of arguments passed to ${fnName}: expected ${expectedNum} but found ${actualNum}`);
      } else {
        const prelimPromise = requiresAuthToken ? this.getAuthToken() : Promise.resolve();
        prelimPromise.then(authTokenMaybe => {
          if (authTokenMaybe) {
            newArgs[newArgs.indexOf(AUTH_PLACEHOLDER)] = authTokenMaybe;
          }
          newArgs.push((err, response) => err ? reject(err) : resolve(response));
          fn.apply(this, newArgs);
        }).catch(err => reject(err));
      }
    });
  };
}

function extendClientWithEdamClient(Client, EDAMClient) {
  for (let key in EDAMClient.prototype) {
    if (typeof EDAMClient.prototype[key] === 'function') {
      Client.prototype[key] = makeProxyPromise(EDAMClient.prototype[key], key);
    }
  }
}

function getAdditionalHeaders(token) {
  const m = token && token.match(/:A=([^:]+):/);
  const userAgentId = m ? m[1] : '';
  return {
    'User-Agent': `${userAgentId}/${pjson.version}; Node.js / ${process.version}`,
  };
}

class UserStoreClient extends EDAMUserStore.Client {
  constructor(opts = {}) {
    if (opts.url) {
      const transport = new BinaryHttpTransport(opts.url);
      const protocol = new BinaryProtocol(transport);
      transport.addHeaders(getAdditionalHeaders(opts.token));
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
    return new Promise(resolve => resolve(this.token));
  }
}
extendClientWithEdamClient(UserStoreClient, EDAMUserStore.Client);

class NoteStoreClient extends EDAMNoteStore.Client {
  constructor(opts = {}) {
    if (opts.url) {
      const transport = new BinaryHttpTransport(opts.url);
      const protocol = new BinaryProtocol(transport);
      transport.addHeaders(getAdditionalHeaders(opts.token));
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
    return new Promise(resolve => resolve(this.token));
  }
}

extendClientWithEdamClient(NoteStoreClient, EDAMNoteStore.Client);

export {NoteStoreClient, UserStoreClient};
