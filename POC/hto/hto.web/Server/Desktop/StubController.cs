using System;
using System.Web.Http;

namespace HTO.Web.Server.Desktop
{
	public class StubController : ApiController
	{
		public StubController()
		{
		}

		[HttpPost]
		[Route("Server/Stub/HandleRequest")]
		public void Post(string value)
		{
		}
	}
}