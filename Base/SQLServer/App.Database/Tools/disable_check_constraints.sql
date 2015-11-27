
-- This script will diable all check constraints in a database, that are currently disabled.
-- It stores the name of the check contraints in the table 'SV_CheckConstraints', so the check constraints can be enbled after database merge.

set transaction isolation level read uncommitted
set nocount on

use Arbois_AV

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
	insert into SV_Log ([Message]) values ('DisableCheckConstraints: Table [SV_Log] created.')
end

insert into SV_Log ([Message]) values ('DisableCheckConstraints: start')

if object_id('SV_CheckConstraints') is null
begin	
	create table SV_CheckConstraints (Id int not null identity(1, 1) constraint [PK_SV_CheckConstraints] primary key, ObjectId int not null, TableName nvarchar(128) not null, CheckConstraintName nvarchar(128) not null)
	insert into SV_Log ([Message]) values ('DisableCheckConstraints: Table [SV_CheckConstraints] created.')
end
else 
begin
	delete SV_CheckConstraints
end

insert into SV_CheckConstraints (ObjectId, TableName, CheckConstraintName)
select	so.object_id, so.name, sc.name
from	sys.objects so
join	sys.check_constraints sc on so.object_id = sc.parent_object_id
where	sc.is_disabled = 0
insert into SV_Log ([Message]) values ('DisableCheckConstraints: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] ingeschakelde check constraints gevonden.')

declare @DisableCheckConstraintCommand nvarchar(4000)
declare @CheckConstraintTableName nvarchar(128)
declare @CheckConstraintName nvarchar(128)

declare DisableCheckConstraintCursor cursor
for
(
	select TableName, CheckConstraintName from SV_CheckConstraints
)
open DisableCheckConstraintCursor

fetch next
from DisableCheckConstraintCursor
into @CheckConstraintTableName, @CheckConstraintName

while @@fetch_status = 0
begin
	set @DisableCheckConstraintCommand = N'alter table ' + @CheckConstraintTableName + ' nocheck constraint ' + @CheckConstraintName
	
	insert into SV_Log ([Message]) values ('DisableCheckConstraints: Executing: ' + + @DisableCheckConstraintCommand)
	execute sp_executesql @DisableCheckConstraintCommand

	fetch next
	from DisableCheckConstraintCursor
	into @CheckConstraintTableName, @CheckConstraintName
end

close DisableCheckConstraintCursor
deallocate DisableCheckConstraintCursor

insert into SV_Log ([Message]) values ('DisableCheckConstraints: end')