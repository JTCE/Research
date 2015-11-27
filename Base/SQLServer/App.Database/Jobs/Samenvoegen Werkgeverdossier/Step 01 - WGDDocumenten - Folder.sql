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

use WGDDocumenten
go

begin transaction [FolderTransaction]
begin try
	
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(FolderId) from 
            (
                select max(MA.FolderId) as FolderId from Folder MA with (nolock)
                union 
                select max(AV.FolderId) as FolderId from [93_WGD].WGDDocumenten.dbo.Folder AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		FolderIdOldMA int,
		FolderIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (FolderIdOldMA, FolderIdNewMA)
	select	x.FolderId as FolderIdOldMA,
			row_number() over (order by x.FolderId) + @MaxId as FolderIdNewMA
	from (
		select * from [93_WGD].WGDDocumenten.dbo.Folder AV with (nolock)
		except
		select * from Folder MA with (nolock)
	) x
	order by x.FolderId
	
	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert Folder on
	insert into Folder (folderId, folderName, folderParentId, isVisible)
	select	b.FolderIdNewMA, x.folderName, x.folderParentId, x.isVisible
	from	@backlog b
	join	Folder x on b.FolderIdOldMA = x.FolderId
	
	-- 1d. Pas foreignkeys in MA aan.
	update	d set d.FolderId = b.FolderIdNewMA from	@backlog b join	document d with (nolock) on b.FolderIdOldMA = d.FolderId
	update	x set x.folderParentId = b.FolderIdNewMA from @backlog b join Folder x with (nolock) on b.FolderIdOldMA = x.folderParentId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	Folder x with (nolock) on b.FolderIdOldMA = x.FolderId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into Folder (folderId, folderName, folderParentId, isVisible)
	select	AV.*
	from	@backlog b
	join	[93_WGD].WGDDocumenten.dbo.Folder AV with (nolock) on b.FolderIdOldMA = AV.FolderId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into Folder (folderId, folderName, folderParentId, isVisible)
	select		AV.*
	from		[93_WGD].WGDDocumenten.dbo.Folder AV with (nolock)
	left join	Folder MA with (nolock) on AV.FolderId = MA.FolderId
	where		MA.FolderId is null

	set identity_insert Folder off
	
	commit transaction [FolderTransaction]
end try
begin catch
	rollback transaction [FolderTransaction]
end catch
go