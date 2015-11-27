
if object_id('dbo.Product') is null
begin
	create table dbo.Product
	(
		-- Internal identification. 
		Id int identity(1,1) not null constraint PK_dbo_Product_Id primary key,
		
		-- External identification. 
		Code uniqueidentifier not null constraint UQ_dbo_Product_Code unique(Code)
									   constraint DF_dbo_Product_Code default newid(),
		-- Textual identification.
		Name varchar(255) not null constraint UQ_dbo_Product_Name unique(Name),

		-- Amount of sold products.
		InStock decimal(18,0) not null constraint DF_dbo_Product_InStock default 0
	)
end
go

set nocount on
go
if not exists(select top 1 1 from dbo.Product where Code = '72905AAF-28CE-4234-9D33-239A39E50A33') 
begin
	insert into dbo.Product (Code, Name, InStock) values ('72905AAF-28CE-4234-9D33-239A39E50A33', 'iPhone 6', 100)
end
go
set nocount off
go