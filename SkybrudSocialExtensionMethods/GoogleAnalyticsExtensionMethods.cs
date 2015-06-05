using Skybrud.Social;
using Skybrud.Social.Google.Analytics;
using Skybrud.Social.Google.Analytics.Objects;
using Skybrud.Social.Google.Analytics.Responses;
using System;
using System.Collections.Specialized;

namespace PieMan.SkybrudSocialExtensionMethods
{
    public static class GoogleAnalyticsExtensionMethods
    {
        public static string GetData(this AnalyticsRawEndpoint endpoint, AnalyticsProfile profile, DateTime startDate, DateTime endDate, string[] metrics, string[] dimensions, string[] filters, string[] sort)
        {
            return GoogleAnalyticsExtensionMethods.GetData(endpoint, profile.Id, startDate, endDate, metrics, dimensions, filters, sort);
        }

        public static string GetData(this AnalyticsRawEndpoint endpoint, string profileId, DateTime startDate, DateTime endDate, string[] metrics, string[] dimensions, string[] filters, string[] sort)
        {
            NameValueCollection queryString = new NameValueCollection();
            queryString.Add("ids", "ga:" + profileId);
            queryString.Add("start-date", startDate.ToString("yyyy-MM-dd"));
            queryString.Add("end-date", endDate.ToString("yyyy-MM-dd"));
            queryString.Add("metrics", string.Join(",", metrics));
            queryString.Add("dimensions", string.Join(",", dimensions));
            if (filters != null && filters.Length > 0)
                queryString.Add("filters", string.Join(",", filters));
            if (sort != null && sort.Length > 0)
                queryString.Add("sort", string.Join(",", sort));
            queryString.Add("access_token", endpoint.Client.AccessToken);
            return SocialUtils.DoHttpGetRequestAndGetBodyAsString("https://www.googleapis.com/analytics/v3/data/ga", queryString);
        }

        public static AnalyticsDataResponse GetData(this AnalyticsEndpoint endpoint, AnalyticsProfile profile, DateTime startDate, DateTime endDate, string[] metrics, string[] dimensions, string[] filters, string[] sort)
        {
            return AnalyticsDataResponse.ParseJson(GoogleAnalyticsExtensionMethods.GetData(endpoint.Service.Client.Analytics, profile, startDate, endDate, metrics, dimensions, filters, sort));
        }

        public static AnalyticsDataResponse GetData(this AnalyticsEndpoint endpoint, string profileId, DateTime startDate, DateTime endDate, string[] metrics, string[] dimensions, string[] filters, string[] sort)
        {
            return AnalyticsDataResponse.ParseJson(GoogleAnalyticsExtensionMethods.GetData(endpoint.Service.Client.Analytics, profileId, startDate, endDate, metrics, dimensions, filters, sort));
        }
    }
}
