
angular.module("umbraco.resources")
    .factory("PieManSettingsResource", function ($http, $cookieStore) {
        return {

            getprevalues: function () {
                return $http.get('backoffice/pieman/editorapi/getprevalues');
            },

            saveprevalue: function (prevalue, alias) {
                return $http.post('backoffice/pieman/editorapi/updateprevalueforeditor?prevalue=' + angular.toJson(prevalue) + '&alias=' + alias);
            },

            checkauth: function () {
                return $http.get('backoffice/pieman/settingsapi/getauth');
            },

            getaccounts: function () {
                return $http.get("backoffice/pieman/analyticsapi/getaccounts");
            },

            getprofiles: function (accountId) {
                return $http.get("backoffice/pieman/analyticsapi/getprofilesfromaccount?accountId=" + accountId);
            },
       
            setDateFilter: function (startDate, endDate) {
                $cookieStore.put("analyticsStartDate", startDate);
                $cookieStore.put("analyticsEndDate", endDate);

            },
            getDateFilter: function () {
                var dateFilter = {};
                dateFilter.startDate = $cookieStore.get("analyticsStartDate");
                dateFilter.endDate = $cookieStore.get("analyticsEndDate");

                if (dateFilter.startDate == null) {
                    dateFilter.startDate = moment().subtract('days', 29).format('YYYY-MM-DD');
                    dateFilter.endDate = moment().format('YYYY-MM-DD');
                    $cookieStore.put("analyticsStartDate", dateFilter.startDate);
                    $cookieStore.put("analyticsEndDate", dateFilter.endDate);
                }

                return dateFilter;
            },

            gettranslations: function (culture) {
                return $http.get('backoffice/pieman/translationsapi/gettranslations?culture=' + culture);
            }

        };
    });