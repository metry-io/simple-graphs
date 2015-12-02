var angular = require('angular');

module.exports = /*@ngInject*/ function ($document, $rootScope, $compile, $q, gettextCatalog) {
 var defaultTemplate  = require('./alert.tmpl.jade');
 var currentAlert;

 function ok(title, message) {
   return alert(title, message, [gettextCatalog.getString('Ok')]);
 }

 function alert(title, message, buttons) {
   scope = $rootScope.$new(true);
   scope.title = title;
   scope.message = message;
   scope.buttons = (buttons || []).map(button);
   scope.dismiss = hide;

   return rawAlert(defaultTemplate, scope);
 }

 // Allows for providing buttons both as strings and as objects with classes
 function button(obj) {
   return (typeof obj === 'string') ? {text: obj, class: ''} : obj;
 }

 function rawAlert(tmpl, scope) {
   if (currentAlert) return $q.reject();

   currentAlert = {
     el: $compile(angular.element(tmpl))(scope),
     scope: scope,
     defer: $q.defer()
   };

   var body = angular.element($document).find('body');
   body.append(currentAlert.el);
   body.find('main').addClass('mry-behind-alert');
   body.find('nav').addClass('mry-behind-alert');

   return currentAlert.defer.promise;
 }

 function hide(button) {
   if (!currentAlert) return;

   currentAlert.el.detach();
   currentAlert.scope.$destroy();
   currentAlert.defer.resolve(button);

   currentAlert = undefined;

   var body = angular.element($document).find('body');
   body.find('main').removeClass('mry-behind-alert');
   body.find('nav').removeClass('mry-behind-alert');
 }

 return {
   ok: ok,
   error: ok,
   alert: alert,
   rawAlert: rawAlert,
   hide: hide
 };
};
