app.post('/backend/AddGameMessage', async function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.to)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'to' is missing." }));
        res.end();
        return;
    }

    if (!req.body.subject)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'subject' is missing." }));
        res.end();
        return;
    }

    if (!req.body.message)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'message' is missing." }));
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
    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();

        var toUsers: string = "";
        var users: string[] = [];
        var p = req.body.to.replace(/,/g, ";").replace(/ /g, "").split(';');
        for (var i = 0; i < p.length; i++)
        {
            if (p[i] == "")
                continue;
            if (!p[i].match(/^[a-z0-9]+$/i))
            {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "user '" + p[0] + "' unknown." }));
                res.end();
                return;
            }
            users.push(p[i].toLowerCase());
            if (toUsers == "")
                toUsers = "'" + p[i] + "'";
            else
                toUsers += ",'" + p[i] + "'";
        }
        //console.log("Searching " + toUsers);

        var r1 = await connection.query('select game_player.user_id, users.name from game_player left join users on game_player.user_id = users.id where user_id in (select id from users where name in (' + toUsers + ')) and game_id = ?', [req.body.game]);

        var toIds: number[] = [];
        if (r1)
        {
            for (var i = 0; i < r1.length; i++)
                users.splice(users.indexOf(r1[i].name.toLowerCase()), 1);
        }

        var unknown = "";
        for (var i = 0; i < users.length; i++)
        {
            if (unknown == "")
                unknown = "'" + users[i] + "'";
            else
                unknown = ", '" + users[i] + "'";

            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "Unknown user(s): " + unknown + "." }));
            res.end();
            return;
        }


        for (var i = 0; i < r1.length; i++)
        {
            await SendGameMessage(req.body.game, tokenInfo.id, r1[i].user_id, req.body.to, req.body.subject, req.body.message, req.body.attachments);
        }

        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(true));
        res.end();
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

async function SendGameMessage(gameId: number, fromUser: number, toUser: number, destination: string, subject: string, message: string, attachments: string)
{
    var connection = getDb();
    if (!connection)
        return;

    try
    {
        await connection.connect();
        for (var i = 0; i < sockets.length; i++)
        {
            if (sockets[i].user_id == toUser && sockets[i].game_id == gameId)
            {
                sockets[i].emit('new_message', null);
            }
        }

        await connection.query('insert into game_player_messages(game_id,inbox,from_user,to_user,subject,message,attachments) values(?,?,?,?,?,?,?)', [gameId, toUser, fromUser, destination, subject, message, attachments]);
    }
    catch (ex)
    {
        console.log(ex);
    }
}

app.post('/backend/CheckNewGameMessage', async function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r1 = await connection.query("select count(id) \"nb\" from game_player_messages where inbox = ? and game_id = ? and new_message = 'y'", [tokenInfo.id, req.body.game]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(0));
            res.end();
            return;
        }
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(r1[0].nb));
        res.end();
        return;
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

app.post('/backend/GetGameMessageList', async function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r1 = await connection.query("select game_player_messages.id, game_player_messages.new_message, \
game_player_messages.sent, users.name \"from_user\", \
game_player_messages.subject \
from game_player_messages left join users on game_player_messages.from_user = users.id \
where inbox = ? and game_id = ? \
order by game_player_messages.id desc \
limit 100", [tokenInfo.id, req.body.game]);

        connection.end();

        if (!r1 || !r1.length)
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(null));
            res.end();
            return;
        }
        var resData: any[] = [];
        for (var i = 0; i < r1.length; i++)
        {
            resData.push({
                id: r1[i].id,
                newMessage: r1[i].new_message == 'y',
                sentDate: r1[i].sent,
                from: r1[i].from_user,
                subject: r1[i].subject
            });
        }
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(resData));
        res.end();
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

app.post('/backend/GetGameMessage', async function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.id)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'id' is missing." }));
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
    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r0 = await connection.query("update game_player_messages set new_message='n', sent=sent \
where inbox = ? and game_id = ? and game_player_messages.id = ? and new_message <> 'n' limit 1", [tokenInfo.id, req.body.game, req.body.id]);
        var isNew = (r0.changedRows != 0);

        var r1 = await connection.query("select game_player_messages.id, \
game_player_messages.sent, users.name \"from_user\", \
game_player_messages.to_user, \
game_player_messages.subject, \
game_player_messages.message, \
game_player_messages.attachments \
from game_player_messages left join users on game_player_messages.from_user = users.id \
where inbox = ? and game_id = ? and game_player_messages.id = ? limit 1", [tokenInfo.id, req.body.game, req.body.id]);

        connection.end();

        if (!r1 || !r1.length)
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(null));
            res.end();
            return;
        }
        var resData = {
            id: r1[0].id,
            sentDate: r1[0].sent,
            from: r1[0].from_user,
            to: r1[0].to_user,
            subject: r1[0].subject,
            message: r1[0].message,
            attachments: r1[0].attachments,
            isNew: isNew
        };
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(resData));
        res.end();
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

app.post('/backend/DeleteGameMessage', async function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.id)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'id' is missing." }));
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
    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var r0 = await connection.query("delete from game_player_messages where inbox = ? and game_id = ? and game_player_messages.id = ? limit 1", [tokenInfo.id, req.body.game, req.body.id]);

        connection.end();

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(true));
        res.end();
        return;
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