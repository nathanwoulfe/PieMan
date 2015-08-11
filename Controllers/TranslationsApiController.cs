using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class TranslationsApiController : UmbracoAuthorizedApiController
    {
        public HttpResponseMessage GetTranslations(string culture)
        {
            var langFiles = Translations.GetAnalyticsLanguageFiles();
            var langFilesArray = langFiles as FileInfo[] ?? langFiles.ToArray();

            var match = langFilesArray.FirstOrDefault(x => x.Name == culture + ".xml");

            if (match != null)
            {
                var dict = new Dictionary<string, string>();
                var lang = new XmlDocument();
                lang.LoadXml(File.ReadAllText(match.FullName));

                var areas = lang.DocumentElement.SelectNodes("//area");
                foreach (XmlNode area in areas)
                {
                    foreach (XmlNode node in area.ChildNodes)
                    {
                        var alias = node.Attributes["alias"].Value;
                        var value = node.InnerText;
                        dict.Add(alias, value);
                    }
                }

                return Request.CreateResponse(HttpStatusCode.OK, dict);
            }

            return Request.CreateResponse(HttpStatusCode.OK, "some string");
        }
    }
}
