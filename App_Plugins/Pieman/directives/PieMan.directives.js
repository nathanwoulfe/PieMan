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
              label: '='
          },
          template: '<div></div>',
          link: function (scope, element, attrs, $filter) {
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        height:350
                    },
                    title: {
                        text: scope.label
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
                            name: 'Total',
                            data: scope.views
                        },
                        {
                            name: 'Unique',
                            data: scope.unique
                        }
                    ],
                    tooltip: {
                        formatter: function () {
                            return '<b>' + scope.dates[this.x] + '</b><br/>' +
                                this.series.name + ': ' + this.y;
                        },
                        style: {
                            fontSize: '14px'
                        }
                    },
                });

                var chartComparison = function (data, prevData, label, color, i) {

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
                    }
                }

                scope.$watch('views', function (newValue) {
                    chart.series[0].setData(newValue, true);
                    $(window).trigger('resize');
                }, true);

                scope.$watch('unique', function (newValue) {                    
                    chart.series[1].setData(newValue, true);
                    $(window).trigger('resize');
                }, true);

                scope.$watch('prevViews', function (newValue, oldValue) {
                    chartComparison(newValue, oldValue, 'Comparison - views', '#b1d7e7', 2);                    
                }, true);

                scope.$watch('prevUnique', function (newValue, oldValue) {
                    chartComparison(newValue, oldValue, 'Comparison - unique', '#b7e4aa', 3);
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
                  title: {
                      text: scope.label
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
              drillOut: '='
          },
          template: '<div></div>',
          link: function (scope, element, attrs) {
              var chart = new Highcharts.Chart({
                  chart: {
                      renderTo: element[0],
                      type: 'pie',
                      height:500
                  },
                  title: {
                      text: scope.label
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
                  $(window).trigger('resize');
              }, true);

          }
      }
  });
