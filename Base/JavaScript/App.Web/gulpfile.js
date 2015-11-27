
(function (require) {
	"use strict";

	// "through2" is a thin wrapper around node transform streams.
	var through = require("through2");

	// "fs" is used to interact with the filesystem.
	var fs = require("fs");

	// "Q" is used to work with promises instead of callbacks.
	var Q = require("Q");

	// Gulp.
	var gulp = require("gulp");

	// Gulp plugins.
	var jshint = require("gulp-jshint");
	var plumber = require("gulp-plumber");
	var livereload = require("gulp-livereload");

	//function fingerPrintAppCache(content, datetime) {
	//	/// <summary>
	//	/// Replaces the datetime in appcache file with the given datetime.
	//	/// The "appcache" file should contain the text: "# version {{ ... }}" or the text: "# version {{...}}"
	//	/// Example of the finger printed row:
	//	/// 
	//	/// # version {{ 2015-03-20T13:50:18.808Z }}
	//	///
	//	/// </summary>
	//	/// <param name="content" type="String">The content of the ".appcache" file.</param>
	//	/// <param name="datetime" type="Date">Current date time</param>

	//	var regEx = new RegExp("# version {{.*}}", "g");
	//	var result = content.replace(regEx, "# version {{ " + datetime.toISOString() + " }}");
	//	return result;
	//}

	// Gulp plumber error handler
	var onError = function (err) {
		console.log(err);
	};

	//function readFile(path) {
	//	/// <summary>
	//	/// Read the contents of the given file.
	//	/// It returns a promise.
	//	/// </summary>
	//	/// <returns type="Q">A promise.</returns>

	//	var deferred = Q.defer();
	//	fs.readFile(path, "utf-8", function (err, data) {
	//		if (err) {
	//			deferred.reject(err);
	//		}
	//		deferred.resolve(data);
	//	});

	//	return deferred.promise;
	//}

	function reload() {
		/// <summary>
		/// Change the filepath, when you want to live reload a different page in your project.
		/// </summary>

		livereload.reload("./index.html");
	}

	//function writeFile(path, content) {
	//	/// <summary>
	//	/// Write one model to filesystem.
	//	/// </summary>
	//	/// <param name="path" type="String">Full file path.</returns>
	//	/// <param name="content" type="String">Content to be written to file.</returns>

	//	var ws = fs.createWriteStream(path);
	//	ws.write(content);
	//	ws.end();
	//}

	//gulp.task("fingerprint-appcache", function () {
	//	/// <summary>
	//	/// Fingerprint the "manifest.appcache" file, so it is invalidated.
	//	/// </summary>

	//	var path = "./Resources/manifest.appcache";
	//	readFile(path)
    //        .then(function (content) {
    //        	content = fingerPrintAppCache(content, new Date());
    //        	writeFile(path, content);
    //        	reload();
    //        })
    //        .done();
	//});

	gulp.task("reload", reload);

	gulp.task("watch", function () {
		/// <summary>
		/// This task should be run, when you want to reload the webpage, when files change on disk.
		/// This task will only watch JavaScript file changes in the folder "/wwwroot" and it's subfolders.
		/// It will start by finger printing the "appcache" file, so al files will be refreshed in the browser.
		/// </summary>

		livereload.listen();
		gulp.watch([
            "./wwwroot/**/*.css",
            "./wwwroot/**/*.html",
            "./wwwroot/**/*.js",
		]);

		//gulp.watch([
        //    "./wwwroot/**/*.css",
        //    "./wwwroot/**/*.html",
        //    "./wwwroot/**/*.js",
		//], ["fingerprint-appcache"]);
	});

	gulp.task("jshint", function () {
		/// <summary>
		/// Hint all of our custom developed Javascript to make sure things are clean.
		/// This task will only hint JavaScript files in the folder "/wwwroot" and it's subfolders.
		/// </summary>

		return gulp.src([
            "./wwwroot/**/*.js"
		])
        .pipe(plumber({
        	errorHandler: onError
        }))
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
	});

	// When the user enters "gulp" on the command line, the default task will automatically be called.
	// This default task below, will run all other task automatically.
	// So when the user enters "gulp" on the command line all task are run.
	gulp.task("default", ["jshint"]);

}(require));

