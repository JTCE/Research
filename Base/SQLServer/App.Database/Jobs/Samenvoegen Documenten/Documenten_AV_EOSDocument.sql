-- Geschatte totale duur op ACC bij "set" grootte van 10.000 is 2 uur.

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
insert into SV_Log ([Message]) values ('EOS: Collation van de linked server [91_DOCS] aangepast.')

set nocount on
alter database Documenten_AV set recovery simple
insert into SV_Log ([Message]) values ('EOS: Recovery model gezet op simpel.')

insert into [91_DOCS].[Arbois_AV].dbo.SV_Voortgang (tabel, begindatum) select 'Documenten_AV.dbo.EOSDocument', getdate() 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end
create table #Backlog (IdOld int, IdNew int, primary key (IdOld))
create table #InProcess (IdOld int, IdNew int, primary key (IdOld))

set identity_insert Documenten_AV.dbo.EOSDocument on

declare @IdIncrease int = 500000
insert	into #Backlog
select	ma.Id as IdOld,
		ma.Id + @IdIncrease as IdNew
from    [91_DOCS].[Arbois_MA].[dbo].[GMDossierDocument] ma_gmd
join    Documenten_MA.dbo.EOSDocument ma on ma_gmd.DocumentId = ma.Id
and     not exists (select Id from Documenten_AV.dbo.EOSDocument av where av.Id = ma.Id + @IdIncrease)
insert into SV_Log ([Message]) values ('EOS: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records uit de tabel Documenten_AV.dbo.EOSDocument overgezet naar de backlog.')        

while (1=1)
begin
    truncate table #InProcess
    
    insert into #InProcess
    select top 10000 IdOld, IdNew from #Backlog
    if @@rowcount = 0 begin break end
	
    insert into Documenten_AV.dbo.EOSDocument(Id, DocumentData, Module)
    select ip.IdNew as Id, DocumentData, Module
    from #InProcess ip
    join Documenten_MA.dbo.EOSDocument ma on ip.IdOld = ma.Id
    insert into SV_Log ([Message]) values ('EOS: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records overgezet naar Documenten_AV.dbo.EOSDocument.')        

    delete b
    from #Backlog b
    inner join #InProcess ip on b.IdOld = ip.IdOld 
end

set identity_insert Documenten_AV.dbo.EOSDocument off   

update [91_DOCS].[Arbois_AV].dbo.SV_Voortgang set Einddatum = getdate() where Tabel = 'Documenten_AV.dbo.EOSDocument' and Einddatum is null 

if object_id('tempdb..#Backlog') is not null begin drop table #Backlog end
if object_id('tempdb..#InProcess') is not null begin drop table #InProcess end

insert into SV_Log ([Message]) values ('EOS: Zet het recovery model weer terug naar full.')
alter database Documenten_AV set recovery full