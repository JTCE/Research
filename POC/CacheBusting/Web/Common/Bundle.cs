using System;
using System.Linq;
using System.Reflection;
using System.Web;
using Web.Extensions;

namespace Web.Common
{
    public class Bundle
    {
        public static IHtmlString RenderScripts(params string[] bundlePaths)
        {
            IHtmlString html = System.Web.Optimization.Scripts.Render(bundlePaths);
            string replaceTemplate = @" src=""{0}";
            return Render(html, replaceTemplate);
        }

        public static IHtmlString RenderStyles(params string[] bundlePaths)
        {
            IHtmlString html = System.Web.Optimization.Styles.Render(bundlePaths);
            string replaceTemplate = @" href=""{0}";
            return Render(html, replaceTemplate);
        }

        private static HtmlString Render(IHtmlString html, string replaceTemplate)
        {
            var scriptsAsString = html.ToHtmlString();
            var bundleEntries = scriptsAsString.Split(new string[] { Environment.NewLine.ToString() }, 
                StringSplitOptions.RemoveEmptyEntries);
            
            
            string src = string.Format(replaceTemplate, string.Empty);

            string version = Assembly.GetExecutingAssembly().GetFormatedVersion("/v{0}_{1}_{2}_{3}");
            string markerWithVersion = string.Format(replaceTemplate, version);

            bundleEntries = bundleEntries.Select(x => { return x.Replace(src, markerWithVersion); }).ToArray();

            return new HtmlString(string.Join(Environment.NewLine, bundleEntries));
        }
    }
}
