
# This sccript requires the system to allow running powershell scripts, when not allowed the following code can be used to allow running powershell scripts.
# Set-ExecutionPolicy RemoteSigned

# The following import statement enables the SQL Server PowerShell cmdlets, like "Invoke-Sqlcmd".
Import-Module SqlPs

$serverInstance = "(localdb)\v11.0"
$database = "App"

# Add tablenames to the "$tables" array in the order they should be created.
$tables = @(
	"dbo.Product"
)

# create database if it does not exist.
function CreateDatabase {
	Echo("create database {0}" -f $database)
	[string]$file = "{0}\Database\Database.sql" -f $PSScriptRoot
}

# Create a table if it does not exist.
# It expects the "create scripts" to be located in a subfolder "Tables".
function CreateTable
{
	[string]$table = $args[0]
	[string]$file = "{0}\Tables\{1}.sql" -f $PSScriptRoot, $table
	Echo("create table {0}" -f $table)
	ExecuteSqlFile($file)
}

function CreateTables {
	foreach ($table in $tables) {
	   CreateTable $table
	}
}

# Drop a table if it exists.
function DropTable
{
	[string]$table = $args[0]
	[string]$query = "if object_id('{0}') is not null begin drop table {0} end" -f $table
	Echo("drop table {0}" -f $table) 
	ExecuteSqlQuery($query)
}

function DropTables
{
	$reverseTable = $tables.Clone()
	[array]::Reverse($reverseTable)
	foreach ($table in $reverseTable) {
	   DropTable($table)
	}	
}

function ExecuteSqlFile {
	[string]$file = $args[0]
	Invoke-Sqlcmd -ServerInstance $serverInstance -Database $database -InputFile $file
}

function ExecuteSqlQuery {
	[string]$query = $args[0]
	Invoke-Sqlcmd -ServerInstance $serverInstance -Database $database -Query $query
}

CreateDatabase
DropTables
CreateTables