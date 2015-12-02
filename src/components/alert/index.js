var MODULE_NAME = 'alert';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.service('Alert', require('./alert.service.js'));
