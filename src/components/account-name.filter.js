module.exports = /*@ngInject*/ function() {
  return function(account) {
    return (!account) ? '' : account.name || account.username || account._id;
  };
};
