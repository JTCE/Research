
-- This script selects all the records that do diff.
(
	select * from Table1
	except
	select * from Table2
)
union all
(
	select * from Table2
	except
	select * from Table1
)

-- Praktijk voorbeeld met linked server.
(
	select * from DocumentUserInput with (nolock)
	except
	select * from [93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
)
union all
(
	select * from [93_WGD].Werkgeverdossier.dbo.DocumentUserInput AV with (nolock)
	except
	select * from DocumentUserInput with (nolock)
)