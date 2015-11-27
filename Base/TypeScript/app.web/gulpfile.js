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
    var jasmine = require('gulp-jasmine');

    // Gulp plumber error handler
    var onError = function (err) {
        console.log(err);
    };

    gulp.task('unittests', function () {
        return gulp.src('poc/vanilla/unittests.js')
            .pipe(jasmine());
    });
    
    /**
     * Watch for source changes to run unittests.
     */
    gulp.task("watch_unittests", function () {
        gulp.watch([
            "poc/vanilla/unittests.js"
        ], ["unittests"]);
    });

    /**
     * The following files will be reloaded, when one of the "watched" files had changed.
     */
    gulp.task('reload', function () {
        gulp.src(["poc/vanilla/unittests.html"])
          .pipe(gulp.dest('dist'))
          .pipe(livereload());
    });
    
    /**
     * This task should be run, when you want to reload the webpage, when files change on disk.
     * This task will only watch JavaScript file changes in the folders ["/core", "/poc"] and it's subfolders.
     */
    gulp.task("watch", function () {
        livereload.listen();
        gulp.watch([
            "core/**/*.css",
            "core/**/*.html",
            "core/**/*.js",
            "poc/**/*.css",
            "poc/**/*.html",
            "poc/**/*.js",
            "poc/layout/*.html"
        ], ["reload"]);
    });

    /**
     * Hint all of our custom developed Javascript files.
     */
    gulp.task("jshint", function () {
        
        return gulp.src([
            "./core/**/*.js",
            "./poc/**/*.js"
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
    });

    /**
     * When the user enters "gulp" on the command line, the default task will automatically be called.
     * This default task below, will run all other task automatically.
     * So when the user enters "gulp" on the command line all task are run.
     */
    gulp.task("default", ["watch", "reload"]);

}(require));
