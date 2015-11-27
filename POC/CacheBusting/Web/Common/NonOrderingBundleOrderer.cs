using System.Collections.Generic;
using System.Web.Optimization;

namespace Web.Common
{
    /// <summary>
    /// Deze klasse wordt gebruikt om aan een ASP .NET Bundle aan te geven dat de opgegeven scripts files, NIET gesorteerd mogen worden.
    /// De scripts worden dan gebundeld in de volgorde, zoals ze zijn opgegeven.
    /// </summary>
    public class NonOrderingBundleOrderer : IBundleOrderer
    {
        public IEnumerable<BundleFile> OrderFiles(BundleContext context, IEnumerable<BundleFile> files)
        {
            return files;
        }
    }
}
