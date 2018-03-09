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
            return new { prevalues };
        }

        /// <summary>
        /// Updates the prevalues for the property editor
        /// </summary>
        /// <param name="prevalue">The new value</param>
        /// <param name="alias">The prevalue to update</param>
        public void UpdatePrevalueForEditor(string prevalue, string alias)
        {
            var datatype = Services.DataTypeService.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            var prevalues = Services.DataTypeService.GetPreValuesCollectionByDataTypeId(datatype.Id).PreValuesAsDictionary;

            prevalues[alias] = new PreValue(prevalue);

            Services.DataTypeService.SaveDataTypeAndPreValues(datatype, prevalues);
        }
    }
}
