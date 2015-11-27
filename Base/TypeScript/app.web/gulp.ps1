#
# This PowerShell script is used to initialize the task runner: gulp.js.
#

Set-ExecutionPolicy RemoteSigned

Write-Host "Change directory to folder containing the 'gulpfile.js'"
Set-Location $PSScriptRoot

Write-Host "Install gulp globally"
npm install gulp --g

Write-Host "Install gulp to project"
npm install gulp --save-dev

Write-Host "Install node packages"
npm install fs --save-dev
npm install through2 --save-dev
npm install Q --save-dev

Write-Host "Install plugins"
npm install gulp-jshint --save-dev
npm install gulp-notify --save-dev
npm install gulp-plumber --save-dev
npm install gulp-watch --save-dev
npm install gulp-livereload --save-dev
npm install gulp-jasmine --save-dev
