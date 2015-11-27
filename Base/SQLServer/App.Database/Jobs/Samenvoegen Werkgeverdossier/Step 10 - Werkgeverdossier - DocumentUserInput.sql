-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption '93_WGD', 'collation compatible', 'false'
exec sp_serveroption '93_WGD', 'use remote collation', 'false'
exec sp_serveroption '93_WGD', 'collation name', 'Latin1_General_BIN2'

set nocount on
go

use Werkgeverdossier
go

begin transaction [DocumentUserInputTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(DocumentUserInputId) from 
            (
                select max(MA.DocumentUserInputId) as DocumentUserInputId from DocumentUserInput MA with (nolock)
                union 
                select max(AV.DocumentUserInputId) as DocumentUserInputId from [93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		DocumentUserInputIdOldMA int,
		DocumentUserInputIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (DocumentUserInputIdOldMA, DocumentUserInputIdNewMA)
	select	x.DocumentUserInputId as DocumentUserInputIdOldMA,
			row_number() over (order by x.DocumentUserInputId) + @MaxId as DocumentUserInputIdNewMA
	from (
		select	documentUserInputId,
				[guid] collate Latin1_General_BIN2 as [guid],
				docName collate Latin1_General_BIN2 as docName,
				fieldName collate Latin1_General_BIN2 as fieldName,
				fieldValue collate Latin1_General_BIN2 as fieldValue
		from	[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
		except
		select	documentUserInputId,
				[guid] collate Latin1_General_BIN2 as [guid],
				docName collate Latin1_General_BIN2 as docName,
				fieldName collate Latin1_General_BIN2 as fieldName,
				fieldValue collate Latin1_General_BIN2 as fieldValue
		from DocumentUserInput MA with (nolock)
	) x
	order by x.DocumentUserInputId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert DocumentUserInput on
	insert into DocumentUserInput (documentUserInputId, [guid], docName, fieldName, fieldValue)
	select	b.DocumentUserInputIdNewMA, [guid], docName, fieldName, fieldValue
	from	@backlog b
	join	DocumentUserInput x on b.DocumentUserInputIdOldMA = x.DocumentUserInputId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	DocumentUserInput x with (nolock) on b.DocumentUserInputIdOldMA = x.DocumentUserInputId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into DocumentUserInput (documentUserInputId, guid, docName, fieldName, fieldValue)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock) on b.DocumentUserInputIdOldMA = AV.DocumentUserInputId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into DocumentUserInput (documentUserInputId, guid, docName, fieldName, fieldValue)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
	left join	DocumentUserInput MA with (nolock) on AV.DocumentUserInputId = MA.DocumentUserInputId
	where		MA.DocumentUserInputId is null
	
	set identity_insert DocumentUserInput off

	commit transaction [DocumentUserInputTransaction]
end try
begin catch
	rollback transaction [DocumentUserInputTransaction]
end catch
go