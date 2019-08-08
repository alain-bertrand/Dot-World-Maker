///<reference path="../app.ts" />

var currentTokens: TokenEntry = {};

function BuildToken(id: number, username: string, ip: string)
{
    if (!ip)
        ip = '127.0.0.1';
    if (ip && ip.endsWith('127.0.0.1'))
        ip = '::1';
    var dt = new Date();
    var token = md5("" + id + "-" + username.toLowerCase() + "-" + dt.toString());

    currentTokens[token] = { id: id, lastUsage: new Date(), user: username, ip: ip };

    return { token: token };
}

function GetTokenInformation(token: string, ip: string)
{
    var now = (new Date());
    if (ip.endsWith('127.0.0.1'))
        ip = '::1';

    // Check all the tokens
    var toDelete: string[] = [];
    for (var i in currentTokens)
    {
        if ((now.getTime() - currentTokens[i].lastUsage.getTime()) > 60000 * 5)
            toDelete.push(i);
    }

    // Removes the one which are too old
    for (var j = 0; j < toDelete.length; j++)
        delete currentTokens[toDelete[j]];

    if (currentTokens[token] && currentTokens[token].ip == ip && (now.getTime() - currentTokens[token].lastUsage.getTime()) < 60000 * 5)
    {
        currentTokens[token].lastUsage = now;
        return currentTokens[token];
    }
    else if (currentTokens[token] && currentTokens[token].ip != ip)
        console.log("Wrong ip: " + currentTokens[token].ip + ", " + ip);
    else if (currentTokens[token] && (now.getTime() - currentTokens[token].lastUsage.getTime()) < 60000 * 5)
        console.log("Timeout...");
    else
        console.log("Token not found");
    return null;
}

app.post('/backend/RecoverPassword', async function (req, res, next)
{
    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("User is missing.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r1 = await connection.query('select id,email from users where name = ?', [req.body.user]);
        // Not yet registered
        if (r1.length == 0 || !r1[0].email)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("User not found or it doesn't have an email.");
            res.end();
            return;
        }

        var email = r1[0].email;
        var id = r1[0].id;
        var key = md5(email + "SomethingPrr1vat3T0mak3ItH@rd" + r1[0].id + ((new Date()).toLocaleTimeString()) + Math.round(Math.random() * Number.MAX_VALUE));

        await connection.query('update users set random_reset_key=?, reset_valid_till=? where id = ?', [key, new Date(new Date().getTime() + 3600000), id]);
        connection.end();

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("EMail sent.");
        res.end();

        var email = require("emailjs");
        var server = email.server.connect({
            user: packageJson.config.email_user,
            password: packageJson.config.email_pass,
            host: packageJson.config.email_server,
            ssl: true
        });

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        server.send({
            text: "Dot World Maker - Password recovery\nTo recover your account please open this link:\nhttps://www.dotworldmaker.com/Home/recover_password.html?key=" + key + "&id=" + id,
            from: "no-reply@dotworldmaker.com",
            to: r1[0].email,
            subject: "Dot World Maker - Password recovery"
        }, (err3, message) =>
            {
                if (err3)
                    console.log(err3);
            });
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/GetRoles', async function (req, res, next)
{

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        await connection.connect();

        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        var result: number[] = [];
        if (r1 && r1.length > 0) for (var i = 0; i < r1.length; i++)
            result.push(r1[i].access_right_id);
        res.write(JSON.stringify(result));
        res.end();
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/HasRole', async function (req, res, next)
{

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }

    if (!req.body.role)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("role is missing.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var access: number = 0;
        switch (("" + req.body.role).toLowerCase())
        {
            case "admin":
            case "game admin":
                access = 100;
                break;
            case "moderator":
            case "chat moderator":
                access = 10;
                break;
        }

        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ? and access_right_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, access, tokenInfo.id]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        if (!r1 || !r1.length)
            res.write(JSON.stringify(false));
        else
            res.write(JSON.stringify(true));
        res.end();
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/ChatBan', async function (req, res, next)
{

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }

    if (!req.body.username)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("username is missing.");
        res.end();
        return;
    }

    if (!req.body.days)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("days is missing.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "no write access." }));
            res.end();
            return;
        }

        var r2 = await connection.query('select data from game_player where game_id = ? and user_id in (select id from users where name = ?)', [req.body.game, req.body.username]);
        // Not yet registered
        if (r2.length != 1)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify({ error: "User not found." }));
            res.end();
            return;
        }

        var data: PlayerSerialization = JSON.parse(r2[0].data);
        data.chatBannedTill = new Date((new Date()).getTime() + parseInt(req.body.days) * 24 * 3600 * 1000);
        ChatSendTo(parseInt(req.body.game), req.body.username, "ban", data.chatBannedTill);

        var r3 = await connection.query('update game_player set data = ? where  game_id = ? and user_id in (select id from users where name = ?)', [JSON.stringify(data), req.body.game, req.body.username]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify(true));
        res.end();
        return;
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/ChatMute', async function (req, res, next)
{

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("game is missing.");
        res.end();
        return;
    }

    if (!req.body.username)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("username is missing.");
        res.end();
        return;
    }

    if (!req.body.minutes)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("minutes is missing.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        await connection.connect();

        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "no write access." }));
            res.end();
            return;
        }

        var r2 = await connection.query('select data from game_player where game_id = ? and user_id in (select id from users where name = ?)', [req.body.game, req.body.username]);

        // Not yet registered
        if (r2.length != 1)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify({ error: "User not found." }));
            res.end();
            return;
        }

        var data: PlayerSerialization = JSON.parse(r2[0].data);
        data.chatMutedTill = new Date((new Date()).getTime() + parseInt(req.body.minutes) * 60 * 1000);
        ChatSendTo(parseInt(req.body.game), req.body.username, "mute", data.chatMutedTill);

        var r3 = await connection.query('update game_player set data = ? where  game_id = ? and user_id in (select id from users where name = ?)', [JSON.stringify(data), req.body.game, req.body.username]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify(true));
        res.end();
        return;
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/ResetPassword', async function (req, res, next)
{
    if (!req.body.key)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Key is missing.");
        res.end();
        return;
    }

    if (!req.body.id)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Id is missing.");
        res.end();
        return;
    }

    if (!req.body.password)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("password is missing.");
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    try
    {
        connection.connect();

        var r1 = await connection.query('select random_reset_key,reset_valid_till from users where id = ?', [req.body.id]);
        // Not yet registered
        if (r1.length == 0 || !r1[0].random_reset_key)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Operation is not allowed sorry.");
            res.end();
            return;
        }

        if (r1[0].random_reset_key != req.body.key || new Date(r1[0].reset_valid_till).getTime() < new Date().getTime())
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Operation is not allowed sorry.");
            res.end();
            return;
        }

        await connection.query('update users set random_reset_key = null, reset_valid_till = null, password = ? where id = ? and random_reset_key = ?', ["*" + req.body.password, req.body.id, req.body.key]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("Password has been reset. You can now log-in.");
        res.end();
        return;
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Error with database.");
        res.end();
        return;
    }
});

app.post('/backend/ChangePassword', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }

    if (!req.body.password)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("password is missing.");
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }

        connection.query('update users set password = ? where id = ?', ["*" + req.body.password, tokenInfo.id], function (err2, r2)
        {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write("Password has been changed.");
            res.end();
            return;
        });
    });
});

app.post('/backend/UserInfo', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify({ error: "Token is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify({ error: "Connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify({ error: "Error with database." }));
            res.end();
            return;
        }

        connection.query('select users.name, users.email, editor_version, (select count(id) from games where main_owner = ?) "nb", credits from users where id = ?', [tokenInfo.id, tokenInfo.id], function (err2, r2)
        {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            if (r2 && r2.length)
                res.write(JSON.stringify(r2[0]));
            else
                res.write(JSON.stringify(null));
            res.end();
            return;
        });
    });
});

app.post('/backend/VerifyToken', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var t = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify({ valid: (t ? true : false), username: (t ? t.user : null) }));
    res.end();
});

app.post('/backend/UserExists', function (req, res, next)
{
    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from users where name = ?', [req.body.user], function (err1, r1)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0)
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ result: false }));
                res.end();
                return;
            }
            else
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ result: true }));
                res.end();
                return;
            }
        });
    });
});

app.post('/backend/RegisterUser', function (req, res, next)
{
    var reserved = ["root", "admin", "administrator", "boss", "master", "moderator", "helper"];

    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.password)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'password' is missing." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    var username = req.body.user.trim();
    if (username.replace(/[a-z0-9]+/gi, "").length > 0 || reserved.indexOf(username.trim().toLowerCase()) != -1)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid username." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from users where name = ?', [username], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0)
            {
                connection.query('insert users(name,password,email) values(?,?,?)', [username, HashPassword(req.body.user, req.body.password), req.body.email], function (err, results)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(BuildToken(results.insertId, req.body.user, req.headers['x-forwarded-for'] || req.connection.remoteAddress)));
                    res.end();
                    return;
                });
            }
            else
            {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "user already exists." }));
                res.end();
                return;
            }
        });
    });
});

app.post('/backend/Login', async function (req, res, next)
{
    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.password)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'password' is missing." }));
        res.end();
        return;
    }

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    await timeout(2000);
    // Introduce a sleep, to avoid DoS or password brute force attacks.
    try
    {
        await connection.connect();
        var results = await connection.query('select id,password from users where name = ?', [req.body.user]);
        // Not yet registered
        if (results.length == 0 || (results[0].password != HashPassword(req.body.user, req.body.password) && results[0].password != "*" + req.body.password))
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "wrong username or password" }));
            res.end();
            return;
        }
        else
        {
            if (results[0].password == "*" + req.body.password)
                await connection.query('update users set password = ? where name = ?', [HashPassword(req.body.user, req.body.password), req.body.user]);

            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(BuildToken(results[0].id, req.body.user, req.headers['x-forwarded-for'] || req.connection.remoteAddress)));
            res.end();
            return;
        }
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});

app.post('/backend/LoadPlayer', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select x, y, zone, data from game_player where user_id = ? and game_id = ?', [tokenInfo.id, req.body.game], function (err1, r1)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0)
            {
                GameIncreaseStat(req.body.game, StatType.Player_Join);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            else
            {
                GameIncreaseStat(req.body.game, StatType.Player_Login);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ x: r1[0].x, y: r1[0].y, zone: r1[0].zone, data: r1[0].data }));
                res.end();
                return;
            }
        });
    });
});

function UpdatePosition(userId: number, gameId: number, x: number, y: number, zone: string)
{
    var connection = getConnection();
    if (!connection)
    {
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            return;
        }
        connection.query('update game_player x=?,y=?,zone=? where game_id=? and user_id=?', [x, y, zone, gameId, userId], function (err1, r1)
        {
            connection.end();
            return;
        });
    });
}

app.post('/backend/SavePlayer', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.x)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }

    if (!req.body.y)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'y' is missing." }));
        res.end();
        return;
    }

    if (!req.body.zone)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'zone' is missing." }));
        res.end();
        return;
    }

    if (!req.body.data)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select data from game_player where game_id = ? and user_id = ?', [req.body.game, tokenInfo.id], function (err0, r0)
        {
            if (err0 != null)
            {
                connection.end();
                console.log(err0);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            var newData = null;
            try
            {
                newData = JSON.parse(req.body.data);
            }
            catch (ex)
            {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "The save doesn't seems to be in a valid format." }));
                res.end();
                return;
            }

            var isOk = false;
            // First save, nothing to control
            if (!r0 || r0.length == 0)
                isOk = true;
            else
            {
                try
                {
                    var savedData = JSON.parse(r0[0].data);
                }
                catch (ex)
                {
                }

                //console.log("" + newData.saveId + " ?== " + savedData.saveId);

                // We don't have yet a saveId, then all fine...
                if (!savedData.saveId)
                    isOk = true;
                // Saved info and new data are the same
                else if (newData.saveId == savedData.saveId)
                    isOk = true;
            }

            if (!isOk)
            {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "Save doesn't match. Be sure you have only one browser open." }));
                res.end();
                return;
            }
            newData.saveId = md5("D0tW0rldMak3r2016" + req.body.game + "_" + tokenInfo.id + "_" + (new Date()).toString() + "_" + (Math.random() * 100000));

            connection.query('replace game_player(game_id,user_id,x,y,zone,data) values(?,?,?,?,?,?)', [req.body.game, tokenInfo.id, req.body.x, req.body.y, req.body.zone, JSON.stringify(newData)], function (err1, r1)
            {
                connection.end();
                if (err1 != null)
                {
                    console.log(err1);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(newData.saveId));
                res.end();
                return;
            });
        });
    });
});

app.post('/backend/ResetPlayer', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('delete from game_player where game_id = ? and user_id = ?', [req.body.game, tokenInfo.id], function (err1, r1)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(true));
            res.end();
            return;
        });
    });
});

app.post('/backend/ResetAllPlayers', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }


            connection.query('delete from game_player where game_id = ?', [req.body.game], function (err1, r1)
            {
                connection.end();
                if (err1 != null)
                {
                    console.log(err1);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(true));
                res.end();

                io.to("" + req.body.game + "@#global").emit('reset');
                return;
            });
        });
    });
});

interface PlayerSerialization
{
    name: string
    questVariables: any;
    inventory: any[];
    equipedObjects: any;
    currentSkill: string;
    quickslots: string[];
    stats: any[];
    skills: any[];
    temporaryEffects: any[]
    respawnPoint: any;
    kills: any[];
    quests?: any[];
    chests?: any[];
    mapobjects?: string[];
    saveId: string;
    chatMutedTill: Date;
    chatBannedTill: Date;
}

app.post('/backend/PublicViewPlayer', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.name)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'name' is missing." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select x, y, zone, data from game_player where user_id in (select id from users where name = ?) and game_id = ?', [req.body.name, req.body.game], function (err1, r1)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0)
            {
                GameIncreaseStat(req.body.game, StatType.Player_Join);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            else
            {
                GameIncreaseStat(req.body.game, StatType.Player_Login);
                res.writeHead(200, { 'Content-Type': 'text/json' });

                var rawData: PlayerSerialization = null;
                try
                {
                    rawData = JSON.parse(r1[0].data);
                }
                catch (ex)
                {
                }

                var resData = {
                    name: rawData.name,
                    x: r1[0].x,
                    y: r1[0].y,
                    zone: r1[0].zone,
                    equipedObjects: rawData.equipedObjects,
                    stats: rawData.stats,
                    skills: rawData.skills
                };

                res.write(JSON.stringify(resData));
                res.end();
                return;
            }
        });
    });
});

app.post('/backend/PremiumPurchase', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.item)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'item' is missing." }));
        res.end();
        return;
    }

    if (!req.body.credits)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'credits' is missing." }));
        res.end();
        return;
    }


    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select main_owner,name from games where id = ?', [req.body.game], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "game doesn't exists." }));
                res.end();
                return;
            }

            var destCreditUser = r1[0].main_owner;
            var gameName = r1[0].name;


            connection.query('update users set credits = credits - ? where id = ? and credits >= ?', [req.body.credits, tokenInfo.id, req.body.credits], function (err2, r2)
            {
                if (err2 != null)
                {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                if (r2.affectedRows < 1)
                {
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(true));
                    res.end();
                }
                else
                {
                    connection.query('update users set credits = credits + ? where id = ?', [req.body.credits, destCreditUser], function (err3, r3)
                    {
                        if (err3 != null)
                        {
                            console.log(err3);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }

                        connection.query("insert into credits_log(from_user, to_user, quantity, reason) values(?, ?, ?, ?)", [tokenInfo.id, destCreditUser, req.body.credits, "Premium purchase of " + req.body.item + " for game " + gameName], function (err4, r4)
                        {
                            connection.end();
                            if (err4 != null)
                            {
                                console.log(err4);
                                res.writeHead(500, { 'Content-Type': 'text/json' });
                                res.write(JSON.stringify({ error: "error with database." }));
                                res.end();
                                return;
                            }
                            res.writeHead(200, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify(true));
                            res.end();
                        });
                    });
                }
            });
        });
    });
});
