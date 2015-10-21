using System.Linq;
using System.Web.Hosting;
using System.Xml.Linq;
using Newtonsoft.Json;
using Umbraco.Web.WebApi;
using PieMan.Models;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using System.Collections.Generic;

namespace PieMan
{
    public class Config
    {
        private static IDataTypeService dts = ApplicationContext.Current.Services.DataTypeService;

        public static string ClientIdFromPropertyEditor
        {
            get
            {
                return GetSettingFromPropertyEditor("ClientId");
            }
        }

        public static string ClientSecretFromPropertyEditor
        {
            get
            {
                return GetSettingFromPropertyEditor("ClientSecret");
            }
        }

        public static string RefreshTokenFromPropertyEditor
        {
            get
            {
                return GetSettingFromPropertyEditor("RefreshToken");
            }
            set
            {
                SetTokenFromPropertyEditor(value);
            }
        }

        public static string GetSettingFromPropertyEditor(string alias)
        {
            var datatype = dts.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            var settings = dts.GetPreValuesByDataTypeId(datatype.Id).ToList()[0];

            var o = JsonConvert.DeserializeObject<ConfigSettings>(settings);

            if (alias == "ClientId")
                return o.client_id;
            else if (alias == "ClientSecret")
                return o.client_secret;
            else if (alias == "RefreshToken")
                return o.refresh_token;

            return string.Empty;

        }

        public static void SetTokenFromPropertyEditor(string value)
        {
            var datatype = dts.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            var settings = dts.GetPreValuesByDataTypeId(datatype.Id).ToList();

            var o = JsonConvert.DeserializeObject<ConfigSettings>(settings.First());
            o.refresh_token = value;

            var prevalue = new PreValue(JsonConvert.SerializeObject(o));

            var dict = new Dictionary<string, Umbraco.Core.Models.PreValue>();
            dict.Add("settings", prevalue);
            dict.Add("account", new PreValue(settings[1]));
            dict.Add("profile", new PreValue(settings[2]));

            dts.SaveDataTypeAndPreValues(datatype, dict);   
        }
    }
}
