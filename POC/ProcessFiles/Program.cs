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
        public static void Main(string[] args)
        {
            Console.WriteLine("Processing files started.");
            var fs = new FileSystem();
            var projectFolder = new DirectoryInfo(@"C:\Projects\ZvdZ\zvdzonline\Source\ZvdZOnline\ZvdZOnline.Web");
            var info = new ProcessCshtmlFilesInfo();

            var files = fs.FindFiles(projectFolder, "*.cshtml");         
            foreach (FileInfo file in files)
            {
                Task task = fs.ProcessCshtmlFile(file, info);
                task.Wait();
            }

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

        /* Find files uses EnumerateFiles, because this is faster then GetFiles. 
         */
        public IEnumerable<FileInfo> FindFiles(DirectoryInfo folder, string pattern)
        {
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
                        await CreateOrUpdateFile(scssPath, string.Empty);                  
                        Console.WriteLine(file.FullName);
                        Console.WriteLine(scssPath);
                    }              
                }
        }
    }

    public struct ProcessCshtmlFilesInfo {
        public int FileCounter { get; set; }
        public int StyleTextCounter { get; set; }
        public int StyleFileCounter { get; set; }
    }
}
