namespace Dashboard.Web.Snippets
{

    // Als je een MVC controller hebt met een action method, die als input parameter een bepaalde klasse heeft,
    // en de aangeleverd Json kan niet gedeserializeerd worden naar dit object, dan krijg je een nare foutmelding.
    // Om deze uitzondering te anlyseren verwijder je de parameter en voeg je onderstaande code die in commentaar staat toe.
    public class ReadRawJson
    {
        public void HandleRequest()
        {
            //string json = new StreamReader(this.Request.InputStream).ReadToEnd();
            //DashboardViewModel model = Newtonsoft.Json.JsonConvert.DeserializeObject<DashboardViewModel>(json);
        }
    }
}