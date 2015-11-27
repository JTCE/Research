-- Totale duur op ACC is 7 min.

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
insert into SV_Log ([Message]) values ('Arbouw: Collation van de linked server [91_DOCS] aangepast.')

set nocount on
alter database Documenten_AV set recovery simple
insert into SV_Log ([Message]) values ('Arbouw: Recovery model gezet op simpel.')

insert into [91_DOCS].[Arbois_AV].dbo.SV_Voortgang (tabel, begindatum) select 'Documenten_AV.dbo.ArbouwDocument', getdate() 

truncate table Documenten_AV.dbo.ArbouwDocument
insert into SV_Log ([Message]) values ('Arbouw: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records verwijderd uit de tabel Documenten_AV.dbo.ArbouwDocument.')

declare @IdIncrease int = 10000
insert	into Documenten_AV.dbo.ArbouwDocument (Id, DocumentData)
select	ma.Id,
		ma.DocumentData
from	Documenten_MA.dbo.ArbouwDocument ma
insert into SV_Log ([Message]) values ('Arbouw: [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '] records uit de tabel Documenten_AV.dbo.ArbouwDocument overgezet naar de backlog.')        

update [91_DOCS].[Arbois_AV].dbo.SV_Voortgang set Einddatum = getdate() where Tabel = 'Documenten_AV.dbo.ArbouwDocument' and Einddatum is null 

insert into SV_Log ([Message]) values ('Arbouw: Zet het recovery model weer terug naar full.')
alter database Documenten_AV set recovery full
