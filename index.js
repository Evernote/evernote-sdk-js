var vm = require('vm');
var fs = require('fs');
var path = require('path');

var evernote = {
  console: console,
  ArrayBuffer: ArrayBuffer,
  DataView: DataView,
  Uint8Array: Uint8Array,
  Int8Array: Int8Array,
  XMLHttpRequest: require("./evernote-sdk-js/vendor/xmlhttprequest/xmlhttprequest").XMLHttpRequest
};

var filenames = ['./evernote-sdk-js/thrift/lib/thrift.js',
    './evernote-sdk-js/thrift/lib/thrift-binary.js',
    './evernote-sdk-js/generated/Errors_types.js',
    './evernote-sdk-js/generated/NoteStore_types.js',
    './evernote-sdk-js/generated/Limits_types.js',
    './evernote-sdk-js/generated/Types_types.js',
    './evernote-sdk-js/generated/UserStore_types.js',
    './evernote-sdk-js/generated/UserStore.js',
    './evernote-sdk-js/generated/NoteStore.js'
    ];
for (var i = 0; i < filenames.length; i++) {
  filename = path.resolve(path.dirname(module.filename), filenames[i]);
  var filedata = fs.readFileSync(filename);
  vm.runInNewContext(filedata, evernote);
}

exports.Evernote = evernote;
