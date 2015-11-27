using HTO.Web.Server.Enums;
using HTO.Web.Server.Models;
using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;

namespace HTO.Web.Server.SignalR
{
	public class SignatureHub : Hub<IClient>
	{
		private static Dictionary<string, Connection> _connections;

		private static ApplicationException _unauthorizedException;

		private static Dictionary<string, User> _users;

		private readonly ILog _logger;

		static SignatureHub()
		{
			SignatureHub._connections = new Dictionary<string, Connection>();
			SignatureHub._unauthorizedException = new ApplicationException("Unauthorized, see server side logging for more details.");
			SignatureHub._users = new Dictionary<string, User>();
		}

		public SignatureHub() : this(null)
		{
		}

		public SignatureHub(ILog logger)
		{
			this._logger = logger ?? LogManager.GetLogger(typeof(SignatureHub));
			if (SignatureHub._users.Count == 0)
			{
				User user = new User()
				{
					Password = "ALrZWfTWjsnapwBigDAs6XiWLf3VW9g25liTVXTRYVjfP29zcMl7p1X4CMeqIftIxw==",
					UserName = "admin"
				};
				SignatureHub._users.Add(user.UserName, user);
			}
		}

		public string Authenticate(string userName, string password, string token, AppTypes appType)
		{
			if (string.IsNullOrWhiteSpace(userName))
			{
				this._logger.Error("[userName] was null, empty or whitespace.");
				return string.Empty;
			}
			if (string.IsNullOrWhiteSpace(password) && string.IsNullOrWhiteSpace(token))
			{
				this._logger.Error("Both [password] as [token] were null, empty or whitespace.");
				return string.Empty;
			}
			userName = userName.ToLower();
			if (!SignatureHub._users.ContainsKey(userName))
			{
				this._logger.Error(string.Format("User [{0}] could not be found.", userName));
				return string.Empty;
			}
			User item = SignatureHub._users[userName];
			if (!string.IsNullOrWhiteSpace(password) && !Crypto.VerifyHashedPassword(item.Password, password))
			{
				this._logger.Error(string.Format("Crypto.VerifyHashedPassword failed on current password [{0}] and supplied password [{1}]", item.Password, password));
				return string.Empty;
			}
			token = string.Concat(item.Password, appType.ToString());
			Connection connection = new Connection()
			{
				AppType = appType,
				Id = base.Context.ConnectionId,
				User = item
			};
			if (!SignatureHub._connections.ContainsKey(token))
			{
				SignatureHub._connections.Add(token, connection);
			}
			if (appType == AppTypes.Desktop)
			{
				item.DesktopConnectionId = token;
			}
			else
			{
				if (appType != AppTypes.Mobile)
				{
					throw new ApplicationException("Unknown apptype");
				}
				item.MobileConnectionId = token;
			}
			return token;
		}

		private Connection Authenticate(string token)
		{
			if (!SignatureHub._connections.ContainsKey(token))
			{
				throw SignatureHub._unauthorizedException;
			}
			return SignatureHub._connections[token];
		}

		public void SendChat(ChatMessage message)
		{
			if (message == null)
			{
				throw new ArgumentNullException("message");
			}
			Connection connection = this.Authenticate(message.Token);
			Connection item = null;
			AppTypes appType = message.AppType;
			if (appType == AppTypes.Desktop && connection.User.MobileConnectionId != null)
			{
				item = SignatureHub._connections[connection.User.MobileConnectionId];
			}
			else if (appType == AppTypes.Mobile && connection.User.DesktopConnectionId != null)
			{
				item = SignatureHub._connections[connection.User.DesktopConnectionId];
			}

            if (item != null)
            {
                base.Clients.Client(item.Id).ShowChat(message);
            }
		}

		public void SendSignature(SignatureMessage message)
		{
			if (message == null)
			{
				throw new ArgumentNullException("message");
			}
			Connection connection = this.Authenticate(message.Token);
            if (connection.User.DesktopConnectionId != null)
            {
                Connection item = SignatureHub._connections[connection.User.DesktopConnectionId];
                if (item != null)
                {
                    base.Clients.Client(item.Id).ShowSignature(message);
                }
            }
		}
	}
}