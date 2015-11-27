
use master
exec sp_serveroption '91_DOCS', 'collation compatible', 'false'
exec sp_serveroption '91_DOCS', 'use remote collation', 'false'
exec sp_serveroption '91_DOCS', 'collation name', 'Latin1_General_BIN2'

use Medisch_AV

set transaction isolation level read uncommitted

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
end
insert into SV_Log ([Message]) values ('MedischFris: Collation van de linked server [91_DOCS] aangepast.')

set nocount on
alter database Medisch_AV set recovery simple
insert into SV_Log ([Message]) values ('MedischFris: Recovery model gezet op simpel.')

insert into [91_DOCS].[Arbois_AV].dbo.SV_Voortgang (tabel, begindatum) select 'Medisch_AV.dbo.MedischFris', getdate() 

declare @minid int
declare @maxid int
declare @increment int

select 	  @minid = min(MA.Id) 
		, @maxid = max(MA.Id)
		, @increment = 100000
from	Medisch_MA.dbo.MedischFris MA with (nolock)

while (@minid <= @maxid)
begin
	insert into MedischFris ([GUID], Waarde) 
	select		[GUID], Waarde
	from	    Medisch_MA.dbo.MedischFris MA with (nolock)
	where		MA.Id between @minid and @minid + @increment
	and not exists (select [GUID] from MedischFris av where av.[GUID] = ma.[GUID])
	insert into SV_Log ([Message]) values ('[' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records overgezet naar Medisch_AV.MedischFris.' + 'MinId [' + cast(isnull(@minid, 0) as varchar(50)) +  '] Increment [' + cast(isnull(@increment, 0) as varchar(50)) + '] MaxId [' + cast(isnull(@maxid, 0) as varchar(50)) + ']')
		
	set @MinId = @MinId + @Increment + 1
end

update [91_DOCS].[Arbois_AV].dbo.SV_Voortgang set Einddatum = getdate() where Tabel = 'Medisch_AV.dbo.MedischFris' and Einddatum is null 

insert into SV_Log ([Message]) values ('MedischFris: Zet het recovery model weer terug naar full.')
alter database Medisch_AV set recovery full