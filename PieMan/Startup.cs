using System.Web.Configuration;
using umbraco.cms.businesslogic.packager;
using Umbraco.Core;

namespace PieMan
{
    class Startup : ApplicationEventHandler
    {
        private const string AppSettingKey = "PieManInstalled";

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            var installAppSetting = WebConfigurationManager.AppSettings[AppSettingKey];

            if (string.IsNullOrEmpty(installAppSetting) || installAppSetting != true.ToString())
            {

                //Check to see if language keys for section needs to be added
                //Translations.AddTranslations();

                //As we only want this to run once - not every startup of Umbraco
                var webConfig = WebConfigurationManager.OpenWebConfiguration("/");
                webConfig.AppSettings.Settings.Add(AppSettingKey, true.ToString());
                webConfig.Save();

            }

            //Add OLD Style Package Event
            InstalledPackage.BeforeDelete += InstalledPackage_BeforeDelete;
        }

        /// <summary>
        /// Uninstall Package - Before Delete (Old style events, no V6/V7 equivelant)
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void InstalledPackage_BeforeDelete(InstalledPackage sender, System.EventArgs e)
        {
            //Check which package is being uninstalled
            if (sender.Data.Name == "PieMan Analytics")
            {
                Translations.RemoveTranslations();

                var webConfig = WebConfigurationManager.OpenWebConfiguration("/");
                webConfig.AppSettings.Settings.Remove(AppSettingKey);
                webConfig.Save();
            }
        }
    }
}
