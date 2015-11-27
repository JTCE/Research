using HTO.Web.Server.Models;
using System;

namespace HTO.Web.Server.SignalR
{
	public interface IClient
	{
		void ShowChat(ChatMessage message);

		void ShowSignature(SignatureMessage message);
	}
}