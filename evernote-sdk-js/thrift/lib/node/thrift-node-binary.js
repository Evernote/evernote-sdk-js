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

var Url = require('url');

exports.NodeBinaryHttpTransport = function(url) {
  var self = this;
  var http = require('http');
  var https = require('https');

  this.url = url;
  this.buffer = [];
  this.received = null;
  this.offset = 0;
  this.headers = {
    'Content-Type': 'application/x-thrift',
    'Accept': 'application/x-thrift'
  };

  this.addHeaders = function(headers) {
    for (k in headers) {
      self.headers[k] = headers[k];
    }
  };

	this.open = function () {
	};

	this.close = function () {
	};

  this.read = function (len) {
    var view = new DataView(this.received, this.offset, len);
    self.offset += len;
    return view;
  };

	this.write = function (bytes) {
    self.buffer.push(bytes);
	};

  this.flush = function (async) {
    if (!async) throw 'Error in NodeBinaryHttpTransport.flush: Binary protocol does not support synchronous calls';

    var size = self.buffer.reduce(function (size, bytes) {
      return size + bytes.byteLength;
    }, 0);

    var ab = new ArrayBuffer(size);
    var allbytes = new Uint8Array(ab);
    var pos = 0;
    self.buffer.forEach(function (bytes) {
      var view = null;
      if (bytes.buffer) {
        if (bytes instanceof Uint8Array) {
          view = bytes;
        } else {
          view = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        }
      } else {
        view = new Uint8Array(bytes);
      }

      allbytes.set(view, pos);
      pos += bytes.byteLength;
    });

    self.buffer = [];

    return ab
  };

  this.send = function (client, postData, args, recv_method) {
    self.offset = 0;
    args = Array.prototype.slice.call(args, 0);
    var callback = args.pop();

    try {
      var purl = Url.parse(self.url);
    } catch (err) {
      callback("Invalid endpoint URL: " + self.url);
      return;
    }
    var options = {
      hostname: purl['host'],
      port: purl['protocol'] == 'https' ? 443 : 80,
      path: purl['path'],
      method: 'POST',
      headers: self.headers
    };
    var doRequest = (purl['protocol'] == 'https' ? https : http).request;

    var req = doRequest(options, function(res) {
      var data = [], dataLength = 0;
      res.on('data', function(chunk) {
        data.push(chunk);
        dataLength += chunk.length;
      });

      res.on('end', function() {
        if (res.headers['content-type'] != 'application/x-thrift') {
          callback('Bad response content type from "' + self.url + '": '
            + res.headers['content-type']);
          return;
        }

        var buffer = new Buffer(dataLength);
        for (var i = 0, len = data.length, pos = 0; i < len; i++) {
          data[i].copy(buffer, pos);
          pos += data[i].length;
        }
        self.received = bufferToArrayBuffer(buffer);
        try {
          callback(null, recv_method.call(client));
        } catch(e) {
          callback(e);
        }
      });
    });

    req.on('error', function(e) {
      callback(e);
    });

    req.write(arrayBufferToBuffer(postData));
    req.end();
  };

  var arrayBufferToBuffer = function(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  };

  var bufferToArrayBuffer = function(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  };

};

