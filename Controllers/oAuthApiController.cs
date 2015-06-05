using System.Web.Hosting;
using System.Xml;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
  [PluginController("PieMan")]
  public class oAuthApiController : UmbracoApiController
  {
    private const string ConfigPath = "~/App_Plugins/PieMan/settings.config";

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
  }
}
