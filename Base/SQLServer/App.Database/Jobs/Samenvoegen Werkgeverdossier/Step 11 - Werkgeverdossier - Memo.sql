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

begin transaction [memoTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(memoId) from 
            (
                select max(MA.memoId) as memoId from memo MA with (nolock)
                union 
                select max(AV.memoId) as memoId from [93_WGD].Werkgeverdossier.dbo.memo AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		memoIdOldMA int,
		memoIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (memoIdOldMA, memoIdNewMA)
	select	x.memoId as memoIdOldMA,
			row_number() over (order by x.memoId) + @MaxId as memoIdNewMA
	from (
		select		memoId, werkgeverId, werkgeverType, cast(memo as varchar(max)) collate Latin1_General_BIN2 as memo
		from		[93_WGD].Werkgeverdossier.dbo.memo AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select		memoId, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid), werkgeverType, cast(memo as varchar(max)) collate Latin1_General_BIN2 as memo
		from		memo MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		memoId, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid), werkgeverType, cast(memo as varchar(max)) collate Latin1_General_BIN2 as memo
		from		memo MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.memoId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert memo on
	insert into memo (memoId, werkgeverId, werkgeverType, memo)
	select	b.memoIdNewMA, werkgeverId, werkgeverType, memo
	from	@backlog b
	join	memo x on b.memoIdOldMA = x.memoId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	memo x with (nolock) on b.memoIdOldMA = x.memoId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into memo (memoId, werkgeverId, werkgeverType, memo)
	select		AV.memoId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgeverType, AV.memo
	from		@backlog b
	join		[93_WGD].Werkgeverdossier.dbo.memo AV with (nolock) on b.memoIdOldMA = AV.memoId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into memo (memoId, werkgeverId, werkgeverType, memo)
	select		AV.memoId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.werkgeverType, AV.memo
	from		[93_WGD].Werkgeverdossier.dbo.memo AV with (nolock)
	left join	memo MA with (nolock) on AV.memoId = MA.memoId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.memoId is null
	
	set identity_insert memo off

	commit transaction [memoTransaction]
end try
begin catch
	rollback transaction [memoTransaction]
end catch
go