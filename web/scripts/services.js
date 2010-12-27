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

/*jslint indent: 2 */
/*global require: false, window: false, location: true, localStorage: false,
  opener: false, setTimeout: false */

'use strict';

require.def('services',
        ['rdapi', "blade/url"],
function (rdapi,   url) {

  var options = url.queryToObject(location.href.split('#')[1] || '') || {},
  showNew = options.show === 'new';
  
  function svcBase(name, options) {
    this.name = name;
    this.type = name.replace(/\s/g,'').toLowerCase();
    this.tabName = this.type+'Tab';
    this.icon = 'i/'+this.type+'Icon.png';
    
    for (var i in options) {
      this[i] = options[i];
    }
  }
  svcBase.constructor = svcBase;
  svcBase.prototype = {
    validate: function (sendData) {
      return true;
    },
    getFormData: function () {
      var dom = $('#'+this.type);
      return {
        to: dom.find('[name="to"]').val().trim() || '',
        subject: dom.find('[name="subject"]').val().trim() || '',
        message: dom.find('textarea.message').val().trim() || '',
        picture: dom.find('[name="picture"]').val().trim() || '',
        canonicalUrl: dom.find('[name="link"]').val().trim() || '',
        title: dom.find('[name="title"]').val().trim() || '',
        description: dom.find('[name="description"]').val().trim() || ''
      };
    },
    setFormData: function (data) {
      var dom = $('#'+this.type);
      if (data.to) {
        dom.find('[name="to"]').val(data.to);
      }
      if (data.subject) {
        dom.find('[name="subject"]').val(data.subject);
      }
      if (data.message) {
        dom.find('textarea.message').val(data.message);
      }
      var picture = data.previews && data.previews[0];
      if (picture) {
        dom.find('[name="picture"]').val(picture);
      }
      if (data.canonicalUrl || data.url) {
        dom.find('[name="link"]').val(data.canonicalUrl || data.url);
      }
      if (data.title) {
        dom.find('[name="title"]').val(data.title);
      }
      if (data.description) {
        dom.find('[name="description"]').val(data.description);
      }
    },
    clearCache: function(store) {
        
    }
  };
  
  /* common functionality for email based services */
  function emailSvcBase() {
    svcBase.constructor.apply(this, arguments);
  };
  emailSvcBase.prototype = svcBase.prototype;
  emailSvcBase.constructor = emailSvcBase;
  emailSvcBase.prototype.validate = function (sendData) {
    if (!sendData.to || !sendData.to.trim()) {
      showStatus('statusToError');
      return false;
    }
    return true;
  };
  
  var svcs = {
    showNew: showNew,
    domains: {
      'linkedin.com': new svcBase('LinkedIn', {
        serviceUrl: 'http://linkedin.com',
        revokeUrl: 'http://linkedin.com/settings/connections',
        signOutUrl: 'http://linkedin.com/logout',
        accountLink: function (account) {
          return 'http://linkedin.com/' + account.username;
        }
      }),
      'twitter.com': new svcBase('Twitter', {
        serviceUrl: 'http://twitter.com',
        revokeUrl: 'http://twitter.com/settings/connections',
        signOutUrl: 'http://twitter.com/logout',
        accountLink: function (account) {
          return 'http://twitter.com/' + account.username;
        },
        getFormData: function () {
          var dom = $('#twitter');
          return {
            message: dom.find('textarea.message').val().trim() || '',
            canonicalUrl: dom.find('[name="link"]').val().trim() || ''
          };
        },
        setFormData: function (data) {
          var dom = $('#twitter');
          if (data.message) {
            dom.find('textarea.message').val(data.message);
          }
          if (data.canonicalUrl || data.url) {
            dom.find('[name="link"]').val(data.canonicalUrl || data.url);
          }
        }
      }),
      'facebook.com': new svcBase('Facebook', {
        serviceUrl: 'http://facebook.com',
        revokeUrl: 'http://www.facebook.com/editapps.php?v=allowed',
        signOutUrl: 'http://facebook.com',
        accountLink: function (account) {
          return 'http://www.facebook.com/profile.php?id=' + account.userid;
        },
        getFormData: function () {
          var dom = $('#facebook');
          return {
            message: dom.find('textarea.message').val().trim() || '',
            picture: dom.find('[name="picture"]').val().trim() || '',
            canonicalUrl: dom.find('[name="link"]').val().trim() || '',
            title: dom.find('[name="name"]').val().trim() || '',
            description: dom.find('[name="caption"]').val().trim() || ''
          };
        },
        setFormData: function (data) {
          var dom = $('#facebook');
          if (data.message) {
            dom.find('textarea.message').val(data.message);
          }
          var picture = data.previews && data.previews[0];
          if (picture) {
            dom.find('[name="picture"]').val(picture);
          }
          if (data.canonicalUrl || data.url) {
            dom.find('[name="link"]').val(data.canonicalUrl || data.url);
          }
          if (data.title) {
            dom.find('[name="name"]').val(data.title);
          }
          if (data.description) {
            dom.find('[name="caption"]').val(data.description);
          }
        }
      }),
      'google.com': new emailSvcBase('Gmail', {
        serviceUrl: 'https://mail.google.com',
        revokeUrl: 'https://www.google.com/accounts/IssuedAuthSubTokens',
        signOutUrl: 'http://google.com/preferences',
        accountLink: function (account) {
          return 'http://google.com/profiles/' + account.username;
        },
        clearCache: function(store) {
          if (store.gmailContacts)
            delete store.gmailContacts;
        }
      }),
      'googleapps.com': new emailSvcBase('Google Apps', {
        icon: 'i/gmailIcon.png',
        serviceUrl: 'https://mail.google.com',
        revokeUrl: 'https://www.google.com/accounts/IssuedAuthSubTokens',
        signOutUrl: 'http://google.com/preferences',
        accountLink: function (account) {
          return 'http://google.com/profiles/' + account.username;
        }
      }),
      'yahoo.com': new emailSvcBase('Yahoo', {
        name: 'Yahoo!',
        serviceUrl: 'http://mail.yahoo.com', // XXX yahoo doesn't have ssl enabled mail?
        revokeUrl: 'https://api.login.yahoo.com/WSLogin/V1/unlink',
        signOutUrl: 'https://login.yahoo.com/config/login?logout=1',
        accountLink: function (account) {
          return 'http://profiles.yahoo.com/' + account.username;
        }
      })
    },
    domainList: []
  };

  for (var i in svcs.domains) {
    svcs.domainList.push(i);
  }
  
  return svcs;
});
