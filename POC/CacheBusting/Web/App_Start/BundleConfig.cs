using System.Web.Optimization;
using Web.Common;

namespace Web.App_Start
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            RegisterHomeBundles(bundles);
            
#if !DEBUG
            System.Web.Optimization.BundleTable.EnableOptimizations = true;
#endif

        }

        private static void RegisterHomeBundles(BundleCollection bundles)
        {
            var styleBundle = new StyleBundle("~/Home/css");
            styleBundle.Orderer = new NonOrderingBundleOrderer();
            styleBundle.Include(
                      "~/Views/Home/Test1.css",
                      "~/Views/Home/Test2.css");
            bundles.Add(styleBundle);

            var scriptBundle = new ScriptBundle("~/Home/js");
            scriptBundle.Orderer = new NonOrderingBundleOrderer();
            scriptBundle.Include(
                        "~/Views/Home/Test1.js",
                        "~/Views/Home/Test2.js"
                        );
            bundles.Add(scriptBundle);
        }
    }
}