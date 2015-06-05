angular.module("umbraco").controller("PieMan.SettingsController",
    function ($scope, PieManSettingsResource, notificationsService) {

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
                    notificationsService.success('Success', 'Account details have been saved');
                });
            }

            if ($scope.dialogData.profile.Id != '') {
                PieManSettingsResource.saveprevalue($scope.dialogData.profile, "profile").then(function (response) {
                    notificationsService.success('Success', 'Profile details have been saved');
                });
            }           

            $scope.submit();
        };

    }); 