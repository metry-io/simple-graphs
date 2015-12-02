var MODULE_NAME = 'main';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.controller('MainController', require('./main.ctrl.js'))
.config(require('./main.state.js'));
