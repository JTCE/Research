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

begin transaction [OpmerkingTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(OpmerkingId) from 
            (
                select max(MA.OpmerkingId) as OpmerkingId from Opmerking MA with (nolock)
                union 
                select max(AV.OpmerkingId) as OpmerkingId from [93_WGD].Werkgeverdossier.dbo.Opmerking AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		OpmerkingIdOldMA int,
		OpmerkingIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (OpmerkingIdOldMA, OpmerkingIdNewMA)
	select	x.OpmerkingId as OpmerkingIdOldMA,
			row_number() over (order by x.OpmerkingId) + @MaxId as OpmerkingIdNewMA
	from (
		select		opmerkingid, werkgeverid, werkgevertype, opmerking collate Latin1_General_BIN2 as opmerking
		from		[93_WGD].Werkgeverdossier.dbo.Opmerking AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		opmerkingid, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid) as werkgeverid, werkgevertype, opmerking collate Latin1_General_BIN2 as opmerking
		from		Opmerking MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		opmerkingid, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid) as werkgeverid, werkgevertype, opmerking collate Latin1_General_BIN2 as opmerking
		from		Opmerking MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.OpmerkingId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert Opmerking on
	insert into Opmerking (opmerkingid, werkgeverid, werkgevertype, opmerking)
	select	b.OpmerkingIdNewMA, werkgeverid, werkgevertype, opmerking
	from	@backlog b
	join	Opmerking x on b.OpmerkingIdOldMA = x.OpmerkingId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	Opmerking x with (nolock) on b.OpmerkingIdOldMA = x.OpmerkingId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into Opmerking (opmerkingid, werkgeverid, werkgevertype, opmerking)
	select		AV.opmerkingid, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.opmerking
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.Opmerking AV with (nolock) on b.OpmerkingIdOldMA = AV.OpmerkingId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into Opmerking (opmerkingid, werkgeverid, werkgevertype, opmerking)
	select		AV.opmerkingid, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.opmerking
	from		[93_WGD].Werkgeverdossier.dbo.Opmerking AV with (nolock)
	left join	Opmerking MA with (nolock) on AV.OpmerkingId = MA.OpmerkingId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.OpmerkingId is null
	
	set identity_insert Opmerking off

	commit transaction [OpmerkingTransaction]
end try
begin catch
	rollback transaction [OpmerkingTransaction]
end catch
go