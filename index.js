evernote = require('./base.js').Evernote;
evernote.Client = require('./evernote-sdk-js/evernote/node/client.js').Client;

evernote.Data.prototype.__defineGetter__('body', function() {
  return this._body;
});
evernote.Data.prototype.__defineSetter__('body', function(val) {
  if (val instanceof Buffer) {
    // Automatic convert from Buffer to ArrayBuffer
    var ab = new ArrayBuffer(val.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < val.length; ++i) {
      view[i] = val[i];
    }
    this._body = ab;
  } else {
    this._body = val;
  }
});

BusinessUtils = require('./evernote-sdk-js/evernote/node/client.business-utils.js');
evernote.Client.prototype.createNoteInBusinessNotebook = BusinessUtils.createNoteInBusinessNotebook;
evernote.Client.prototype.listBusinessNotebooks = BusinessUtils.listBusinessNotebooks;
evernote.Client.prototype.createBusinessNotebook = BusinessUtils.createBusinessNotebook;
evernote.Client.prototype.getCorrespondingNotebook = BusinessUtils.getCorrespondingNotebook;
evernote.User.prototype.isBusinessUser = BusinessUtils.isBusinessUser;

exports.Evernote = evernote;
