var MODULE_NAME = 'progress';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.service('Progress', require('./progress.service.js'));
