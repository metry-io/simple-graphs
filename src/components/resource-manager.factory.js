var angular = require('angular');

module.exports = /*@ngInject*/ function($rootScope, $timeout, $injector, gettextCatalog, Alert) {
  function ResourceManager(resource, filter, refreshTime, onSelectedChanged) {
    var Resource, resourceName;

    if (typeof resource === 'string') {
      resourceName = resource;
      Resource = $injector.get('em' + resourceName);
    } else if (resource.constructor === Array) {
      this.staticData = resource;
    } else if (typeof resource === 'object') {
      resourceName = resource.name;
      Resource = resource.Resource;
    }

    if (!Resource && !this.staticData) {
      throw 'Cannot find collection ' + resourceName;
    }

    this.resourceName = resourceName;
    this.Resource = Resource;

    this.loading = false;
    this.data = [];
    this.pagination = {};
    this.originalFilter = angular.copy(filter);
    this.filter = angular.copy(filter);
    this.filterChanged = false;

    this.selected = undefined;
    this.lastSelected = undefined;
    this.allSelected = false;
    this.onSelectedChanged = onSelectedChanged;
    this.selectedCount = 0;

    this.refreshTime = (refreshTime === undefined) ? false : refreshTime;
    this._refreshTimeout = undefined;
    this._lastParams = {};

    if (!this.staticData) {
      var changeEventName = 'mryChanged:'  + resourceName;
      this._changeUnregister = $rootScope.$on(changeEventName, this.refresh.bind(this));
    }

    this.getData();
  }

  ResourceManager.prototype.destroy = function destroy() {
    if (this._changeUnregister) {
      this._changeUnregister();
      this._changeUnregister = undefined;
    }

    this.clearRefreshTimeout();
    this.refreshTime = false;
  };

  ResourceManager.prototype.setFilterOption = function setFilter(key, value) {
    if (!value || value.length === 0) {
      delete this.filter[key];
    } else {
      this.filter[key] = value;
    }

    this.filter.skip = 0;
    this.getData();
    this.filterChanged = filterChanged(this.filter, this.originalFilter);
  };

  // Called by pagination directive
  ResourceManager.prototype.updatePage = function updatePage() {
    this.filter.skip = this.pagination.limit * (this.pagination.page - 1);
    this.getData();
  };

  ResourceManager.prototype.getData = function() {
    this.loading = true;
    this.data = [];
    this.pagination = {page: 1};
    this._getData();
  };

  // Private get data function
  ResourceManager.prototype._getData = function _getData() {
    if (this.staticData) {
      var count = this.staticData.length;

      this.data = this.staticData;
      this.pagination = {
        count: count,
        skip: 0,
        from: 1,
        to: count,
        limit: count
      };

      this.resetSelected(count);
      this.loading = false;

      return;
    }

    var params = angular.copy(this.filter),
      _this = this;

    this.clearRefreshTimeout();
    this._lastParams = params;

    this.Resource.query(params).then(function(res) {
      if (angular.equals(params, _this._lastParams)) {
        _this.loading = false;
        _this.data = res.data;
        _this.pagination = res.pagination;
        _this.setRefreshTimeout();
        _this.resetSelected(res.data.length);
      }
    }, function(err) {
      if (angular.equals(params, _this._lastParams)) {
        _this.loading = false;
        _this.data = [];
        _this.pagination = {};
        _this.resetSelected(0);
      }
    });
  };

  // Refresh data
  ResourceManager.prototype.refresh = function refresh() {
    this._getData();
  };

  ResourceManager.prototype.setRefreshTimeout = function setRefreshTimeout() {
    if (this.refreshTime && !this._refreshTimeout) {
      var _this = this;

      this._refreshTimeout = $timeout(function() {
        if (!_this.refreshTime) return;
        _this.refresh();
      }, this.refreshTime);
    }
  };

  ResourceManager.prototype.clearRefreshTimeout = function clearRefreshTimeout() {
    if (this._refreshTimeout) {
      $timeout.cancel(this._refreshTimeout);
      this._refreshTimeout = undefined;
    }
  };

  // Manage selections
  function makeArray(length, value) {
    var array = new Array(length);
    for (var i = 0; i < length; i++) array[i] = value;
    return array;
  }

  ResourceManager.prototype.resetSelected = function resetSelected(length) {
    if (typeof length !== 'number') length = 0;

    this.selected = makeArray(length, false);
    this.allSelected = false;
    this.selectedCount = 0;
    this.lastSelected = undefined;

    if (this.onSelectedChanged) this.onSelectedChanged(this.selected);
  };

  ResourceManager.prototype.isSelected = function isSelected(index) {
    return this.selected[index] === true;
  };

  ResourceManager.prototype.select = function select(index, selected, fromLast) {
    var selectStart = (fromLast) ? Math.min(index, this.lastSelected) : index;
    var selectEnd = (fromLast) ? Math.max(index, this.lastSelected) : index;

    var selectedCount = 0;

    for (var i = 0, l = this.selected.length; i < l; i++) {
      if (i >= selectStart && i <= selectEnd) {
        this.selected[i] = selected;
      }

      if (this.selected[i]) {
        selectedCount++;
      }
    }

    this.allSelected = (selectedCount === this.selected.length);
    this.selectedCount = selectedCount;
    this.lastSelected = index;

    if (this.onSelectedChanged) this.onSelectedChanged(this.selected);
  };

  ResourceManager.prototype.selectOnly = function selectOnly(index) {
    this.allSelected = false;

    for (var i = 0, l = this.selected.length; i < l; i++) {
      this.selected[i] = (i === index);
    }

    this.selectedCount = 1;
    this.lastSelected = index;

    if (this.onSelectedChanged) this.onSelectedChanged(this.selected);
  };

  ResourceManager.prototype.selectAll = function selectAll(selected) {
    this.allSelected = selected;

    for (var i = 0, l = this.selected.length; i < l; i++) {
      this.selected[i] = selected;
    }

    this.selectedCount = selected ? this.selected.length : 0;
    this.lastSelected = undefined;

    if (this.onSelectedChanged) this.onSelectedChanged(this.selected);
  };

  ResourceManager.prototype.getSelected = function getSelected() {
    var selected = [];

    for (var i = 0, l = this.data.length; i < l; i++) {
      if (this.selected[i]) {
        selected.push(this.data[i]);
      }
    }

    return selected;
  };

  // Runs a batchUpdate function on all selected items.
  ResourceManager.prototype.batchUpdate = function batchUpdate(data) {
    if (this.staticData || this.selectedCount === 0) return;

    var itemIds = [];
    var _this = this;

    for (var i = 0, l = this.data.length; i < l; i++) {
      if (this.selected[i]) {
        itemIds.push(this.data[i]._id);
      }
    }

    $rootScope.$broadcast('mryProgressStart');

    this.Resource.batchUpdate(itemIds, data).then(function() {
      var eventName = 'mryChanged:' + _this.resourceName;
      $rootScope.$broadcast(eventName);
    }, function(error) {
      Alert.error(
        gettextCatalog.getString('Save failed'),
        gettextCatalog.getString('Please refresh the page to make sure all selected items still are available.')
      );
    }).finally(function() {
      $rootScope.$broadcast('mryProgressEnd');
    });
  };

  return ResourceManager;
};

function filterChanged(current, original) {
  for (var key in current) {
    if (key !== 'sort' && key !== 'skip' && current.hasOwnProperty(key)) {
      var value = current[key];
      var originalValue = original[key];

      if (typeof originalValue === 'undefined' && value.length > 0) return true;
    }
  }

  return false;
}
