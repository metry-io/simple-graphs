var angular = require('angular');

module.exports = /*@ngInject*/ function ($document) {
 var tmpl  = require('./progress.tmpl.jade');
 var tmplEl;

 function show(message) {
   if (tmplEl) return;
   tmplEl = angular.element(tmpl);
   angular.element($document).find('body').append(tmplEl);
 }

 function hide() {
   if (!tmplEl) return;

   tmplEl.detach();
   tmplEl = undefined;
 }

 return {
   show: show,
   hide: hide
 };
};
