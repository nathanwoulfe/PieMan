﻿(function() {
    'use strict';

    function directive(locale) {

        return {
            restrict: 'C',
            scope: {
                data: '=',
                label: '@label',
                drillIn: '=',
                drillOut: '=',
            },
            template: '<div></div>',
            link: function(scope, element) {
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        type: 'pie'
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        layout: 'vertical'
                    }, 
                    tooltip: {
                        formatter: function() {
                            var point = this.point,
                                s = '<span>' +
                                    this.point.name +
                                    ':</span> <b>' +
                                    this.percentage.toFixed(1) +
                                    '%</b><br />';

                            if (point.drilldown) {
                                locale.localize(scope.drillIn)
                                    .then(function(t) {
                                        s += t;
                                    });
                            } else {
                                locale.localize(scope.drillOut)
                                    .then(function(t) {
                                        s += t;
                                    });
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
                            center: ['50%', '50%'],
                            showInLegend: true,
                            dataLabels: {
                                enabled: false
                            },
                            point: {
                                events: {
                                    click: function() {
                                        var drilldown = this.drilldown;
                                        if (drilldown) { // drill down
                                            setChart(drilldown.name, drilldown.data, true);
                                        } else { // restore
                                            locale.localize(scope.label)
                                                .then(function(t) {
                                                    setChart(t, scope.data, false);
                                                });
                                        }
                                    }
                                }
                            },
                        }
                    },
                    series: [
                        {
                            data: scope.data
                        }
                    ]
                });

                function setChart(name, d) {
                    chart.series[0].remove();
                    chart.addSeries({
                        name: name,
                        data: d
                    });

                    chart.setTitle({
                        text: name
                    });
                }

                scope.$watch('data',
                    function(newValue) {
                        locale.localize(scope.label)
                            .then(function(t) {
                                chart.series[0].setData(newValue, true);
                                chart.setTitle({ text: t });
                                window.dispatchEvent(new Event('resize'));
                                //chart.redraw();
                            });
                    },
                    true);

            }
        }
    }

    angular.module('umbraco.directives').directive('PieManDrilldownPie', ['localizationService', directive]);

}());