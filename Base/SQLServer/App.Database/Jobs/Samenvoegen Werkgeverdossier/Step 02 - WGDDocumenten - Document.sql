
-- Inhoud
-- Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		Bepaal in tijdelijke tabel nieuwe en oude id.
--		Kopieer records uit MA naar nieuwe id.
--		Pas foreignkeys in MA aan.
--		Verwijder oude MA records.
--		Kopieer records 1 op 1 van AV naar MA.
-- Overnemen records die alleen in AV bestaan.

set nocount on

use master
exec sp_serveroption '93_WGD', 'collation compatible', 'false'
exec sp_serveroption '93_WGD', 'use remote collation', 'false'
exec sp_serveroption '93_WGD', 'collation name', 'Latin1_General_BIN2'

use WGDDocumenten

declare @Increment int
declare @MaxId int
declare @MinId int

if object_id('SV_Log') is null
begin
	create table SV_Log (
		Id int identity(1, 1) not null,
		DateInserted datetime not null default(getdate()),
		[Message] varchar(max) not null
	)
end

insert into SV_Log ([Message]) values ('Begin van de samenvoeging.')
alter database WGDDocumenten set recovery simple
insert into SV_Log ([Message]) values ('Recovery model gezet op simpel.')

set @MaxId = (
	select max(DocumentId) from 
    (
        select max(MA.DocumentId) as DocumentId from Document MA with (nolock)
        union 
        select max(AV.DocumentId) as DocumentId from [93_WGD].WGDDocumenten.dbo.Document AV with (nolock)
    ) t 
)
insert into SV_Log ([Message]) values ('MaxId [' + cast(isnull(@MaxId, 0) as varchar(50)) + '] bepaalt.')
	
declare @backlog table
(
	DocumentIdOldMA int,
	DocumentIdNewMA int
)

insert into @backlog (DocumentIdOldMA, DocumentIdNewMA)
select	x.DocumentId as DocumentIdOldMA,
		row_number() over (order by x.DocumentId) + @MaxId as DocumentIdNewMA
from (
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		[93_WGD].WGDDocumenten.dbo.document AV with (nolock)
	except
	-- Records die geheel gelijk zijn nietovernemen.
	-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid) as werkgeverid, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		document MA with (nolock)
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
	except
	-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, svm.Oude_WGV_ID, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		document MA with (nolock)
	join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
) x
order by x.DocumentId
insert into SV_Log ([Message]) values ('Aantal te behandelen records [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  '].')

set identity_insert Document on

select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin	
	insert into Document (documentid, naam, omvang, document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator)
	select	b.DocumentIdNewMA, naam, omvang, document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator
	from	@backlog b
	join	Document MA on b.DocumentIdOldMA = MA.DocumentId
	where	MA.documentid between @MinId and @MinId + @Increment
	insert into SV_Log ([Message]) values ('Aantal records uit MA naar nieuwe ID overgezet [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + '] huidige min_id [' + cast(isnull(@MinId, 0) as varchar(50)) + '].')
			
	set @MinId = @MinId + @Increment + 1
end
	
-- Pas foreignkeys in MA aan.
-- N.V.T.
		
delete	x
from	@backlog b
join	Document x with (nolock) on b.DocumentIdOldMA = x.DocumentId
insert into SV_Log ([Message]) values ('Aantal records verwijderd uit MA [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + '] huidige min_id [' + cast(isnull(@MinId, 0) as varchar(50)) + '].')

select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin	
	insert into Document (documentid, naam,	omvang,	document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator)
	select		AV.documentid, AV.naam, AV.omvang, AV.document, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.contactId, AV.datumUpload, AV.folderId, AV.creator
	from		@backlog b
	join		[93_WGD].WGDDocumenten.dbo.Document AV with (nolock) on b.DocumentIdOldMA = AV.DocumentId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		AV.documentid between @MinId and @MinId + @Increment
	insert into SV_Log ([Message]) values ('Aantal records overgezet die zowel in MA als AV voorkwamen [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + '] huidige min_id [' + cast(isnull(@MinId, 0) as varchar(50)) + '].')
		
	set @MinId = @MinId + @Increment + 1
end
	
select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin
	insert into Document (documentid, naam, omvang, document, werkgevertype, WerkgeverId, contactId, datumUpload, folderId, creator)
	select		AV.documentid, AV.naam, AV.omvang, AV.document, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.contactId, AV.datumUpload, AV.folderId, AV.creator
	from		[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)
	left join	Document MA with (nolock) on AV.DocumentId = MA.DocumentId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.DocumentId is null
	and			(AV.documentid between @MinId and @MinId + @Increment)
	insert into SV_Log ([Message]) values ('Aantal records overgezet die alleen in AV voorkwamen [' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + '] huidige min_id [' + cast(isnull(@MinId, 0) as varchar(50)) + '].')
		
	set @MinId = @MinId + @Increment + 1
end

set identity_insert Document off

alter database WGDDocumenten set recovery simple
insert into SV_Log ([Message]) values ('Recovery model gezet op full.')