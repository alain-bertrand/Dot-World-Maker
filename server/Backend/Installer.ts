/// <reference path="../app.ts" />
/// <reference path="Database.ts" />

app.post('/backend/MustInstall', async function (req, res, next)
{
    res.writeHead(200, { 'Content-Type': 'text/json' });
    if (fs.existsSync(__dirname + "/must_install.txt"))
        res.write(JSON.stringify("must"));
    else
        res.write(JSON.stringify("noneed"));
    res.end();
});

app.post('/backend/CheckConfigJson', async function (req, res, next)
{
    if (!fs.existsSync(__dirname + "/must_install.txt"))
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: installer already run"));
        res.end();
    }

    try
    {
        fs.writeFileSync(__dirname + "/touch_test.txt", "works");
        fs.unlinkSync(__dirname + "/touch_test.txt");

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("allfine"));
        res.end();
    }
    catch (ex)
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("norights"));
        res.end();
    }
});

app.post('/backend/CheckMysql', async function (req, res, next)
{
    if (!fs.existsSync(__dirname + "/must_install.txt"))
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: installer already run"));
        res.end();
    }

    var host = req.body.host;
    var port = parseInt(req.body.port);
    var user = req.body.user;
    var password = req.body.password;
    var dbname = req.body.dbname;

    var connection = getDbConfig(host, (isNaN(port) || !port) ? 3306 : port, user, password);
    try
    {
        await connection.connect();
        await connection.query("SHOW DATABASES");
        await connection.query("CREATE DATABASE dwm812712912");
        await connection.query("DROP DATABASE dwm812712912");
    }
    catch (ex)
    {
        connection.end();
        if (ex.code == 'ECONNREFUSED')
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify("nodb"));
            res.end();
            return;
        }
        else if (ex.code == 'ER_ACCESS_DENIED_ERROR')
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify("wrongpass"));
            res.end();
            return;
        }
        else if (ex.code == 'ER_DBACCESS_DENIED_ERROR')
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify("norights"));
            res.end();
            return;
        }
        else
            console.log(ex);
    }

    try
    {
        await connection.query("USE " + dbname.replace(/[' `]/g, ""));
        var result = await connection.query("SHOW TABLES");

        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });

        if (result.length)
            res.write(JSON.stringify("dbnotempty"));
        else
            res.write(JSON.stringify("allok"));
        res.end();
    }
    catch (ex)
    {
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("allok"));
        res.end();
    }
});

app.post('/backend/SetupMysql', async function (req, res, next)
{
    if (!fs.existsSync(__dirname + "/must_install.txt"))
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: installer already run"));
        res.end();
    }

    var host = req.body.host;
    var port = parseInt(req.body.port);
    var user = req.body.user;
    var password = req.body.password;
    var dbname = req.body.dbname;
    var dbuser = req.body.dbuser;
    var dbpassword = req.body.dbpassword;

    //CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
    //GRANT ALL PRIVILEGES ON DWM.* TO 'newuser'@'localhost';


    var connection = getDbConfig(host, (isNaN(port) || !port) ? 3306 : port, user, password);
    try
    {
        await connection.connect();

        try
        {
            await connection.query("CREATE DATABASE " + dbname.replace(/[' `]/g, ""));
        }
        catch (ex2)
        {
            if (ex2.code != "ER_DB_CREATE_EXISTS")
                throw ex2;
        }

        if (dbuser != user)
        {
            try
            {
                if (dbpassword.trim() == "")
                    await connection.query("CREATE USER ?@'localhost'", [dbuser]);
                else
                    await connection.query("CREATE USER ?@'localhost' IDENTIFIED BY ?", [dbuser, dbpassword]);
            }
            catch (ex2)
            {
            }

            try
            {
                await connection.query("GRANT ALL PRIVILEGES ON " + dbname.replace(/[' `]/g, "") + ".* TO ?@'localhost'", [dbuser]);
            }
            catch (ex2)
            {
            }
        }
        await connection.query("USE " + dbname.replace(/[' `]/g, ""));

        if (fs.existsSync(__dirname + "/tables.txt"))
            var sql: string = fs.readFileSync(__dirname + "/tables.txt", "ascii");
        else
            var sql: string = fs.readFileSync(__dirname + "/server/tables.txt", "ascii");
        var lines = sql.replace(/\r/g, "").split(";\n");
        for (var i = 0; i < lines.length; i++)
        {
            if (lines[i].trim() == "") // skip empty lines
                continue;
            await connection.query(lines[i]);
        }

        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("allok"));
        res.end();
    }
    catch (ex)
    {
        console.log(ex);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: " + ex));
        res.end();
    }
});

app.post('/backend/SetupJson', async function (req, res, next)
{
    if (!fs.existsSync(__dirname + "/must_install.txt"))
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: installer already run"));
        res.end();
    }

    var host = req.body.host;
    var port = parseInt(req.body.port);
    var dbname = req.body.dbname;
    var dbuser = req.body.dbuser;
    var dbpassword = req.body.dbpassword;

    try
    {
        var possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+*%&()=${}[]!<>,;.:-_";

        packageJson.config.dbhost = host;
        packageJson.config.dbport = isNaN(port) ? 3306 : port;;
        packageJson.config.dbuser = dbuser;
        packageJson.config.dbpass = dbpassword;
        packageJson.config.dbname = dbname;

        packageJson.config.email_user = req.body.email_user;
        packageJson.config.email_pass = req.body.email_pass;
        packageJson.config.email_server = req.body.email_server;

        var randomString = "";
        for (var i = 0; i < 30; i++)
            randomString += possibleChars.charAt(Math.ceil(Math.random() * possibleChars.length));

        packageJson.config.fixedHashSalt = randomString;

        fs.writeFileSync(__dirname + "/package.json", JSON.stringify(packageJson, null, 2));


        var connection = getDbConfig(host, (isNaN(port) || !port) ? 3306 : port, dbuser, dbpassword, dbname);
        await connection.connect();

        await connection.query("update users set name = ?, password = ? where id=1", [req.body.admin_user, "*" + req.body.admin_password]);

        try
        {
            fs.unlink(__dirname + "/must_install.txt");
        }
        catch (ex2)
        {
            console.log(ex2);
        }

        connection.end();

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("allok"));
        res.end();
    }
    catch (ex)
    {
        if (connection)
            connection.end();
        console.log(ex);
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify("error: " + ex));
        res.end();
    }
});