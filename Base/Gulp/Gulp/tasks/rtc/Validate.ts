import fs = require("q-io/fs");
import q = require("q");

"use strict";
export interface IValidate {
    isHtmlFile(path: string, stats: fs.Stats): boolean
}

export class Validate implements IValidate {

    constructor() {
    }

    /**
        * Determines if the given file is a html file.
        * Returns true, when path points to a file and the file extension === ".html" 
        */
    isHtmlFile(path: string, stats: fs.Stats): boolean {
        var result = false;

        if (stats.node.isFile()) {
            var extension = fs.extension(path);
            if (extension === ".html") {
                result = true;
            }
        }

        return result;
    }
}