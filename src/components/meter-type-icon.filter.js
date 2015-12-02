var ICONS = {
  electricity: 'glyphicon-flash',
  heat: 'glyphicon-fire',
  water: 'glyphicon-tint',
  cooling: 'glyphicon-asterisk',
  gas: 'glyphicon-oil',
  unknown: 'glyphicon-question-sign'
};

module.exports = /*@ngInject*/ function ($sce) {
  return function filter(meter) {
    var iconClass = ICONS[meter.type] || ICONS.unknown;
    return $sce.trustAsHtml('<i class="glyphicon ' + iconClass + '"></i>');
  };
};
