USE [msdb]
GO

/****** Object:  Job [Samenvoegen Werkgeverdossier]    Script Date: 11/13/2015 06:57:22 ******/
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
/****** Object:  JobCategory [[Uncategorized (Local)]]]    Script Date: 11/13/2015 06:57:22 ******/
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

END

DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'Samenvoegen Werkgeverdossier', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=0, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'No description available.', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'MA\lisdonkr', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 01 - WGDDocumenten - Folder]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 01 - WGDDocumenten - Folder', 
		@step_id=1, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas foreignkeys in MA aan.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'WGDDocumenten', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 02 - WGDDocumenten - Document]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 02 - WGDDocumenten - Document', 
		@step_id=2, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'
-- Inhoud
-- Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		Bepaal in tijdelijke tabel nieuwe en oude id.
--		Kopieer records uit MA naar nieuwe id.
--		Pas foreignkeys in MA aan.
--		Verwijder oude MA records.
--		Kopieer records 1 op 1 van AV naar MA.
-- Overnemen records die alleen in AV bestaan.

set nocount on

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

use WGDDocumenten

declare @Increment int
declare @MaxId int
declare @MinId int

if object_id(''SV_Log'') is null
begin
	create table SV_Log (
		Id int identity(1, 1) not null,
		DateInserted datetime not null default(getdate()),
		[Message] varchar(max) not null
	)
end

insert into SV_Log ([Message]) values (''Begin van de samenvoeging.'')
alter database WGDDocumenten set recovery simple
insert into SV_Log ([Message]) values (''Recovery model gezet op simpel.'')

set @MaxId = (
	select max(DocumentId) from 
    (
        select max(MA.DocumentId) as DocumentId from Document MA with (nolock)
        union 
        select max(AV.DocumentId) as DocumentId from [93_WGD].WGDDocumenten.dbo.Document AV with (nolock)
    ) t 
)
insert into SV_Log ([Message]) values (''MaxId ['' + cast(isnull(@MaxId, 0) as varchar(50)) + ''] bepaalt.'')
	
declare @backlog table
(
	DocumentIdOldMA int,
	DocumentIdNewMA int
)

insert into @backlog (DocumentIdOldMA, DocumentIdNewMA)
select	x.DocumentId as DocumentIdOldMA,
		row_number() over (order by x.DocumentId) + @MaxId as DocumentIdNewMA
from (
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		[93_WGD].WGDDocumenten.dbo.document AV with (nolock)
	except
	-- Records die geheel gelijk zijn nietovernemen.
	-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid) as werkgeverid, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		document MA with (nolock)
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
	except
	-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
	select		documentid, naam collate Latin1_General_BIN2 as naam, omvang, werkgevertype, svm.Oude_WGV_ID, contactId, datumUpload, folderId, creator collate Latin1_General_BIN2 as creator
	from		document MA with (nolock)
	join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
) x
order by x.DocumentId
insert into SV_Log ([Message]) values (''Aantal te behandelen records ['' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) +  ''].'')

set identity_insert Document on

select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin	
	insert into Document (documentid, naam, omvang, document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator)
	select	b.DocumentIdNewMA, naam, omvang, document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator
	from	@backlog b
	join	Document MA on b.DocumentIdOldMA = MA.DocumentId
	where	MA.documentid between @MinId and @MinId + @Increment
	insert into SV_Log ([Message]) values (''Aantal records uit MA naar nieuwe ID overgezet ['' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + ''] huidige min_id ['' + cast(isnull(@MinId, 0) as varchar(50)) + ''].'')
			
	set @MinId = @MinId + @Increment + 1
end
	
-- Pas foreignkeys in MA aan.
-- N.V.T.
		
delete	x
from	@backlog b
join	Document x with (nolock) on b.DocumentIdOldMA = x.DocumentId
insert into SV_Log ([Message]) values (''Aantal records verwijderd uit MA ['' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + ''] huidige min_id ['' + cast(isnull(@MinId, 0) as varchar(50)) + ''].'')

select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin	
	insert into Document (documentid, naam,	omvang,	document, werkgevertype, werkgeverid, contactId, datumUpload, folderId, creator)
	select		AV.documentid, AV.naam, AV.omvang, AV.document, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.contactId, AV.datumUpload, AV.folderId, AV.creator
	from		@backlog b
	join		[93_WGD].WGDDocumenten.dbo.Document AV with (nolock) on b.DocumentIdOldMA = AV.DocumentId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		AV.documentid between @MinId and @MinId + @Increment
	insert into SV_Log ([Message]) values (''Aantal records overgezet die zowel in MA als AV voorkwamen ['' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + ''] huidige min_id ['' + cast(isnull(@MinId, 0) as varchar(50)) + ''].'')
		
	set @MinId = @MinId + @Increment + 1
end
	
select 	  @MinId = min(AV.documentid) 
		, @MaxId = max(AV.documentid)
		, @Increment = 10000
from	[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)

while (@MinId <= @MaxId)
begin
	insert into Document (documentid, naam, omvang, document, werkgevertype, WerkgeverId, contactId, datumUpload, folderId, creator)
	select		AV.documentid, AV.naam, AV.omvang, AV.document, AV.werkgevertype, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.contactId, AV.datumUpload, AV.folderId, AV.creator
	from		[93_WGD].WGDDocumenten.dbo.Document AV with (nolock)
	left join	Document MA with (nolock) on AV.DocumentId = MA.DocumentId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.DocumentId is null
	and			(AV.documentid between @MinId and @MinId + @Increment)
	insert into SV_Log ([Message]) values (''Aantal records overgezet die alleen in AV voorkwamen ['' + cast(isnull(@@ROWCOUNT, 0) as varchar(50)) + ''] huidige min_id ['' + cast(isnull(@MinId, 0) as varchar(50)) + ''].'')
		
	set @MinId = @MinId + @Increment + 1
end

set identity_insert Document off

alter database WGDDocumenten set recovery simple
insert into SV_Log ([Message]) values (''Recovery model gezet op full.'')', 
		@database_name=N'WGDDocumenten', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 03 - Werkgeverdossier - Lookup]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 03 - Werkgeverdossier - Lookup', 
		@step_id=3, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas foreignkeys in MA aan.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

set nocount on
go

use Werkgeverdossier
go


go

begin transaction [LookupTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(LookupId) from 
            (
                select max(MA.LookupId) as LookupId from [Lookup] MA with (nolock)
                union 
                select max(AV.LookupId) as LookupId from [93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		LookupIdOldMA int,
		LookupIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (LookupIdOldMA, LookupIdNewMA)
	select	x.LookupId as LookupIdOldMA,
			row_number() over (order by x.LookupId) + @MaxId as LookupIdNewMA
	from (
		select * from [93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
		except
		select * from [Lookup] MA with (nolock)
	) x
	order by x.LookupId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert [Lookup] on
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select	b.LookupIdNewMA, listCode, listDescription, datumVan, datumTot
	from	@backlog b
	join	[Lookup] x on b.LookupIdOldMA = x.LookupId
	
	-- 1d. Pas foreignkeys in MA aan.
	update	x set x.ConcurentId = b.LookupIdNewMA from	@backlog b join	CommercieelTraject x with (nolock) on b.LookupIdOldMA = x.ConcurentId
	update	x set x.StatusId = b.LookupIdNewMA from	@backlog b join	CommercieelTraject x with (nolock) on b.LookupIdOldMA = x.StatusId
	update	x set x.ConcurentId = b.LookupIdNewMA from	@backlog b join	CommercieelTrajectDeleted x with (nolock) on b.LookupIdOldMA = x.ConcurentId
	update	x set x.RedenId = b.LookupIdNewMA from	@backlog b join	RedenAfsluiting x with (nolock) on b.LookupIdOldMA = x.RedenId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	[Lookup] x with (nolock) on b.LookupIdOldMA = x.LookupId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock) on b.LookupIdOldMA = AV.LookupId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into [Lookup] (lookupId, listCode, listDescription, datumVan, datumTot)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.[Lookup] AV with (nolock)
	left join	[Lookup] MA with (nolock) on AV.LookupId = MA.LookupId
	where		MA.LookupId is null
	
	set identity_insert [Lookup] off

	commit transaction [LookupTransaction]
end try
begin catch
	rollback transaction [LookupTransaction]
end catch
go
', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 04 - Werkgeverdossier - RedenAfsluiting]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 04 - Werkgeverdossier - RedenAfsluiting', 
		@step_id=4, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas foreignkeys in MA aan.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 05 - Werkgeverdossier - CommercieelTrajectOpmerking]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 05 - Werkgeverdossier - CommercieelTrajectOpmerking', 
		@step_id=5, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 06 - Werkgeverdossier - CommercieelTraject]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 06 - Werkgeverdossier - CommercieelTraject', 
		@step_id=6, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 07 - Werkgeverdossier - CommercieelTrajectDeleted]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 07 - Werkgeverdossier - CommercieelTrajectDeleted', 
		@step_id=7, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

set nocount on
go

use Werkgeverdossier
go

begin transaction [CTDTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(CommercieelTrajectId) from 
            (
                select max(MA.CommercieelTrajectId) as CommercieelTrajectId from CommercieelTrajectDeleted MA with (nolock)
                union 
                select max(AV.CommercieelTrajectId) as CommercieelTrajectId from [93_WGD].Werkgeverdossier.dbo.CommercieelTrajectDeleted AV with (nolock)
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
		select CommercieelTrajectId, werkgeverId, beginDatum from [93_WGD].Werkgeverdossier.dbo.CommercieelTrajectDeleted AV with (nolock)
		except
		-- Records die geheel gelijk zijn niet overnemen.
		-- Behalve als de AV.Werkgeverid in de [mapping] tabel voorkomt.
		select CommercieelTrajectId, isnull(svm.Nieuwe_WGV_ID, MA.werkgeverid), beginDatum from CommercieelTrajectDeleted MA with (nolock)
		left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Oude_WGV_ID
		except
		-- Behalve als het record al een keer eerder is overgenomen (t.b.v. meerdere keren draaien van dit script).
		select		CommercieelTrajectId, werkgeverId, beginDatum
		from		CommercieelTrajectDeleted MA with (nolock)
		join		[Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on MA.WerkgeverId = svm.Nieuwe_WGV_ID
	) x
	order by x.CommercieelTrajectId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert CommercieelTrajectDeleted on
	insert into CommercieelTrajectDeleted (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar, DeleteDatum, DeleteDoor)
	select	b.CommercieelTrajectIdNewMA, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar, DeleteDatum, DeleteDoor
	from	@backlog b
	join	CommercieelTrajectDeleted x on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	CommercieelTrajectDeleted x with (nolock) on b.CommercieelTrajectIdOldMA = x.CommercieelTrajectId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into CommercieelTrajectDeleted (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar, DeleteDatum, DeleteDoor)
	select		AV.commercieelTrajectId, AV.userId, AV.onderwerp, AV.dealGrootte, AV.slagingsPercentageId, AV.CAMVolume, AV.aantalMedewerkers, AV.doorloopTijd, AV.beginDatum, AV.eindDatum, AV.verzendDatumOfferte, AV.ontvangstDatumOfferte, AV.beginDatumContract, AV.statusId, AV.concurentId, AV.werkgevertypeId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.KlantEigenaar, AV.DeleteDatum, AV.DeleteDoor
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.CommercieelTrajectDeleted AV with (nolock) on b.CommercieelTrajectIdOldMA = AV.CommercieelTrajectId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID

	-- 2. Overnemen records die alleen in AV bestaan.
	insert into CommercieelTrajectDeleted (commercieelTrajectId, userId, onderwerp, dealGrootte, slagingsPercentageId, CAMVolume, aantalMedewerkers, doorloopTijd, beginDatum, eindDatum, verzendDatumOfferte, ontvangstDatumOfferte, beginDatumContract, statusId, concurentId, werkgevertypeId, werkgeverId, KlantEigenaar, DeleteDatum, DeleteDoor)
	select		AV.commercieelTrajectId, AV.userId, AV.onderwerp, AV.dealGrootte, AV.slagingsPercentageId, AV.CAMVolume, AV.aantalMedewerkers, AV.doorloopTijd, AV.beginDatum, AV.eindDatum, AV.verzendDatumOfferte, AV.ontvangstDatumOfferte, AV.beginDatumContract, AV.statusId, AV.concurentId, AV.werkgevertypeId, isnull(svm.Nieuwe_WGV_ID, AV.werkgeverid) as WerkgeverId, AV.KlantEigenaar, AV.DeleteDatum, AV.DeleteDoor
	from		[93_WGD].Werkgeverdossier.dbo.CommercieelTrajectDeleted AV with (nolock)
	left join	CommercieelTrajectDeleted MA with (nolock) on AV.CommercieelTrajectId = MA.CommercieelTrajectId
	left join   [Arbois_AV].[dbo].[SV_MappingWGV_ID] svm with (nolock) on AV.WerkgeverId = svm.Oude_WGV_ID
	where		MA.CommercieelTrajectId is null
	
	set identity_insert CommercieelTrajectDeleted off

	commit transaction [CTDTransaction]
end try
begin catch
	rollback transaction [CTDTransaction]
end catch
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 08 - Werkgeverdossier - Communicatiematrix]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 08 - Werkgeverdossier - Communicatiematrix', 
		@step_id=8, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 09 - Werkgeverdossier - Contact]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 09 - Werkgeverdossier - Contact', 
		@step_id=9, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 10 - Werkgeverdossier - DocumentUserInput]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 10 - Werkgeverdossier - DocumentUserInput', 
		@step_id=10, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

set nocount on
go

use Werkgeverdossier
go

begin transaction [DocumentUserInputTransaction]
begin try

	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(DocumentUserInputId) from 
            (
                select max(MA.DocumentUserInputId) as DocumentUserInputId from DocumentUserInput MA with (nolock)
                union 
                select max(AV.DocumentUserInputId) as DocumentUserInputId from [93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		DocumentUserInputIdOldMA int,
		DocumentUserInputIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (DocumentUserInputIdOldMA, DocumentUserInputIdNewMA)
	select	x.DocumentUserInputId as DocumentUserInputIdOldMA,
			row_number() over (order by x.DocumentUserInputId) + @MaxId as DocumentUserInputIdNewMA
	from (
		select	documentUserInputId,
				[guid] collate Latin1_General_BIN2 as [guid],
				docName collate Latin1_General_BIN2 as docName,
				fieldName collate Latin1_General_BIN2 as fieldName,
				fieldValue collate Latin1_General_BIN2 as fieldValue
		from	[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
		except
		select	documentUserInputId,
				[guid] collate Latin1_General_BIN2 as [guid],
				docName collate Latin1_General_BIN2 as docName,
				fieldName collate Latin1_General_BIN2 as fieldName,
				fieldValue collate Latin1_General_BIN2 as fieldValue
		from DocumentUserInput MA with (nolock)
	) x
	order by x.DocumentUserInputId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert DocumentUserInput on
	insert into DocumentUserInput (documentUserInputId, [guid], docName, fieldName, fieldValue)
	select	b.DocumentUserInputIdNewMA, [guid], docName, fieldName, fieldValue
	from	@backlog b
	join	DocumentUserInput x on b.DocumentUserInputIdOldMA = x.DocumentUserInputId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	-- N.V.T.
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	DocumentUserInput x with (nolock) on b.DocumentUserInputIdOldMA = x.DocumentUserInputId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into DocumentUserInput (documentUserInputId, guid, docName, fieldName, fieldValue)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock) on b.DocumentUserInputIdOldMA = AV.DocumentUserInputId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into DocumentUserInput (documentUserInputId, guid, docName, fieldName, fieldValue)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
	left join	DocumentUserInput MA with (nolock) on AV.DocumentUserInputId = MA.DocumentUserInputId
	where		MA.DocumentUserInputId is null
	
	set identity_insert DocumentUserInput off

	commit transaction [DocumentUserInputTransaction]
end try
begin catch
	rollback transaction [DocumentUserInputTransaction]
end catch
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 11 - Werkgeverdossier - Memo]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 11 - Werkgeverdossier - Memo', 
		@step_id=11, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 12 - Werkgeverdossier - Opmerking]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 12 - Werkgeverdossier - Opmerking', 
		@step_id=12, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 13 - Werkgeverdossier - Taak]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 13 - Werkgeverdossier - Taak', 
		@step_id=13, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

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
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Step 14 - Werkgeverdossier - TrajectStatus]    Script Date: 11/13/2015 06:57:23 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Step 14 - Werkgeverdossier - TrajectStatus', 
		@step_id=14, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'-- Inhoud
-- 1. Records die voorkomen in MA en AV, maar verschillen op bepaalde NIET primairy key kolommen, overzetten.
--		1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
--		1b. Bepaal in tijdelijke tabel nieuwe en oude id.
--		1c. Kopieer records uit MA naar nieuwe id.
--		1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
--		1e. Verwijder oude MA records.
--		1f. Kopieer records 1 op 1 van AV naar MA.
-- 2.	Overnemen records die alleen in AV bestaan.

use master
exec sp_serveroption ''93_WGD'', ''collation compatible'', ''false''
exec sp_serveroption ''93_WGD'', ''use remote collation'', ''false''
exec sp_serveroption ''93_WGD'', ''collation name'', ''Latin1_General_BIN2''

set nocount on
go

use Werkgeverdossier
go

begin transaction [TrajectStatusTransaction]
begin try
		
	-- 1a. Bepaal max id in beide databases, zodat er correct plek gemaakt kan worden voor de AV records.
	declare @MaxId int = (
			select max(TrajectStatusId) from 
            (
                select max(MA.TrajectStatusId) as TrajectStatusId from TrajectStatus MA with (nolock)
                union 
                select max(AV.TrajectStatusId) as TrajectStatusId from [93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
            ) t 
        ) 	
	
	declare @backlog table
	(
		TrajectStatusIdOldMA int,
		TrajectStatusIdNewMA int
	)
	
	-- 1b. Bepaal in tijdelijke tabel nieuwe en oude id.
	insert into @backlog (TrajectStatusIdOldMA, TrajectStatusIdNewMA)
	select	x.TrajectStatusId as TrajectStatusIdOldMA,
			row_number() over (order by x.TrajectStatusId) + @MaxId as TrajectStatusIdNewMA
	from (
		select * from [93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
		except
		select * from TrajectStatus MA with (nolock)
	) x
	order by x.TrajectStatusId

	-- 1c. Kopieer records uit MA naar nieuwe id.
	set identity_insert TrajectStatus on
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select	b.TrajectStatusIdNewMA, omschrijving
	from	@backlog b
	join	TrajectStatus x on b.TrajectStatusIdOldMA = x.TrajectStatusId
	
	-- 1d. Pas tabellen in MA aan die foreignkeys hebben naar de huidige tabel.
	update	x set x.statusId = b.TrajectStatusIdNewMA from	@backlog b join	commercieelTraject x with (nolock) on b.TrajectStatusIdOldMA = x.commercieelTrajectId
		
	-- 1e. Verwijder oude MA records.
	delete	x
	from	@backlog b
	join	TrajectStatus x with (nolock) on b.TrajectStatusIdOldMA = x.TrajectStatusId
	
	-- 1f. Kopieer records van AV naar MA.
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select	AV.*
	from	@backlog b
	join	[93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock) on b.TrajectStatusIdOldMA = AV.TrajectStatusId
	
	-- 2. Overnemen records die alleen in AV bestaan.
	insert into TrajectStatus (trajectStatusId, omschrijving)
	select		AV.*
	from		[93_WGD].Werkgeverdossier.dbo.TrajectStatus AV with (nolock)
	left join	TrajectStatus MA with (nolock) on AV.TrajectStatusId = MA.TrajectStatusId
	where		MA.TrajectStatusId is null
	
	set identity_insert TrajectStatus off

	commit transaction [TrajectStatusTransaction]
end try
begin catch
	rollback transaction [TrajectStatusTransaction]
end catch
go', 
		@database_name=N'Werkgeverdossier', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:

GO


