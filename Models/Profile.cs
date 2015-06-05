using Skybrud.Social.Google.Analytics.Objects;
using System;

namespace PieMan.Models
{
  public class Profile
  {
    public string Id { get; set; }

    public string AccountId { get; set; }

    public string WebPropertyId { get; set; }

    public string InternalWebPropertyId { get; set; }

    public string Name { get; set; }

    public string Currency { get; set; }

    public string Timezone { get; set; }

    public string WebsiteUrl { get; set; }

    public string Type { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }

    public Profile()
    {
    }

    public Profile(AnalyticsProfile profile)
    {
      this.Id = profile.Id;
      this.AccountId = profile.AccountId;
      this.WebPropertyId = profile.WebPropertyId;
      this.InternalWebPropertyId = profile.InternalWebPropertyId;
      this.Name = profile.Name;
      this.Currency = profile.Currency;
      this.Timezone = profile.Timezone;
      this.WebsiteUrl = profile.WebsiteUrl;
      this.Type = profile.Type;
      this.Created = profile.Created;
      this.Updated = profile.Updated;
    }
  }
}
