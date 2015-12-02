module.exports = /*@ngInject*/ function() {
  return {
    restrict: 'E',
    template: require('./pagination.directive.tmpl.jade'),
    scope: {
      resMgr: '=mryResourceManager'
    }
  };
};
