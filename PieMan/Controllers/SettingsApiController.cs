using Newtonsoft.Json;
using PieMan.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Hosting;
using System.Xml;
using Umbraco.Core.Configuration;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class SettingsApiController : UmbracoAuthorizedApiController
    {
        private const string SettingsPath = "~/App_Plugins/PieMan/settings.config";
        private const string AccountPath = "~/App_Plugins/PieMan/account.config";
        private const string ProfilePath = "~/App_Plugins/PieMan/profile.config";

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public List<Settings> GetSettings()
        {
            List<Settings> list = new List<Settings>();

            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNodeList xmlNodeList = xmlDocument.SelectNodes("//Settings");

            if (xmlNodeList == null) return list;

            foreach (XmlNode xmlNode1 in xmlNodeList)
            {
                foreach (XmlNode xmlNode2 in xmlNode1.ChildNodes)
                    list.Add(new Settings()
                    {
                        Key = xmlNode2.Name,
                        Label = xmlNode2.Attributes["label"].Value,
                        Description = xmlNode2.Attributes["description"].Value,
                        Value = xmlNode2.InnerText
                    });
            }
            return list;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="settings"></param>
        /// <returns></returns>
        public List<Settings> PostSettings(List<Settings> settings)
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            foreach (XmlNode xmlNode1 in xmlDocument.SelectNodes("//Settings"))
            {
                foreach (XmlNode xmlNode2 in xmlNode1.ChildNodes)
                {
                    XmlNode setting = xmlNode2;
                    setting.InnerText = Enumerable.SingleOrDefault<Settings>(settings, x => x.Key == setting.Name).Value;
                }
            }
            xmlDocument.Save(filename);
            return settings;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public Settings GetSetting(string key)
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);
            if (xmlNode == null)
                return null;

            return new Settings()
            {
                Key = xmlNode.Name,
                Label = xmlNode.Attributes["label"].Value,
                Description = xmlNode.Attributes["description"].Value,
                Value = xmlNode.InnerText
            };
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public string GetSettingValue(string key)
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);

            return xmlNode?.InnerText ?? string.Empty;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="setting"></param>
        /// <returns></returns>
        public Settings PostSetting(Settings setting)
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + setting.Key);
            if (xmlNode != null)
                xmlNode.InnerText = setting.Value;
            xmlDocument.Save(filename);
            return setting;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public string PostSettingValue(string key, string value)
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);
            if (xmlNode != null)
                xmlNode.InnerText = value;
            xmlDocument.Save(filename);
            return value;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public bool GetAuth()
        {
            string filename = HostingEnvironment.MapPath(SettingsPath);
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(filename);
            XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/RefreshToken");
            if (xmlNode != null)
                return xmlNode.InnerText.Length > 0;
            return false;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public Account GetAccount()
        {
            return JsonConvert.DeserializeObject<Account>(File.ReadAllText(HostingEnvironment.MapPath(AccountPath)));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public Profile GetProfile()
        {
            return JsonConvert.DeserializeObject<Profile>(File.ReadAllText(HostingEnvironment.MapPath(ProfilePath)));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public string GetUmbracoVersion()
        {
            return UmbracoVersion.Current.ToString();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="account"></param>
        /// <returns></returns>
        public object PostAccount(Account account)
        {
            File.WriteAllText(HostingEnvironment.MapPath(AccountPath), JsonConvert.SerializeObject(account, Newtonsoft.Json.Formatting.Indented));
            return account;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="profile"></param>
        /// <returns></returns>
        public object PostProfile(Profile profile)
        {
            File.WriteAllText(HostingEnvironment.MapPath(ProfilePath), JsonConvert.SerializeObject(profile, Newtonsoft.Json.Formatting.Indented));
            return profile;
        }

    }
}
