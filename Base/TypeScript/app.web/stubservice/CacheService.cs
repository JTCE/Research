using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Text;
using System.Threading.Tasks;

namespace app.web.stubservice
{
    public interface ICacheService
    {
        /// <summary>
        /// Get the data from the cache.
        /// </summary>
        dynamic GetData(string name);

        /// <summary>
        /// Save the given data to the cache.
        /// Uses the default AbsoluteExpiration = [InfiniteAbsoluteExpiration], meaning that the entry does not expire.
        /// </summary>
        void SaveData(string name, dynamic data);
    }

    public class CacheService : ICacheService
    {
        private readonly MemoryCache _cache = null;

        public CacheService(MemoryCache cache = null)
        {
            _cache = cache ?? MemoryCache.Default;
        }

        public dynamic GetData(string name)
        {
            return _cache.Get(name);
        }

        public void SaveData(string name, dynamic data)
        {
            var cacheItemPolicy = new CacheItemPolicy();
            _cache.Set(name, data, new CacheItemPolicy());
        }
    }
}