using log4net;
using log4net.Config;
using System;
using System.Web.Http;

namespace app.web
{
    public class Global : System.Web.HttpApplication
    {
        private ILog _logger;

        /// <summary>
        /// To enable Web Api attribute routing we use: GlobalConfiguration.Configure(WebApiConfig.Register).
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        protected void Application_Start(object sender, EventArgs e)
        {
            RegisterLog4Net();
            GlobalConfiguration.Configure(WebApiConfig.Register);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            _logger.Info("Service started");
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }

        private void RegisterLog4Net()
        {
            XmlConfigurator.Configure();
            _logger = LogManager.GetLogger(typeof(Global));
        }
    }
}