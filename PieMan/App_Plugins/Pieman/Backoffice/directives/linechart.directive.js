(function () {
    'use strict';

    function directive(locale) {
        return {
            restrict: 'C',
            scope: {
                views: '=',
                unique: '=',
                prevViews: '=',
                prevUnique: '=',
                dates: '=',
                prevDates: '=',
                label: '@label'
            },
            template: '<div></div>',
            link: function (scope, element) {

                var chart;

                function initChart() {
                    chart = new Highcharts.Chart({
                        chart: {
                            renderTo: element[0],
                            height: 350
                        },
                        credits: {
                            enabled: false
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
                        xAxis: {
                            visible: false
                        },
                        yAxis: {
                            visible: false
                        },
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
                                    tooltip += '<span>' +
                                        this.points[i >= 2 ? i - 2 : i].series.options.name +
                                        ': <strong>' +
                                        p.y +
                                        '</strong></span><br />';
                                }

                                return tooltip;
                            }
                        },
                    });
                }

                function chartComparison(data, prevData, label, i) {
                    if (data && prevData) {
                        if (data !== prevData && data.length > 0) {

                            if (chart.series[i] !== undefined) {
                                chart.series[i].setData(data, true);
                            } else {
                                chart.addSeries({
                                    name: label,
                                    data: data,
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

                scope.$watch('views',
                    function (newVal) {
                        if (newVal && newVal.length) {
                            initChart();
                            locale.localizeMany(['pieman_total', scope.label])
                                .then(function (t) {
                                    chart.series[0].setData(newVal, true);
                                    chart.series[0].update({ name: t[0] }, false);
                                    chart.setTitle({ text: t[1] });
                                    window.dispatchEvent(new Event('resize'));
                                });
                        }
                    },
                    true);

                scope.$watch('unique',
                    function (newVal) {
                        if (newVal && newVal.length) {
                            locale.localize('pieman_unique')
                                .then(function (t) {
                                    chart.series[1].setData(newVal, true);
                                    chart.series[1].update({ name: t }, false);
                                    window.dispatchEvent(new Event('resize'));
                                });
                        }
                    },
                    true);

                scope.$watch('prevViews',
                    function (newVal, oldVal) {
                        if (newVal && newVal.length) {
                            locale.localizeMany(['pieman_comparison', 'pieman_total'])
                                .then(function (t) {
                                    chartComparison(newVal, oldVal, t[0] + ' - ' + t[1], 2);
                                });
                        }
                    },
                    true);

                scope.$watch('prevUnique',
                    function (newVal, oldVal) {
                        if (newVal && newVal.length) {
                            locale.localizeMany('pieman_comparison', 'pieman_unique')
                                .then(function (t) {
                                    chartComparison(newVal, oldVal, t[0] + ' - ' + t[1], 3);
                                });
                        }
                    },
                    true);
            }
        };
    }

    angular.module('umbraco.directives').directive('PieManLine', ['localizationService', directive]);

}());