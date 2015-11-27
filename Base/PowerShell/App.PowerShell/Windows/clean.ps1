# Remove temp files
Get-ChildItem -Path C:\Users\Roel\AppData\Local\Temp -Include * -File -Recurse | foreach { $_.Delete()}
Get-ChildItem -Path C:\Users\Roel\AppData\Local\Microsoft\WebSiteCache -Include -File * -Recurse | foreach { $_.Delete()}