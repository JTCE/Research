-- This script will enable all triggers found in the table 'SV_Triggers'.

set transaction isolation level read uncommitted
set nocount on

use Arbois_AV

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
	insert into SV_Log ([Message]) values ('EnableTriggers: Table [SV_Log] created.')
end

insert into SV_Log ([Message]) values ('EnableTriggers: start')

declare @EnableTriggerCommand nvarchar(4000)
declare @TriggerTableName nvarchar(128)
declare @TriggerName nvarchar(128)

declare EnableTriggerCursor cursor
for
(
	select TableName, TriggerName from SV_Triggers
)
open EnableTriggerCursor

fetch next
from EnableTriggerCursor
into @TriggerTableName, @TriggerName

while @@fetch_status = 0
begin
	set @EnableTriggerCommand = N'alter table ' + @TriggerTableName + ' enable trigger ' + @TriggerName
	
	insert into SV_Log ([Message]) values ('EnableTriggers: Executing: ' + + @EnableTriggerCommand)
	execute sp_executesql @EnableTriggerCommand

	fetch next
	from EnableTriggerCursor
	into @TriggerTableName, @TriggerName
end

close EnableTriggerCursor
deallocate EnableTriggerCursor

insert into SV_Log ([Message]) values ('EnableTriggers: end')