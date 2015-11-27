using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;

namespace app.web.stubservice
{
    /// <summary>
    /// The application will be first build based on a "StubService".
    /// To keep things simple and secure, the application only uses "POST" messages and the "StubService" only has one entry point.
    /// All data calls will be routed through the "StubService.HandleRequest" method.
    /// When the application front-end is connected to the application back-end, the "StubService" can still be used, by adding "usestub=true" to the url, like:
    /// https://localhost/dashboard?usestub=true
    /// </summary>
    public interface IStubService
    {
        /// <summary>
        /// This is the only entrypoint to the "StubService", because it has to handle any kind of request,
        /// the method does not contain any parameters. All data is read from the "request content".
        /// Based on the property "stub" in the "request content", the "server stub data" and "server stub function" can be found.
        /// The stub function will be called with the stub data.
        /// </summary>
        /// <returns></returns>
        Task<IHttpActionResult> HandleRequest();
    }

    public class StubServiceController : ApiController, IStubService
    {
        
        [HttpPost]
        public async Task<IHttpActionResult> HandleRequest()
        {
            dynamic clientData = await GetClientData(this.ActionContext.Request.Content);
            StubInfo stubInfo = GetStubInfo(clientData);
            dynamic responseData = InvokeStub(stubInfo, clientData);

            return Ok(responseData);
        }

        #region privates

        private async Task<dynamic> GetClientData(HttpContent content)
        {
            string json = await content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(json))
            { 
                throw new ApplicationException("The stubservice expects data in the request content.");
            }

            dynamic clientData = JObject.Parse(json);
            if (clientData.stub == null) {
                throw new ApplicationException("The stubservice expects at least a property 'stub' in the request content.");
            }

            return clientData;
        }

        private StubInfo GetStubInfo(dynamic clientData)
        {
            var result = new StubInfo();

            string stub = Convert.ToString(clientData.stub);
            string[] parts = stub.Split(new string[] { "." }, StringSplitOptions.RemoveEmptyEntries);
            result.FunctionName = parts[parts.Length - 1];
            result.TypeName = string.Join(".", parts, 0, parts.Length - 1);

            return result;
        }

        /// <summary>
        /// The "stub function" can be a static function or an instance method.
        /// </summary>
        private dynamic InvokeStub(StubInfo stubInfo, dynamic clientData)
        {
            Type type = Type.GetType(stubInfo.TypeName);
            if (type == null)
            {
                throw new ApplicationException(string.Format("No type with the name {0} could be found.", stubInfo.TypeName));
            }

            MethodInfo methodInfo = type.GetMethod(stubInfo.FunctionName, BindingFlags.Static | BindingFlags.Public);
            Object obj = null;
            if (methodInfo == null)
            {
                methodInfo = type.GetMethod(stubInfo.FunctionName, BindingFlags.Instance | BindingFlags.Public);
                if (methodInfo == null)
                {
                    throw new ApplicationException(string.Format("No public static function or public instance method with the name {0} could be found on type {1}.", stubInfo.FunctionName, stubInfo.TypeName));
                }
                else
                {
                    obj = Activator.CreateInstance(type);
                }
            }
            return methodInfo.Invoke(obj, new object[] { clientData });
        }

        #endregion

    }
}