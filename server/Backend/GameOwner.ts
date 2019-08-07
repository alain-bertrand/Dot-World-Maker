///<reference path="../app.ts" />

app.post('/backend/CanEdit', function (req, res, next)
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
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify((!r1 || !r1.length) ? false : true));
            res.end();
            return;
        });
    });
});

app.post('/backend/OwnerPlayers', function (req, res, next)
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
        connection.query('select users.name \
from game_player left join users on game_player.user_id = users.id, (select count(id) nb from game_access_rights where user_id = ? and access_right_id = 1000) as rights \
where game_player.game_id = ? \
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0) order by users.name limit 500', [tokenInfo.id, req.body.game, tokenInfo.id], function (err1, results)
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

                if (!results || results.length == 0)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }

                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify((<any[]>results).map(c => c.name)));
                res.end();
                return;
            });
    });
});

app.post('/backend/OwnerViewPlayer', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
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
        connection.query('select game_player.x,game_player.y,game_player.zone,game_player.data \
from game_player, (select count(id) nb from game_access_rights where user_id = ? and access_right_id = 1000) as rights \
where game_player.user_id in (select id from users where name = ?) \
and game_player.game_id = ? \
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results)
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

                if (!results || results.length != 1)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }

                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ x: results[0].x, y: results[0].y, zone: results[0].zone, data: results[0].data }));
                res.end();
                return;
            });
    });
});

app.post('/backend/OwnerRecallPlayer', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
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
        connection.query('select game_player.user_id \
from game_player, (select count(id) nb from game_access_rights where user_id = ? and access_right_id = 1000) as rights \
where game_player.user_id in (select id from users where name = ?) \
and game_player.game_id = ? \
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results)
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

                if (!results || results.length != 1)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(false));
                    res.end();
                    return;
                }

                var clients = findSockets(req.body.game, results[0].user_id);
                for (var i = 0; i < clients.length; i++)
                    clients[i].emit('recall');
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(true));
                res.end();
                return;
            });
    });
});

app.post('/backend/OwnerResetPlayer', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.user)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
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
        connection.query('select game_player.user_id \
from game_player, (select count(id) nb from game_access_rights where user_id = ? and access_right_id = 1000) as rights \
where game_player.user_id in (select id from users where name = ?) \
and game_player.game_id = ? \
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results)
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

                if (!results || results.length != 1)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(false));
                    res.end();
                    return;
                }

                var userId = results[0].user_id;

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

                    var clients = findSockets(req.body.game, results[0].user_id);
                    for (var i = 0; i < clients.length; i++)
                        clients[i].emit('reset');
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(true));
                    res.end();
                    return;
                });
            });
    });
});
