var POLL_INTERVAL = 200;

module.exports = /*@ngInject*/ function() {
  return {
    restrict: 'E',
    template: '<button class="metry-connect-button" ng-click="ctrl.authenticate()">Connect with Metry</button>',
    replace: true,
    scope: {
      onAuthenticated: '&'
    },
    bindToController: true,
    controllerAs: 'ctrl',
    controller: /*@ngInject*/ function($window, emAuth, $interval) {
      var _this = this;

      this.authenticate = function authenticate() {
        var authUrl = emAuth.authorizeUrl();
        var features = getWindowFeatures(500, 700);
        var authWindow = $window.open(authUrl, 'mryAuthWindow', features);

        var checkInterval = $interval(function() {
          if (authWindow.closed) {
            return $interval.cancel(checkInterval);
          }

          try {
            var code = getParam('code', authWindow.document.URL);

            if (code) {
              authWindow.close();
              $interval.cancel(checkInterval);

              emAuth.handleAuthCode(code).then(function() {
                _this.onAuthenticated();
              });
            }
          } catch (e) {}
        }, POLL_INTERVAL);
      };

      function getParam(name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);

        return results == null ? null : results[1];
      }

      function getWindowFeatures(width, height) {
        var top = (screen.height - height) / 2;
        var left = (screen.width - width) / 2;

        return 'width=' + width +
               ',height=' + height +
               ',top=' + top +
               ',left=' + left +
               ',status=0,menubar=0,toolbar=0,personalbar=0';
      }
    }
  };
};
