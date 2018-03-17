using System.Collections.Generic;

namespace PieMan.Models
{
  public class ApiResponse
  {
    public class BrowserDataObject
    {
      public Dictionary<string, int> browserCatData;
      public IEnumerable<BrowserData> browserData;
    }

    public class BrowserCatData
    {
      public string deviceCategory;
      public string visitors;
    }

    public class BrowserData
    {
      public string browser;
      public Dictionary<string, int> version;
    }
  }
}
