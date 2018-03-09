//using Skybrud.Social.Google.Analytics.Objects;
using System;

namespace PieMan.Models
{
    public class Account
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }

        //public Account()
        //{
        //}

        //public Account(AnalyticsAccount account)
        //{
        //    this.Id = account.Id;
        //    this.Name = account.Name;
        //    this.Created = account.Created;
        //    this.Updated = account.Updated;
        //}
    }
}
