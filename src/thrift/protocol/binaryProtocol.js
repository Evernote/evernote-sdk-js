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


Thrift.BinaryProtocol = function (trans, strictRead, strictWrite) {
    this.transport = this.trans = trans;
    this.strictRead = (strictRead !== undefined ? strictRead : false);
    this.strictWrite = (strictWrite !== undefined ? strictWrite : true);
};

Thrift.BinaryParser = {
    fromByte: function (b) {
        return new Int8Array([b]).buffer;
    },

    fromShort: function (i16) {
        i16 = parseInt(i16);
        var buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, i16);
        return buffer;
    },

    fromInt: function (i32) {
        i32 = parseInt(i32);
        var buffer = new ArrayBuffer(4);
        new DataView(buffer).setInt32(0, i32);
        return buffer;
    },

    fromLong: function (n) {
        n = parseInt(n);
        if (Math.abs(n) >= Math.pow(2, 53)) {
            throw new Error('Unable to accurately transfer numbers larger than 2^53 - 1 as integers. '
                + 'Number provided was ' + n);
        }

        var bits = (Array(64).join('0') + Math.abs(n).toString(2)).slice(-64);
        if (n < 0) bits = this.twosCompliment(bits);

        var buffer = new ArrayBuffer(8);
        var dataview = new DataView(buffer);
        for (var i = 0; i < 8; i++) {
            var uint8 = parseInt(bits.substr(8 * i, 8), 2);
            dataview.setUint8(i, uint8);
        }

        return buffer;
    },

    twosCompliment: function (bits) {
        // Convert to two's compliment using string manipulation because bitwise operator is limited to 32 bit numbers
        var smallestOne = bits.lastIndexOf('1');
        var left = bits.substring(0, smallestOne).
            replace(/1/g, 'x').
            replace(/0/g, '1').
            replace(/x/g, '0');
        bits = left + bits.substring(smallestOne);
        return bits;
    },

    fromDouble: function (d) {
        var buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, d);
        return buffer;
    },

    fromString: function (s) {
        var i;
        var utf8 = unescape(encodeURIComponent(s));
        var len = utf8.length;
        var bytes = new Uint8Array(len);

        for (i = 0; i < len; i++) {
            bytes[i] = utf8.charCodeAt(i);
        }
        return bytes.buffer;
    },


    toByte: function (dataview) {
        return dataview.getUint8(0);
    },

    toBytes: function (dataview) {
        return new Uint8Array(dataview.buffer, dataview.byteOffset, dataview.byteLength);
    },

    toShort: function (dataview) {
        return dataview.getInt16(0);
    },

    toInt: function (dataview) {
        return dataview.getInt32(0);
    },

    toLong: function (dataview) {
        // Javascript does not support 64-bit integers. Only decode values up to 2^53 - 1.
        var sign = 1;
        var bits = '';
        for (var i = 0; i < 8; i++) {
            bits += (Array(8).join('0') + dataview.getUint8(i).toString(2)).slice(-8);
        }

        if (bits[0] === '1') {
            sign = -1;
            bits = this.twosCompliment(bits);
        }
        var largestOne = bits.indexOf('1');
        if (largestOne != -1 && largestOne < 64 - 54) throw new Error('Unable to receive number larger than 2^53 - 1 as an integer');

        return parseInt(bits, 2) * sign;
    },

    toDouble: function (dataview) {
        return dataview.getFloat64(0);
    },

    toString: function (dataview) {
        var s = '';
        var i;
        var len = dataview.byteLength;
        var hex;

        for (i = 0; i < len; i++) {
            hex = dataview.getUint8(i).toString(16);
            if (hex.length == 1) hex = '0' + hex;
            s += '%' + hex;
        }

        s = decodeURIComponent(s);
        return s;
    }
};


(function(p) {
    var BinaryParser = Thrift.BinaryParser;

    p.flush = function () {
        return this.trans.flush();
    };
    
    // NastyHaxx. JavaScript forces hex constants to be
    // positive, converting this into a long. If we hardcode the int value
    // instead it'll stay in 32 bit-land.
    
    var VERSION_MASK = -65536, // 0xffff0000
        VERSION_1 = -2147418112, // 0x80010000
        TYPE_MASK = 0x000000ff;

    var Type = Thrift.Type;
    
    p.writeMessageBegin = function (name, type, seqid) {
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
    
    p.writeMessageEnd = function () {
    };
    
    p.writeStructBegin = function (name) {
    };
    
    p.writeStructEnd = function () {
    };
    
    p.writeFieldBegin = function (name, type, id) {
        this.writeByte(type);
        this.writeI16(id);
    };
    
    p.writeFieldEnd = function () {
    };
    
    p.writeFieldStop = function () {
        this.writeByte(Type.STOP);
    };
    
    p.writeMapBegin = function (ktype, vtype, size) {
        this.writeByte(ktype);
        this.writeByte(vtype);
        this.writeI32(size);
    };
    
    p.writeMapEnd = function () {
    };
    
    p.writeListBegin = function (etype, size) {
        this.writeByte(etype);
        this.writeI32(size);
    };
    
    p.writeListEnd = function () {
    };
    
    p.writeSetBegin = function (etype, size) {
        console.log('write set', etype, size);
        this.writeByte(etype);
        this.writeI32(size);
    };
    
    p.writeSetEnd = function () {
    };
    
    p.writeBool = function (bool) {
        if (bool) {
            this.writeByte(1);
        } else {
            this.writeByte(0);
        }
    };
    
    p.writeByte = function (b) {
        this.trans.write(BinaryParser.fromByte(b));
    };

    p.writeBinary = function (bytes) {
      if(typeof bytes === "string") {
        bytes = BinaryParser.fromString(bytes);
      }
      if (bytes.byteLength) {
        this.writeI32(bytes.byteLength);
      } else {
        throw Error("Cannot read length of binary data");
      }
      this.trans.write(bytes);
    }; 

    p.writeI16 = function (i16) {
        this.trans.write(BinaryParser.fromShort(i16));
    };
    
    p.writeI32 = function (i32) {
        this.trans.write(BinaryParser.fromInt(i32));
    };
    
    p.writeI64 = function (i64) {
        this.trans.write(BinaryParser.fromLong(i64));
    };
    
    p.writeDouble = function (dub) {
        this.trans.write(BinaryParser.fromDouble(dub));
    };
    
    p.writeString = function (str) {
        var bytes = BinaryParser.fromString(str);
        this.writeI32(bytes.byteLength);
        this.trans.write(bytes);
    };
    
    p.readMessageBegin = function () {
        var sz = this.readI32().value;
        var type, name, seqid;

        if (sz < 0) {
            // sz written at server: -2147418110 == 0x80010002
            var version = sz & VERSION_MASK;
            if (version != VERSION_1) {
                console.log("BAD: " + version);
                throw Error("Bad version in readMessageBegin: " + sz);
            }
            type = sz & TYPE_MASK;
            name = this.readString().value;
            seqid = this.readI32().value;
        } else {
            if (this.strictRead) {
                throw Error("No protocol version header");
            }
            name = this.trans.read(sz);
            type = this.readByte().value;
            seqid = this.readI32().value;
        }
        return {fname: name, mtype: type, rseqid: seqid};
    };
    
    p.readMessageEnd = function () {
    };
    
    p.readStructBegin = function () {
        return {fname: ''}; // Where is this return value used? Can it be removed?
    };
    
    p.readStructEnd = function () {
    };
    
    p.readFieldBegin = function () {
        var type = this.readByte().value;
        if (type == Type.STOP) {
            return {fname: null, ftype: type, fid: 0};
        }
        var id = this.readI16().value;
        return {fname: null, ftype: type, fid: id};
    };
    
    p.readFieldEnd = function () {
    };
    
    p.readMapBegin = function () {
        // Add variables required by thrift generated js code but not needed for BinaryHttpTransport
        this.rstack = [];
        this.rpos = [1];

        var ktype = this.readByte().value;
        var vtype = this.readByte().value;
        var size = this.readI32().value;
        return {ktype: ktype, vtype: vtype, size: size};
    };
    
    p.readMapEnd = function () {
    };
    
    p.readListBegin = function () {
        var etype = this.readByte().value;
        var size = this.readI32().value;
        return {etype: etype, size: size};
    };
    
    p.readListEnd = function () {
    };
    
    p.readSetBegin = function () {
        var etype = this.readByte().value;
        var size = this.readI32().value;
        return {etype: etype, size: size};
    };
    
    p.readSetEnd = function () {
    };
    
    p.readBool = function () {
        var b = this.readByte().value;
        if (b == 0) {
            return { value: false };
        }
        return { value: true };
    };
    
    // ThriftJS expects values to be wrapped in an object with a prop named "value"
    p.readByte = function () {
        var dataview = this.trans.read(1);
        var b = BinaryParser.toByte(dataview);
        return { value: b };
    };

    p.readI16 = function () {
        var dataview = this.trans.read(2);
        var n = BinaryParser.toShort(dataview);
        return { value: n };
    };
    
    p.readI32 = function () {
        var dataview = this.trans.read(4);
        var n = BinaryParser.toInt(dataview);
        return { value: n };
    };
    
    p.readI64 = function () {
        var dataview = this.trans.read(8);
        var n = BinaryParser.toLong(dataview);
        return { value: n };
    };
    
    p.readDouble = function () {
        var dataview = this.trans.read(8);
        var n = BinaryParser.toDouble(dataview);
        return { value: n };
    };
    
    p.readBinary = function () {
        var len = this.readI32().value;
        var dataview = this.trans.read(len);
        var bytes = BinaryParser.toBytes(dataview);
        return { value: bytes };
    };
    
    p.readString = function () {
        var len = this.readI32().value;
        var dataview = this.trans.read(len);
        var s = BinaryParser.toString(dataview);
        return { value: s };
    };
    
    p.getTransport = function () {
        return this.trans;
    };
    
    p.skip = function(type) {
        // console.log("skip: " + type);
        switch (type) {
            case Type.STOP:
                return;
            case Type.BOOL:
                this.readBool();
                break;
            case Type.BYTE:
                this.readByte();
                break;
            case Type.I16:
                this.readI16();
                break;
            case Type.I32:
                this.readI32();
                break;
            case Type.I64:
                this.readI64();
                break;
            case Type.DOUBLE:
                this.readDouble();
                break;
            case Type.STRING:
                this.readString();
                break;
            case Type.STRUCT:
                this.readStructBegin();
                while (true) {
                    var r = this.readFieldBegin();
                    if (r.ftype === Type.STOP) {
                        break;
                    }
                    this.skip(r.ftype);
                    this.readFieldEnd();
                }
                this.readStructEnd();
                break;
            case Type.MAP:
                var r = this.readMapBegin();
                for (var i = 0; i < r.size; ++i) {
                    this.skip(r.ktype);
                    this.skip(r.vtype);
                }
                this.readMapEnd();
                break;
            case Type.SET:
                var r = this.readSetBegin();
                for (var i = 0; i < r.size; ++i) {
                    this.skip(r.etype);
                }
                this.readSetEnd();
                break;
            case Type.LIST:
                var r = this.readListBegin();
                for (var i = 0; i < r.size; ++i) {
                    this.skip(r.etype);
                }
                this.readListEnd();
                break;
            default:
                throw Error("Invalid type: " + type);
        }
    }
})(Thrift.BinaryProtocol.prototype);


Thrift.BinaryHttpTransport = function(url) {
    this.url = url;
    this.buffer = [];
    this.received = null;
    this.offset = 0;
};

(function (p) {
	p.open = function () {
	};

	p.close = function () {
	};

	p.read = function (len) {
        var view = new DataView(this.received, this.offset, len);
        this.offset += len;
        return view;
	};

	p.write = function (bytes) {
        this.buffer.push(bytes);
	};

	p.flush = function (async) {
        if (!async) throw 'Error in BinaryHttpTransport.flush: Binary protocol does not support synchronous calls';

        var size = this.buffer.reduce(function (size, bytes) {
            return size + bytes.byteLength;
        }, 0);

        var allbytes = new Uint8Array(new ArrayBuffer(size));
        var pos = 0;
        this.buffer.forEach(function (bytes) {
            var view = null;
            if (bytes.buffer) view = (bytes instanceof Uint8Array) ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            else view = new Uint8Array(bytes);

            allbytes.set(view, pos);
            pos += bytes.byteLength;
        });

        this.buffer = [];

        return allbytes;
    };

    p.send = function (client, postData, args, recv_method) {
        args = Array.prototype.slice.call(args, 0);
        var onerror = args.pop();
        var callback = args.length > 0 ? args.pop() : onerror;
        if (typeof callback !== 'function') callback = onerror;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.url, /*async*/true);
        xhr.setRequestHeader('Content-Type', 'application/x-thrift');
        xhr.setRequestHeader('Accept', 'application/x-thrift');
        xhr.responseType = 'arraybuffer';
        
        xhr.onload = function (evt) {
            this.received = xhr.response;
            this.offset = 0;
            try {
                var value = recv_method.call(client);
            } catch (exception) {
                //console.log(JSON.stringify(exception));
                value = exception;
                callback = onerror;
            }
            callback(value);
        }.bind(this);

        xhr.onerror = function (evt) {
            //console.log(JSON.stringify(evt));
            onerror(evt);
        };

        xhr.send(postData.buffer);
	};

})(Thrift.BinaryHttpTransport.prototype);


