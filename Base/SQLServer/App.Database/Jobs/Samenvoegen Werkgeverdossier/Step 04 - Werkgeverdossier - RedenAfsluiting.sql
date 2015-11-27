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

begin transaction [RedenAfsluitingTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(RedenAfsluitingId) from 
            (
                select max(MA.RedenAfsluitingId) as RedenAfsluitingId from RedenAfsluiting MA with (nolock)
                union 
                select max(AV.RedenAfsluitingId) as RedenAfsluitingId from [93_WGD].Werkgeverdossier.dbo.RedenAfsluiting AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		RedenAfsluitingIdOldMA int,
		RedenAfsluitingIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (RedenAfsluitingIdOldMA, RedenAfsluitingIdNewMA)
	select	x.RedenAfsluitingId as RedenAfsluitingIdOldMA,
			row_number() over (order by x.RedenAfsluitingId) + @MaxId as RedenAfsluitingIdNewMA
	from (
		select * from [93_WGD].Werkgeverdossier.dbo.RedenAfsluiting AV with (nolock)
		except
		select * from RedenAfsluiting MA with (nolock)
	) x
	order by x.RedenAfsluitingId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert RedenAfsluiting on
	insert into RedenAfsluiting (redenAfsluitingId, commercieelTrajectId, redenId)
	select	b.RedenAfsluitingIdNewMA, commercieelTrajectId, redenId
	from	@backlog b
	join	RedenAfsluiting x on b.RedenAfsluitingIdOldMA = x.RedenAfsluitingId
	
	-- 1d. Pas foreignkeys in MA aan.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	RedenAfsluiting x with (nolock) on b.RedenAfsluitingIdOldMA = x.RedenAfsluitingId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into RedenAfsluiting (RedenAfsluitingId, commercieelTrajectId, redenId)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.RedenAfsluiting AV with (nolock) on b.RedenAfsluitingIdOldMA = AV.RedenAfsluitingId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into RedenAfsluiting (RedenAfsluitingId, commercieelTrajectId, redenId)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.RedenAfsluiting AV with (nolock)
	left join	RedenAfsluiting MA with (nolock) on AV.RedenAfsluitingId = MA.RedenAfsluitingId
	where		MA.RedenAfsluitingId is null
	
	set identity_insert RedenAfsluiting off

	commit transaction [RedenAfsluitingTransaction]
end try
begin catch
	rollback transaction [RedenAfsluitingTransaction]
end catch
go