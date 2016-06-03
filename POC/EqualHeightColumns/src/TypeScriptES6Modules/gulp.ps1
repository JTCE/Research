#
# This PowerShell script is used to initialize the task runner: gulp.
#

# To allow running of scripts, the execution policy should be set to "RemoteSigned".
Set-ExecutionPolicy RemoteSigned

Write-Host "Change directory to folder containing the 'gulpfile.js'"
Set-Location $PSScriptRoot

Write-Host "Install gulp globally"
npm install gulp --global

Write-Host "Install gulp to project"
npm install gulp --save-dev

Write-Host "Install plugins"
npm install jshint --save-dev
npm install gulp-jshint --save-dev
npm install gulp-plumber --save-dev
npm install gulp-watch --save-dev
npm install gulp-livereload --save-dev
