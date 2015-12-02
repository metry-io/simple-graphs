module.exports = /*@ngInject*/ function($stateProvider) {
  $stateProvider.state('auth', {
    url: '/auth',
    controller: 'AuthController as ctrl',
    template: require('./auth.tmpl.jade')
  });
};
