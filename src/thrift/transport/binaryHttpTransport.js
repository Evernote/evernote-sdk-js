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

var MemBuffer = require('./memBuffer');
var http = require('http');
var url = require('url');

function BinaryHttpTransport (serviceUrl, quiet) {
    var parsedUrl = url.parse(serviceUrl);
    this.hostname = parsedUrl.hostname;
    this.port = parsedUrl.port;
    this.path = parsedUrl.path;
    this.url = parsedUrl.href;
    this.quiet = quiet;
    this.input = new MemBuffer();
    this.additionalHeaders = {};
};

BinaryHttpTransport.prototype.addHeaders = function (headers) {
    Object.assign(this.additionalHeaders, headers);
}

BinaryHttpTransport.prototype.open = function () {
};

BinaryHttpTransport.prototype.close = function () {
};

BinaryHttpTransport.prototype.read = function (len) {
    throw Error('BinaryHttpTransport object does not support reads');
};

BinaryHttpTransport.prototype.write = function (bytes) {
    this.input.write(bytes);
};

BinaryHttpTransport.prototype.clear = function () {
    this.input.clear();
};

BinaryHttpTransport.prototype.flush = function (callback) {
    var me = this;
    var options = {
        protocol: 'https:',
        hostname: this.hostname,
        port: this.port,
        path: this.path,
        method: 'POST',
        headers: Object.assign({}, {
            'Content-Type': 'application/x-thrift',
            'Accept': 'application/x-thrift'
        }, me.additionalHeaders)
    };
    var req = http.request(options, function (res) {
        var chunkCount = 0;
        var chunks = [];
        if (res.statusCode != 200) {
            me.log('Error in Thrift HTTP response: ' + res.statusCode);
            if (callback) callback(res);
        }
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            var buffer = Buffer.concat(chunks);
            if (callback) callback(null, new MemBuffer(buffer));
        });
    });

    req.on('error', function (err) {
        me.log('Error making Thrift HTTP request: ' + err);
        if (callback) callback(err);
    });

    this.input.flush();
    req.write(this.input.buffer);
    req.end();
    this.clear();
};

BinaryHttpTransport.prototype.log = function (msg) {
    if (this.quiet) return;
    console.log(msg);
};

module.exports = BinaryHttpTransport;
