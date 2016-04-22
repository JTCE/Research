
var gulp = require('gulp');
var jshint = require("gulp-jshint");
var plumber = require("gulp-plumber");
var livereload = require("gulp-livereload");

/**
*   Gulp plumber error handler 
*/
var plumberErrorHandler = function (err) {
    console.log(err);
};

gulp.task('default', function () {

});

/**
*   Hint all of our custom developed Javascript files.
*/
gulp.task("jshint", function () {
    return gulp.src([
        "wwwroot/**/*.js",
        "!wwwroot/libraries/**/*.js"
    ])
    .pipe(plumber({
        errorHandler: plumberErrorHandler
    }))
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

/**
*   The following files will be reloaded, when one of the "watched" files had changed.
*/
gulp.task('reload', function () {
    livereload.reload("/");
});

/**
*   Watch *.html, *.css and *.js files, when a change is detected, reload the page.
*/
gulp.task("watch", function () {
    livereload.listen();

    gulp.watch([
        "wwwroot/**/*.html",
        "wwwroot/**/*.js",
        "wwwroot/**/*.css"
    ], ["reload"]);
});