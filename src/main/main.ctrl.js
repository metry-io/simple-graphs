var GRANULARITIES = {
  year: 'month',
  month: 'day',
  day: 'hour'
};

var TOOLTIP_FORMATS = {
  day: 'HH:mm - EEEE d MMMM yyyy',
  month: 'EEEE d MMMM yyyy',
  year: 'MMMM yyyy'
};

var X_AXIS_FORMATS = {
  day: 'HH:mm',
  month: 'd MMM',
  year: 'MMM'
};

var DATE_SELECT_FORMAT = {
  day: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy'
};

var COMPARE_DATES = {
  day: [['days', -1], ['days', -7]],
  month: [['days', -28], ['years', -1]],
  year: [['years', -1]]
};

var COLORS = {
  series: [
    "#36828F",
    "#42A495"
  ],
  labels: '#7EB2D6',
  gridLines: '#0E3A58'
};

module.exports = /*@ngInject*/ function(
  $scope,
  $window,
  $rootScope,
  $filter,
  $state,
  emMeters,
  emAuth,
  emConsumptions,
  emDateUtil,
  ResourceManager,
  me
) {
  var _this = this;
  var chartDirty = false;
  var filter = {
    limit: 20,
    box: 'active',
    revoked: false
  };

  this.resMgr = new ResourceManager('Meters', filter, false, onMeters);
  this.meter = undefined;
  this.meterCount = undefined;
  this.metersVisible = false;
  this.view = undefined;
  this.comparePeriod = 0;
  this.hasData = true;
  this.loadingMeter = true;
  this.loadingChartData = false;

  this.energy = {
    hour: 0,
    day: 0,
    month: 0
  };

  this.datePicker = {
    open: false,
    date: undefined
  };

  this.compareDatePicker = {
    open: false,
    date: undefined
  };

  this.pickerConfig = {
    mode: undefined,
    minMode: undefined,
    minDate: new Date(),
    dateFormat: DATE_SELECT_FORMAT.day,
    options: {
      startingDay: 1
    }
  };

  this.chartConfig = {
    useHighStocks: true,
    series: undefined,
    yAxis: {
      labels: {
        formatter: function() {
          return Highcharts.numberFormat(this.value, 1, ",", " ") + ' kWh';
        },
        style: {
          color: 'white'
        }
      },
      title: { text: null },
      gridLineColor: COLORS.gridLines
    },
    xAxis: {
      labels: {
        formatter: function() {
          var dateFilter;
          dateFilter = $filter('date');
          return dateFilter(this.value, X_AXIS_FORMATS[_this.view]);
        },
        style: {
          color: COLORS.labels
        }
      }
    },
    options: {
      colors: COLORS.series,
      tooltip: {
        formatter: function(a) {
          var dateFilter, format;
          dateFilter = $filter('date');
          format = TOOLTIP_FORMATS[_this.view];
          return [this.points[1], this.points[0]].map(function(data) {
            var timestamp;
            if (data) {
              timestamp = data.x + data.series.options.realPointStartDiff;
              if (_this.view === 'year') {
                timestamp += 86400000;
              }
              return '<b>' + dateFilter(timestamp, format) + ':</b> ' + data.y + " kWh";
            }
          }).filter(function(value) {
            return (value !== null);
          }).join('<br>');
        }
      },
      rangeSelector: { enabled: false },
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      credits: { enabled: false },
      title: { text: '' },
      chart: {
        animation: true,
        panning: false,
        zoomType: false,
        pinchType: false,
        backgroundColor: 'rgba(255, 255, 255, 0.002)',
      }
    }
  };

  $scope.$watchGroup(['ctrl.datePicker.date', 'ctrl.compareDatePicker.date'], function(newValue, oldValue) {
    if (newValue !== oldValue) {
      setChartDirty();
    }
  });

  $scope.$watch('ctrl.comparePeriod', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    if (newValue !== 'custom') {
      _this.compareDatePicker.date = undefined;
    }

    setChartDirty();
  });

  $scope.$watch('ctrl.view', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    var minPeriod = _this.energy[GRANULARITIES[newValue]].first.toString();
    var maxPeriod = _this.energy[GRANULARITIES[newValue]].last.toString();

    _this.pickerConfig.mode = newValue;
    _this.pickerConfig.minMode = newValue;
    _this.pickerConfig.dateFormat = DATE_SELECT_FORMAT[newValue];
    _this.pickerConfig.minDate = emDateUtil.getDate(minPeriod);
    _this.pickerConfig.maxDate = emDateUtil.getDate(maxPeriod);
    _this.datePicker.date = emDateUtil.getDate(maxPeriod);
    _this.comparePeriod = 0;

    setChartDirty();
  });

  this.toggleMeters = function toggleMeters(visible) {
    _this.metersVisible = visible;
  };

  this.logout = function logout() {
    emAuth.setRefreshToken(null);
    $state.go('auth');
  };

  this.setMeter = function setMeter(meter) {
    _this.meter = meter;
    _this.loadingMeter = false;
    var energy = _this.energy = meter.consumption_stats.energy;

    if (energy.hour.count + energy.day.count + energy.month.count === 0) {
      _this.hasData = false;
    } else {
      _this.hasData = true;

      if (energy.hour.count > 0) {
        _this.view = 'day';
      } else if (energy.day.count > 0) {
        _this.view = 'month';
      } else if (energy.month.count > 0) {
        _this.view = 'year';
      }
    }

    setChartDirty();
    _this.metersVisible = false;
  };

  function setChartDirty() {
    if (chartDirty) return;

    $scope.$applyAsync(function() {
      chartDirty = false;
      updateChartData();
    });

    chartDirty = true;
  }

  function shouldGetChartData() {
    return (_this.hasData &&
            (_this.datePicker.date !== null) &&
              (_this.comparePeriod !== null) &&
                !(_this.comparePeriod === 'custom' && !_this.compareDatePicker.date));
  }

  function updateChartData() {
    if (!shouldGetChartData()) return;

    _this.loadingChartData = true;

    var granularity = GRANULARITIES[_this.view];
    var period = emDateUtil.getPeriod(_this.datePicker.date, granularity);
    var comparePeriod = getComparePeriod();

    emConsumptions.get(_this.meter._id, granularity, [period, comparePeriod]).then(function(consumptions) {
      _this.chartConfig.options.yAxis = {
        max: _this.energy[GRANULARITIES[_this.view]].max,
        min: 0
      };

      setChartSeries(consumptions[0], granularity);
      _this.loadingChartData = false;
    });
  }

  function getComparePeriod() {
    if (_this.comparePeriod === 'custom') {
      return emDateUtil.getPeriod(_this.compareDatePicker.date, GRANULARITIES[_this.view]);
    }

    var compareDate = new Date(_this.datePicker.date.getTime());
    var period = COMPARE_DATES[_this.view][_this.comparePeriod];
    var amount = period[1];
    var type = period[0];

    if (_this.view === 'month' && type === 'days') {
      startDate = new Date(compareDate.getTime());
      startDate.setDate(1 + amount);
      var endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + emDateUtil.daysInMonth(compareDate) - 1);
      return emDateUtil.getDayPeriod([startDate, endDate]);
    }

    if (type === 'years') {
      compareDate.setFullYear(compareDate.getFullYear() + amount);
    } else {
      compareDate.setDate(compareDate.getDate() + amount);
    }

    return emDateUtil.getPeriod(compareDate, GRANULARITIES[_this.view]);
  }

  function setChartSeries(data, granularity) {
    var pointStart = emDateUtil.parseISO(data.periods[0].start_date).getTime();
    var comparingPointStart = emDateUtil.parseISO(data.periods[1].start_date).getTime();

    var pointInterval = {
      hour: 3600000,
      day: 86400000,
      month: 2628000000
    }[granularity];

    _this.chartConfig.series = [
      {
        type: 'area',
        name: 'Comparison',
        fillOpacity: 0.2,
        lineWidth: 1,
        data: data.periods[1].energy,
        dataGrouping: {
          approximation: 'close',
          units: [['hour', [1]]]
        },
        pointStart: pointStart,
        pointInterval: pointInterval,
        realPointStartDiff: comparingPointStart - pointStart
      }, {
        type: 'column',
        name: 'Chosen period',
        data: data.periods[0].energy,
        realPointStartDiff: 0,
        dataGrouping: {
          approximation: 'close',
          units: [['hour', [1]]]
        },
        pointStart: pointStart,
        pointInterval: pointInterval
      }
    ];
  }

  function reloadMeter() {
    if (!_this.meter) return;

    emMeters.get(_this.meter._id).then(function(meter) {
      _this.meter = meter;
    });
  }

  function onMeters() {
    if (_this.resMgr.data && !_this.meter) {
      _this.meterCount = _this.resMgr.pagination.count;
      _this.setMeter(_this.resMgr.data[0]);
    }
  }
};
