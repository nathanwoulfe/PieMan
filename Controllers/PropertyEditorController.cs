using Newtonsoft.Json;

using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;

using Umbraco.Core.Models;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

using PieMan.Models;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class EditorApiController : UmbracoAuthorizedApiController
    {
        /// <summary>
        /// Gets the config data stored in the property editor prevalues
        /// </summary>
        /// <returns></returns>
        public object GetPrevalues()
        {
            var dataType = Services.DataTypeService.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            if (dataType == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            var prevalues = Services.DataTypeService.GetPreValuesByDataTypeId(dataType.Id);
            return new { prevalues = prevalues };
        }

        /// <summary>
        /// Updates the prevalues for the property editor
        /// </summary>
        /// <param name="prevalue">The new value</param>
        /// <param name="alias">The prevalue to update</param>
        public void UpdatePrevalueForEditor(string prevalue, string alias)
        {
            var datatype = Services.DataTypeService.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            var settings = Services.DataTypeService.GetPreValuesByDataTypeId(datatype.Id).ToList();
            var prevalues = Services.DataTypeService.GetPreValuesCollectionByDataTypeId(datatype.Id).PreValuesAsDictionary;

            var dict = new Dictionary<string, Umbraco.Core.Models.PreValue>();

            if (alias == "settings")
            {
                dict.Add("settings", new PreValue(prevalue));
                dict.Add("account", new PreValue(settings[1]));
                dict.Add("profile", new PreValue(settings[2]));
            }
            else if (alias == "account")
            {
                var o = JsonConvert.DeserializeObject<Account>(prevalue);
                dict.Add("settings", new PreValue(settings[0]));
                dict.Add("account", new PreValue(JsonConvert.SerializeObject(o)));
                dict.Add("profile", new PreValue(settings[2]));

                prevalues["settings"].Value = settings[0];
                prevalues["account"].Value = JsonConvert.SerializeObject(o);
                prevalues["profile"].Value = settings[2];
            }
            else if (alias == "profile")
            {
                var o = JsonConvert.DeserializeObject<Profile>(prevalue);
                dict.Add("settings", new PreValue(settings[0]));
                dict.Add("account", new PreValue(settings[1]));
                dict.Add("profile", new PreValue(JsonConvert.SerializeObject(o)));

                prevalues["settings"].Value = settings[0];
                prevalues["account"].Value = settings[1];
                prevalues["profile"].Value = JsonConvert.SerializeObject(o);
            }

            Services.DataTypeService.SaveDataTypeAndPreValues(datatype, prevalues);
        }
    }
}
