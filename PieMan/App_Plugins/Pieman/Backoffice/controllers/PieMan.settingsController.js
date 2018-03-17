(function () {
    'use strict';

    function settings($scope, pieManSettingsResource) {

        var vm = this;

        if ($scope.model.settings.refresh_token !== '') {
            //Show or hide the auth button
            vm.isAuthd = true;

            //Get all accounts via PieManSettingsResource
            vm.loading = true;
            pieManSettingsResource.getaccounts().then(function (response) {
                vm.accounts = response.data;

                if ($scope.model.account) {
                    vm.selectedAccount = _.where(vm.accounts, { Id: $scope.model.account.Id })[0];
                }

                if (vm.selectedAccount.Id !== '') {
                    getProfiles();
                }

                vm.loading = false;
            });
        }

        /**
         * 
         */
        function getProfiles() {
            vm.loading = true;
            pieManSettingsResource.getprofiles(vm.selectedAccount.Id).then(function (response) {
                vm.profiles = response.data;

                if ($scope.model.profile) {
                    vm.selectedProfile = _.where(vm.profiles, { Id: $scope.model.profile.Id })[0];
                    vm.loading = false;
                }
            });
        }

        /**
         * Map the selection to the model - don't want/need all properties
         */
        function accountSelected() {
            $scope.model.account = {
                'Name': vm.selectedAccount.Name,
                'Id': vm.selectedAccount.Id,
                'Created': new Date(vm.selectedAccount.Created).toISOString(),
                'Updated': new Date(vm.selectedAccount.Updated).toISOString()
            }

            getProfiles();
        };

        //When a profile is selected
        function profileSelected() {
            $scope.model.profile = {
                'AccountId': vm.selectedProfile.AccountId,
                'Created': new Date(vm.selectedProfile.Created).toISOString(),
                'Currency': vm.selectedProfile.Currency,
                'Id': vm.selectedProfile.Id,
                'InternalWebPropertyId': vm.selectedProfile.InternalWebPropertyId,
                'Name': vm.selectedProfile.Name,
                'Timezone': vm.selectedProfile.Timezone,
                'Type': vm.selectedProfile.Type,
                'Updated': new Date(vm.selectedProfile.Updated).toISOString(),
                'WebPropertyId': vm.selectedProfile.WebPropertyId,
                'WebsiteUrl': vm.selectedProfile.WebsiteUrl
            };
        };

        //Auth - Click
        function doAuthorise() {
            //Open a dialog window to oAuth
            window.open('/App_Plugins/PieMan/auth/OAuth.aspx', 'oAuthAnalytics', 'location=0,status=0,width=600,height=600');
        };

        // expose some stuff
        angular.extend(vm,
            {
                doAuthorise: doAuthorise,
                accountSelected: accountSelected,
                profileSelected: profileSelected
            });
    }

    angular.module('umbraco').controller('PieMan.SettingsController', ['$scope', 'pieManSettingsResource', settings]);

}());
