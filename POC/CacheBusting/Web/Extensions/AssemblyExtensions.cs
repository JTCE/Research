using System;
using System.Reflection;

namespace Web.Extensions
{
    public static class AssemblyExtensions
    {
        /// <summary>
        /// Format "Assembly.GetName().Version".
        /// </summary>
        /// <param name="assembly"></param>
        /// <param name="format">
        /// Must have 4 placeholders, eg: "{0}.{1}.{2}.{3}"
        /// 0 = Major
        /// 1 = Minor
        /// 2 = Build
        /// 3 = Revision
        /// </param>
        /// <returns></returns>
        public static string GetFormatedVersion(this Assembly assembly, string format)
        {
            Version version = assembly.GetName().Version;
            return string.Format(format, version.Major, version.Minor, version.Build, version.Revision);
        }
    }
}
