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

begin transaction [CTOTransaction]
begin try
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(CommercieelTrajectOpmerkingId) from 
            (
                select max(MA.CommercieelTrajectOpmerkingId) as CommercieelTrajectOpmerkingId from CommercieelTrajectOpmerking MA with (nolock)
                union 
                select max(AV.CommercieelTrajectOpmerkingId) as CommercieelTrajectOpmerkingId from [93_WGD].Werkgeverdossier.dbo.CommercieelTrajectOpmerking AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		CommercieelTrajectOpmerkingIdOldMA int,
		CommercieelTrajectOpmerkingIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (CommercieelTrajectOpmerkingIdOldMA, CommercieelTrajectOpmerkingIdNewMA)
	select	x.CommercieelTrajectOpmerkingId as CommercieelTrajectOpmerkingIdOldMA,
			row_number() over (order by x.CommercieelTrajectOpmerkingId) + @MaxId as CommercieelTrajectOpmerkingIdNewMA
	from (
		select AV.commercieelTrajectOpmerkingId, AV.commercieelTrajectId, cast(AV.opmerking as varchar(max)) collate Latin1_General_BIN2 as opmerking from [93_WGD].Werkgeverdossier.dbo.CommercieelTrajectOpmerking AV with (nolock)
		except
		select MA.commercieelTrajectOpmerkingId, MA.commercieelTrajectId, cast(MA.opmerking as varchar(max)) collate Latin1_General_BIN2 as opmerking from CommercieelTrajectOpmerking MA with (nolock)
	) x
	order by x.CommercieelTrajectOpmerkingId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert CommercieelTrajectOpmerking on
	insert into CommercieelTrajectOpmerking (commercieelTrajectOpmerkingId, commercieelTrajectId, opmerking)
	select	b.CommercieelTrajectOpmerkingIdNewMA, commercieelTrajectId, opmerking
	from	@backlog b
	join	CommercieelTrajectOpmerking x on b.CommercieelTrajectOpmerkingIdOldMA = x.CommercieelTrajectOpmerkingId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	CommercieelTrajectOpmerking x with (nolock) on b.CommercieelTrajectOpmerkingIdOldMA = x.CommercieelTrajectOpmerkingId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into CommercieelTrajectOpmerking (commercieelTrajectOpmerkingId, commercieelTrajectId, opmerking)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.CommercieelTrajectOpmerking AV with (nolock) on b.CommercieelTrajectOpmerkingIdOldMA = AV.CommercieelTrajectOpmerkingId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into CommercieelTrajectOpmerking (commercieelTrajectOpmerkingId, commercieelTrajectId, opmerking)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.CommercieelTrajectOpmerking AV with (nolock)
	left join	CommercieelTrajectOpmerking MA with (nolock) on AV.CommercieelTrajectOpmerkingId = MA.CommercieelTrajectOpmerkingId
	where		MA.CommercieelTrajectOpmerkingId is null
	
	set identity_insert CommercieelTrajectOpmerking off

	commit transaction [CTOTransaction]
end try
begin catch
	rollback transaction [CTOTransaction]
end catch
go