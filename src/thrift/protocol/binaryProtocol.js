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

var Thrift = require('../thrift');
var Type = Thrift.Type;

// NastyHaxx. JavaScript forces hex constants to be
// positive, converting this into a long. If we hardcode the int value
// instead it'll stay in 32 bit-land.

var VERSION_MASK = -65536, // 0xffff0000
    VERSION_1 = -2147418112, // 0x80010000
    TYPE_MASK = 0x000000ff;

function BinaryProtocol(trans, strictRead, strictWrite) {
    this.transport = this.trans = trans;
    this.strictRead = (strictRead !== undefined ? strictRead : false);
    this.strictWrite = (strictWrite !== undefined ? strictWrite : true);
}

BinaryProtocol.prototype.flush = function (callback) {
    var wrapTransport;

    if (callback) {
        wrapTransport = function (err, transport) {
            var protocol;
            if (transport) protocol = new BinaryProtocol(transport);
            return callback(err, protocol);
        };
    }

    return this.trans.flush(wrapTransport);
};

BinaryProtocol.prototype.writeMessageBegin = function (name, type, seqid) {
    if (this.strictWrite) {
        this.writeI32(VERSION_1 | type);
        this.writeString(name);
        this.writeI32(seqid);
    } else {
        this.writeString(name);
        this.writeByte(type);
        this.writeI32(seqid);
    }
};

BinaryProtocol.prototype.writeMessageEnd = function () {
};

BinaryProtocol.prototype.writeStructBegin = function (name) {
};

BinaryProtocol.prototype.writeStructEnd = function () {
};

BinaryProtocol.prototype.writeFieldBegin = function (name, type, id) {
    this.writeByte(type);
    this.writeI16(id);
};

BinaryProtocol.prototype.writeFieldEnd = function () {
};

BinaryProtocol.prototype.writeFieldStop = function () {
    this.writeByte(Type.STOP);
};

BinaryProtocol.prototype.writeMapBegin = function (ktype, vtype, size) {
    this.writeByte(ktype);
    this.writeByte(vtype);
    this.writeI32(size);
};

BinaryProtocol.prototype.writeMapEnd = function () {
};

BinaryProtocol.prototype.writeListBegin = function (etype, size) {
    this.writeByte(etype);
    this.writeI32(size);
};

BinaryProtocol.prototype.writeListEnd = function () {
};

BinaryProtocol.prototype.writeSetBegin = function (etype, size) {
    this.writeByte(etype);
    this.writeI32(size);
};

BinaryProtocol.prototype.writeSetEnd = function () {
};

BinaryProtocol.prototype.writeBool = function (bool) {
    if (bool) {
        this.writeByte(1);
    } else {
        this.writeByte(0);
    }
};

BinaryProtocol.prototype.writeByte = function (b) {
    this.trans.write(BinaryParser.fromByte(b));
};

BinaryProtocol.prototype.writeBinary = function (bytes) {
    if(typeof bytes === "string") {
        bytes = BinaryParser.fromString(bytes);
    }
    if (bytes.length != null) {
        this.writeI32(bytes.length);
    } else {
        throw Error("Cannot read length of binary data");
    }
    this.trans.write(bytes);
};

BinaryProtocol.prototype.writeI16 = function (i16) {
    this.trans.write(BinaryParser.fromShort(i16));
};

BinaryProtocol.prototype.writeI32 = function (i32) {
    this.trans.write(BinaryParser.fromInt(i32));
};

BinaryProtocol.prototype.writeI64 = function (i64) {
    var buffer = BinaryParser.fromLong(i64);
    this.trans.write(buffer);
};

BinaryProtocol.prototype.writeDouble = function (dub) {
    this.trans.write(BinaryParser.fromDouble(dub));
};

BinaryProtocol.prototype.writeString = function (str) {
    var bytes = BinaryParser.fromString(str);
    this.writeI32(bytes.length);
    this.trans.write(bytes);
};

BinaryProtocol.prototype.writeType = function(type, value) {
    switch (type) {
        case Type.BOOL:
            return this.writeBool(value);
        case Type.BYTE:
            return this.writeByte(value);
        case Type.I16:
            return this.writeI16(value);
        case Type.I32:
            return this.writeI32(value);
        case Type.I64:
            return this.writeI64(value);
        case Type.DOUBLE:
            return this.writeDouble(value);
        case Type.STRING:
            return this.writeString(value);
        case Type.BINARY:
            return this.writeBinary(value);
//            case Type.STRUCT:
//            case Type.MAP:
//            case Type.SET:
//            case Type.LIST:
        default:
            throw Error("Invalid type: " + type);
    }
};

BinaryProtocol.prototype.readMessageBegin = function () {
    var size = this.readI32();
    var signature = {
        mtype: null,
        fname: null,
        seqid: null
    };

    if (size < 0) {
        // size written at server: -2147418110 == 0x80010002
        var version = size & VERSION_MASK;
        if (version != VERSION_1) {
            console.log("BAD: " + version);
            throw Error("Bad version in readMessageBegin: " + size);
        }
        signature.mtype = size & TYPE_MASK;
        signature.fname = this.readString();
        signature.seqid = this.readI32();
    } else {
        if (this.strictRead) {
            throw Error("No protocol version header");
        }

        signature.fname = this.trans.read(size);
        signature.mtype = this.readByte();
        signature.seqid = this.readI32();
    }

    return signature;
};

BinaryProtocol.prototype.readMessageEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readStructBegin = function () {
    return {fname: ''}; // Where is this return value used? Can it be removed?
};

BinaryProtocol.prototype.readStructEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readFieldBegin = function () {
    var type = this.readByte();
    var field = {
        fname: null,
        ftype: type,
        fid: 0
    };

    if (type != Type.STOP) {
        field.fid = this.readI16();
    }

    return field;
};

BinaryProtocol.prototype.readFieldEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readMapBegin = function () {
    // Add variables required by thrift generated js code but not needed for BinaryHttpTransport
    var result = {
        ktype: null,
        vtype: null,
        size: null
    };

    result.ktype = this.readByte();
    result.vtype = this.readByte();
    result.size = this.readI32();

    return result;
};

BinaryProtocol.prototype.readMapEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readListBegin = function () {
    var result = {
        etype: null,
        size: null
    };
    result.etype = this.readByte();
    result.size = this.readI32();
    return result;
};

BinaryProtocol.prototype.readListEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readSetBegin = function () {
    var result = {
        etype: null,
        size: null
    };
    result.etype = this.readByte();
    result.size = this.readI32();
    return result;
};

BinaryProtocol.prototype.readSetEnd = function () {
    // Do nothing
};

BinaryProtocol.prototype.readBool = function () {
    var b = this.readByte();
    return (b == 1);
};

// ThriftJS expects values to be wrapped in an object with a prop named "value"
BinaryProtocol.prototype.readByte = function () {
    var buffer = this.trans.read(1);
    var result = buffer.readUInt8(0);
    return result;
};

BinaryProtocol.prototype.readI16 = function () {
    var buffer = this.trans.read(2);
    var result = buffer.readInt16BE(0);
    return result;
};

BinaryProtocol.prototype.readI32 = function () {
    var buffer = this.trans.read(4);
    var result = buffer.readInt32BE(0);
    return result;
};

BinaryProtocol.prototype.readI64 = function () {
    var buffer = this.trans.read(8);
    var result = BinaryParser.toLong(buffer);
    return result;
};

BinaryProtocol.prototype.readDouble = function () {
    var buffer = this.trans.read(8);
    var result = buffer.readDoubleBE(0);
    return result;
};

BinaryProtocol.prototype.readBinary = function () {
    var len = this.readI32();
    var buffer = this.trans.read(len);
    return buffer;
};

BinaryProtocol.prototype.readString = function () {
    var len = this.readI32();
    var buffer = this.trans.read(len);
    var result = buffer.toString();
    return result;
};

BinaryProtocol.prototype.readType = function(type) {
    switch (type) {
        case Type.BOOL:
            return this.readBool();
        case Type.BYTE:
            return this.readByte();
        case Type.I16:
            return this.readI16();
        case Type.I32:
            return this.readI32();
        case Type.I64:
            return this.readI64();
        case Type.DOUBLE:
            return this.readDouble();
        case Type.STRING:
            return this.readString();
        case Type.BINARY:
            return this.readBinary();
//            case Type.STRUCT:
//            case Type.MAP:
//            case Type.SET:
//            case Type.LIST:
        default:
            throw new Error("Invalid type: " + type);
    }
};

BinaryProtocol.prototype.getTransport = function () {
    return this.trans;
};

BinaryProtocol.prototype.skipStruct = function() {
    this.readStructBegin();
    this.skipFields();
    this.readStructEnd();
};

BinaryProtocol.prototype.skipFields = function() {
    var r = this.readFieldBegin();
    if (r.ftype === Type.STOP) return;

    this.skip(r.ftype);
    this.readFieldEnd();
    this.skipFields();
};

BinaryProtocol.prototype.skipMap = function() {
    var i = 0;
    var map = this.readMapBegin();
    for (i = 0; i < map.size; i++) {
        this.skip(map.ktype);
        this.skip(map.vtype);
    }
    this.readMapEnd();
};

BinaryProtocol.prototype.skipSet = function() {
    var i = 0;
    var set = this.readSetBegin();
    for (i = 0; i < set.size; i++) {
        this.skip(set.etype);
    }
    this.readSetEnd();
};

BinaryProtocol.prototype.skipList = function() {
    var i = 0;
    var list = this.readListBegin();
    for (i = 0; i < list.size; i++) {
        this.skip(list.etype);
    }
    this.readListEnd();
};

BinaryProtocol.prototype.skip = function(type) {
    // console.log("skip: " + type);
    switch (type) {
        case Type.STOP:
            return;
        case Type.BOOL:
            return this.readBool();
        case Type.BYTE:
            return this.readByte();
        case Type.I16:
            return this.readI16();
        case Type.I32:
            return this.readI32();
        case Type.I64:
            return this.readI64();
        case Type.DOUBLE:
            return this.readDouble();
        case Type.STRING:
            return this.readString();
        case Type.STRUCT:
            return this.skipStruct();
        case Type.MAP:
            return this.skipMap();
        case Type.SET:
            return this.skipSet();
        case Type.LIST:
            return this.skipList();
        case Type.BINARY:
            return this.readBinary();
        default:
            throw Error("Invalid type: " + type);
    }
};


var BinaryParser = {};

BinaryParser.fromByte = function (b) {
    var buffer = new Buffer(1);
    buffer.writeInt8(b, 0);
    return buffer;
};

BinaryParser.fromShort = function (i16) {
    i16 = parseInt(i16);
    var buffer = new Buffer(2);
    buffer.writeInt16BE(i16, 0);
    return buffer;
};

BinaryParser.fromInt = function (i32) {
    i32 = parseInt(i32);
    var buffer = new Buffer(4);
    buffer.writeInt32BE(i32, 0);
    return buffer;
};

BinaryParser.fromLong = function (n) {
    n = parseInt(n);
    if (Math.abs(n) >= Math.pow(2, 53)) {
        throw new Error('Unable to accurately transfer numbers larger than 2^53 - 1 as integers. '
            + 'Number provided was ' + n);
    }

    var bits = (Array(64).join('0') + Math.abs(n).toString(2)).slice(-64);
    if (n < 0) bits = this.twosCompliment(bits);

    var buffer = new Buffer(8);
    for (var i = 0; i < 8; i++) {
        var uint8 = parseInt(bits.substr(8 * i, 8), 2);
        buffer.writeUInt8(uint8, i);
    }
    return buffer;
};

BinaryParser.twosCompliment = function (bits) {
    // Convert to two's compliment using string manipulation because bitwise operator is limited to 32 bit numbers
    var smallestOne = bits.lastIndexOf('1');
    var left = bits.substring(0, smallestOne).
        replace(/1/g, 'x').
        replace(/0/g, '1').
        replace(/x/g, '0');
    bits = left + bits.substring(smallestOne);
    return bits;
};

BinaryParser.fromDouble = function (d) {
    var buffer = new Buffer(8);
    buffer.writeDoubleBE(d, 0);
    return buffer;
};

BinaryParser.fromString = function (s) {
        var len = Buffer.byteLength(s);
        var buffer = new Buffer(len);
        buffer.write(s);
        return buffer;
};

BinaryParser.toLong = function (buffer) {
    // Javascript does not support 64-bit integers. Only decode values up to 2^53 - 1.
    var sign = 1;
    var bits = '';
    for (var i = 0; i < 8; i++) {
        bits += (Array(8).join('0') + buffer.readUInt8(i).toString(2)).slice(-8);
    }

    if (bits[0] === '1') {
        sign = -1;
        bits = this.twosCompliment(bits);
    }
    var largestOne = bits.indexOf('1');
    if (largestOne != -1 && largestOne < 64 - 54) throw new Error('Unable to receive number larger than 2^53 - 1 as an integer');

    return parseInt(bits, 2) * sign;
};


module.exports = BinaryProtocol;
