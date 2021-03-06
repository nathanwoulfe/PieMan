(function () {
    'use strict';

    function editor($scope, $q, $timeout, assetsService, notificationsService, localizationService, pieManResource, $filter, editorState, pieManSettingsResource) {

        // wire up the settings dialog
        $scope.openSettings = function () {
            $scope.settingsOverlay = {
                view: '../app_plugins/pieman/backoffice/partials/settings.html',
                show: true,
                title: 'Analytics settings',
                settings: $scope.config.settings,
                account: $scope.config.account,
                profile: $scope.config.profile,
                submit: function (model) {

                    $scope.settingsOverlay.shpw = false;
                    $scope.settingsOverlay = null;

                    if (model.account.Id !== '') {
                        $scope.loading = true;

                        pieManSettingsResource.saveprevalue(model.account, 'account').then(function () {
                            localizationService.localize('pieman_accountDetailsSaved').then(function (val) {
                                notificationsService.success('Success', val);
                                $scope.loading = false;
                            });
                        });
                    }

                    if (model.profile.Id !== '') {
                        $scope.loading = true;

                        pieManSettingsResource.saveprevalue(model.profile, 'profile').then(function () {
                            localizationService.localize('pieman_profileDetailsSaved').then(function (val) {
                                notificationsService.success('Success', val);
                                $scope.loading = false;
                            });
                        });
                    }

                    $timeout(function () {
                        init();
                    });
                },
                close: function () {
                    $scope.settingsOverlay.shpw = false;
                    $scope.settingsOverlay = null;
                }
            }
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

        $scope.getComparisonData = function () {

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
                    .then(function (resp) {
                        var len = resp.Body.Rows.length, tempV = [], tempU = [], tempD = [];

                        for (var i = 0; i < len; i += 1) {

                            var o = resp.Body.Rows[i].Cells,
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

            if ($scope.pagePath.length > 1) {
                var a = document.createElement('a');
                a.href = $scope.pagePath;
                $scope.pagePath = a.pathname;

                if ($scope.pagePath.charAt($scope.pagePath.length - 1) === '/') {
                    $scope.pagePath = $scope.pagePath.slice(0, -1);
                }
            }

            $scope.filter = 'ga:pagePath==' + $scope.pagePath;

            /**
             * Await all analytics requests
             */
            $q.all([
                pieManResource.getViewsDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter),
                pieManResource.getViewsChartData($scope.config.profile.Id, $scope.dateSpan, $scope.filter),
                pieManResource.getBrowserDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
            ])
                .then(function (d) {
                    setViewsDatapoints(d[0]);
                    setViewsChartData(d[1]);
                    setBrowserDatapoints(d[2]);

                    $scope.showCharts = true;
                });
        }

        /**
         * 
         * @param {any} data
         */
        function setViewsDatapoints(data) {

            if (data.Body.Rows !== undefined && data.Body.Rows.length) {
                var d = data.Body.Rows[0].Cells;
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
                    });
            }
        }

        /**
         * 
         * @param {any} data
         */
        function setViewsChartData(data) {

            if (data.Body.Rows !== undefined && data.Body.Rows.length) {

                $scope.dates = [];
                $scope.views = [];
                $scope.unique = [];
                var len = data.Body.Rows.length;

                for (var i = 0; i < len; i += 1) {

                    var o = data.Body.Rows[i].Cells,
                        views = parseInt(o[1].Value),
                        uniqueViews = parseInt(o[2].Value),
                        year = o[0].Value.substr(0, 4),
                        month = o[0].Value.substr(4, 2),
                        day = o[0].Value.substr(6, 2);

                    $scope.dates.push($filter('date')(new Date(year, month - 1, day), 'EEE, d MMM'));
                    $scope.views.push(views);
                    $scope.unique.push(uniqueViews);
                }
            }
        }

        /**
         * 
         * @param {any} data
         */
        function setBrowserDatapoints(data) {
            if (data.browserData !== undefined && data.browserData.length) {

                var bd = data.browserData,
                    bcd = data.browserCatData,
                    l = bd.length,
                    i;

                $scope.deviceCategory = [];
                $scope.browserType = [];

                ['desktop', 'mobile', 'tablet'].forEach(function (type) {
                    if (bcd.hasOwnProperty(type)) {
                        localizationService.localize('pieman_' + type)
                            .then(function (val) {
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
            }
        }

        $scope.toggleState = function () {
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

        // check that highcharts doesn't already exist - will still work if we load it twice, but that's not cool
        if (window.Highcharts) {
            init();
        } else {
            assetsService.loadJs('~/app_plugins/pieman/backoffice/lib/highcharts.js')
                .then(function () {
                    init();
                });
        }
    }

    angular.module('umbraco')
        .controller('PieMan.EditorController', ['$scope',
            '$q',
            '$timeout',
            'assetsService',
            'notificationsService',
            'localizationService',
            'pieManResource',
            '$filter',
            'editorState',
            'pieManSettingsResource', editor]);

    /**
     * *
     */
    function secondsToString() {
        return function (seconds) {
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
    }

    angular.module('umbraco.filters').filter('secondsToString', secondsToString);
}());

