using System;
using System.Runtime.CompilerServices;

namespace HTO.Web.Server.Models
{
	public class User
	{
		public string DesktopConnectionId
		{
			get;
			set;
		}

		public string MobileConnectionId
		{
			get;
			set;
		}

		public string Password
		{
			get;
			set;
		}

		public string UserName
		{
			get;
			set;
		}

		public User()
		{
		}
	}
}