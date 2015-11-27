using HTO.Web.Server.Enums;
using System;
using System.Runtime.CompilerServices;

namespace HTO.Web.Server.Models
{
	public class Connection
	{
		public AppTypes AppType
		{
			get;
			set;
		}

		public string Id
		{
			get;
			set;
		}

		public HTO.Web.Server.Models.User User
		{
			get;
			set;
		}

		public Connection()
		{
		}
	}
}