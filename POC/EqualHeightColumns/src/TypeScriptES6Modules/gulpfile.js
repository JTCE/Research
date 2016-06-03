/**
 * When you want to use this gulpfile.js, make sure you execute the gulp.ps1 PowerShell script first, so everything is installed correctly.
 */
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
    
    /**
     * The following files will be reloaded, when one of the "watched" files has changed.
     */
    gulp.task('reload', function () {
        gulp.src([
            "wwwroot/index.html"
        ])
        .on('error', onError)
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
    });   

    /**
        Watch *.css, *.html and *.js files, when a change is detected, reload the page.
    */
    gulp.task("watch", function () {
        livereload.listen();
        gulp.watch([
            "wwwroot/**/*.html",
            "wwwroot/**/*.js",
            "wwwroot/**/*.css"
        ], ["reload"]);
    });
                
    /**
     * Hint JavaScript files (excluding library files).
     */
    gulp.task("jshint", function () {

        return gulp.src([
            "wwwroot/**/*.js",
            "!wwwroot/Libraries/**/*.js"
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
    });

    /**
        When the user enters "gulp" on the command line, the default task will automatically be called.
        This default task below, will run all other task automatically.
        So when the user enters "gulp" on the command line all task are run.
     */
    gulp.task("default", ["watch"]);

}(require));
