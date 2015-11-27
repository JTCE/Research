
(function (require) {
    "use strict";
    
    // Gulp.
    var gulp = require("gulp");

    // Gulp plugins.
    var jshint = require("gulp-jshint");
    var plumber = require("gulp-plumber");
    var livereload = require("gulp-livereload");

    // Gulp plumber error handler
    var onError = function (err) {
        console.log(err);
    };
        
    gulp.task("jshint", function () {
        /// <summary>
        /// Hint all of our custom developed Javascript to make sure things are clean.
        /// This task will only hint JavaScript files in the folder "/Client" and it's subfolders.
        /// </summary>

        return gulp.src([
            "./Client/Core/**/*.js",
            "./Client/Desktop/**/*.js",
            "./Client/Mobile/**/*.js"
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

