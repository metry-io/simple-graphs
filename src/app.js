var angular = require('angular');

require('../vendor/standalone-framework.src.js');
require('../vendor/highstock.src.js');

// For none-node modules
window.angular = angular;
require('angular-gettext');

var config = require('./config.json');

var app = angular.module('simple-graphs', [
  require('angular-ui-bootstrap'),
  require('angular-ui-router'),
  require('angular-sanitize'),
  require('highcharts-ng'),
  'gettext',
  require('energimolnet-ng/src/main.js'),
  require('./components'),
  require('./auth'),
  require('./main')
])

.constant('authConfig', config.authConfig)
.constant('apiBaseUrl', config.apiBaseUrl)

.config(/*@ngInject*/ function(
  $urlRouterProvider,
  $locationProvider,
  $compileProvider
) {
  $urlRouterProvider.otherwise('/graphs');
  $locationProvider.html5Mode(false);
  $compileProvider.debugInfoEnabled(true);
})

.run(/*@ngInject*/ function($rootScope, $window, $state) {
  $rootScope.$on('mryAuthError', function() {
    $state.go('auth');
  });
});

module.exports = app;
