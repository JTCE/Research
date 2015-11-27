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

begin transaction [TaakTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(taak) from 
            (
                select max(MA.taak) as taak from Taak MA with (nolock)
                union 
                select max(AV.taak) as taak from [93_WGD].Werkgeverdossier.dbo.Taak AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		taakOldMA int,
		taakNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (taakOldMA, taakNewMA)
	select	x.taak as taakOldMA,
			row_number() over (order by x.taak) + @MaxId as taakNewMA
	from (
		select		taak,
					onderwerp collate Latin1_General_BIN2 as onderwerp,
					datumaanmaak,
					uitvoerder collate Latin1_General_BIN2 as uitvoerder,
					eigenaar collate Latin1_General_BIN2 as eigenaar,
					taaktype,
					datumafgehandeld,
					toelichting collate Latin1_General_BIN2 as toelichting,
					werkgevertype,
					werkgever
		from		[93_WGD].Werkgeverdossier.dbo.Taak AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		taak,
					onderwerp collate Latin1_General_BIN2 as onderwerp,
					datumaanmaak,
					uitvoerder collate Latin1_General_BIN2 as uitvoerder,
					eigenaar collate Latin1_General_BIN2 as eigenaar,
					taaktype,
					datumafgehandeld,
					toelichting collate Latin1_General_BIN2 as toelichting,
					werkgevertype,
					isnull(svm.Nieuwe_WGV_ID, MA.werkgever) as werkgever
		from		Taak MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.Werkgever = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		taak,
					onderwerp collate Latin1_General_BIN2 as onderwerp,
					datumaanmaak,
					uitvoerder collate Latin1_General_BIN2 as uitvoerder,
					eigenaar collate Latin1_General_BIN2 as eigenaar,
					taaktype,
					datumafgehandeld,
					toelichting collate Latin1_General_BIN2 as toelichting,
					werkgevertype,
					isnull(svm.Nieuwe_WGV_ID, MA.werkgever) as werkgever
		from		Taak MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.Werkgever = svm.Nieuwe_WGV_ID
	) x
	order by x.taak

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert Taak on
	insert into Taak (taak, onderwerp, datumaanmaak, uitvoerder, eigenaar, taaktype, datumafgehandeld, toelichting, werkgevertype, werkgever)
	select	b.taakNewMA, onderwerp, datumaanmaak, uitvoerder, eigenaar, taaktype, datumafgehandeld, toelichting, werkgevertype, werkgever
	from	@backlog b
	join	Taak x on b.taakOldMA = x.taak
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	Taak x with (nolock) on b.taakOldMA = x.taak
	
	-- 1f. Kopieer records van AV naar MA.
	insert into Taak (taak, onderwerp, datumaanmaak, uitvoerder, eigenaar, taaktype, datumafgehandeld, toelichting, werkgevertype, werkgever)
	select		AV.taak, AV.onderwerp, AV.datumaanmaak, AV.uitvoerder, AV.eigenaar, AV.taaktype, AV.datumafgehandeld, AV.toelichting, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgever) as werkgever
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.Taak AV with (nolock) on b.taakOldMA = AV.taak
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.werkgever = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into Taak (taak, onderwerp, datumaanmaak, uitvoerder, eigenaar, taaktype, datumafgehandeld, toelichting, werkgevertype, werkgever)
	select		AV.taak, AV.onderwerp, AV.datumaanmaak, AV.uitvoerder, AV.eigenaar, AV.taaktype, AV.datumafgehandeld, AV.toelichting, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgever) as werkgever
	from		[93_WGD].Werkgeverdossier.dbo.Taak AV with (nolock)
	left join	Taak MA with (nolock) on AV.taak = MA.taak
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.werkgever = svm.Oude_WGV_ID
	where		MA.taak is null
	
	set identity_insert Taak off

	commit transaction [TaakTransaction]
end try
begin catch
	rollback transaction [TaakTransaction]
end catch
go