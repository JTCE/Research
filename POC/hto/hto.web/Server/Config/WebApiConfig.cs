using System;
using System.Web.Http;

namespace HTO.Web.Server.Config
{
	public static class WebApiConfig
	{
		public static HttpConfiguration Register()
		{
			HttpConfiguration httpConfiguration = new HttpConfiguration();
			httpConfiguration.MapHttpAttributeRoutes();
			return httpConfiguration;
		}
	}
}