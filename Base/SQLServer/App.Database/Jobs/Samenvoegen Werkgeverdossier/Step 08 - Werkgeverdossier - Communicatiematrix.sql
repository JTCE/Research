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

begin transaction [communicatiematrixTransaction]
begin try
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(communicatie) from 
            (
                select max(MA.communicatie) as communicatie from communicatiematrix MA with (nolock)
                union 
                select max(AV.communicatie) as communicatie from [93_WGD].Werkgeverdossier.dbo.communicatiematrix AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		communicatieOldMA int,
		communicatieNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (communicatieOldMA, communicatieNewMA)
	select	x.communicatie as communicatieOldMA,
			row_number() over (order by x.communicatie) + @MaxId as communicatieNewMA
	from (
		select		communicatie, 
					werkgeverid,
					werkgevertype,
					maetisvoorletters collate Latin1_General_BIN2 as maetisvoorletters,
					maetistussenvoegsels collate Latin1_General_BIN2 as maetistussenvoegsels,
					maetisachternaam collate Latin1_General_BIN2 as maetisachternaam,
					maetisfunctie collate Latin1_General_BIN2 as maetisfunctie,
					maetistelefoon collate Latin1_General_BIN2 as maetistelefoon,
					maetismobiel collate Latin1_General_BIN2 as maetismobiel,
					maetisemail collate Latin1_General_BIN2 as maetisemail,
					regio collate Latin1_General_BIN2 as regio,
					klantvoorletters collate Latin1_General_BIN2 as klantvoorletters,
					klanttussenvoegsels collate Latin1_General_BIN2 as klanttussenvoegsels,
					klantachternaam collate Latin1_General_BIN2 as klantachternaam,
					klantfunctie collate Latin1_General_BIN2 as klantfunctie,
					klanttelefoon collate Latin1_General_BIN2 as klanttelefoon,
					klantmobiel collate Latin1_General_BIN2 as klantmobiel,
					klantemail collate Latin1_General_BIN2 as klantemail,
					klantGeslacht collate Latin1_General_BIN2 as klantGeslacht
		from		[93_WGD].Werkgeverdossier.dbo.communicatiematrix AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		communicatie, 
					isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid) as werkgeverid,
					werkgevertype,
					maetisvoorletters collate Latin1_General_BIN2 as maetisvoorletters,
					maetistussenvoegsels collate Latin1_General_BIN2 as maetistussenvoegsels,
					maetisachternaam collate Latin1_General_BIN2 as maetisachternaam,
					maetisfunctie collate Latin1_General_BIN2 as maetisfunctie,
					maetistelefoon collate Latin1_General_BIN2 as maetistelefoon,
					maetismobiel collate Latin1_General_BIN2 as maetismobiel,
					maetisemail collate Latin1_General_BIN2 as maetisemail,
					regio collate Latin1_General_BIN2 as regio,
					klantvoorletters collate Latin1_General_BIN2 as klantvoorletters,
					klanttussenvoegsels collate Latin1_General_BIN2 as klanttussenvoegsels,
					klantachternaam collate Latin1_General_BIN2 as klantachternaam,
					klantfunctie collate Latin1_General_BIN2 as klantfunctie,
					klanttelefoon collate Latin1_General_BIN2 as klanttelefoon,
					klantmobiel collate Latin1_General_BIN2 as klantmobiel,
					klantemail collate Latin1_General_BIN2 as klantemail,
					klantGeslacht collate Latin1_General_BIN2 as klantGeslacht
		from		communicatiematrix MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		communicatie, 
					werkgeverid,
					werkgevertype,
					maetisvoorletters collate Latin1_General_BIN2 as maetisvoorletters,
					maetistussenvoegsels collate Latin1_General_BIN2 as maetistussenvoegsels,
					maetisachternaam collate Latin1_General_BIN2 as maetisachternaam,
					maetisfunctie collate Latin1_General_BIN2 as maetisfunctie,
					maetistelefoon collate Latin1_General_BIN2 as maetistelefoon,
					maetismobiel collate Latin1_General_BIN2 as maetismobiel,
					maetisemail collate Latin1_General_BIN2 as maetisemail,
					regio collate Latin1_General_BIN2 as regio,
					klantvoorletters collate Latin1_General_BIN2 as klantvoorletters,
					klanttussenvoegsels collate Latin1_General_BIN2 as klanttussenvoegsels,
					klantachternaam collate Latin1_General_BIN2 as klantachternaam,
					klantfunctie collate Latin1_General_BIN2 as klantfunctie,
					klanttelefoon collate Latin1_General_BIN2 as klanttelefoon,
					klantmobiel collate Latin1_General_BIN2 as klantmobiel,
					klantemail collate Latin1_General_BIN2 as klantemail,
					klantGeslacht collate Latin1_General_BIN2 as klantGeslacht
		from		communicatiematrix MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.communicatie

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert communicatiematrix on
	insert into communicatiematrix (communicatie, werkgeverid, werkgevertype, maetisvoorletters, maetistussenvoegsels, maetisachternaam, maetisfunctie, maetistelefoon, maetismobiel, maetisemail, regio, klantvoorletters, klanttussenvoegsels, klantachternaam, klantfunctie, klanttelefoon, klantmobiel, klantemail, klantGeslacht)
	select	b.communicatieNewMA, werkgeverid, werkgevertype, maetisvoorletters, maetistussenvoegsels, maetisachternaam, maetisfunctie, maetistelefoon, maetismobiel, maetisemail, regio, klantvoorletters, klanttussenvoegsels, klantachternaam, klantfunctie, klanttelefoon, klantmobiel, klantemail, klantGeslacht
	from	@backlog b
	join	communicatiematrix x on b.communicatieOldMA = x.communicatie
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	communicatiematrix x with (nolock) on b.communicatieOldMA = x.communicatie
	
	-- 1f. Kopieer records van AV naar MA.
	insert into communicatiematrix (communicatie, werkgeverid, werkgevertype, maetisvoorletters, maetistussenvoegsels, maetisachternaam, maetisfunctie, maetistelefoon, maetismobiel, maetisemail, regio, klantvoorletters, klanttussenvoegsels, klantachternaam, klantfunctie, klanttelefoon, klantmobiel, klantemail, klantGeslacht)
	select		AV.communicatie, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.maetisvoorletters, AV.maetistussenvoegsels, AV.maetisachternaam, AV.maetisfunctie, AV.maetistelefoon, AV.maetismobiel, AV.maetisemail, AV.regio, AV.klantvoorletters, AV.klanttussenvoegsels, AV.klantachternaam, AV.klantfunctie, AV.klanttelefoon, AV.klantmobiel, AV.klantemail, AV.klantGeslacht
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.communicatiematrix AV with (nolock) on b.communicatieOldMA = AV.communicatie
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into communicatiematrix (communicatie, werkgeverid, werkgevertype, maetisvoorletters, maetistussenvoegsels, maetisachternaam, maetisfunctie, maetistelefoon, maetismobiel, maetisemail, regio, klantvoorletters, klanttussenvoegsels, klantachternaam, klantfunctie, klanttelefoon, klantmobiel, klantemail, klantGeslacht)
	select		AV.communicatie, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgevertype, AV.maetisvoorletters, AV.maetistussenvoegsels, AV.maetisachternaam, AV.maetisfunctie, AV.maetistelefoon, AV.maetismobiel, AV.maetisemail, AV.regio, AV.klantvoorletters, AV.klanttussenvoegsels, AV.klantachternaam, AV.klantfunctie, AV.klanttelefoon, AV.klantmobiel, AV.klantemail, AV.klantGeslacht
	from		[93_WGD].Werkgeverdossier.dbo.communicatiematrix AV with (nolock)
	left join	communicatiematrix MA with (nolock) on AV.communicatie = MA.communicatie
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.communicatie is null
	
	set identity_insert communicatiematrix off

	commit transaction [communicatiematrixTransaction]
end try
begin catch
	rollback transaction [communicatiematrixTransaction]
end catch
go