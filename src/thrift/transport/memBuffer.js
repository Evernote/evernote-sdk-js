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

function MemBuffer(buffer) {
    this.queue = [];
    this.offset = 0;
    this.buffer = buffer;
}

MemBuffer.prototype.read = function (len) {
    if (this.offset + len > this.buffer.length) throw Error('MemBuffer overrun');
    // console.log('MemBuffer.read len: ' + len + ' buffer.length: ' + this.buffer.length + ' offset: ' + this.offset);
    var buffer = this.buffer.slice(this.offset, this.offset + len);
    this.offset += len;
    return buffer;
};

MemBuffer.prototype.write = function (buffer) {
    if (Buffer.isBuffer(buffer)) {
        this.queue.push(buffer);
    } else {
        throw Error('Unsupported type sent to MemBuffer.write. Accepts Buffer.');
    }
};

MemBuffer.prototype.clear = function () {
    this.queue = [];
    this.buffer = null;
    this.offset = 0;
};

MemBuffer.prototype.flush = function () {
    if (this.buffer) this.queue.unshift(this.buffer);
    this.buffer = Buffer.concat(this.queue);
    this.queue = [];
};

module.exports = MemBuffer;
