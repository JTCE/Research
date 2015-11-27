using HTO.Web.Server.Enums;
using System;
using System.Runtime.CompilerServices;

namespace HTO.Web.Server.Models
{
	public class SignatureMessage
	{
		public AppTypes AppType
		{
			get;
			set;
		}

		public decimal Latitude
		{
			get;
			set;
		}

		public string LocationImageUrl
		{
			get;
			set;
		}

		public decimal Longitude
		{
			get;
			set;
		}

		public string Message
		{
			get;
			set;
		}

		public string SignatureImageDataUrl
		{
			get;
			set;
		}

		public string Token
		{
			get;
			set;
		}

		public SignatureMessage()
		{
		}
	}
}