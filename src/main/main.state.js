module.exports = /*@ngInject*/ function($stateProvider) {
  $stateProvider.state('main', {
    url: '/graphs',
    template: require('./main.tmpl.jade'),
    controller: 'MainController as ctrl',
    onEnter: /*@ngInject*/ function(emAuth, $state) {
      if (!emAuth.isAuthenticated()) {
        $state.go('auth');
      }
    },
    resolve: {
      me: /*@ngInject*/ function(emMe) {
        return emMe.get();
      }
    }
  });
};
