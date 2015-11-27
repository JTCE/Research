using System.Web;
using System.Web.Caching;
using System.Web.Hosting;

namespace Web.Common
{
    public class Fingerprint
    {
        public static string Tag(string rootRelativePath, string version)
        {
            // Save fingerprinted url in cache, for fast retrieval during runtime.
            if (HttpRuntime.Cache[rootRelativePath] == null)
            {
                string absolute = HostingEnvironment.MapPath("~" + rootRelativePath);
                int index = rootRelativePath.LastIndexOf('/');
                string result = rootRelativePath.Insert(index, "/v-" + version);
                HttpRuntime.Cache.Insert(rootRelativePath, result, new CacheDependency(absolute));
            }

            return HttpRuntime.Cache[rootRelativePath] as string;
        }
    }
}
