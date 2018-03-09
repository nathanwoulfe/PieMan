/*! pieman - v1.0.0-build1 - 2018-03-09
 * Copyright (c) 2018 ;
 * Licensed ISC
 */

angular.module('umbraco')
    .controller('PieMan.EditorController', function ($scope, $http, PieManResource, $filter, editorState, userService, contentResource, PieManSettingsResource, dialogService, dataTypeResource) {

        Highcharts.theme =
            PieManResource.highchartsTheme('"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif!important');
        Highcharts.setOptions(Highcharts.theme);

        //// need the current user locale to apply translations
        //userService.getCurrentUser()
        //    .then(function (resp) {
        //        $scope.userType = resp.userType;
                
        //        var locale = resp.locale;
        //        if (locale.toLowerCase() === 'en-us') {
        //            locale = 'en_us';
        //        }
        //        else {
        //            locale = locale.substr(0, 2);
        //        }

        //        getTranslations(locale);

        //    });

        //// fetch locale
        //function getTranslations(locale) {
        //    PieManSettingsResource.gettranslations(locale)
        //        .then(function (resp) {
        //            $scope.translations = resp.data;
        //            init();
        //        });
        //};

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
        var setComparisonOptions = function () {
            $scope.comparisonOptions = [
                { key: 'compareTo', val: 0 },
                //{ key: $scope.translations.preceding + ' ' + $scope.dateSpan + ' ' + $scope.translations.days, val: 1 },
                //{ key: $scope.translations.samePeriodLast + ' ' + $scope.translations.month, val: 2 },
                //{ key: $scope.translations.samePeriodLast + ' ' + $scope.translations.year, val: 3 }
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

            PieManResource.getViewsDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[0] = 1;

                    if (resp.data.Rows !== undefined && resp.data.Rows.length) {
                        var d = resp.data.Rows[0].Cells;
                        $scope.totalPageViews = d[0].Value;
                        $scope.avgTimeOnPage = parseInt(d[1].Value, 10).toFixed(0);
                        $scope.totalUniqueViews = d[2].Value;
                        $scope.totalVisitors = d[4].Value;

                        var nv = d[3].Value;
                        $scope.newVisits = [
                            ['new', parseFloat(nv)],
                            ['returning', 100 - nv]
                        ];

                        $scope.loadingStatus[0] = 1;
                    }
                    else {
                        $scope.noData[0] = 1;
                    }

                    checkLoadingStatus();
                });

            PieManResource.getViewsChartData($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[1] = 1;

                    if (resp.data.Rows !== undefined && resp.data.Rows.length) {

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
                    }
                    else {
                        $scope.noData[1] = 1;
                    }

                    checkLoadingStatus();
                });

            PieManResource.getBrowserDatapoints($scope.config.profile.Id, $scope.dateSpan, $scope.filter)
                .then(function (resp) {

                    $scope.responseStatus[2] = 1;

                    if (resp.data.browserData !== undefined && resp.data.browserData.length) {

                        var bd = resp.data.browserData,
                            bcd = resp.data.browserCatData,
                            l = bd.length,
                            i;

                        $scope.deviceCategory = [];
                        $scope.browserType = [];

                        for (i in types = ['desktop', 'mobile', 'tablet']) {
                            var t = types[i];
                            if (bcd.hasOwnProperty(t))
                                $scope.deviceCategory.push([t, bcd[t]]);
                        }

                        for (i = 0; i < l; i++) {

                            var o = bd[i],
                                c = 0,
                                versionsArr = [];

                            $.each(o.version, function (k, v) {
                                versionsArr.push([k, v]);
                                c += v;
                            });

                            $scope.browserType.push({
                                name: o.browser,
                                y: c,
                                drilldown: {
                                    name: o.browser + ' ' + 'versions',
                                    data: versionsArr
                                }
                            });
                        }
                        $scope.loadingStatus[2] = 1;
                    }
                    else {
                        $scope.noData[2] = 1;
                    }

                    checkLoadingStatus();
                });
        }

        var checkLoadingStatus = function () {
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


angular.module("umbraco").controller("PieMan.SettingsController",
    function ($scope, PieManSettingsResource, notificationsService, localizationService) {

        $scope.settings = $scope.dialogData.settings;
        $scope.selectedaccount = $scope.dialogData.account;
        $scope.selectedprofile = $scope.dialogData.profile;

        if ($scope.dialogData.settings.refresh_token !== '') {
            //Show or hide the auth button (set on scope & local var for if check)
            $scope.isAuthd = true;

            //Only load/fetch if showAuth is true
            if ($scope.isAuthd) {

                //Get all accounts via PieManSettingsResource - does WebAPI GET call
                PieManSettingsResource.getaccounts().then(function (response) {
                    $scope.accounts = response.data;

                    if ($scope.selectedaccount.Id != '') {
                        getProfiles($scope.selectedaccount.Id);
                    }

                    $scope.selectedaccount = _.where($scope.accounts, { Id: $scope.selectedaccount.Id })[0];
                });
                
                //When an account is selected
                $scope.accountSelected = function (selectedAccount) {

                    $scope.dialogData.account = {};
                    $scope.dialogData.account.Name = selectedAccount.Name;
                    $scope.dialogData.account.Id = selectedAccount.Id;
                    $scope.dialogData.account.Created = new Date(selectedAccount.Created).toISOString();
                    $scope.dialogData.account.Updated = new Date(selectedAccount.Updated).toISOString();

                    getProfiles(selectedAccount.Id);
                };

                //When a profile is selected
                $scope.profileSelected = function (selectedProfile) {

                    var o = {};
                    o.AccountId = selectedProfile.AccountId;
                    o.Created = new Date(selectedProfile.Created).toISOString();
                    o.Currency = selectedProfile.Currency;
                    o.Id = selectedProfile.Id;
                    o.InternalWebPropertyId = selectedProfile.InternalWebPropertyId;
                    o.Name = selectedProfile.Name;
                    o.Timezone = selectedProfile.Timezone;
                    o.Type = selectedProfile.Type;
                    o.Updated = new Date(selectedProfile.Updated).toISOString();
                    o.WebPropertyId = selectedProfile.WebPropertyId;
                    o.WebsiteUrl = selectedProfile.WebsiteUrl;

                    $scope.selectedprofile = selectedProfile;
                    $scope.dialogData.profile = o;
                };
            }
        }

        getProfiles = function (id) {
            PieManSettingsResource.getprofiles(id).then(function (response) {
                $scope.profiles = response.data;
                $scope.selectedprofile = _.where($scope.profiles, { Id: $scope.selectedprofile.Id })[0];
            });
        }

        //Auth - Click
        $scope.auth = function () {
            //Open a dialog window to oAuth
            window.open("/App_Plugins/PieMan/auth/OAuth.aspx", "oAuthAnalytics", "location=0,status=0,width=600,height=600");
        };

        //Save - click...
        $scope.save = function () {

            if ($scope.dialogData.account.Id != '') {
                PieManSettingsResource.saveprevalue($scope.dialogData.account, "account").then(function (response) {
                    localizationService.localize('pieman_accountDetailsSaved').then(function (val) {
                        notificationsService.success('Success', val);
                    });
                });
            }

            if ($scope.dialogData.profile.Id != '') {
                PieManSettingsResource.saveprevalue($scope.dialogData.profile, "profile").then(function (response) {
                    localizationService.localize('pieman_profileDetailsSaved').then(function (val) {
                        notificationsService.success('Success', val);
                    });
                });
            }

            $scope.submit();
        };

    }); 
angular.module('umbraco.directives')
    .directive('PieManLine', function (localizationService) {
        return {
            restrict: 'C',
            scope: {
                views: '=',
                unique: '=',
                prevViews: '=',
                prevUnique: '=',
                dates: '=',
                prevDates: '=',
                label: '=',
                translations: '='
            },
            template: '<div></div>',
            link: function (scope, element, attrs, $filter) {

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        height: 350
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
                                tooltip += '<span>' + this.points[i >= 2 ? i - 2 : i].series.options.name + ': <strong>' + p.y + '</strong></span><br />';
                            }

                            return tooltip;
                        }
                    },
                });

                var chartComparison = function (data, prevData, label, color, i) {
                    if (data !== undefined && prevData !== undefined) {
                        if (data !== prevData && data.length > 0) {

                            if (chart.series[i] !== undefined) {
                                chart.series[i].setData(data, true);
                            }
                            else {
                                chart.addSeries({
                                    name: label,
                                    data: data,
                                    color: color,
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

                function valid(o) {
                    return o !== undefined && o.length;
                }

                scope.$watch('views', function (newValue) {
                    if (valid(newValue)) {
                        chart.series[0].setData(newValue, true);
                        chart.series[0].update({ name: scope.translations.total }, false);
                        chart.setTitle({ text: scope.label });
                        $(window).trigger('resize');
                    }
                }, true);

                scope.$watch('unique', function (newValue) {
                    if (valid(newValue)) {
                        chart.series[1].setData(newValue, true);
                        chart.series[1].update({ name: scope.translations.unique }, false);
                        $(window).trigger('resize');
                    }
                }, true);

                scope.$watch('prevViews', function (newValue, oldValue) {
                    if (valid(newValue))
                        chartComparison(newValue, oldValue, scope.translations.comparison + ' - ' + scope.translations.total, '#b1d7e7', 2);
                }, true);

                scope.$watch('prevUnique', function (newValue, oldValue) {
                    if (valid(newValue))
                        chartComparison(newValue, oldValue, scope.translations.comparison + ' - ' + scope.translations.unique, '#b7e4aa', 3);
                }, true);
            }
        }
    })

    .directive('PieManPie', function (localizationService) {
        return {
            restrict: 'C',
            scope: {
                data: '=',
                label: '='
            },
            template: '<div></div>',
            link: function (scope, element, attrs) {
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        type: 'pie',
                        height: 500
                    },
                    legend: {
                        floating: true,
                        maxHeight: 400,
                        layout: 'vertical',
                        verticalAlign: 'top',
                        y: 300
                    },
                    tooltip: {
                        formatter: function () {
                            var point = this.point,
                                s = '<span>' + this.point.name + ':</span> <b>' + this.percentage.toFixed(1) + '%</b><br />';
                            return s;
                        },
                        useHTML: true,
                        style: {
                            fontSize: '14px'
                        }
                    },
                    series: [{
                        data: scope.data
                    }]
                });

                scope.$watch('data', function (newValue) {
                    chart.series[0].setData(newValue, true);

                    localizationService.localize(scope.label).then(function (value) {
                        chart.setTitle({ text: value });
                    });

                    $(window).trigger('resize');
                }, true);

            }
        }
    })

    .directive('PieManDrilldownPie', function (localizationService) {
        return {
            restrict: 'C',
            scope: {
                data: '=',
                label: '=',
                drillIn: '=',
                drillOut: '=',
            },
            template: '<div></div>',
            link: function (scope, element, attrs) {
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: element[0],
                        type: 'pie',
                        height: 500
                    },
                    legend: {
                        floating: true,
                        maxHeight: 400,
                        layout: 'vertical',
                        verticalAlign: 'top',
                        y: 300
                    },
                    tooltip: {
                        formatter: function () {
                            var point = this.point,
                                s = '<span>' + this.point.name + ':</span> <b>' + this.percentage.toFixed(1) + '%</b><br />';

                            if (point.drilldown) {
                                //s += scope.drillIn;
                            } else {
                                //s += scope.drillOut;
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
                            point: {
                                events: {
                                    click: function () {
                                        var drilldown = this.drilldown;
                                        if (drilldown) { // drill down
                                            setChart(drilldown.name, drilldown.data, true);
                                        } else { // restore
                                            setChart(scope.label, scope.data, false);
                                        }
                                    }
                                }
                            },
                        }
                    },
                    series: [{
                        data: scope.data
                    }]
                });

                function setChart(name, d, isDrilldown) {
                    chart.series[0].remove();
                    chart.addSeries({
                        name: name,
                        data: d
                    });

                    chart.setTitle({
                        text: name
                    });
                }

                scope.$watch('data', function (newValue) {
                    chart.series[0].setData(newValue, true);

                    localizationService.localize(scope.label).then(function (value) {
                        chart.setTitle({ text: value });
                    });

                    $(window).trigger('resize');
                }, true);

            }
        }
    });
