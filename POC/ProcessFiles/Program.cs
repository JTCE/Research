using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ConsoleApplication
{
    public class Program
    {
        /*
         * Tasks
         * - Create SASS files foreach CSHTML file, that contains a html tag with a style attribute.
         * - Create XML that can be used to add each created SASS file to a *.csproj file with "Build Action" set to "None".
         */
        public static void Main(string[] args)
        {
            Console.WriteLine("Processing files started.");
            var fs = new FileSystem();
            var info = new ProcessCshtmlFilesInfo();
            info.ProjectFolder = new DirectoryInfo(@"C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web");
            
            var files = fs.FindFiles(info.ProjectFolder, "*.cshtml");         
            foreach (FileInfo file in files)
            {
                Task task = fs.ProcessCshtmlFile(file, info);
                task.Wait();
            }
            Console.WriteLine($"<ItemGroup>{info.CsprojXml}</ItemGroup>");
            Console.WriteLine(info.BundleCsIncludes.ToString());
            Console.WriteLine($"Total *.cshtml files = {info.FileCounter}");
            Console.WriteLine($"Total *.cshtml files containing the text 'style=' = {info.StyleFileCounter}");
            Console.WriteLine($"Total 'style =' text count {info.StyleTextCounter}");
            Console.WriteLine("Processing finished.");
        }
    }

    public class FileSystem {

        public async Task CreateOrUpdateFile(string path, string content)
        {
            byte[] result = Encoding.UTF8.GetBytes(content);
            using (var stream = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.Write, bufferSize: 4096, useAsync: true))
            {
                await stream.WriteAsync(result, 0, result.Length);
            }
        }

        public IEnumerable<FileInfo> FindFiles(DirectoryInfo folder, string pattern)
        {
            // Note: using EnumerateFiles is faster then using "GetFiles".
            return folder.EnumerateFiles(pattern, SearchOption.AllDirectories);
        }

        public async Task ProcessCshtmlFile(FileInfo file, ProcessCshtmlFilesInfo info) {
            info.FileCounter++;

                if(!file.FullName.Contains(@"App\Print")) {
                    var content = File.ReadAllText(file.FullName);

                    // Determine if the file contains the text "style =".
                    var regEx = new Regex(@".?style\s*=.?", RegexOptions.IgnoreCase | RegexOptions.Singleline);
                    var result = regEx.Matches(content);
                    
                    if (result.Count > 0)
                    {
                        info.StyleTextCounter += result.Count;
                        info.StyleFileCounter++;

                        // Create sass file.
                        var scssPath = Path.ChangeExtension(file.FullName, ".scss");                        
                        await CreateOrUpdateFile(scssPath, "@import \"./App/Styles/variables\";" + Environment.NewLine + Environment.NewLine);                  

                        AddCsprojXml(scssPath, info);
                        AddBundleCsPaths(scssPath, info);
                    }              
                }
        }

        /* Create text that can be used to add the css file to the BundleConfig.cs.
         */
        public void AddBundleCsPaths(string scssPath, ProcessCshtmlFilesInfo info) {
            var cssPath = Path.ChangeExtension(scssPath, ".css");
            if(File.Exists(cssPath)) {
                Console.WriteLine(cssPath + " !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }

            // Replace leading "_" in filename, because sass can't handle that.
            var folder = Path.GetDirectoryName(cssPath);
            var name = Path.GetFileName(cssPath);
            if(name.StartsWith("_")) {
                name = name.Substring(1);
            }
            cssPath = Path.Combine(folder, name);

            // If file exists it should not be added to the bundle.
            // But the contents of the file should be placed in the *.scss file
            if(File.Exists(cssPath)) {
                Console.WriteLine(cssPath + " <============================================");
            }
            else {
                // Make path relative to project root.
                string path = cssPath.Replace(info.ProjectFolder.FullName + "\\", string.Empty);
                
                // Convert from Windows file paths to URL.
                path = path.Replace(@"\", "/");

                // Create include string.
                string include = $"\"~/{path}\",";           
                info.BundleCsIncludes.AppendLine(include);
            }       
        }

        /* Create xml text that can be use to add sass file to *.csproj with "Build Action" set to "None".
         */
        public void AddCsprojXml(string scssPath, ProcessCshtmlFilesInfo info) {
            string path = scssPath.Replace(info.ProjectFolder.FullName + "\\", string.Empty);
            string xml = $"<None Include=\"{path}\" />";           
            info.CsprojXml.AppendLine(xml);
        }
    }

    public class ProcessCshtmlFilesInfo {
        public ProcessCshtmlFilesInfo() {
            this.BundleCsIncludes = new StringBuilder(string.Empty);
            this.CsprojXml = new StringBuilder(string.Empty);
        }
        public StringBuilder BundleCsIncludes { get; set; }
        public StringBuilder CsprojXml { get; set; }
        public int FileCounter { get; set; }
        public DirectoryInfo ProjectFolder { get; set; }
        public int StyleTextCounter { get; set; }
        public int StyleFileCounter { get; set; }
    }



// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Administratie\Verlof\Index.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Administratie\ZiekteMelding\Index.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Contact\Contact.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Dossiers\Verzuimkalender.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\GebruikersBeheer\GebruikersBeheer.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\GebruikersBeheer\Index.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\MijnProfiel\MijnContactgegevens.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\MijnTools\Index.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\NoRiskpolis.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\UitDienst.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\Vragenlijst.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\WAOStatus.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\WgaStatus.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Rapporten\ZiekUitDienst.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Registratie\Aanmelden.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Settings\ExtraRechten.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Settings\Modules.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Settings\TaakDefinitie.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Settings\VerzuimProtocol.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Shared\PdfNotities.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\Shared\PdfVerzuimverlof.css <============================================
// C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web\App\SpreekuurAfspraak\Details.css <============================================




}
