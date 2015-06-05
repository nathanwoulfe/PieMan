using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;
using System.Xml;
using Umbraco.Core.Configuration;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using PieMan.Models;
using System.Net;

namespace PieMan.Controllers
{
  [PluginController("PieMan")]
  public class SettingsApiController : UmbracoAuthorizedApiController
  {
    private const string ConfigPath = "~/App_Plugins/PieMan/settings.config";
    private const string AccountPath = "~/App_Plugins/PieMan/account.config";
    private const string ProfilePath = "~/App_Plugins/PieMan/profile.config";

    public List<Settings> GetSettings()
    {
      List<Settings> list = new List<Settings>();
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNodeList xmlNodeList = xmlDocument.SelectNodes("//Settings");
      if (xmlNodeList != null)
      {
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
      }
      return list;
    }

    public List<Settings> PostSettings(List<Settings> settings)
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      foreach (XmlNode xmlNode1 in xmlDocument.SelectNodes("//Settings"))
      {
        foreach (XmlNode xmlNode2 in xmlNode1.ChildNodes)
        {
          XmlNode setting = xmlNode2;
          setting.InnerText = Enumerable.SingleOrDefault<Settings>((IEnumerable<Settings>) settings, (Func<Settings, bool>) (x => x.Key == setting.Name)).Value;
        }
      }
      xmlDocument.Save(filename);
      return settings;
    }

    public Settings GetSetting(string key)
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);
      if (xmlNode == null)
        return (Settings) null;
      return new Settings()
      {
        Key = xmlNode.Name,
        Label = xmlNode.Attributes["label"].Value,
        Description = xmlNode.Attributes["description"].Value,
        Value = xmlNode.InnerText
      };
    }

    public string GetSettingValue(string key)
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);
      if (xmlNode != null)
        return xmlNode.InnerText;
      return string.Empty;
    }

    public Settings PostSetting(Settings setting)
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + setting.Key);
      if (xmlNode != null)
        xmlNode.InnerText = setting.Value;
      xmlDocument.Save(filename);
      return setting;
    }

    public string PostSettingValue(string key, string value)
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/" + key);
      if (xmlNode != null)
        xmlNode.InnerText = value;
      xmlDocument.Save(filename);
      return value;
    }

    public bool GetAuth()
    {
      string filename = HostingEnvironment.MapPath("~/App_Plugins/PieMan/settings.config");
      XmlDocument xmlDocument = new XmlDocument();
      xmlDocument.Load(filename);
      XmlNode xmlNode = xmlDocument.SelectSingleNode("//Settings/RefreshToken");
      if (xmlNode != null)
        return xmlNode.InnerText.Length > 0;
      return false;
    }

    public Account GetAccount()
    {
      return JsonConvert.DeserializeObject<Account>(File.ReadAllText(HostingEnvironment.MapPath("~/App_Plugins/PieMan/account.config")));
    }

    public Profile GetProfile()
    {
      return JsonConvert.DeserializeObject<Profile>(File.ReadAllText(HostingEnvironment.MapPath("~/App_Plugins/PieMan/profile.config")));
    }

    public string GetUmbracoVersion()
    {
      return UmbracoVersion.Current.ToString();
    }

    public object PostAccount(Account account)
    {
      File.WriteAllText(HostingEnvironment.MapPath("~/App_Plugins/PieMan/account.config"), JsonConvert.SerializeObject((object) account, Newtonsoft.Json.Formatting.Indented));
      return (object) account;
    }

    public object PostProfile(Profile profile)
    {
      File.WriteAllText(HostingEnvironment.MapPath("~/App_Plugins/PieMan/profile.config"), JsonConvert.SerializeObject((object) profile, Newtonsoft.Json.Formatting.Indented));
      return (object) profile;
    }

  }
}
