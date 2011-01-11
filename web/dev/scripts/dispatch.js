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

/*jslint plusplus: false, indent: 2 */
/*global require: false, define: false, location: false, window: false */
"use strict";

/**
 * A module that handles dispatching pub/sub topics, where the underlying
 * dispatch is done by postMessage. This allows for chrome extensions
 * to participate in the pub/sub via postMessage without having to
 * participate in this particular module.
 */
define(['jquery'], function ($) {

  var origin = location.protocol + "//" + location.host;

  return {
    sub: function (topic, callback, win, targetOrigin) {
      win = win || window;
      targetOrigin = targetOrigin || origin;

      var func = function (evt) {
        //Make sure message is from this page.
        if (evt.origin === targetOrigin) {
          //Assume pub/sub has JSON data with properties named
          //'topic' and 'data'.
          var message = JSON.parse(evt.data),
            pubTopic = message.topic;
          if (pubTopic && pubTopic === topic) {
            callback(message.data);
          }
        }
      };

      win.addEventListener('message', func, false);

      //return the created function to allow unsubscribing
      return func;
    },

    unsub: function (func, win) {
      win = win || window;
      win.removeEventListener('message', func, false);
    },

    pub: function (topic, data, win) {
      win = win || window;
      win.postMessage(JSON.stringify({
        topic: topic,
        data: data
      }), origin);
    }
  };
});
