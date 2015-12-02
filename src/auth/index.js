var MODULE_NAME = 'auth';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.controller('AuthController', require('./auth.ctrl.js'))
.config(require('./auth.state.js'));
