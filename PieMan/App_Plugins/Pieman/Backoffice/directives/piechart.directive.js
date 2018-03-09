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

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        type: 'pie',
                        height: 500
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        layout: 'vertical'
                    },
                    tooltip: {
                        formatter: function () {
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
                            center: ['50%', '50%'],
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },
                    series: [{
                        data: scope.data
                    }]
                });

                scope.$watch('data', function (newVal) {
                    if (newVal) {
                        var data = JSON.parse(JSON.stringify(newVal));
                        // to keep the pie charts aligned, all must have the same number of segments
                        data.push(['3', 0]);
                        data.push(['4', 0]);
                        data.push(['5', 0]);
                        
                        locale.localize(scope.label)
                            .then(function (t) {
                                chart.series[0].setData(data, true);
                                chart.setTitle({ text: t });
                                window.dispatchEvent(new Event('resize'));
                                //chart.redraw();
                            });
                    }
                }, true);

            }
        }
    }

    angular.module('umbraco.directives').directive('PieManPie', ['localizationService', directive]);

}());