using log4net;
using log4net.Config;
using System.Reflection;
using System.Web.Http;

namespace hto.web
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            XmlConfigurator.Configure();
            LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType).Info("Service started.");
        }
    }
}
