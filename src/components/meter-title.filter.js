module.exports = /*@ngInject*/ function () {
  return function filter(meter) {
    return (!meter) ? '' : meter.name || meter.address || meter.ean || meter._id;
  };
};
