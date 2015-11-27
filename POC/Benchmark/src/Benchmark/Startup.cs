using Microsoft.AspNet.Builder;
using Microsoft.Framework.DependencyInjection;

namespace Benchmark
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseStaticFiles();
        }
    }
}
