///<reference path="../app.ts" />

app.post('/backend/GetMap', async function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
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
        var result = await connection.query('select data from game_maps where game_id = ? and area_x = ? and area_y = ? and zone = ?', [req.body.game, req.body.x, req.body.y, req.body.zone]);
        connection.end();
        // Not yet registered
        if (result.length == 0)
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(null));
            res.end();
            return;
        }
        else
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(result[0].data));
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

app.post('/backend/FindNPC', async function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.npc)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'npc' is missing." }));
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
        var results = await connection.query('select area_x, area_y, zone, data from game_maps where game_id = ? ', [req.body.game]);
        for (var i = 0; i < results.length; i++)
        {
            if (!results[i].data)
                continue;
            var map = JSON.parse(results[i].data);
            if (map.StoredNPC) for (var j = 0; j < map.StoredNPC.length; j++)
            {
                if (map.StoredNPC[j].Name == req.body.npc)
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ zone: results[i].zone, ax: results[i].area_x, ay: results[i].area_y, x: map.StoredNPC[j].X, y: map.StoredNPC[j].Y }));
                    res.end();
                    return;
                }
            }
        }

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(null));
        res.end();
        connection.end();
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

app.post('/backend/UpdateMapDetails', async function (req, res, next)
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
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "no write access." }));
            res.end();
            return;
        }

        var r2 = await connection.query('select area_x,area_y,zone,data from game_maps where game_id = ?', [req.body.game]);

        var query = 'replace game_maps(game_id,area_x,area_y,zone,data)';
        var queryData = [];
        var modified = false;

        for (var i = 0; i < r2.length; i++)
        {
            var rowModified = false;
            var data = MapSerializer.Parse(r2[i].data);
            if (req.body.oldObject)
            {
                // Work on the map objects
                for (var j = 0; j < data.Objects.length;)
                {
                    if (req.body.newObject && data.Objects[j].Name == req.body.oldObject)
                    {
                        rowModified = true;
                        data.Objects[j].Name = req.body.newObject;
                        j++;
                    }
                    else if (data.Objects[j].Name == req.body.oldObject)
                    {
                        rowModified = true;
                        data.Objects.splice(j, 1);
                    }
                    else
                        j++;
                }
                // Work on the map chests
                for (var j = 0; j < data.Chests.length;)
                {
                    if (req.body.newObject && data.Chests[j].Name == req.body.oldObject)
                    {
                        rowModified = true;
                        data.Chests[j].Name = req.body.newObject;
                        j++;
                    }
                    else if (data.Chests[j].Name == req.body.oldObject)
                    {
                        rowModified = true;
                        data.Objects.splice(j, 1);
                    }
                    else
                        j++;
                }
            }
            // Work on the map houses
            if (req.body.oldHouse)
            {
                for (var j = 0; j < data.Houses.length;)
                {
                    if (req.body.newHouse && data.Houses[j].Name == req.body.oldHouse)
                    {
                        rowModified = true;
                        data.Houses[j].Name = req.body.newHouse;
                        j++;
                    }
                    else if (data.Houses[j].Name == req.body.oldHouse)
                    {
                        rowModified = true;
                        data.Houses.splice(j, 1);
                    }
                    else
                        j++;
                }
            }
            // Work on the map monsters
            if (req.body.oldMonster)
            {
                for (var j = 0; j < data.StoredMonsters.length;)
                {
                    if (req.body.newMonster && data.StoredMonsters[j].Name == req.body.oldMonster)
                    {
                        rowModified = true;
                        data.StoredMonsters[j].Name = req.body.newMonster;
                        j++;
                    }
                    else if (data.StoredMonsters[j].Name == req.body.oldMonster)
                    {
                        rowModified = true;
                        data.StoredMonsters.splice(j, 1);
                    }
                    else
                        j++;
                }
            }
            // Work on the map NPC
            if (req.body.oldNpc)
            {
                for (var j = 0; j < data.StoredNPC.length;)
                {
                    if (req.body.newNpc && data.StoredNPC[j].Name == req.body.oldNpc)
                    {
                        rowModified = true;
                        data.StoredNPC[j].Name = req.body.newNpc;
                        j++;
                    }
                    else if (data.StoredNPC[j].Name == req.body.oldNpc)
                    {
                        rowModified = true;
                        data.StoredNPC.splice(j, 1);
                    }
                    else
                        j++;
                }
            }

            if (rowModified)
            {
                if (modified)
                    query += ", ";
                modified = true;
                query += " values(?,?,?,?,?)";
                queryData.push(req.body.game);
                queryData.push(r2[i].area_x);
                queryData.push(r2[i].area_y);
                queryData.push(r2[i].zone);
                queryData.push(MapSerializer.Stringify(data));
            }
        }

        if (!modified)
        {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(modified));
            res.end();
            return;
        }

        await connection.query(query, queryData);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(modified));
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


app.post('/backend/SaveMap', async function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
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

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
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
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "no write access." }));
            res.end();
            return;
        }

        await connection.query('replace game_maps(game_id,area_x,area_y,zone,data) values(?,?,?,?,?)', [req.body.game, req.body.x, req.body.y, req.body.zone, req.body.data]);
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

app.post('/backend/RemoveZoneMap', async function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,]);
        if (!r1 || !r1.length)
        {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "no write access." }));
            res.end();
            return;
        }

        await connection.query('delete from game_maps where game_id = ? and zone = ?', [req.body.game, req.body.zone]);
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
