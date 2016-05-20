using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        public const string TwoFactorCookieName = "TwoFactor";

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            HandleTwoFactorCookie(HttpContext.Current.Request.Cookies, HttpContext.Current.Response.Cookies);
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        public void HandleTwoFactorCookie(HttpCookieCollection requestCookies, HttpCookieCollection responseCookies)
        {
            
            var cookieExists = requestCookies.AllKeys.Contains(TwoFactorCookieName);
            if (cookieExists)
            {
                var cookie = requestCookies[TwoFactorCookieName];
                HttpContext.Current.Response.Write("TwoFactor cookie:" + cookie.Value);
            }
            else
            {
                var cookie = new HttpCookie(TwoFactorCookieName);
                cookie.Value = "104,105";
                cookie.Expires = DateTime.Now.AddMinutes(10);
                cookie.HttpOnly = true;
                responseCookies.Add(cookie);
            }
        }
    }
}
