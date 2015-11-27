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

begin transaction [TrajectStatusTransaction]
begin try
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(TrajectStatusId) from 
            (
                select max(MA.TrajectStatusId) as TrajectStatusId from TrajectStatus MA with (nolock)
                union 
                select max(AV.TrajectStatusId) as TrajectStatusId from [93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		TrajectStatusIdOldMA int,
		TrajectStatusIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (TrajectStatusIdOldMA, TrajectStatusIdNewMA)
	select	x.TrajectStatusId as TrajectStatusIdOldMA,
			row_number() over (order by x.TrajectStatusId) + @MaxId as TrajectStatusIdNewMA
	from (
		select * from [93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
		except
		select * from TrajectStatus MA with (nolock)
	) x
	order by x.TrajectStatusId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert TrajectStatus on
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select	b.TrajectStatusIdNewMA, omschrijving
	from	@backlog b
	join	TrajectStatus x on b.TrajectStatusIdOldMA = x.TrajectStatusId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	update	x set x.statusId = b.TrajectStatusIdNewMA from	@backlog b join	commercieelTraject x with (nolock) on b.TrajectStatusIdOldMA = x.commercieelTrajectId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	TrajectStatus x with (nolock) on b.TrajectStatusIdOldMA = x.TrajectStatusId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock) on b.TrajectStatusIdOldMA = AV.TrajectStatusId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
	left join	TrajectStatus MA with (nolock) on AV.TrajectStatusId = MA.TrajectStatusId
	where		MA.TrajectStatusId is null
	
	set identity_insert TrajectStatus off

	commit transaction [TrajectStatusTransaction]
end try
begin catch
	rollback transaction [TrajectStatusTransaction]
end catch
go