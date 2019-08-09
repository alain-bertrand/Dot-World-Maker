///<reference path="../app.ts" />

app.post('/backend/GetWorld', async function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
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
        var result = await connection.query('select games.name, games.data, users.editor_version from games left join users on games.main_owner = users.id where games.id = ?', [req.body.game]);
        connection.end();
        // Not yet registered
        if (result.length == 0)
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write("");
            res.end();
            return;
        }
        else
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ name: result[0] && result[0].name ? result[0].name : "", edition: result[0] && result[0].editor_version ? result[0].editor_version : "f", data: result[0] && result[0].data ? result[0].data : "" }));
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

app.post('/backend/SaveWorld', async function (req, res, next)
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

    var name = "";
    var description = "";
    var publicView: boolean;

    try
    {
        var data = JSON.parse(req.body.data);
        name = data.Name;
        description = data.Description;
        publicView = data.PublicView;
    }
    catch (ex)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Not a valid JSON." }));
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

        var r3 = await connection.query('select data from games where id = ?', [req.body.game]);

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
        if (!r3 || r3.length == 0)
            isOk = true;
        else
        {
            var savedData = null;
            try
            {
                savedData = JSON.parse(r3[0].data);
            }
            catch (ex)
            {
            }

            //console.log("" + newData.SaveId + " ?== " + savedData.SaveId);

            // We don't have yet a SaveId, then all fine...
            if (!savedData || !savedData.SaveId)
                isOk = true;
            // Saved info and new data are the same
            else if (newData.SaveId == savedData.SaveId)
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
        newData.SaveId = md5("D0tW0rldMak3r2016" + req.body.game + "_" + tokenInfo.id + "_" + (new Date()).toString() + "_" + (Math.random() * 100000));

        await connection.query('update games set description = ?, data = ?, public = ? where id = ?', [description, JSON.stringify(newData), (publicView ? "y" : "n"), req.body.game]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(newData.SaveId));
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