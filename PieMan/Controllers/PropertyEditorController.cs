using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class EditorApiController : UmbracoAuthorizedApiController
    {
        private readonly IDataTypeService _dataTypeService;
        private const string Alias = "NW.PieMan";

        public EditorApiController()
        {
            _dataTypeService = Services.DataTypeService;
        }

        /// <summary>
        /// Gets the config data stored in the property editor prevalues
        /// </summary>
        /// <returns></returns>
        public object GetPrevalues()
        {
            IDataTypeDefinition dataType = _dataTypeService.GetDataTypeDefinitionByPropertyEditorAlias(Alias).First();
            if (dataType == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
            IEnumerable<string> prevalues = _dataTypeService.GetPreValuesByDataTypeId(dataType.Id);

            return new { prevalues };
        }

        /// <summary>
        /// Updates the prevalues for the property editor
        /// </summary>
        /// <param name="prevalue">The new value</param>
        /// <param name="alias">The prevalue to update</param>
        public void UpdatePrevalueForEditor(string prevalue, string alias)
        {
            IDataTypeDefinition datatype = _dataTypeService.GetDataTypeDefinitionByPropertyEditorAlias(Alias).First();
            IDictionary<string, PreValue> prevalues = _dataTypeService.GetPreValuesCollectionByDataTypeId(datatype.Id).PreValuesAsDictionary;

            prevalues[alias] = new PreValue(prevalue);

            _dataTypeService.SaveDataTypeAndPreValues(datatype, prevalues);
        }
    }
}
