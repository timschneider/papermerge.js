'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'papermerge',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      NAMESPACE: 'api',
      WS_NAMESPACE: 'ws'  // websockets namespace
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    ENV.APP.HOST = 'http://127.0.0.1:8000';
    ENV.APP.WS_HOST = 'ws://127.0.0.1:8000';

    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV['ember-cli-mirage'] = { enabled: false};
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    // enable migrage - which mocks HTTP requests
    ENV['ember-cli-mirage'] = { enabled: true };
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
