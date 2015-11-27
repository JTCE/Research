-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas foreignkeys in MA aan.
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


go

begin transaction [LookupTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(LookupId) from 
            (
                select max(MA.LookupId) as LookupId from [Lookup] MA with (nolock)
                union 
                select max(AV.LookupId) as LookupId from [93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		LookupIdOldMA int,
		LookupIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (LookupIdOldMA, LookupIdNewMA)
	select	x.LookupId as LookupIdOldMA,
			row_number() over (order by x.LookupId) + @MaxId as LookupIdNewMA
	from (
		select * from [93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
		except
		select * from [Lookup] MA with (nolock)
	) x
	order by x.LookupId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert [Lookup] on
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select	b.LookupIdNewMA, listCode, listDescription, datumVan, datumTot
	from	@backlog b
	join	[Lookup] x on b.LookupIdOldMA = x.LookupId
	
	-- 1d. Pas foreignkeys in MA aan.
	update	x set x.ConcurentId = b.LookupIdNewMA from	@backlog b join	CommercieelTraject x with (nolock) on b.LookupIdOldMA = x.ConcurentId
	update	x set x.StatusId = b.LookupIdNewMA from	@backlog b join	CommercieelTraject x with (nolock) on b.LookupIdOldMA = x.StatusId
	update	x set x.ConcurentId = b.LookupIdNewMA from	@backlog b join	CommercieelTrajectDeleted x with (nolock) on b.LookupIdOldMA = x.ConcurentId
	update	x set x.RedenId = b.LookupIdNewMA from	@backlog b join	RedenAfsluiting x with (nolock) on b.LookupIdOldMA = x.RedenId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	[Lookup] x with (nolock) on b.LookupIdOldMA = x.LookupId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock) on b.LookupIdOldMA = AV.LookupId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
	left join	[Lookup] MA with (nolock) on AV.LookupId = MA.LookupId
	where		MA.LookupId is null
	
	set identity_insert [Lookup] off

	commit transaction [LookupTransaction]
end try
begin catch
	rollback transaction [LookupTransaction]
end catch
go
