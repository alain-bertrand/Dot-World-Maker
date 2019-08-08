var mysql: mysql = require('mysql');

class Database
{
    private connection: Connection;

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
            this.connection.connect(err);
            ok();
        });
    }
}

function getDb(): Database
{
    return new Database(getConnection());
}

function getConnection(): Connection
{
    try
    {
        var conn = mysql.createConnection({
            host: packageJson.config.dbhost,
            user: packageJson.config.dbuser,
            password: packageJson.config.dbpass,
            database: packageJson.config.dbname,
            insecureAuth: true
        });
        conn.on("error", function (err)
        {

        });
        return conn;
    }
    catch (ex)
    {
        return null;
    }
}
