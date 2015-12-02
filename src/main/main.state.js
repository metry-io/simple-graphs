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
      me: /*@ngInject*/ function(emMe, $state) {
        return emMe.get().then(function(me) {
          return me;
        }, function(error) {
          $state.go('auth');
        });
      }
    }
  });
};
