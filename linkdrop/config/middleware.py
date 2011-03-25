# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Raindrop.
#
# The Initial Developer of the Original Code is
# Mozilla Messaging, Inc..
# Portions created by the Initial Developer are Copyright (C) 2009
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#

"""Pylons middleware initialization"""
from beaker.middleware import SessionMiddleware
from paste.cascade import Cascade
from paste.registry import RegistryManager
from paste.urlparser import StaticURLParser
from paste.deploy.converters import asbool
from pylons.middleware import ErrorHandler, StatusCodeRedirect
from pylons.wsgiapp import PylonsApp
from routes.middleware import RoutesMiddleware

from linkdrop.config.environment import load_environment
from linkdrop.sstatus import ServicesStatusMiddleware
from linkoauth.util import setup_config


def make_app(global_conf, full_stack=True, static_files=True, **app_conf):
    """Create a Pylons WSGI application and return it

    ``global_conf``
        The inherited configuration for this application. Normally from
        the [DEFAULT] section of the Paste ini file.

    ``full_stack``
        Whether this application provides a full WSGI stack (by default,
        meaning it handles its own exceptions and errors). Disable
        full_stack when this application is "managed" by another WSGI
        middleware.

    ``static_files``
        Whether this application serves its own static files; disable
        when another web server is responsible for serving them.

    ``app_conf``
        The application's local configuration. Normally specified in
        the [app:<name>] section of the Paste ini file (where <name>
        defaults to main).

    """
    # Configure the Pylons environment
    config = load_environment(global_conf, app_conf)

    # The Pylons WSGI app
    orig_app = app = PylonsApp(config=config)

    # Routing/Session/Cache Middleware
    app = RoutesMiddleware(app, config['routes.map'], singleton=False)

    if asbool(config.get('session_middleware', True)):
        # if we've configured beaker as a filter in the ini file, don't
        # include it a second time here, it's unecessary.
        app = SessionMiddleware(app, config)

    # CUSTOM MIDDLEWARE HERE (filtered by error handling middlewares)

    if asbool(full_stack):
        # Handle Python exceptions
        app = ErrorHandler(app, global_conf, **config['pylons.errorware'])

        # Display error documents for 401, 403, 404 status codes (and
        # 500 when debug is disabled)
        if asbool(config['debug']):
            app = StatusCodeRedirect(app)
        else:
            app = StatusCodeRedirect(app, [400, 401, 403, 404, 500])

    # Establish the Registry for this application
    app = RegistryManager(app)

    if asbool(static_files):
        # Serve static files
        static_app = StaticURLParser(config['pylons.paths']['static_files'])
        app = Cascade([static_app, app])

    # adding the services status middleware
    if asbool(config['sstatus.enabled']):
        # we need at least one
        services = config['sstatus.services'].split(',')
        tresholds = [float(tres) for tres in
                     config['sstatus.tresholds'].split(',')]
        retry_after = int(config.get('sstatus.retry_after', '600'))
        cache_servers = config.get('sstatus.cache_servers')
        if cache_servers is not None:
            cache_servers = cache_servers.split(',')

        if len(services) != len(tresholds):
            raise ValueError('Bad Services Status config')

        app = ServicesStatusMiddleware(app, services, tresholds, retry_after,
                                       cache_servers)

    setup_config(config)
    app.config = config
    app.orig_app = orig_app
    return app
