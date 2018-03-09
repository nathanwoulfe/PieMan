angular.module('umbraco')
    .controller('PieMan.EditorController', function ($scope, localizationService, $http, pieManResource, $filter, editorState, userService, contentResource, pieManSettingsResource, dialogService) {

        // wire up the settings dialog
        $scope.settingsDialog = function() {
            dialogService.open({
                template: '../App_Plugins/PieMan/backoffice/partials/settings.html',
                show: true,
                dialogData: $scope.config,
                callback: function() {
                    setTimeout(function() { init(); }, 1);
                }
            });
        };

        // back to the start
        function reset() {
            $scope.pagePath = '';
            $scope.dateSpan = 28;
            $scope.showCharts = false;
            $scope.showLoader = false;
            $scope.showError = false;
            $scope.responseStatus = [0, 0, 0];
            $scope.loadingStatus = [0, 0, 0];
            $scope.noData = [0, 0, 0];

            $scope.prevDates = [];
            $scope.prevUnique = [];
            $scope.prevViews = [];
        }


        // set the comparison, if any
        function setComparisonOptions() {
            localizationService.localizeMany(
                ['pieman_compareTo',
                    'pieman_preceding',
                    'pieman_samePeriodLast',
                    'pieman_month',
                    'pieman_year',
                    'pieman_days'])
                .then(function (t) {
                    $scope.comparisonOptions = [
                        { key: t[0], val: 0 },
                        { key: t[1] + ' ' + $scope.dateSpan + ' ' + t[5], val: 1 },
                        { key: t[2] + ' ' + t[3], val: 2 },
                        { key: t[2] + ' ' + t[4], val: 3 }
                    ];
                    $scope.comparisonType = 0;
                });
        }

        $scope.getComparisonData = function() {

            var startDate = new Date(),
                endDate = new Date();

            if ($scope.comparisonType === 1) {
                startDate.setDate(startDate.getDate() - ($scope.dateSpan * 2));
                endDate.setDate(endDate.getDate() - $scope.dateSpan);
            } else if ($scope.comparisonType === 2) {
                startDate.setDate(startDate.getDate() - 28 - $scope.dateSpan);
                endDate.setDate(endDate.getDate() - 28);
            } else if ($scope.comparisonType === 3) {
                startDate.setDate(startDate.getDate() - 365 - $scope.dateSpan);
                endDate.setDate(endDate.getDate() - 365);
            }

            if ($scope.comparisonType > 0) {

                pieManResource.getComparisonChartData($scope.config.profile.Id,
                        startDate.toUTCString(),
                        endDate.toUTCString(),
                        $scope.filter)
                    .then(function(resp) {
                        var len = resp.data.Body.Rows.length, tempV = [], tempU = [], tempD = [];

                        for (var i = 0; i < len; i += 1) {

                            var o = resp.data.Body.Rows[i].Cells,
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
            } else {
                $scope.prevUnique = [];
                $scope.prevViews = [];
                $scope.prevDates = [];
            }
        };

        // the heavy lifting happens in here
        function getAnalytics() {

            $scope.showLoader = true;
            $scope.pagePath = editorState.current.urls[0];
            setComparisonOptions();

            var len, i;
            if ($scope.pagePath.length > 1) {
                var a = document.createElement('a');
                a.href = $scope.pagePath;
                $scope.pagePath = a.pathname;

                if ($scope.pagePath.charAt($scope.pagePath.length - 1) === '/') {
                    $scope.pagePath = $scope.pagePath.slice(0, -1);
                }
            }

            $scope.filter = 'ga:pagePath==' + $scope.pagePath;

            pieManResource.getViewsDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[0] = 1;

                    if (resp.data.Body.Rows !== undefined && resp.data.Body.Rows.length) {
                        var d = resp.data.Body.Rows[0].Cells;
                        $scope.totalPageViews = d[0].Value;
                        $scope.avgTimeOnPage = parseInt(d[1].Value, 10).toFixed(0);
                        $scope.totalUniqueViews = d[2].Value;
                        $scope.totalVisitors = d[4].Value;

                        var nv = d[3].Value;

                        localizationService.localizeMany(['pieman_new', 'pieman_returning'])
                            .then(function (t) {
                                $scope.newVisits = [
                                    [t[0], parseFloat(nv)],
                                    [t[1], 100 - nv]
                                ];

                                $scope.loadingStatus[0] = 1;
                            });
                    } else {
                        $scope.noData[0] = 1;
                    }

                    checkLoadingStatus();
                });

            pieManResource.getViewsChartData($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[1] = 1;

                    if (resp.data.Body.Rows !== undefined && resp.data.Body.Rows.length) {

                        $scope.dates = [];
                        $scope.views = [];
                        $scope.unique = [];
                        len = resp.data.Body.Rows.length;

                        for (i = 0; i < len; i++) {

                            var o = resp.data.Body.Rows[i].Cells,
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
                    } else {
                        $scope.noData[1] = 1;
                    }

                    checkLoadingStatus();
                });

            pieManResource.getBrowserDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[2] = 1;
                    if (resp.data.browserData !== undefined && resp.data.browserData.length) {

                        var bd = resp.data.browserData,
                            bcd = resp.data.browserCatData,
                            l = bd.length,
                            i;

                        $scope.deviceCategory = [];
                        $scope.browserType = [];

                        ['desktop', 'mobile', 'tablet'].forEach(function (type) {
                            if (bcd.hasOwnProperty(type)) {
                                localizationService.localize('pieman_' + type)
                                    .then(function(val) {
                                        $scope.deviceCategory.push([val, bcd[type]]);
                                    });
                            }
                        });

                        for (i = 0; i < l; i++) {

                            var o = bd[i],
                                c = 0,
                                versionsArr = [];

                            $.each(o.version,
                                function (k, v) {
                                    versionsArr.push([k, v]);
                                    c += v;
                                });

                            $scope.browserType.push({
                                name: o.browser,
                                y: c,
                                colorIndex: i,
                                drilldown: {
                                    name: o.browser + ' ' + 'versions',
                                    data: versionsArr
                                }
                            });
                        }
                        $scope.loadingStatus[2] = 1;
                    } else {
                        $scope.noData[2] = 1;
                    }
                    checkLoadingStatus();
                });
        }

        function checkLoadingStatus() {
            if ($scope.responseStatus.indexOf(0) === -1) {
                if ($scope.loadingStatus.indexOf(0) === -1) {
                    $scope.showLoader = false;
                    $scope.showCharts = true;
                    $scope.showError = false;
                } else if ($scope.noData.indexOf(1) !== -1) {
                    $scope.showCharts = false;
                    $scope.showLoader = false;
                    $scope.showError = true;
                }
            }
        }

        $scope.toggleState = function() {
            if ($scope.showCharts) {
                reset();
            } else {
                getAnalytics();
            }
        };

        // get the account, profile and settings info from the property editor prevalues
        $scope.config = {};
        function init() {
            pieManSettingsResource.getprevalues().then(function (resp) {
                $scope.config.settings = JSON.parse(resp.data.prevalues[0]);
                $scope.config.account = JSON.parse(resp.data.prevalues[1]);
                $scope.config.profile = JSON.parse(resp.data.prevalues[2]);

                reset();
            });
        }

        init();
    })

    .filter('secondsToString', function () {
        return function(seconds) {
            var days = Math.floor(seconds / 86400),
                hours = Math.floor((seconds % 86400) / 3600),
                minutes = Math.floor(((seconds % 86400) % 3600) / 60),
                timeString = '';

            if (days > 0) {
                timeString += days + 'd ';
            }
            if (hours > 0) {
                timeString += hours + 'h ';
            }
            if (minutes > 0) {
                timeString += minutes + 'm ';
            }

            timeString += seconds + 's';

            return timeString;
        };
    });

