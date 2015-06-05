angular.module('umbraco.directives')
  .directive('PieManLine', function () {
      return {
          restrict: 'C',
          scope: {
              views: '=',
              unique: '=',
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

                scope.$watch('views', function (newValue) {
                    chart.series[0].setData(newValue, true);
                }, true);

                scope.$watch('unique', function (newValue) {
                    chart.series[1].setData(newValue, true);
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
              }, true);

          }
      }
  });
