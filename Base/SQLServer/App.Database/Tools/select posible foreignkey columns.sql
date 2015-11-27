
-- Select all columns that might possibly be a foreign key to the given column.
 declare	@primairyColumnName varchar(255) = '%doc%id'
 select	object_name(id), name 
 from		syscolumns where name like @primairyColumnName
 and		object_name(id) in (select name from sysobjects where type='U')
 and		object_name(id) not like '\_%' escape '\'
 go

 -- You can also use "sp_help tablename" to identify real foreignkeys.
 sp_help MyTable1