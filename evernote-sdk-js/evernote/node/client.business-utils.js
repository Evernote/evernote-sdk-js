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

exports.createNoteInBusinessNotebook = function(note, businessNotebook, callback) {
  var self = this;
  var sharedNoteStore = self.getSharedNoteStore(businessNotebook);
  sharedNoteStore.getSharedNotebookByAuth(function(err, sharedNotebook) {
    if (err) {
      callback(err);
    } else {
      note.notebookGuid = sharedNotebook.notebookGuid;
      sharedNoteStore.createNote(note, function(err, createdNote) {
        callback(err, createdNote);
      });
    }
  });
};

exports.listBusinessNotebooks = function(callback) {
  var self = this;
  self.getNoteStore().listLinkedNotebooks(function(err, linkedNotebooks) {
    var businessNotebooks = [];
    for (i in linkedNotebooks) {
      if (linkedNotebooks[i].businessId) businessNotebooks.push(linkedNotebooks[i]);
    }
    callback(err, businessNotebooks);
  });
};

exports.createBusinessNotebook = function(notebook, callback) {
  var self = this;
  var businessNoteStore = self.getBusinessNoteStore();
  businessNoteStore.createNotebook(notebook, function(err, businessNotebook) {
    if (err) {
      callback(err);
    } else {
      var sharedNotebook = businessNotebook.sharedNotebooks[0];
      var linkedNotebook = new Evernote.LinkedNotebook();
      linkedNotebook.shareKey = sharedNotebook.shareKey;
      linkedNotebook.shareName = businessNotebook.name;
      linkedNotebook.username = self.bizUser.username;
      linkedNotebook.shardId = self.bizUser.shardId;
      self.getNoteStore().createLinkedNotebook(linkedNotebook,
        function(err, createdLinkedNotebook) {
          callback(err, createdLinkedNotebook);
        }
      );
    }
  });
};

exports.getCorrespondingNotebook = function(businessNotebook, callback) {
  var self = this;
  self.getSharedNoteStore(businessNotebook).getSharedNotebookByAuth(
    function(err, sharedNotebook) {
      if (err) {
        callback(err);
      } else {
        self.getBusinessNoteStore().getNotebook(sharedNotebook.notebookGuid,
          function(err, notebook) {
            callback(err, notebook);
          }
        );
      }
    }
  );
};

exports.isBusinessUser = function() {
  var self = this;
  if (self.businessUserInfo) return true;
  return false;
};
