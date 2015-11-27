
-- This script will diable all check constraints in a database, that are currently disabled.
-- It stores the name of the check contraints in the table 'SV_CheckConstraints', so the check constraints can be enbled after database merge.

set transaction isolation level read uncommitted
set nocount on

use Arbois_AV

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
	insert into SV_Log ([Message]) values ('EnableCheckConstraints: Table [SV_Log] created.')
end

insert into SV_Log ([Message]) values ('EnableCheckConstraints: start')

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
	set @DisableCheckConstraintCommand = N'alter table ' + @CheckConstraintTableName + ' with nocheck check constraint ' + @CheckConstraintName
	
	insert into SV_Log ([Message]) values ('EnableCheckConstraints: Executing: ' + @DisableCheckConstraintCommand)
	execute sp_executesql @DisableCheckConstraintCommand

	fetch next
	from DisableCheckConstraintCursor
	into @CheckConstraintTableName, @CheckConstraintName
end

close DisableCheckConstraintCursor
deallocate DisableCheckConstraintCursor

insert into SV_Log ([Message]) values ('EnableCheckConstraints: end')

