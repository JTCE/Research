-- Geschatte totale duur op ACC is +/- 30s.

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
insert into SV_Log ([Message]) values ('zvdzoDocument: Collation van de linked server [91_DOCS] aangepast.')

set nocount on
alter database Documenten_AV set recovery simple
insert into SV_Log ([Message]) values ('zvdzoDocument: Recovery model gezet op simpel.')

insert into [91_DOCS].[Arbois_AV].dbo.SV_Voortgang (tabel, begindatum) select 'Documenten_AV.dbo.zvdzoDocument', getdate() 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end
create table #Backlog (IdOld int, IdNew int, primary key (IdOld))
create table #InProcess (IdOld int, IdNew int, primary key (IdOld))

set identity_insert Documenten_AV.dbo.zvdzoDocument on

declare @IdIncrease int = 200 -- Alle MA Id's en DocumentId's ophogen met 200
insert	into #Backlog
select	ma.Id as IdOld,
		ma.Id + @IdIncrease as IdNew
from    [91_DOCS].[Arbois_MA].[dbo].[zvdzoOrganisatieTaakDocument] ma_meta -- Alleen documenten overzetten die meta data hebben in de tabel [zvdzoOrganisatieTaakDocument].
join    Documenten_MA.dbo.zvdzoDocument ma on ma_meta.Id = ma.Id
and     not exists (select Id from Documenten_AV.dbo.zvdzoDocument av where av.Id = ma.Id + @IdIncrease)
insert into SV_Log ([Message]) values ('zvdzoDocument: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records uit de tabel Documenten_AV.dbo.zvdzoDocument overgezet naar de backlog.')        

while (1=1)
begin
    truncate table #InProcess
    
    insert into #InProcess
    select top 10000 IdOld, IdNew from #Backlog
    if @@rowcount = 0 begin break end
	
    insert into Documenten_AV.dbo.zvdzoDocument(Id, OrganisatieTaakDocumentId, DocumentData)
    select ip.IdNew as Id, ma.OrganisatieTaakDocumentId + @IdIncrease as OrganisatieTaakDocumentId, ma.DocumentData
    from #InProcess ip
    join Documenten_MA.dbo.zvdzoDocument ma on ip.IdOld = ma.Id
    insert into SV_Log ([Message]) values ('zvdzoDocument: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records overgezet naar Documenten_AV.dbo.zvdzoDocument.')        

    delete b
    from #Backlog b
    inner join #InProcess ip on b.IdOld = ip.IdOld 
end

set identity_insert Documenten_AV.dbo.zvdzoDocument off   

update [91_DOCS].[Arbois_AV].dbo.SV_Voortgang set Einddatum = getdate() where Tabel = 'Documenten_AV.dbo.zvdzoDocument' and Einddatum is null 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end

insert into SV_Log ([Message]) values ('zvdzoDocument: Zet het recovery model weer terug naar full.')
alter database Documenten_AV set recovery full