import fs = require("q-io/fs");
import q = require("q");
import l = require("./tasks/Logger");
import l2 = require("./tasks/Logger");

module am.tasks {

    var test = new l.Logger();
    test.log("test");

    var test2 = new l2.Logger();
    test2.log("test2");

    export class Templates {

        //constructor(public viewsFolder: string, public destinationFilePath: string, public logger: ILogger) {
            
        //}

        /**
         * Used to construct the body of the object app.templates.
         */
        //getContent(key: string, value: string, appendTerminator: boolean): string {
        //    var itemTerminator = ",\n";
        //    var content = key + ":" + value;
        //    if (appendTerminator) {
        //        content += itemTerminator;
        //    }
        //    return content;
        //}

        /**
         * Used to construct the key part of a specific template.
         */
        //getKey(path: string): string {
        //    var key = "\t\t" + path.replace(this.viewsFolder + "\\", "");
        //    key = key.replace(/\\/g, "_")
        //    key = key.replace(/\.html$/, "");
        //    return key;
        //}

        /**
         * Converts all html files in the give folder (and all it's subfolders) to  the contents of a "templates.ts" file.
         */
        //getTemplatesFileContent(path: string): Q.Promise<any> {
        //    return fs.listTree(path, this.isHtmlFile.bind(this))
        //        .then(this.getContentOfHtmlFiles.bind(this))
        //        .then(this.processContentOfHtmlFiles.bind(this));
        //}

        /**
         * Used to construct the value part of a specific template.
         */
        //getValue(path: string): string {
        //    var value = '"<login></login>"';
        //    return value;
        //}

        /**
         * Determines if the given file is a html file.
         * Returns true, when path points to a file and the file extension === ".html" 
         */
        //isHtmlFile(path: string, stats: fs.Stats): boolean {
        //    var result = false;

        //    if (stats.node.isFile()) {
        //        var extension = fs.extension(path);
        //        if (extension === ".html") {
        //            result = true;
        //        }
        //    }
            
        //    return result;
        //}

        /**
         * Return a chained promise for getting the contents of all html files.
         */
        //getContentOfHtmlFiles(files: Array<string>): Q.Promise<string[]> {
        //    var promises: Array<Q.Promise<string>> = [];

        //    files.map(function getContentOfHtmlFile(file: string) {
        //        promises.push(fs.read(file));
        //    });
            
        //    return q.all(promises);
        //}

        /**
         * Process the given content of HTML files.
         */
        //processContentOfHtmlFiles(files: Array<string>): string {
        //    var header = 'module app {\n\t"use strict";\n\n\texport var templates = {\n';
        //    var content = '';
        //    for (var i = 0, length = files.length; i < length; i++) {
        //        var path = files[i];
        //        var key = this.getKey(path);
        //        var value = this.getValue(path);
        //        var appendTerminator = (i < length - 1);
        //        content += this.getContent(key, value, appendTerminator);
        //    }
        //    var footer = '\n\t}\n}';
        //    return header + content + footer;
        //}

        //saveToFile(content: string): Q.Promise<void> {
        //    return fs.write(this.destinationFilePath, content);
        //}

        /**
        * Convert all *.html files found in the "viewsFolder" to a templates object in the given "destinationFilePath".
        */
        //update(): void {
        //    this.getTemplatesFileContent(__dirname)
        //        .then(this.saveToFile.bind(this))
        //        .fail(this.logger.log.bind(this.logger))
        //        .done();
        //}
    }
}

//var logger = new am.tasks.Logger();
//var templatesFilePath = __dirname + "\\" + "app\\templates.ts";
//var templates = new am.tasks.Templates(__dirname, templatesFilePath, logger);

//templates.update();


