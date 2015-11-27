using HTO.Web.Server.Enums;
using System;
using System.Runtime.CompilerServices;

namespace HTO.Web.Server.Models
{
	public class ChatMessage
	{
		public AppTypes AppType
		{
			get;
			set;
		}

		public string Message
		{
			get;
			set;
		}

		public DateTime? ReceivedDateTime
		{
			get;
			set;
		}

		public DateTime SendDateTime
		{
			get;
			set;
		}

		public string Token
		{
			get;
			set;
		}

		public ChatMessage()
		{
		}
	}
}