
-- Create a new database if it does not exist.
if db_id('App') is null
begin
	create database App

	-- Set recovery model to simple to prevent large log files.
	alter database App set recovery simple
end
go

-- To enable CLR code in SQL the "show advanced options" should be turned on.
sp_configure 'show advanced options', 1;
go
reconfigure
go

-- To enable CLR code in SQL, "clr enabled" should be turned on.
sp_configure 'clr enabled', 1;
go
reconfigure
go