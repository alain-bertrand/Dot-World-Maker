var mysql: mysql = require('mysql');

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
