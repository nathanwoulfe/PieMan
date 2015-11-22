using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;

using Newtonsoft.Json;

using PieMan.Models;

using Skybrud.Social.Google;
using Skybrud.Social.Google.Analytics.Objects;
using Skybrud.Social.Google.Analytics.Responses;

using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class AnalyticsApiController : UmbracoAuthorizedApiController
    {
        /// <summary>
        /// Creates GoogleService from the current saved account, using the config values stored as prevalues of the property editor
        /// </summary>
        /// <returns>GoogleService instance</returns>
        private GoogleService GetGoogleService()
        {
            return GoogleService.CreateFromRefreshToken(Config.ClientIdFromPropertyEditor, Config.ClientSecretFromPropertyEditor, Config.RefreshTokenFromPropertyEditor);
        }

        /// <summary>
        /// Get the Analytics account details for the authenticated Google account
        /// </summary>
        /// <returns>Array of AnalyicsAccount objects</returns>
        public AnalyticsAccount[] GetAccounts()
        {
            return this.GetGoogleService().Analytics.GetAccounts().Items;
        }

        /// <summary>
        /// Gets the Analytics profile details for the authenticated Google account
        /// </summary>
        /// <returns>Array of AnalyticsProfile objects</returns>
        public AnalyticsProfile[] GetProfiles()
        {
            return this.GetGoogleService().Analytics.GetProfiles(0, 0).Items;
        }

        /// <summary>
        /// Gets the Analytics profiles assigned to the provided account id
        /// </summary>
        /// <param name="accountId">Return profiles associated with this account id</param>
        /// <returns>Array of AnalyticsProfile objects</returns>
        public AnalyticsProfile[] GetProfilesFromAccount(string accountId)
        {
            return this.GetGoogleService().Analytics.GetProfiles(Enumerable.SingleOrDefault<AnalyticsAccount>((IEnumerable<AnalyticsAccount>)this.GetGoogleService().Analytics.GetAccounts().Items, (Func<AnalyticsAccount, bool>)(x => x.Id == accountId)), 0, 0).Items;
        }

        /// <summary>
        /// Gets data around page visitation over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="DateSpan">Number of days preceding the current day</param>
        /// <param name="Filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetViewsDatapoints(string profile, string DateSpan, string Filter)
        {
            return this.Response((object)this.GetGoogleService().Analytics.GetData(profile, new AnalyticsDataOptions()
            {
                StartDate = StartDate(DateSpan),
                EndDate = DateTime.Now,
                Filters = (AnalyticsFilterOptions)Filter,
                Metrics = AnalyticsMetric.Pageviews + AnalyticsMetric.AvgTimeOnPage + AnalyticsMetric.UniquePageviews + AnalyticsMetric.PercentNewVisits + AnalyticsMetric.Visitors
            }));
        }

        /// <summary>
        /// Gets the chart data for total and unique pageviews over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="DateSpan">Number of days preceding the current day</param>
        /// <param name="Filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetViewsChartdata(string profile, string DateSpan, string Filter)
        {
            return this.Response((object)this.GetGoogleService().Analytics.GetData(profile, new AnalyticsDataOptions()
            {
                StartDate = StartDate(DateSpan),
                EndDate = DateTime.Now,
                Filters = (AnalyticsFilterOptions)Filter,
                Dimensions = (AnalyticsDimensionCollection)AnalyticsDimension.Date,
                Metrics = AnalyticsMetric.Pageviews + AnalyticsMetric.UniquePageviews
            }));
        }

        /// <summary>
        /// Gets the chart data for total and unique pageviews over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="DateSpan">Number of days preceding the current day</param>
        /// <param name="Filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetComparisonChartdata(string profile, string startDate, string endDate, string Filter)
        {
            return this.Response((object)this.GetGoogleService().Analytics.GetData(profile, new AnalyticsDataOptions()
            {
                StartDate = DateTime.Parse(startDate),
                EndDate = DateTime.Parse(endDate),
                Filters = (AnalyticsFilterOptions)Filter,
                Dimensions = (AnalyticsDimensionCollection)AnalyticsDimension.Date,
                Metrics = AnalyticsMetric.Pageviews + AnalyticsMetric.UniquePageviews
            }));
        }

        /// <summary>
        /// Gets data points for browser type, version and device categories
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="DateSpan">Number of days preceding the current day</param>
        /// <param name="Filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetBrowserDatapoints(string profile, string DateSpan, string Filter)
        {
            AnalyticsDataResponse data = this.GetGoogleService().Analytics.GetData(profile, new AnalyticsDataOptions()
            {
                StartDate = StartDate(DateSpan),
                EndDate = DateTime.Now,
                Filters = (AnalyticsFilterOptions)Filter,
                Dimensions = AnalyticsDimension.Browser + AnalyticsDimension.DeviceCategory + AnalyticsDimension.BrowserVersion,
                Metrics = (AnalyticsMetricCollection)AnalyticsMetric.Visitors,
                Sorting = new AnalyticsSortOptions().AddDescending(AnalyticsMetric.Visitors),
                MaxResults = 10
            });

            Dictionary<string, int> deviceCategoryDict = new Dictionary<string, int>();
            List<ApiResponse.BrowserData> list = new List<ApiResponse.BrowserData>();
            Dictionary<string, Dictionary<string, int>> browserDict = new Dictionary<string, Dictionary<string, int>>();

            foreach (AnalyticsDataRow analyticsDataRow in data.Rows)
            {
                string browserName = analyticsDataRow.Cells[0].ToString();
                string deviceCategory = analyticsDataRow.Cells[1].ToString();
                string browserVersion = analyticsDataRow.Cells[2].ToString();
                int views = Convert.ToInt32(analyticsDataRow.Cells[3].Value);

                Dictionary<string, int> dictionary3;
                string index2;

                if (!deviceCategoryDict.ContainsKey(deviceCategory))
                {
                    deviceCategoryDict.Add(deviceCategory, 0);
                }

                (dictionary3 = deviceCategoryDict)[index2 = deviceCategory] = dictionary3[index2] + views;

                if (!browserDict.ContainsKey(browserName))
                {
                    browserDict.Add(browserName, new Dictionary<string, int>());
                }
                browserDict[browserName][browserVersion] = views;
            }

            foreach (KeyValuePair<string, Dictionary<string, int>> keyValuePair in Enumerable.ToDictionary<KeyValuePair<string, Dictionary<string, int>>, string, Dictionary<string, int>>(Enumerable.Take<KeyValuePair<string, Dictionary<string, int>>>((IEnumerable<KeyValuePair<string, Dictionary<string, int>>>)browserDict, 5), (Func<KeyValuePair<string, Dictionary<string, int>>, string>)(t => t.Key), (Func<KeyValuePair<string, Dictionary<string, int>>, Dictionary<string, int>>)(t => t.Value)))
                list.Add(new ApiResponse.BrowserData()
                {
                    browser = keyValuePair.Key,
                    version = keyValuePair.Value
                });
            return this.Response((object)new ApiResponse.BrowserDataObject()
            {
                browserData = list,
                browserCatData = deviceCategoryDict
            });
        }

        /// <summary>
        /// Calculates the start date for the date span, by subtracting n days from the current date
        /// </summary>
        /// <param name="span">String representing the number of days</param>
        /// <returns>A DateTime n days in the past</returns>
        private DateTime StartDate(string span)
        {
            return DateTime.Now.Subtract(TimeSpan.FromDays(double.Parse(span)));
        }

        /// <summary>
        /// Sends the result back to the browser
        /// </summary>
        /// <param name="o">The Analytics response object</param>
        /// <returns>A shitload of JSON</returns>
        public HttpResponseMessage Response(object o)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, o);
            response.Content = (HttpContent)new StringContent(JsonConvert.SerializeObject(o), Encoding.UTF8, "application/json");
            return response;
        }
    }
}
