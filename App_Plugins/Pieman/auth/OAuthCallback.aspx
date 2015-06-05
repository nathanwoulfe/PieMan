<%@ Page Title="" Language="C#" AutoEventWireup="true" CodeBehind="OAuthCallback.aspx.cs" Inherits="PieMan.BackOffice.OAuthCallback" %>
<html>
    <head>
        <title>PieMan oAuth</title>
        <link rel="stylesheet" href="/umbraco/assets/css/umbraco.css" />
        
        <style>

            header {
                background:#1d1d1d;
                padding:15px 15px 7px;
                margin-bottom:15px;
            }

            section {
                padding:15px;
            }

            h1 {
                margin:0;
                color:#d9d9d9;
            }

            h1 span {
                color:#df7f48;
            }

            h2 {
                margin:-5px 0 0;
                text-transform:uppercase;
                font-size:18px;
                color:#d9d9d9;
            }

            p:last-of-type {
                margin-bottom:30px;
            }
            .btns {
                text-align:right;
                border-top:1px solid #eee;
                padding-top:15px;
            }

        </style>
    </head>
    <body>
        <script type="text/javascript">
            //When this is closed - run function refreshParent()
            window.onunload = refreshParent;


            function refreshParent() {
                //Reload parent
                window.opener.location.reload();
            }
        </script>

        <header>
            <h1>
                <span class="icon-pie-chart"></span>
                PieMan
            </h1>
            <h2>Simple analytics for Umbraco</h2>
        </header>
        <section>
            <asp:Literal runat="server" ID="_content"></asp:Literal>
            <div class="btns">
                <a class="btn btn-success" href="#" onclick="window.close()">Close</a>
            </div>
        </section>

    </body>
</html>
