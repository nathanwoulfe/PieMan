using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using PieMan.Models;
using Skybrud.Social.Google.Analytics.Models.Accounts;
using Skybrud.Social.Google.Analytics.Models.Data;
using Skybrud.Social.Google.Analytics.Models.Dimensions;
using Skybrud.Social.Google.Analytics.Models.Metrics;
using Skybrud.Social.Google.Analytics.Models.Profiles;
using Skybrud.Social.Google.Analytics.Options.Data;
using Skybrud.Social.Google.Analytics.Options.Data.Sorting;
using Skybrud.Social.Google.Analytics.Responses.Data;
using Skybrud.Social.Google.Common;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace PieMan.Controllers
{
    [PluginController("PieMan")]
    public class AnalyticsApiController : UmbracoAuthorizedApiController
    {
        private static GoogleService _googleService;

        /// <summary>
        /// Creates GoogleService from the current saved account, using the config values stored as prevalues of the property editor
        /// </summary>
        /// <returns>GoogleService instance</returns>
        private static void EnsureGoogleService()
        {
            if (_googleService == null)
            {
                _googleService = GoogleService.CreateFromRefreshToken(Config.ClientIdFromPropertyEditor, Config.ClientSecretFromPropertyEditor, Config.RefreshTokenFromPropertyEditor);
            }
        }

        /// <summary>
        /// Get the Analytics account details for the authenticated Google account
        /// </summary>
        /// <returns>Array of AnalyicsAccount objects</returns>
        public AnalyticsAccount[] GetAccounts()
        {
            EnsureGoogleService();
            return _googleService.Analytics.Management.GetAccounts().Body.Items;
        }

        /// <summary>
        /// Gets the Analytics profile details for the authenticated Google account
        /// </summary>
        /// <returns>Array of AnalyticsProfile objects</returns>
        public AnalyticsProfile[] GetProfiles()
        {
            EnsureGoogleService();
            return _googleService.Analytics.Management.GetProfiles().Body.Items;
        }

        /// <summary>
        /// Gets the Analytics profiles assigned to the provided account id
        /// </summary>
        /// <param name="accountId">Return profiles associated with this account id</param>
        /// <returns>Array of AnalyticsProfile objects</returns>
        public AnalyticsProfile[] GetProfilesFromAccount(string accountId)
        {
            AnalyticsProfile[] profiles = _googleService.Analytics.Management.GetProfiles().Body.Items;

            return profiles.Where(x => x.AccountId == accountId).ToArray();
        }

        /// <summary>
        /// Gets data around page visitation over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="dateSpan">Number of days preceding the current day</param>
        /// <param name="filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetViewsDatapoints(string profile, string dateSpan, string filter)
        {
            EnsureGoogleService();

            return Response(
                _googleService.Analytics.Data.GetData(
                    new AnalyticsGetDataOptions
                    {
                        ProfileId = profile,
                        StartDate = StartDate(dateSpan),
                        EndDate = DateTime.Now,
                        Filters = filter,
                        Metrics = AnalyticsMetrics.Pageviews + AnalyticsMetrics.AvgTimeOnPage + AnalyticsMetrics.UniquePageviews + AnalyticsMetrics.PercentNewSessions + AnalyticsMetrics.Users
                    }));
        }

        /// <summary>
        /// Gets the chart data for total and unique pageviews over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="dateSpan">Number of days preceding the current day</param>
        /// <param name="filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetViewsChartdata(string profile, string dateSpan, string filter)
        {
            EnsureGoogleService();

            return Response(
                _googleService.Analytics.Data.GetData(
                    new AnalyticsGetDataOptions
                    {
                        ProfileId = profile,
                        StartDate = StartDate(dateSpan),
                        EndDate = DateTime.Now,
                        Filters = filter,
                        Dimensions = AnalyticsDimensions.Date,
                        Metrics = AnalyticsMetrics.Pageviews + AnalyticsMetrics.UniquePageviews
                    }));

        }

        /// <summary>
        /// Gets the chart data for total and unique pageviews over the given date span
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="endDate"></param>
        /// <param name="filter">The page path</param>
        /// <param name="startDate"></param>
        /// <returns></returns>
        public HttpResponseMessage GetComparisonChartdata(string profile, string startDate, string endDate, string filter)
        {
            EnsureGoogleService();

            return Response(
                _googleService.Analytics.Data.GetData(
                    new AnalyticsGetDataOptions
                    {
                        ProfileId = profile,
                        StartDate = DateTime.Parse(startDate),
                        EndDate = DateTime.Parse(endDate),
                        Filters = filter,
                        Dimensions = AnalyticsDimensions.Date,
                        Metrics = AnalyticsMetrics.Pageviews + AnalyticsMetrics.UniquePageviews
                    }));
        }

        /// <summary>
        /// Gets data points for browser type, version and device categories
        /// </summary>
        /// <param name="profile">Google Analytics profile identifier</param>
        /// <param name="dateSpan">Number of days preceding the current day</param>
        /// <param name="filter">The page path</param>
        /// <returns></returns>
        public HttpResponseMessage GetBrowserDatapoints(string profile, string dateSpan, string filter)
        {
            EnsureGoogleService();

            AnalyticsGetDataResponse data = _googleService.Analytics.Data.GetData(new AnalyticsGetDataOptions
            {
                ProfileId = profile,
                StartDate = StartDate(dateSpan),
                EndDate = DateTime.Now,
                Filters = filter,
                Dimensions = AnalyticsDimensions.Browser + AnalyticsDimensions.DeviceCategory + AnalyticsDimensions.BrowserVersion,
                Metrics = AnalyticsMetrics.Users,
                Sorting = new AnalyticsDataSortOptions().AddDescending(AnalyticsMetrics.Users),
                MaxResults = 10
            });

            Dictionary<string, int> deviceCategoryDict = new Dictionary<string, int>();
            List<ApiResponse.BrowserData> list = new List<ApiResponse.BrowserData>();
            Dictionary<string, Dictionary<string, int>> browserDict = new Dictionary<string, Dictionary<string, int>>();

            foreach (AnalyticsDataRow analyticsDataRow in data.Body.Rows)
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

            foreach (KeyValuePair<string, Dictionary<string, int>> keyValuePair in browserDict.Take(5).ToDictionary(t => t.Key, t => t.Value))
                list.Add(new ApiResponse.BrowserData()
                {
                    browser = keyValuePair.Key,
                    version = keyValuePair.Value
                });
            return Response(new ApiResponse.BrowserDataObject()
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
        private static DateTime StartDate(string span)
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
            response.Content = new StringContent(JsonConvert.SerializeObject(o), Encoding.UTF8, "application/json");
            return response;
        }
    }
}
