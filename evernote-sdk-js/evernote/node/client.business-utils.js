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
  sharedNoteStore.getSharedNotebookByAuth(function(sharedNotebook) {
    note.notebookGuid = sharedNotebook.notebookGuid;
    sharedNoteStore.createNote(note, function(createdNote) {
      callback(createdNote);
    });
  });
};

exports.listBusinessNotebooks = function(callback) {
  var self = this;
  self.getNoteStore().listLinkedNotebooks(function(linkedNotebooks) {
    var businessNotebooks = [];
    for (i in linkedNotebooks) {
      if (linkedNotebooks[i].businessId) businessNotebooks.push(linkedNotebooks[i]);
    }
    callback(businessNotebooks);
  });
};

exports.createBusinessNotebook = function(notebook, callback) {
  var self = this;
  var businessNoteStore = self.getBusinessNoteStore();
  businessNoteStore.createNotebook(notebook, function(businessNotebook) {
    console.log(businessNotebook);
    var sharedNotebook = businessNotebook.sharedNotebooks[0];
    var linkedNotebook = new Evernote.LinkedNotebook();
    linkedNotebook.shareKey = sharedNotebook.shareKey;
    linkedNotebook.shareName = businessNotebook.name;
    linkedNotebook.username = self.bizUser.username;
    linkedNotebook.shardId = self.bizUser.shardId;
    self.getNoteStore().createLinkedNotebook(linkedNotebook, function(createdLinkedNotebook) {
      callback(createdLinkedNotebook);
    });
  });
};

exports.getCorrespondingNotebook = function(businessNotebook, callback) {
  var self = this;
  self.getSharedNoteStore(businessNotebook).getSharedNotebookByAuth(function(sharedNotebook) {
    self.getBusinessNoteStore().getNotebook(sharedNotebook.notebookGuid, function(notebook) {
      callback(notebook);
    });
  });
};

exports.isBusinessUser = function() {
  var self = this;
  if (self.businessUserInfo) return true;
  return false;
};
