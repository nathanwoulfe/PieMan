using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;
using PieMan.Models;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;

namespace PieMan
{
    public class Config
    {
        private static readonly IDataTypeService Dts = ApplicationContext.Current.Services.DataTypeService;

        public static string ClientIdFromPropertyEditor => GetSettingFromPropertyEditor("ClientId");
        public static string ClientSecretFromPropertyEditor => GetSettingFromPropertyEditor("ClientSecret");
        public static string RefreshTokenFromPropertyEditor
        {
            get => GetSettingFromPropertyEditor("RefreshToken");
            set => SetTokenFromPropertyEditor(value);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="alias"></param>
        /// <returns></returns>
        private static string GetSettingFromPropertyEditor(string alias)
        {
            IDataTypeDefinition datatype = Dts.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            string settings = Dts.GetPreValuesByDataTypeId(datatype.Id).ToList()[0];

            var o = JsonConvert.DeserializeObject<ConfigSettings>(settings);

            switch (alias)
            {
                case "ClientId":
                    return o.client_id;
                case "ClientSecret":
                    return o.client_secret;
                case "RefreshToken":
                    return o.refresh_token;
            }

            return string.Empty;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="value"></param>
        private static void SetTokenFromPropertyEditor(string value)
        {
            IDataTypeDefinition datatype = Dts.GetDataTypeDefinitionByPropertyEditorAlias("NW.PieMan").First();
            List<string> settings = Dts.GetPreValuesByDataTypeId(datatype.Id).ToList();

            var o = JsonConvert.DeserializeObject<ConfigSettings>(settings.First());
            o.refresh_token = value;

            var prevalue = new PreValue(JsonConvert.SerializeObject(o));

            Dictionary<string, PreValue> dict = new Dictionary<string, PreValue>
            {
                {"settings", prevalue},
                {"account", new PreValue(settings[1])},
                {"profile", new PreValue(settings[2])}
            };

            Dts.SaveDataTypeAndPreValues(datatype, dict);
        }
    }
}
