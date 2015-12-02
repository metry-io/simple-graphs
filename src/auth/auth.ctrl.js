module.exports = /*@ngInject*/ function($state) {
  this.onAuthDone = function onAuthDone() {
    $state.go('main');
  };
};
