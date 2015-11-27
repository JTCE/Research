-- This script will diable all triggers in a database, that are currently disabled.
-- It stores the name of the triggers in the table 'SV_Triggers', so the triggers can be enbled after database merge.

set transaction isolation level read uncommitted
set nocount on

use Arbois_AV

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
	insert into SV_Log ([Message]) values ('DisableTriggers: Table [SV_Log] created.')
end

insert into SV_Log ([Message]) values ('DisableTriggers: start')

if object_id('SV_Triggers') is null
begin	
	create table SV_Triggers (Id int not null identity(1, 1) constraint [PK_SV_Triggers] primary key, ObjectId int not null, TableName nvarchar(128) not null, TriggerName nvarchar(128) not null)
	insert into SV_Log ([Message]) values ('DisableTriggers: Table [SV_Triggers] created.')
end
else 
begin
	delete SV_Triggers
end

insert into SV_Triggers (ObjectId, TableName, TriggerName)
select	so.object_id, so.name, st.name
from	sys.objects so
join	sys.triggers st on so.object_id = st.parent_id
where	st.is_disabled = 0
insert into SV_Log ([Message]) values ('DisableTriggers: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] ingeschakelde triggers gevonden.')

declare @DisableTriggerCommand nvarchar(4000)
declare @TriggerTableName nvarchar(128)
declare @TriggerName nvarchar(128)

declare DisableTriggerCursor cursor
for
(
	select TableName, TriggerName from SV_Triggers
)
open DisableTriggerCursor

fetch next
from DisableTriggerCursor
into @TriggerTableName, @TriggerName

while @@fetch_status = 0
begin
	set @DisableTriggerCommand = N'alter table ' + @TriggerTableName + ' disable trigger ' + @TriggerName
	
	insert into SV_Log ([Message]) values ('DisableTriggers: Executing: ' + + @DisableTriggerCommand)
	execute sp_executesql @DisableTriggerCommand

	fetch next
	from DisableTriggerCursor
	into @TriggerTableName, @TriggerName
end

close DisableTriggerCursor
deallocate DisableTriggerCursor

insert into SV_Log ([Message]) values ('DisableTriggers: end')
