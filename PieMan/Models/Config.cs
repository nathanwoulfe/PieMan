using Skybrud.Social.Google.Analytics.Objects;
using System;
using System.Runtime.Serialization;
using PieMan.Models;

namespace PieMan.Models
{
    public class Configuration
    {
        public Account Account { get; set; }

        public Profile Profile { get; set; }

        public Settings Settings { get; set; }

        public Configuration() 
        { 
        }

        public Configuration(Account account, Profile profile, Settings settings)
        {
            this.Account = account;
            this.Profile = profile;
            this.Settings = settings;
        }
    }
}