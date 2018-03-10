angular.module('umbraco.resources')
    .factory('pieManResource', function ($http) {

        var urlBase = 'backoffice/pieman/analyticsapi/';

        return {
            getViewsDatapoints: function(profileId, dateSpan, filter) {
                return $http.get(urlBase + 'getviewsdatapoints',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getBrowserDatapoints: function(profileId, dateSpan, filter) {
                return $http.get(urlBase + 'getbrowserdatapoints',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getViewsChartData: function(profileId, dateSpan, filter) {
                return $http.get(urlBase + 'getviewschartdata',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getComparisonChartData: function(profileId, startDate, endDate, filter) {
                return $http.get(urlBase + 'getcomparisonchartdata',
                    { params: { profile: profileId, startDate: startDate, endDate: endDate, filter: filter } });
            },
        };
    });