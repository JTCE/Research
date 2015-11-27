
-- Selecteer alle kolomnamen van de gegeven tabel.
-- Kan onder andere gebruikt worden voor het maken van insert statements.
declare	@SQL nvarchar(max) = ''
declare	@table nvarchar(max) = 'Folder'
select	@SQL = @SQL + sc.name + ', '
from	sys.objects so
join	sys.columns sc on sc.object_id = so.object_id
where	so.name = @table
select  left(@SQL, len(@SQL) - 1)


