angular.module("umbraco.resources")
    .factory('PieManResource', function ($http, PieManSettingsResource) {
        return {
            getViewsDatapoints: function (profileID, dateSpan, filter) {
                return $http.get('backoffice/pieman/analyticsapi/getviewsdatapoints', { params: { profile: profileID, dateSpan: dateSpan, filter: filter } });
            },
            getBrowserDatapoints: function (profileID, dateSpan, filter) {
                return $http.get('backoffice/pieman/analyticsapi/getbrowserdatapoints', { params: { profile: profileID, dateSpan: dateSpan, filter: filter } });
            },
            getViewsChartData: function (profileID, dateSpan, filter) {
                return $http.get('backoffice/pieman/analyticsapi/getviewschartdata', { params: { profile: profileID, dateSpan: dateSpan, filter: filter } });
            },
            // sets the global chart theming - additional values are set in related directives
            highchartsTheme: function (fontStack) {
                return {
                    colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5'],
                    credits: {
                        enabled: false
                    },
                    title: {
                        style: {
                            color: '#555',
                            fontFamily: fontStack,
                            fontSize: '22px'
                        }
                    },
                    xAxis: {
                        gridLineWidth: 0,
                        lineColor: '#fff',
                        tickColor: '#d9d7d7',
                        tickWidth:0,
                        labels: {
                            enabled: false
                        }                    
                    },
                    yAxis: {
                        allowDecimals: false,
                        min:0,
                        minorGridLineWidth:0,
                        minorTickInterval: 'auto',
                        gridLineWidth: 0,
                        tickWidth:0,
                        lineColor: '#fff',
                        lineWidth: 1,
                        tickColor: '#d9d7d7',
                        labels: {
                            enabled: false
                        },
                        title: {
                            style: {
                                display:'none'
                            }
                        }
                    },
                    legend: {
                        enabled: true,
                        borderRadius: 0,
                        borderColor: '#fff',
                        itemStyle: {
                            fontFamily: fontStack,
                            fontSize: '12px',
                            color: '#555'
                        },
                        itemHoverStyle: {
                            color: '#333'
                        },
                        itemHiddenStyle: {
                            color: 'gray'
                        }
                    },

                    plotOptions: {
                        pie: {
                            center: ['50%', 100],
                            cursor: 'pointer',
                            showInLegend: true,
                            borderWidth: 0,
                            dataLabels: {
                                enabled: false
                            },
                            size:'55%'
                        }                        
                    }
                };
            }
        }
    });