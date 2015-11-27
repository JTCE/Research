
# Add tablenames to the "$tables" array in the order they should be created.
$tables = @(
	"dbo.Persoon",
	"dbo.Settings",
	"dbo.SmsStatus",
	"dbo.Sms"
)

# Create a table if it does not exist.
# It expects the "create scripts" to be located in a subfolder "Tables".
function CreateTable
{
	[string]$table = $args[0]
	[string]$file = "{0}\Tables\{1}.sql" -f $PSScriptRoot, $table
	Echo("create table {0}" -f $table) 
	Invoke-Sqlcmd -ServerInstance "(localdb)\v11.0" -Database "Arbois_MA" -InputFile $file
}

# Drop a table if it exists.
function DropTable
{
	[string]$table = $args[0]
	[string]$query = "if object_id('{0}') is not null begin drop table {0} end" -f $table
	Echo("drop table {0}" -f $table) 
	Invoke-Sqlcmd -ServerInstance "(localdb)\v11.0" -Database "Arbois_MA" -Query $query
}

function DropTables
{
	$reverseTable = $tables.Clone()
	[array]::Reverse($reverseTable)
	foreach ($table in $reverseTable) {
	   DropTable $table
	}	
}

function CreateTables {
	foreach ($table in $tables) {
	   CreateTable $table
	}
}

DropTables
CreateTables
