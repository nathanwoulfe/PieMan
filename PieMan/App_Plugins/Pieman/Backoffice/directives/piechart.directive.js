(function () {
    'use strict';

    function directive(locale) {
        return {
            restrict: 'C',
            scope: {
                data: '=',
                label: '@label'
            },
            template: '<div></div>',
            link: function (scope, element) {

                var chart;

                function initChart() {
                    chart = new Highcharts.Chart({
                        chart: {
                            renderTo: element[0],
                            type: 'pie',
                            marginBottom: 100
                        },
                        credits: {
                            enabled: false
                        },
                        exporting: {
                            enabled: false
                        },
                        legend: {
                            layout: 'vertical'
                        },
                        tooltip: {
                            formatter: function() {
                                return '<span>' +
                                    this.point.name +
                                    ':</span> <b>' +
                                    this.percentage.toFixed(1) +
                                    '%</b><br />';
                            },
                            useHTML: true,
                            style: {
                                fontSize: '14px'
                            }
                        },
                        plotOptions: {
                            pie: {
                                showInLegend: true,
                                dataLabels: {
                                    enabled: false
                                }
                            }
                        },
                        series: [
                            {
                                data: scope.data
                            }
                        ]
                    });
                }

                scope.$watch('data',
                    function (newVal) {
                        if (newVal && newVal.length) {

                            initChart();
                        
                            locale.localize(scope.label)
                                .then(function (t) {
                                    chart.series[0].setData(newVal, true);
                                    chart.setTitle({ text: t });
                                    window.dispatchEvent(new Event('resize'));
                                });
                        }
                    },
                    true);

            }
        };
    }

    angular.module('umbraco.directives').directive('PieManPie', ['localizationService', directive]);

}());