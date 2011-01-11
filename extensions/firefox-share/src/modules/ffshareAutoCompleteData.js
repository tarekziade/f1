/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Raindrop.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * */
const Cu = Components.utils;

let EXPORTED_SYMBOLS = ["ffshareAutoCompleteData"];

let data = {};

function _() {
  return; // comment out for verbose debugging
  let msg = Array.join(arguments, " ");
  dump(msg + "\n");
  Cu.reportError(msg);
}

let ffshareAutoCompleteData = {
  get: function (domain) {
    _("XXX getting data for "+domain);
    return data[domain];
  },
  set: function (acdata) {
    _("XXX setting "+ (acdata.contacts ? acdata.contacts.length : "none") +" contacts for "+acdata.domain);
    data[acdata.domain] = (acdata.contacts || []);
  }
};
