angular.module('umbraco.directives')
  .directive('PieManLine', function () {
      return {
          restrict: 'C',
          scope: {
              views: '=',
              unique: '=',
              prevViews: '=',
              prevUnique: '=',
              dates: '=',
              prevDates: '=',
              label: '=',
              translations: '='
          },
          template: '<div></div>',
          link: function (scope, element, attrs, $filter) {

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        height:350
                    },
                    plotOptions: {
                        line: {
                            marker: {
                                symbol: 'circle'
                            }
                        }
                    },
                    series: [
                        {
                            data: []                           
                        },
                        {
                            data: []
                        }
                    ],
                    tooltip: {
                        shared: true,
                        useHTML: true,
                        borderColor: '#555555',
                        borderRadius: 0,
                        formatter: function () {
                            var tooltip = '',
                                i;

                            for (i = 0; i < this.points.length; i += 1) {

                                var p = this.points[i],
                                    date = scope.dates[p.x],
                                    prevDate = scope.prevDates !== undefined ? scope.prevDates[p.x] : undefined;

                                tooltip = tooltip === '' ? '<strong>' + date + '</strong><br />' : tooltip;

                                if (i === 2) {
                                    tooltip += '<hr /><span><strong>' + prevDate + '</strong></span><br />';
                                }
                                tooltip += '<span>' + this.points[i >= 2 ? i - 2 : i].series.options.name + ': <strong>' + p.y + '</strong></span><br />';
                            }

                            return tooltip;
                        }
                    },
                });

                var chartComparison = function (data, prevData, label, color, i) {
                    if (data !== undefined && prevData !== undefined) {
                        if (data !== prevData && data.length > 0) {

                            if (chart.series[i] !== undefined) {
                                chart.series[i].setData(data, true);
                            }
                            else {
                                chart.addSeries({
                                    name: label,
                                    data: data,
                                    color: color,
                                    zIndex: -1
                                });
                            }
                        } else if (data.length === 0 && prevData.length > 0) {
                            // -- select --
                            // either remove by index or take last item if i > length
                            // will be the case on removing the second comparison series
                            var index = chart.series.length > i ? i : chart.series.length - 1;
                            chart.series[index].remove();
                        }
                    }
                }

                function valid(o) {
                    return o !== undefined && o.length;
                }

                scope.$watch('views', function (newValue) {
                    if (valid(newValue)) {
                        chart.series[0].setData(newValue, true);
                        chart.series[0].update({ name: scope.translations.total }, false);
                        chart.setTitle({ text: scope.label });
                        $(window).trigger('resize');
                    }
                }, true);

                scope.$watch('unique', function (newValue) {
                    if (valid(newValue)) {
                        chart.series[1].setData(newValue, true);
                        chart.series[1].update({ name: scope.translations.unique }, false);
                        $(window).trigger('resize');
                    }
                }, true);

                scope.$watch('prevViews', function (newValue, oldValue) {
                    if (valid(newValue))
                        chartComparison(newValue, oldValue, scope.translations.comparison + ' - ' + scope.translations.total, '#b1d7e7', 2);                    
                }, true);

                scope.$watch('prevUnique', function (newValue, oldValue) {
                    if (valid(newValue))
                        chartComparison(newValue, oldValue, scope.translations.comparison + ' - ' + scope.translations.unique, '#b7e4aa', 3);
                }, true);
          }
      }
  })

  .directive('PieManPie', function () {
      return {
          restrict: 'C',
          scope: {
              data: '=',
              label: '='
          },
          template: '<div></div>',
          link: function (scope, element, attrs) {
              var chart = new Highcharts.Chart({
                  chart: {
                      renderTo: element[0],
                      type: 'pie',
                      height:500
                  },
                  legend: {
                      floating: true,
                      maxHeight: 400,
                      layout: 'vertical',
                      verticalAlign: 'top',
                      y: 300
                  },
                  tooltip: {
                      formatter: function () {
                          var point = this.point,
                              s = '<span>' + this.point.name + ':</span> <b>' + this.percentage.toFixed(1) + '%</b><br />';
                          return s;
                      },
                      useHTML: true,
                      style: {
                          fontSize: '14px'
                      }
                  },
                  series: [{
                      data: scope.data
                  }]
              });

              scope.$watch("data", function (newValue) {
                  chart.series[0].setData(newValue, true);
                  chart.setTitle({ text: scope.label });
                  $(window).trigger('resize');
              }, true);

          }
      }
  })

  .directive('PieManDrilldownPie', function () {
      return {
          restrict: 'C',
          scope: {
              data: '=',
              label: '=',
              drillIn: '=',
              drillOut: '=',
          },
          template: '<div></div>',
          link: function (scope, element, attrs) {
              var chart = new Highcharts.Chart({
                  chart: {
                      renderTo: element[0],
                      type: 'pie',
                      height:500
                  },
                  legend: {
                      floating: true,
                      maxHeight: 400,
                      layout: 'vertical',
                      verticalAlign: 'top',
                      y: 300
                  },
                  tooltip: {
                      formatter: function () {
                          var point = this.point,
                              s = '<span>' + this.point.name + ':</span> <b>' + this.percentage.toFixed(1) + '%</b><br />';

                          if (point.drilldown) {
                              s += scope.drillIn;
                          } else {
                              s += scope.drillOut;
                          }
                          return s;
                      },
                      useHTML: true,
                      style: {
                          fontSize: '14px'
                      }
                  },
                  plotOptions: {
                      pie: {
                          point: {
                              events: {
                                  click: function () {
                                      var drilldown = this.drilldown;
                                      if (drilldown) { // drill down
                                          setChart(drilldown.name, drilldown.data, true);
                                      } else { // restore
                                          setChart(scope.label, scope.data, false);
                                      }
                                  }
                              }
                          },
                      }
                  },
                  series: [{
                      data: scope.data
                  }]
              });

              function setChart(name, d, isDrilldown) {
                  chart.series[0].remove();
                  chart.addSeries({
                      name: name,
                      data: d
                  });

                  chart.setTitle({
                      text: name
                  });
              }

              scope.$watch("data", function (newValue) {
                  chart.series[0].setData(newValue, true);
                  chart.setTitle({ text: scope.label });
                  $(window).trigger('resize');
              }, true);

          }
      }
  });
