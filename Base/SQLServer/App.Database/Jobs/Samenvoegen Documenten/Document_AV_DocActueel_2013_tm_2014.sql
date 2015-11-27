
use master
exec sp_serveroption '91_DOCS', 'collation compatible', 'false'
exec sp_serveroption '91_DOCS', 'use remote collation', 'false'
exec sp_serveroption '91_DOCS', 'collation name', 'Latin1_General_BIN2'

use Documenten_AV

set transaction isolation level read uncommitted

if object_id('SV_Log') is null
begin	
	create table SV_Log (Id int identity(1, 1) not null constraint [PK_SV_Log] primary key, DateInserted datetime not null constraint [DF_SV_Log_DateInserted] default(getdate()), [Message] varchar(max) not null)
end
insert into SV_Log ([Message]) values ('DocActueel: Collation van de linked server [91_DOCS] aangepast.')

set nocount on
alter database Documenten_AV set recovery simple
insert into SV_Log ([Message]) values ('DocActueel: Recovery model gezet op simpel.')

insert into [91_DOCS].[Arbois_AV].dbo.SV_Voortgang (tabel, begindatum) select 'Documenten_AV.dbo.DocActueel', getdate() 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end
create table #Backlog (IdOld int not null, IdNew int not null, Inserted datetime not null, primary key (IdOld))
create table #InProcess (IdOld int not null, IdNew int not null, primary key (IdOld))

declare @IdIncrease int = 5000000
declare @MaxDocumentDate date = '2015-1-1'
declare @MinDocumentDate date = '2013-1-1'
insert into SV_Log ([Message]) values ('DocActueel:  MinDate[' + isnull(convert(varchar(50), @MinDocumentDate, 121), '') +  '], MaxDate [' + isnull(convert(varchar(50), @MaxDocumentDate, 121), '') + ']')

insert	into #Backlog
select	ma_pw.Id as IdOld,
		ma_pw.Id + @IdIncrease as IdNew,
		ma_pw.Inserted 
from    [91_DOCS].[Arbois_MA].[dbo].[PWDocument] ma_pw
where	ma_pw.PWDocumentMapId in ('O', 'V')
and		datediff(year, ma_pw.Inserted, @MaxDocumentDate) > 0
and		datediff(year, ma_pw.Inserted, @MinDocumentDate) <= 0
insert into SV_Log ([Message]) values ('DocActueel: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records uit de [MA] tabellen [PWDocument] overgezet naar de backlog.')

while (1=1)
begin
    truncate table #InProcess
    
    insert into #InProcess
    select top 10000 IdOld, IdNew from #Backlog
    if @@rowcount = 0 begin break end
	
    insert into Documenten_AV.dbo.DocActueel(DocumentId, DocumentData)
    select ip.IdNew as DocumentId, DocumentData
    from	#InProcess ip
    join	Documenten_MA.dbo.DocActueel ma on ip.IdOld = ma.DocumentId
    and     not exists (select DocumentId from Documenten_AV.dbo.DocActueel av where av.DocumentId = ma.DocumentId + @IdIncrease)
    insert into SV_Log ([Message]) values ('DocActueel: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records overgezet naar Documenten_AV.dbo.DocActueel.')        

    delete b
    from #Backlog b
    inner join #InProcess ip on b.IdOld = ip.IdOld 
end

update [91_DOCS].[Arbois_AV].dbo.SV_Voortgang set Einddatum = getdate() where Tabel = 'Documenten_AV.dbo.DocActueel' and Einddatum is null 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end

insert into SV_Log ([Message]) values ('DocActueel: Zet het recovery model weer terug naar full.')
alter database Documenten_AV set recovery full
