module.exports = /*@ngInject*/ function ($sce, gettextCatalog) {
  var STRINGS = {
    electricity: gettextCatalog.getString('Electricity'),
    heat: gettextCatalog.getString('Heating'),
    cooling: gettextCatalog.getString('Cooling'),
    water: gettextCatalog.getString('Water'),
    gas: gettextCatalog.getString('Gas'),
    unknown: gettextCatalog.getString('Unknown')
  };

  return function filter(meter) {
    return (!meter) ? '' : STRINGS[meter.type] || STRINGS.unknown;
  };
};

