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

/*
 Description: 'JavaScript bindings for the Apache Thrift RPC system',
 License: 'http://www.apache.org/licenses/LICENSE-2.0',
 Homepage: 'http://thrift.apache.org',
 BugReports: 'https://issues.apache.org/jira/browse/THRIFT',
 Maintainer: 'dev@thrift.apache.org',
 */

'use strict'

var Thrift = {
    Version: '0.9.0',

    Type: {
        STOP : 0,
        VOID : 1,
        BOOL : 2,
        BYTE : 3,
        I08 : 3,
        DOUBLE : 4,
        I16 : 6,
        I32 : 8,
        I64 : 10,
        STRING : 11,
        UTF7 : 11,
        STRUCT : 12,
        EXCEPTION: 12,
        MAP : 13,
        SET : 14,
        LIST : 15,
        UTF8 : 16,
        UTF16 : 17,
        BINARY : 18
    },

    MessageType: {
        CALL : 1,
        REPLY : 2,
        EXCEPTION : 3
    },

    objectLength: function(obj) {
        var length = 0;
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                length++;
            }
        }

        return length;
    },

    inherits: function(constructor, superConstructor) {
        //Prototypal Inheritance http://javascript.crockford.com/prototypal.html
        function F() {}
        F.prototype = superConstructor.prototype;
        constructor.prototype = new F();
    }
};

// Check two Thrift.Type values for equality
// Used to support backwards compatibility for BINARY as STRING
Thrift.equals = function (t1, t2) {
    return t1 == t2 ||
        (t1 == Thrift.Type.BINARY && t2 == Thrift.Type.STRING) ||
        (t1 == Thrift.Type.STRING && t2 == Thrift.Type.BINARY);
};

// Represent binary types as strings when serialized
// Used to support backwards compatibility for BINARY as STRING
Thrift.serializedType = function (t) {
    return (t == Thrift.Type.BINARY) ? Thrift.Type.STRING : t;
};

// defaults taken from underscore.js
Thrift.defaults = function (target) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          if (target[prop] === void 0) target[prop] = source[prop];
        }
      }
    });
    return target;
};

// extend taken from underscore.js
Thrift.extend = function (target) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          target[prop] = source[prop];
        }
      }
    });
    return target;
};

//
// Method
//
Thrift.Method = function (config) {
    this.alias = config.alias;
    this.args = config.args;
    this.result = config.result;
};

Thrift.Method.define = function (config) {
    return new Thrift.Method(config);
};

Thrift.Method.noop = function () {
    // do nothing
};

Thrift.Method.sendException = function (output, seqid, structOrErr, structdef) {
    var config;

    if (!structdef) {
        if (structOrErr instanceof Thrift.TApplicationException) {
            structdef = Thrift.TApplicationException;
        } else if (structOrErr instanceof Thrift.TException) {
            structdef = Thrift.TException;
        } else {
            structdef = Thrift.TApplicationException;
            config = {};
            if (structOrErr) {
                if (structOrErr.message) config.message = structOrErr.message + '';
                if (structOrErr.code != null && Number.isFinite(config.code)) config.code = structOrErr.code;
            }
            structOrErr = new Thrift.TApplicationException(config);
        }
    }

    output.writeMessageBegin('', Thrift.MessageType.EXCEPTION, seqid);
    structdef.write(output, structOrErr);
    output.writeMessageEnd();
    output.flush();
};

Thrift.Method.prototype.sendRequest = function (output, seqid, struct, callback) {
    output.writeMessageBegin(this.alias, Thrift.MessageType.CALL, seqid);
    this.args.write(output, struct);
    output.writeMessageEnd();
    output.flush(function (err, response) {
        if (err) callback(err);
        else this.processResponse(response, callback);
    }.bind(this));
};

Thrift.Method.prototype.sendResponse = function (output, seqid, struct) {
    output.writeMessageBegin(this.alias, Thrift.MessageType.REPLY, seqid);
    this.result.write(output, struct);
    output.writeMessageEnd();
    output.flush();
};

Thrift.Method.prototype.processResponse = function (response, callback) {
    var header;
    var result;
    var err;
    var index;

    callback = callback || Thrift.Method.noop;

    var header = response.readMessageBegin();
    if (header.mtype == Thrift.MessageType.EXCEPTION) {
        err = Thrift.TApplicationException.read(response);
        response.readMessageEnd();
        callback(err);
        return;
    }

    if (header.mtype != Thrift.MessageType.REPLY) {
        err = Error('Client expects REPLY but received unsupported message type: ' + header.mtype);
        callback(err);
        return;
    }

    if (this.alias != header.fname) {
        err = Error('Unrecognized method name. Expected [' + me.alias + '] Received [' + header.fname + ']');
        callback(err);
        return;
    }

    result = this.result.read(response);
    response.readMessageEnd();

    // Exceptions are in fields
    for (index in this.result.fields) {
        if (index != 0 && result[this.result.fields[index].alias]) {
            err = result[this.result.fields[index].alias];
            callback(err);
            return;
        }
    }

    callback(null, result.returnValue);
};


//
// List
//
Thrift.List = {};

Thrift.List.define = function (name, type, def) {
    var ThriftList = function () {
        return [];
    };

    // Name param is optional to allow anonymous lists
    if (typeof name != 'string') {
        def = type;
        type = name;
        name = 'anonymous';
    }

    ThriftList.alias = name;
    ThriftList.type = type;
    ThriftList.def = def;
    ThriftList.read = Thrift.List.read.bind(null, ThriftList);
    ThriftList.write = Thrift.List.write.bind(null, ThriftList);

    return ThriftList;
};

Thrift.List.read = function (listdef, input) {
    var list = new listdef();
    var header = input.readListBegin();
    Thrift.List.readEntries(listdef, list, input, header.size);
    input.readListEnd();
    return list;
};

Thrift.List.readEntries = function (listdef, list, input, size) {
    var i;
    for (i = 0; i < size; i++) {
        if (listdef.def != null) {
            list.push(listdef.def.read(input));
        } else {
            list.push(input.readType(listdef.type));
        }
    }
};

Thrift.List.write = function (listdef, output, list) {
    var val;
    var index;
    var size = list.length;

    output.writeListBegin(listdef.type, size);
    for (index = 0; index < size; index++) {
        val = list[index];
        if (listdef.def) {
            listdef.def.write(output, val);
        } else {
            output.writeType(listdef.type, val);
        }
    }
    output.writeListEnd();
};

//
// Set
//
Thrift.Set = {};

Thrift.Set.define = function (name, type, def) {
    var ThriftSet = function () {
        return [];
    };

    // Name param is optional to allow anonymous sets
    if (typeof name != 'string') {
        def = type;
        type = name;
        name = 'anonymous';
    }

    ThriftSet.alias = name;
    ThriftSet.type = type;
    ThriftSet.def = def;
    ThriftSet.read = Thrift.Set.read.bind(null, ThriftSet);
    ThriftSet.write = Thrift.Set.write.bind(null, ThriftSet);

    return ThriftSet;
};

Thrift.Set.read = function (setdef, input) {
    var set = new setdef();
    var header = input.readSetBegin();
    Thrift.Set.readEntries(setdef, set, input, header.size);
    input.readSetEnd();
    return set;
};

Thrift.Set.readEntries = function (setdef, set, input, size) {
    var i;
    for (i = 0; i < size; i++) {
        if (setdef.def != null) {
            set.push(setdef.def.read(input));
        } else {
            set.push(input.readType(setdef.type));
        }
    }
};

Thrift.Set.write = function (setdef, output, set) {
    var val;
    var index;
    var size = set.length;

    output.writeSetBegin(setdef.type, size);
    for (index = 0; index < size; index++) {
        val = set[index];
        if (setdef.def) {
            setdef.def.write(output, val);
        } else {
            output.writeType(setdef.type, val);
        }
    }
    output.writeSetEnd();
};

//
// Map
//
Thrift.Map = {};

Thrift.Map.define = function (name, ktype, vtype, vdef) {
    var ThriftMap = function () {
        return {};
    };

    // Name param is optional to allow anonymous maps
    if (typeof name != 'string') {
        vdef = vtype;
        vtype = ktype;
        ktype = name;
        name = 'anonymous';
    }

    ThriftMap.alias = name;
    ThriftMap.ktype = ktype;
    ThriftMap.vtype = vtype;
    ThriftMap.vdef = vdef;
    ThriftMap.read = Thrift.Map.read.bind(null, ThriftMap);
    ThriftMap.write = Thrift.Map.write.bind(null, ThriftMap);

    return ThriftMap;
};

Thrift.Map.read = function (mapdef, input) {
    var map = new mapdef();
    var header = input.readMapBegin();
    Thrift.Map.readEntries(mapdef, map, input, header.size);
    input.readMapEnd();
    return map;
};

Thrift.Map.readEntries = function (mapdef, map, input, size) {
    var i;
    var key;
    for (i = 0; i < size; i++) {
        key = input.readType(mapdef.ktype);
        if (mapdef.vdef != null) {
            map[key] = mapdef.vdef.read(input);
        } else {
            map[key] = input.readType(mapdef.vtype);
        }
    }
};

Thrift.Map.write = function (mapdef, output, map) {
    var keys = Object.keys(map);
    var key;
    var value;
    var index;
    var size = keys.length;

    output.writeMapBegin(mapdef.ktype, mapdef.vtype, size);
    for (index = 0; index < size; index++) {
        key = keys[index];
        output.writeType(mapdef.ktype, key);
        value = map[key];
        if (mapdef.vdef) {
            mapdef.vdef.write(output, value);
        } else {
            output.writeType(mapdef.vtype, value);
        }
    }
    output.writeMapEnd();
};

//
// Struct
//
Thrift.Struct = {};

Thrift.Struct.define = function (name, fields) {
    var defaultValues = {};
    var fid;
    var field;

    fields = fields || {};

    for (fid in fields) {
        field = fields[fid];
        defaultValues[field.alias] = field.defaultValue || null;
    }

    var ThriftStruct = function (args) {
      // if an object is passed, use its fields as the defaults
      args = typeof args === 'object' ? args : {};
      return Thrift.defaults({}, args, defaultValues);
    };

    ThriftStruct.alias = name;
    ThriftStruct.fields = fields;
    ThriftStruct.defaultValues = defaultValues;
    ThriftStruct.read = Thrift.Struct.read.bind(null, ThriftStruct);
    ThriftStruct.write = Thrift.Struct.write.bind(null, ThriftStruct);
    ThriftStruct.values = Thrift.Struct.values.bind(null, ThriftStruct);
    ThriftStruct.setByDef = Thrift.Struct.setByDef.bind(null, ThriftStruct);

    return ThriftStruct;
};

Thrift.Struct.setByDef = function (structdef, struct, value) {
    var fid;
    var fields = structdef.fields;
    var field;
    var foundMatch = false;

    for (fid in fields) {
        field = fields[fid];
        if (field.def && value instanceof field.def) {
            struct[field.alias] = value;
            foundMatch = true;
            break;
        }
    }

    return foundMatch;
};

Thrift.Struct.values = function (structdef, struct) {
    var fields = structdef.fields;
    var keys = Object.keys(structdef.fields);
    var result = new Array(keys.length);
    var fid;
    var index;
    var i;

    for (i = 0; i < keys.length; i++) {
        fid = keys[i];
        index = fields[fid].index;
        if (index != null) result[index] = struct[fields[fid].alias];
        else result[i] = struct[fields[fid].alias];
    }

    return result;
};

Thrift.Struct.read = function (structdef, input) {
    var struct = new structdef();
    input.readStructBegin();
    Thrift.Struct.readFields(structdef, input, struct);
    input.readStructEnd();
    return struct;
};

Thrift.Struct.readFields = function (structdef, input, struct) {
    var header;
    var field;

    while (true) {
        header = input.readFieldBegin();

        if (header.ftype == Thrift.Type.STOP) return;

        field = structdef.fields[header.fid];
        if (field) {
            if (Thrift.equals(header.ftype, field.type)) {
                if (field.def) {
                    struct[field.alias] = field.def.read(input);
                } else {
                    struct[field.alias] = input.readType(field.type);
                }
            } else {
                input.skip(header.ftype);
            }
        } else {
            input.skip(header.ftype);
        }

        input.readFieldEnd();
    }
};

Thrift.Struct.write = function (structdef, output, struct) {
    var fid;
    var field;
    var value;
    output.writeStructBegin(structdef.alias);

    for (fid in structdef.fields) {
        field = structdef.fields[fid];
        value = struct[field.alias];
        if (value !== null && value !== undefined) {
            output.writeFieldBegin(field.alias, Thrift.serializedType(field.type), fid);
            if (field.def) {
                new field.def.write(output, value);
            } else {
                output.writeType(field.type, value);
            }
            output.writeFieldEnd();
        }
    }

    output.writeFieldStop();
    output.writeStructEnd();
};

//
// Exceptions
//
Thrift.Exception = {};

Thrift.Exception.define = function (name, fields) {
    var defaultValues = {};
    var fid;
    var field;

    fields = fields || {};

    for (fid in fields) {
        field = fields[fid];
        defaultValues[field.alias] = field.defaultValue || null;
    }

    var ThriftException = function (messageOrConfig) {
        var config = {};
        if (typeof messageOrConfig == 'object') {
            config = messageOrConfig;
        }
        Thrift.defaults(this, config, defaultValues);
        if (typeof messageOrConfig == 'string') {
            this.message = messageOrConfig;
        } else if (messageOrConfig instanceof Error) {
            this.message = messageOrConfig.message;
        }
    };

    ThriftException.alias = name;
    ThriftException.fields = fields;
    ThriftException.defaultValues = defaultValues;
    ThriftException.read = Thrift.Struct.read.bind(null, ThriftException);
    ThriftException.write = Thrift.Struct.write.bind(null, ThriftException);

    return ThriftException;
};

Thrift.TException = Thrift.Exception.define('TException', {
    1: { alias: 'message', type: Thrift.Type.STRING }
});

Thrift.TApplicationExceptionType = {
    'UNKNOWN' : 0,
    'UNKNOWN_METHOD' : 1,
    'INVALID_MESSAGE_TYPE' : 2,
    'WRONG_METHOD_NAME' : 3,
    'BAD_SEQUENCE_ID' : 4,
    'MISSING_RESULT' : 5,
    'INTERNAL_ERROR' : 6,
    'PROTOCOL_ERROR' : 7
};

Thrift.TApplicationException = Thrift.Exception.define('TApplicationException', {
    1: { alias: 'message', type: Thrift.Type.STRING },
    2: { alias: 'code', type: Thrift.Type.I32,
            defaultValue: Thrift.TApplicationExceptionType.INTERNAL_ERROR }
});


//
// Processor
//
Thrift.Processor = function () {
    this.methods = {};
};

Thrift.Processor.prototype.addMethod = function (mdef, fn) {
    this.methods[mdef.alias] = {
        def: mdef,
        fn: fn
    };
};

Thrift.Processor.prototype.process = function (input, output) {
    var method;
    var def;
    var result;
    var header;

    try {
        header = input.readMessageBegin();
        if (header.mtype != Thrift.MessageType.CALL) {
            throw new Thrift.TException('Server expects CALL but received unsupported message type: ' + header.mtype);
        }

        method = me.methods[header.fname];
        if (method == null) {
            throw new Thrift.TException('Unrecognized method name: ' + header.fname);
        }

        def = method.def;
        def.args.read(input);
        result = new def.result();

        method.fn.apply(null, def.args.values(args).concat([
            function (returnValue) {
                result.returnValue = returnValue;
                def.sendResponse(output, header.seqid, result);
            },
            function (err) {
                //console.log(err);
                var seqid = header ? header.seqid : -1;
                if (result && def.result.setByDef(result, err)) {
                    def.sendResponse(output, header.seqid, result);
                } else {
                    Thrift.Method.sendException(output, seqid, err);
                }
            }
        ]));
    } catch (err) {
        console.log(err);
        var seqid = header ? header.seqid : -1;
        if (result && def.result.setByDef(result, err)) {
            def.sendResponse(output, header.seqid, result);
        } else {
            Thrift.Method.sendException(output, seqid, err);
        }
    }
};

// Node exports
Object.keys(Thrift).forEach(function (key) {
    exports[key] = Thrift[key];
});
