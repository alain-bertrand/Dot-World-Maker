var mysql: mysql = require('mysql');

class Database
{
    private connection: Connection;

    public beginTransaction()
    {
        return new Promise((ok, err) =>
        {
            this.connection.beginTransaction((resError) =>
            {
                if (resError)
                    err(resError);
                else
                    ok();
            });
        });
    }

    public commit()
    {
        return new Promise((ok, err) =>
        {
            this.connection.commit((resError) =>
            {
                if (resError)
                    err(resError);
                else
                    ok();
            });
        });
    }

    public rollback()
    {
        return new Promise((ok, err) =>
        {
            this.connection.rollback((resError) =>
            {
                if (resError)
                    err(resError);
                else
                    ok();
            });
        });
    }

    public constructor(connection: Connection)
    {
        this.connection = connection;
    }

    public query(sql: string, params?: any[]): Promise<any>
    {
        return new Promise((ok, err) =>
        {
            this.connection.query(sql, params, (resErr, result) =>
            {
                if (resErr)
                    err(resErr);
                ok(result);
            });
        });
    }

    public end()
    {
        this.connection.end();
    }

    public connect(): Promise<unknown>
    {
        return new Promise((ok, err) =>
        {
            this.connection.connect({}, err);
            ok();
        });
    }
}

function getDb(): Database
{
    try
    {
        var conn = mysql.createConnection({
            host: packageJson.config.dbhost,
            port: packageJson.config.dbport ? packageJson.config.dbport : 3306,
            user: packageJson.config.dbuser,
            password: packageJson.config.dbpass,
            database: packageJson.config.dbname,
            insecureAuth: true
        });
        conn.on("error", function (err)
        {

        });
        return new Database(conn);
    }
    catch (ex)
    {
        return null;
    }
}

function getDbConfig(host: string, port: number, user: string, password: string, dbname: string = null): Database
{
    try
    {
        var conn = mysql.createConnection({
            host: host,
            port: port,
            user: user,
            password: password,
            insecureAuth: true,
            database: dbname
        });
        conn.on("error", function (err)
        {
            console.log(err);
        });
        return new Database(conn);
    }
    catch (ex)
    {
        return null;
    }
}

