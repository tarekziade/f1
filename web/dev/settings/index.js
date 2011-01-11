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

/*jslint indent: 2, plusplus: false */
/*global define: false, window: false, location: true, localStorage: false,
  opener: false, setTimeout: false, setInterval: false, document: false */
"use strict";

define([ "require", "jquery", "blade/fn", "rdapi", "oauth", "blade/jig",
         "dispatch", "storage", "accounts", "dotCompare", "blade/url",
         "services", "jquery.colorFade", "jquery.textOverflow"],
function (require,   $,        fn,         rdapi,   oauth,   jig,
          dispatch,   storage,   accounts,   dotCompare,   url, services) {
  var store = storage(),
  isGreaterThan072 = dotCompare(store.extensionVersion, "0.7.3") > -1,
  options = url.queryToObject(location.href.split('#')[1] || '') || {};

  jig.addFn({
    domainType: function (account) {
      var domain = services.domains[account.accounts[0].domain];
      return domain ? domain.type : '';
    },
    domainName: function (account) {
      var domain = services.domains[account.accounts[0].domain];
      return domain ? domain.name : '';
    },
    accountName: function (displayName, account) {
      return account.username && account.username !== displayName ? displayName + ", " + account.username : displayName;
    }
  });

  function showStatus(statusId, message) {
    $('div.status').addClass('hidden');
    $('#' + statusId).removeClass('hidden');

    if (message) {
      $('#' + statusId + ' .message').text(message);
    }
  }

  function onError(xhr, textStatus, err) {
    if (xhr.status === 503) {
      showStatus('statusServerBusyClose');
    } else {
      showStatus('statusServerError', err);
    }
  }

  //Set up knowledge of accounts and changes.
  accounts.onChange();
  accounts(function (json) {
      $(function () {
        var html = '';

        //Weed out existing accounts for domains from available domainList,
        //and generate account UI
        json.forEach(function (item) {
          var index = services.domainList.indexOf(item.accounts[0].domain);
          if (index !== -1) {
            services.domainList.splice(index, 1);
          }
          html += jig('#accountTemplate', item);
        });

        //Generate UI for each list.
        if (html) {
          $('#existingHeader').removeClass('hidden');
          $('#existing')
            .append(html)
            .removeClass('hidden');
        }

        html = '';
        services.domainList.forEach(function (domain) {
          var data = services.domains[domain];
          data.domain = domain;
          html += jig('#addTemplate', services.domains[domain]);
        });
        if (html) {
          $('#availableHeader').removeClass('hidden');
          $('#available')
            .append(html)
            .removeClass('hidden');
        }

        //Flash the new items.
        if (services.showNew) {
          $(function () {
            $("li.newItem").animate({ backgroundColor: '#ffff99' }, 200)
              .delay(1000).animate({ backgroundColor: '#fafafa' }, 3000);
          });
        }
      });
    },
    //error handler for accounts
    onError
  );

  $(function () {

    //If new items should be shown, refresh the location bar,
    //so further reloads of the page do not trigger showNew
    if (services.showNew) {
      delete options.show;
      location.replace(location.href.split('#')[0] + '#' + url.objectToQuery(options));
    }

    var manageDom = $("#manage"),
        settingsDom = $("#settings"),
        pref, node;

    // resize wrapper
    $(window).bind("load resize", function () {
      var h = $(window).height();
      $("#wrapper").css({ "min-height" : (h) });
    });

    $('body')
      //Wire up the close button
      .delegate('.close', 'click', function (evt) {
        window.close();
      })
      //Handle button click for services in the settings.
      .delegate('.auth', 'click', function (evt) {
        var node = evt.target,
          domain = node.getAttribute('data-domain'),
          selectionName = services.domains[domain].type;

        oauth(domain, function (success) {
          if (success) {
            //Make sure to bring the user back to this service if
            //the auth is successful.
            store.lastSelection = selectionName;

            accounts.fetch(null, onError);
          } else {
            showStatus('statusOAuthFailed');
          }
        });
      })
      //Hook up remove buttons to remove an account
      .delegate('.remove', 'click', function (evt) {
        var buttonNode = evt.target,
            domain = buttonNode.getAttribute('data-domain'),
            userName = buttonNode.getAttribute('data-username'),
            userId = buttonNode.getAttribute('data-userid'),
            svc = services.domains[domain];

        rdapi('account/signout', {
          data: {
            domain: domain,
            userid: userId,
            username: userName
          },
          success: function () {
            accounts.fetch(null, onError);
          },
          error: function (xhr, textStatus, err) {
            showStatus('statusError', err);
          }
        });

        //Remove any cached data
        svc.clearCache(store);
        if (svc.type === store.lastSelection) {
          delete store.lastSelection;
        }

        evt.preventDefault();
      }).
      delegate('#settings [type="checkbox"]', 'click', function (evt) {
        //Listen for changes in prefs and update localStorage, inform opener
        //of changes.
        var node = evt.target,
            prefId = node.id,
            value = node.checked;

        store['prefs.' + prefId] = value;
        if (opener && !opener.closed) {
          dispatch.pub('prefChanged', {
            name: prefId,
            value: value
          }, opener);
        }
      });

    //Set up state of the prefs.
    pref = store['prefs.use_accel_key'];
    pref = pref ? JSON.parse(pref) : false;
    $('#use_accel_key')[0].checked = pref || false;
    pref = store['prefs.bookmarking'];
    pref = pref ? JSON.parse(pref) : false;
    $('#bookmarking')[0].checked = pref || false;

    // create ellipsis for gecko
    $(function () {
      $(".overflow").textOverflow(null, true);
    });

    // tabs
    // Only show settings if extension can actually handle setting of them.
    if (isGreaterThan072) {
      $('li.settings').removeClass('hidden');
    }

    $("ul#tabs li").click(function () {
      $(this).addClass("selected");
      $(this).siblings().removeClass("selected");
    });

    $("ul#tabs li.manage").click(function () {
      if (manageDom.is(":hidden")) {
        manageDom.fadeIn(200);
        manageDom.siblings().fadeOut(0);
      }
    });

    $("ul#tabs li.settings").click(function () {
      if (settingsDom.is(":hidden")) {
        settingsDom.fadeIn(200);
        settingsDom.siblings().fadeOut(0);
      }
    });

    //Callback handler for JSONP feed response from Google.
    window.onFeedLoad = function (x, data) {
      var title, link, i, entry;
      if (data && data.feed && data.feed.entries) {
        for (i = 0; (entry = data.feed.entries[i]); i++) {
          if (entry.categories && entry.categories.indexOf('Sharing') !== -1) {
            link = entry.link;
            title = entry.title;
            break;
          }
        }
      }

      if (link) {
        $('#newsFooter .headline').removeClass('invisible');
        $('#rssLink').attr('href', link).text(title);
      }
    };

    //Fetch the feed. This is low priority, so done at the bottom.
    node = document.createElement("script");
    node.charset = "utf-8";
    node.async = true;
    node.src = 'http://www.google.com/uds/Gfeeds?v=1.0&callback=onFeedLoad&context=' +
              '&output=json&' +
              'q=http%3A%2F%2Fmozillalabs.com%2Fmessaging%2Ffeed%2F';
    $('head')[0].appendChild(node);
  });
});
