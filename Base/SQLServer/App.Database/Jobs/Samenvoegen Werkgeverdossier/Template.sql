-- Omschrijving
-- Onderstaande template wordt toegepast op alle tabellen die overgezet moeten worden, 
-- zodat je het script zonder problemen meerdere keren kan draaien
-- en data in de tussen tijd (voor de daadwerkelijke overzetting nog gewijzigd kan worden).





-- Werkwijze
-- 1. Even data eerst bekijken om een gevoel te krijgen.
select top 10 * from [Lookup]

-- 2. Bepaal alle kolommen van de tabel.
declare	@SQL nvarchar(max) = ''
declare	@table nvarchar(max) = 'Lookup'
select	@SQL = @SQL + sc.name + ', '
from	sys.objects so
join	sys.columns sc on sc.object_id = so.object_id
where	so.name = @table
select  left(@SQL, len(@SQL) - 1)

-- 3. Bepaal mogelijke foreignkey kolommen.
declare	@primairyColumnName varchar(255) = '%MyTable%'
select	object_name(id), name 
from		syscolumns where name like @primairyColumnName
and		object_name(id) in (select name from sysobjects where type='U')
and		object_name(id) not like '\_%' escape '\'
go
-- Bepaal alle foreignkeys die de huidige tabel heeft.
 sp_help MyTable
 -- Belangrijker is, bepaal welke foreignkeys naar deze tabel wijzen.
 exec sp_fkeys 'MyTable'

-- Taken
-- 1. Vervang "MyDatabase" door correcte database naam.
-- 2. Vervang "MyTable" door correcte tabel naam.
-- 3. Vervang "MyId" door de primairy key kolom naam.
-- 4. Let op, soms moet je bij 2b cast(... as varchar(max)) as MyColumn gebruiken, omdat except de "blob" types niet ondersteund.
-- 5. Vervang alle kolommen bij 2c, 2f, 3
-- 6. Vervang NIET primairy key kolommen bij "2d".







-- Inhoud
-- 1. Indien een tabel een kolom "WerkgeverId" bevat, de MA records eerst corrigeren, dit omdat alleen MA werkgeverid's zijn aangepast en vastgelegd in [Arbois_AV].[dbo].[SV_MappingWGV_ID].
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas foreignkeys in MA aan.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 3.	Overnemen records die alleen in AV bestaan.

if @@trancount > 0 rollback
go

set nocount on
go

use MyDatabase
go

begin transaction [MyTableTransaction]
begin try

	-- 1. Indien de tabel een kolom "WerkgeverId" bevat, de MA records eerst corrigeren, dit omdat alleen MA werkgeverid's zijn aangepast en vastgelegd in [Arbois_AV].[dbo].[SV_MappingWGV_ID].
	if exists(select top 1 1 from sys.objects so with (nolock) join sys.columns sc with (nolock) on sc.object_id = so.object_id where so.name = 'MyTable' and sc.name like '%Werkgever%')
	begin
		update	MA
		set		MA.WerkgeverId = svm.Nieuwe_WGV_ID
		from	[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock)
		join	MyTable MA on svm.Oude_WGV_ID = MA.WerkgeverId
	end
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(MyId) from 
            (
                select max(MA.MyId) as MyId from MyTable MA with (nolock)
                union 
                select max(AV.MyId) as MyId from [93_WGD].MyDatabase.dbo.MyTable AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		MyIdOldMA int,
		MyIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (MyIdOldMA, MyIdNewMA)
	select	x.MyId as MyIdOldMA,
			row_number() over (order by x.MyId) + @MaxId as MyIdNewMA
	from (
		select * from [93_WGD].MyDatabase.dbo.MyTable AV with (nolock)
		except
		select * from MyTable MA with (nolock)
	) x
	order by x.MyId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert MyTable on
	insert into MyTable (MyId, folderName, folderParentId, isVisible)
	select	b.MyIdNewMA, x.folderName, x.folderParentId, x.isVisible
	from	@backlog b
	join	MyTable x on b.MyIdOldMA = x.MyId
	
	-- 1d. Pas tabellen in MA aan, die foreignkeys hebben naar de huidige tabel.
	update	x set x.MyId = b.MyIdNewMA from	@backlog b join	document x with (nolock) on b.MyIdOldMA = x.MyId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	MyTable x with (nolock) on b.MyIdOldMA = x.MyId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into MyTable (MyId, folderName, folderParentId, isVisible)
	select	AV.*
	from	@backlog b
	join	[93_WGD].MyDatabase.dbo.MyTable AV with (nolock) on b.MyIdOldMA = AV.MyId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into MyTable (MyId, folderName, folderParentId, isVisible)
	select		AV.*
	from		[93_WGD].MyDatabase.dbo.MyTable AV with (nolock)
	left join	MyTable MA with (nolock) on AV.MyId = MA.MyId
	where		MA.MyId is null
	
	set identity_insert MyTable off

	commit transaction [MyTableTransaction]
end try
begin catch
	rollback transaction [MyTableTransaction]
end catch
go