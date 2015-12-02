var angular = require('angular');
var MODULE_NAME = 'components';

module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [
  require('./alert'),
  require('./progress')
])

.directive('mryPagination', require('./pagination.directive.js'))
.factory('ResourceManager', require('./resource-manager.factory.js'))
.filter('mryMeterTypeIcon', require('./meter-type-icon.filter.js'))
.filter('mryMeterType', require('./meter-type.filter.js'))
.filter('mryAccountName', require('./account-name.filter.js'))
.filter('mryMeterTitle', require('./meter-title.filter.js'));
