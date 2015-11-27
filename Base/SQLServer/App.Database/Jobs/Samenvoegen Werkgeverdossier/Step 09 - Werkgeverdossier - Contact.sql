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

begin transaction [ContactTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(contact) from 
            (
                select max(MA.contact) as contact from Contact MA with (nolock)
                union 
                select max(AV.contact) as contact from [93_WGD].Werkgeverdossier.dbo.Contact AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		contactOldMA int,
		contactNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (contactOldMA, contactNewMA)
	select	x.contact as contactOldMA,
			row_number() over (order by x.contact) + @MaxId as contactNewMA
	from (
		select		contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, cast(actie as varchar(max)) collate Latin1_General_BIN2 as actie, cast(afspraak as varchar(max)) as afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder
		from		[93_WGD].Werkgeverdossier.dbo.Contact AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, cast(actie as varchar(max)) collate Latin1_General_BIN2 as actie, cast(afspraak as varchar(max)) as afspraak, gesprokenmet, eigenaar, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid), werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder
		from		Contact MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, cast(actie as varchar(max)) collate Latin1_General_BIN2 as actie, cast(afspraak as varchar(max)) as afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder
		from		Contact MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.contact

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert Contact on
	insert into Contact (contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, actie, afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder)
	select	b.contactNewMA, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, actie, afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder
	from	@backlog b
	join	Contact x on b.contactOldMA = x.contact
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	Contact x with (nolock) on b.contactOldMA = x.contact
	
	-- 1f. Kopieer records van AV naar MA.
	insert into Contact (contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, actie, afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder)
	select		AV.contact, AV.onderwerp, AV.UitvoerderDNN, AV.contactsoort, AV.datumcontact, AV.verslag, AV.actie, AV.afspraak, AV.gesprokenmet, AV.eigenaar, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.contactTypeId, AV.commercieelTrajectId, AV.datumVolgendContact, AV.Uitvoerder
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.Contact AV with (nolock) on b.contactOldMA = AV.contact
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into Contact (contact, onderwerp, UitvoerderDNN, contactsoort, datumcontact, verslag, actie, afspraak, gesprokenmet, eigenaar, werkgeverid, werkgevertype, contactTypeId, commercieelTrajectId, datumVolgendContact, Uitvoerder)
	select		AV.contact, AV.onderwerp, AV.UitvoerderDNN, AV.contactsoort, AV.datumcontact, AV.verslag, AV.actie, AV.afspraak, AV.gesprokenmet, AV.eigenaar, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.contactTypeId, AV.commercieelTrajectId, AV.datumVolgendContact, AV.Uitvoerder
	from		[93_WGD].Werkgeverdossier.dbo.Contact AV with (nolock)
	left join	Contact MA with (nolock) on AV.contact = MA.contact
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.contact is null
	
	set identity_insert Contact off

	commit transaction [ContactTransaction]
end try
begin catch
	rollback transaction [ContactTransaction]
end catch
go