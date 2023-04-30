# SC2IQ

## Setup Local Prisma Database Server

- https://remix.run/docs/en/1.15.0/tutorials/jokes#set-up-prisma
- https://www.prisma.io/docs/concepts/database-connectors/sql-server


[Prisma Docker Docs](https://www.prisma.io/docs/concepts/database-connectors/sql-server/sql-server-docker)

```
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=<YourStrong@Passw0rd>' -p 1433:1433 --name sql1 -d mcr.microsoft.com/mssql/server:2019-latest
```

```
docker exec -it sql1 "bash"
```

```
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "<YourStrong@Passw0rd>"
```

```
CREATE DATABASE schultztables
GO
```

```
npx prism db push
```

## Use Prisma to execute command against DB

<https://www.prisma.io/docs/reference/api-reference/command-reference#db-execute>

```
prisma db execute --file ./prisma/scripts/create-dbs.sql
```
