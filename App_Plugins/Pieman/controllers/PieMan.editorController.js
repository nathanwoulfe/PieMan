angular.module("umbraco")
    .controller("PieMan.EditorController", function ($scope, $http, PieManResource, $filter, editorState, contentResource, PieManSettingsResource, dialogService, dataTypeResource) {
        
        $scope.fontStack = '"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif!important';
        Highcharts.theme = PieManResource.highchartsTheme($scope.fontStack)
        Highcharts.setOptions(Highcharts.theme);

        // get the account, profile and settings info from the property editor prevalues
        $scope.config = {};
        function init() {
            PieManSettingsResource.getprevalues().then(function (resp) {
                $scope.config.settings = JSON.parse(resp.data.prevalues[0]);
                $scope.config.account = JSON.parse(resp.data.prevalues[1]);
                $scope.config.profile = JSON.parse(resp.data.prevalues[2]);
                reset();
            });
        }
        init();
        
        // wire up the settings dialog
        $scope.settingsDialog = function () {
            dialogService.open({
                template: '../App_Plugins/PieMan/partials/settings.html',
                show: true,
                dialogData: $scope.config,
                callback: function () {
                    setTimeout(function () { init() }, 1);
                }
            });
        }

        // back to the start
        var reset = function () {
            $scope.dateSpan = 28;
            $scope.showCharts = false;
            $scope.showLoader = false;
            $scope.loadingStatus = [0, 0, 0];

            $scope.prevDates = [];
            $scope.prevUnique = [];
            $scope.prevViews = [];
        }

        
        // set the comparison, if any
        var setComparisonOptions = function () {
            $scope.comparisonOptions = [
                { key: '-- Compare to --', val: 0 },
                { key: 'Preceding ' + $scope.dateSpan + ' days', val: 1 },
                { key: 'Same period last month', val: 2 },
                { key: 'Same period last year', val: 3 }
            ];
            $scope.comparisonType = 0;
        }

        $scope.getComparisonData = function () {

            var startDate = new Date(),
                endDate = new Date();

            if ($scope.comparisonType === 1) {
                startDate.setDate(startDate.getDate() - ($scope.dateSpan * 2));
                endDate.setDate(endDate.getDate() - $scope.dateSpan);
            }
            else if ($scope.comparisonType === 2) {
                startDate.setDate(startDate.getDate() - 28 - $scope.dateSpan);
                endDate.setDate(endDate.getDate() - 28);
            }
            else if ($scope.comparisonType === 3) {
                startDate.setDate(startDate.getDate() - 365 - $scope.dateSpan);
                endDate.setDate(endDate.getDate() - 365);
            }

            if ($scope.comparisonType > 0) {                

                PieManResource.getComparisonChartData($scope.config.profile.Id, startDate.toUTCString(), endDate.toUTCString(), $scope.filter)
                    .then(function (resp) {
                        var len = resp.data.Rows.length, tempV = [], tempU = [], tempD = [];

                        for (i = 0; i < len; i++) {

                            var o = resp.data.Rows[i].Cells,
                                views = parseInt(o[1].Value),
                                uniqueViews = parseInt(o[2].Value),
                                year = o[0].Value.substr(0, 4),
                                month = o[0].Value.substr(4, 2),
                                day = o[0].Value.substr(6, 2);

                            tempV.push(views);
                            tempU.push(uniqueViews);
                            tempD.push($filter('date')(new Date(year, month - 1, day), 'EEE, d MMM'));
                        }
                        $scope.prevViews = tempV;
                        $scope.prevUnique = tempU;
                        $scope.prevDates = tempD;
                    });
            }
            else {
                $scope.prevUnique = [];
                $scope.prevViews = [];
                $scope.prevDates = [];
            }
        }

        // the heavy lifting happens in here
        var getAnalytics = function () {
            
            $scope.showLoader = true;

            setComparisonOptions();

            var pagePath = editorState.current.urls[0], len, i;
            if (pagePath.charAt(pagePath.length-1) === '/') {
                pagePath = pagePath.slice(0,-1);
            }

            $scope.filter = 'ga:pagePath==' + pagePath;

            PieManResource.getViewsDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    var d = resp.data.Rows[0].Cells;
                    $scope.totalPageViews = d[0].Value;
                    $scope.avgTimeOnPage = parseInt(d[1].Value, 10).toFixed(0);
                    $scope.totalUniqueViews = d[2].Value;
                    $scope.totalVisitors = d[4].Value;

                    var nv = d[3].Value;
                    $scope.newVisits = [
                        ['New', parseFloat(nv)],
                        ['Returning', 100 - nv]
                    ];

                    $scope.loadingStatus[0] = 1;
                    checkLoadingStatus();
                });

            PieManResource.getViewsChartData($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.dates = [];
                    $scope.views = [];
                    $scope.unique = [];
                    len = resp.data.Rows.length;

                    for (i = 0; i < len; i++) {

                        var o = resp.data.Rows[i].Cells,
                            views = parseInt(o[1].Value),
                            uniqueViews = parseInt(o[2].Value),
                            year = o[0].Value.substr(0, 4),
                            month = o[0].Value.substr(4, 2),
                            day = o[0].Value.substr(6, 2);

                        $scope.dates.push($filter('date')(new Date(year, month - 1, day), 'EEE, d MMM'));
                        $scope.views.push(views);
                        $scope.unique.push(uniqueViews);
                    }

                    $scope.loadingStatus[1] = 1;
                    checkLoadingStatus();
                });

            PieManResource.getBrowserDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.deviceCategory = [
                        ['Desktop', resp.data.browserCatData.desktop],
                        ['Mobile', resp.data.browserCatData.mobile],
                        ['Tablet', resp.data.browserCatData.tablet]
                    ];

                    $scope.browserType = [];
                    len = resp.data.browserData.length;
                    for (i = 0; i < len; i++) {

                        var o = resp.data.browserData[i],
                            c = 0,
                            versionsArr = [];

                        $.each(o.version, function (k, v) {
                            versionsArr.push([k, v]);
                            c += v;
                        } );

                        $scope.browserType.push({
                            name: o.browser,
                            y: c,
                            drilldown: {
                                name: o.browser + ' versions',
                                data: versionsArr
                            }
                        });
                    }
                    $scope.loadingStatus[2] = 1;
                    checkLoadingStatus();
                });
        }

        var checkLoadingStatus = function () {
            if ($scope.loadingStatus.indexOf(0) === -1) {
                $scope.showLoader = false;
                $scope.showCharts = true;
            }
        }

        $scope.toggleState = function () {
            if ($scope.showCharts) {
                reset();
            }
            else {
                getAnalytics();
            }
        }
    })

.filter('secondsToString', function () {
    return function (seconds) {
        var days = Math.floor(seconds / 86400),
            hours = Math.floor((seconds % 86400) / 3600),
            minutes = Math.floor(((seconds % 86400) % 3600) / 60),
            timeString = '';

        if (days > 0) timeString += days + 'd ';
        if (hours > 0) timeString += hours + 'h ';
        if (minutes > 0) timeString += minutes + 'm ';
        timeString += seconds + 's';

        return timeString;
    }
});

