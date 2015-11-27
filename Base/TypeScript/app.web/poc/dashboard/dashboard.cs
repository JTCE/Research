using System.Collections.Generic;

namespace App.Models
{
    public partial class Dashboard
    {
        public string SubTitle { get; set; }
        public string Title { get; set; }
        public List<Widget> Widgets { get; set; }
    }

    public partial class Widget
    {
        public string Name { get; set; }
    }
}
