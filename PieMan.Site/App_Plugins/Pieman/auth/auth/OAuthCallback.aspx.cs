using System;
using Skybrud.Social.Google;
using Umbraco.Web.UI.Pages;
using System.Web.UI.WebControls;
using Skybrud.Social.Google.Common;
using Skybrud.Social.Google.Common.Models;
using Skybrud.Social.Google.Common.Responses;
using umbraco;

namespace PieMan.BackOffice
{

    partial class OAuthCallback : UmbracoEnsuredPage
    {

        protected void Page_Load(object sender, EventArgs e)
        {
            
            // Get the state from the query string
            string state = Request.QueryString["state"];

            // Check whether the state is present
            if (String.IsNullOrWhiteSpace(state))
            {
                //Ouput an error message
                _content.Text += ui.Text("pieman", "noAccess");                
                return;
            }

            // Get the session value
            string session = Session["PieMan_" + state] as string;

            // Has the session expire?
            if (session == null)
            {
                //Ouput an error message
                _content.Text += ui.Text("pieman", "sorrySessionExpired");
                return;
            }

            // Get the refresh token from the query string (kinda bad practice though)
            string refreshToken = Request.QueryString["token"];

            // Do we have a refresh token?
            if (String.IsNullOrWhiteSpace(refreshToken))
            {
                //Ouput an error message
                _content.Text += ui.Text("pieman", "somethingWentWrong");
                return;
            }

            // Initalize a new instance of the GoogleService class
            GoogleService service = GoogleService.CreateFromRefreshToken(Config.ClientIdFromPropertyEditor, Config.ClientSecretFromPropertyEditor, refreshToken);

            try
            {

                //Get the authenticated user
                GoogleUserInfo user = service.GetUserInfo().Body;

                //Set the refresh token in our config
                Config.RefreshTokenFromPropertyEditor = refreshToken;

                //Ouput some info about the user
                _content.Text = "Hi there " + user.Name + ". We have saved your information to a config file, so Umbraco can pull stats from your Google Analytics account.";
                _content.Text += "<br /><br />Close this window and go grab a piping hot serve of stats - you'll need to reopen the settings panel and select an account and profile.";

            }
            catch
            {
                //Ouput an error message
                _content.Text += ui.Text("pieman", "somethingWentWrong");
            }

            // Clear the session state
            Session.Remove("PieMan_" + state);

        }
    }

}