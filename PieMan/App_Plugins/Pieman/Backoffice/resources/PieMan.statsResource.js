angular.module('umbraco.resources')
    .factory('pieManResource', function ($http, umbRequestHelper) {

        var urlBase = 'backoffice/pieman/analyticsapi/';

        function request(url, data) {
            return umbRequestHelper.resourcePromise(
                $http.get(url, data),
                'Something broke'
            );
        };

        return {
            getViewsDatapoints: function(profileId, dateSpan, filter) {
                return request(urlBase + 'getviewsdatapoints',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getBrowserDatapoints: function(profileId, dateSpan, filter) {
                return request(urlBase + 'getbrowserdatapoints',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getViewsChartData: function(profileId, dateSpan, filter) {
                return request(urlBase + 'getviewschartdata',
                    { params: { profile: profileId, dateSpan: dateSpan, filter: filter } });
            },
            getComparisonChartData: function(profileId, startDate, endDate, filter) {
                return request(urlBase + 'getcomparisonchartdata',
                    { params: { profile: profileId, startDate: startDate, endDate: endDate, filter: filter } });
            },
        };
    });