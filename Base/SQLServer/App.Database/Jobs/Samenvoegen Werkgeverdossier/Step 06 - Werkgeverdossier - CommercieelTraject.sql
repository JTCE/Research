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

begin transaction [CommercieelTrajectTransaction]
begin try
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(CommercieelTrajectId) from 
            (
                select max(MA.CommercieelTrajectId) as CommercieelTrajectId from CommercieelTraject MA with (nolock)
                union 
                select max(AV.CommercieelTrajectId) as CommercieelTrajectId from [93_WGD].Werkgeverdossier.dbo.CommercieelTraject AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		CommercieelTrajectIdOldMA int,
		CommercieelTrajectIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (CommercieelTrajectIdOldMA, CommercieelTrajectIdNewMA)
	select	x.CommercieelTrajectId as CommercieelTrajectIdOldMA,
			row_number() over (order by x.CommercieelTrajectId) + @MaxId as CommercieelTrajectIdNewMA
	from (
		select		CommercieelTrajectId, werkgeverId, beginDatum
		from		[93_WGD].Werkgeverdossier.dbo.CommercieelTraject AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		CommercieelTrajectId, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid), beginDatum  from CommercieelTraject MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		CommercieelTrajectId, werkgeverId, beginDatum
		from		CommercieelTraject MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.CommercieelTrajectId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert CommercieelTraject on
	insert into CommercieelTraject (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar)
	select	b.CommercieelTrajectIdNewMA, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar
	from	@backlog b
	join	CommercieelTraject x on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	update	x set x.CommercieelTrajectId = b.CommercieelTrajectIdNewMA from	@backlog b join	Contact x with (nolock) on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	update	x set x.CommercieelTrajectId = b.CommercieelTrajectIdNewMA from @backlog b join redenAfsluiting x with (nolock) on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	update	x set x.CommercieelTrajectId = b.CommercieelTrajectIdNewMA from @backlog b join commercieelTrajectOpmerking x with (nolock) on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	CommercieelTraject x with (nolock) on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into CommercieelTraject (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar)
	select		AV.commercieelTrajectId, AV.userId, AV.onderwerp, AV.dealGrootte, AV.slagingsPercentageId, AV.CAMVolume, AV.aantalMedewerkers, AV.doorloopTijd, AV.beginDatum, AV.eindDatum, AV.verzendDatumOfferte, AV.ontvangstDatumOfferte, AV.beginDatumContract, AV.statusId, AV.concurentId, AV.werkgevertypeId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.KlantEigenaar
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.CommercieelTraject AV with (nolock) on b.CommercieelTrajectIdOldMA = AV.CommercieelTrajectId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into CommercieelTraject (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar)
	select		AV.commercieelTrajectId, AV.userId, AV.onderwerp, AV.dealGrootte, AV.slagingsPercentageId, AV.CAMVolume, AV.aantalMedewerkers, AV.doorloopTijd, AV.beginDatum, AV.eindDatum, AV.verzendDatumOfferte, AV.ontvangstDatumOfferte, AV.beginDatumContract, AV.statusId, AV.concurentId, AV.werkgevertypeId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.KlantEigenaar
	from		[93_WGD].Werkgeverdossier.dbo.CommercieelTraject AV with (nolock)
	left join	CommercieelTraject MA with (nolock) on AV.CommercieelTrajectId = MA.CommercieelTrajectId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.CommercieelTrajectId is null
	
	set identity_insert CommercieelTraject off

	commit transaction [CommercieelTrajectTransaction]
end try
begin catch
	rollback transaction [CommercieelTrajectTransaction]
end catch
go