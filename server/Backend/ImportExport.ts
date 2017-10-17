/// <reference path="../../public/Engine/Logic/World/SerializedWorld.ts" />

app.get('/backend/ExportJson', function (req, res, next)
{
    if (!req.query.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.query.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
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
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.query.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
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

            var exportResult = { gameData: null, maps: [] };
            connection.query('select data from games where id = ?', [req.query.game], function (err2, result)
            {

                exportResult.gameData = result[0].data;
                connection.query('select area_x, area_y, zone, data from game_maps where game_id = ?', [req.query.game], function (err2, r2)
                {
                    connection.end();
                    if (err2 != null)
                    {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }

                    for (var i = 0; i < r2.length; i++)
                    {
                        exportResult.maps[i] = { x: r2[i].area_x, y: r2[i].area_y, zone: r2[i].zone, data: r2[i].data };
                    }

                    res.writeHead(200, { 'Content-Type': 'binary/json', 'Content-Disposition': 'attachment; filename=game_export.json' });
                    res.write(JSON.stringify(exportResult));
                    res.end();
                    return;
                });
            });
        });
    });
});

app.post('/upload/ImportJson', upload.single('fileUpload'), function (req, res)
{
    if (!req.file)
    {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "the file is missing." }) + "');</script>");
        res.end();
        return;
    }

    if (!req.file.originalname.toLowerCase().endsWith(".json"))
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "must upload a json file" }) + "');</script>");
        res.end();
        return;
    }

    var importData: any = null;
    try
    {
        importData = JSON.parse(fs.readFileSync(req.file.path));
        if (!importData.gameData)
            throw "Invalid format";
        if (!importData.maps)
            throw "Invalid format";
    }
    catch (ex)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Import file invalid." }) + "');</script>");
        res.end();
        return;
    }

    ImportData(importData, req, res);
});

app.post('/backend/DirectImportJson', function (req, res)
{
    if (!req.body.data)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "parameter 'data' is missing." }) + "');</script>");
        res.end();
        return;
    }

    try
    {
        ImportData(JSON.parse(req.body.data), req, res);
    }
    catch (ex)
    {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Import file invalid." }) + "');</script>");
        res.end();
        return;
    }
});


function ImportData(importData, req, res)
{
    if (!importData.gameData || !importData.maps)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "invalid format." }) + "');</script>");
        res.end();
        return;
    }

    if (!req.body.game)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (1)." }) + "');</script>");
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (2)." }) + "');</script>");
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "No write access." }) + "');</script>");
                res.end();
                return;
            }

            connection.query('update games set data = ? where id = ?', [importData.gameData, req.body.game], function (err1)
            {
                if (err1 != null)
                {
                    connection.end();
                    console.log(err1);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (3)." }) + "');</script>");
                    res.end();
                    return;
                }


                connection.query('delete from game_maps where game_id = ?', [req.body.game], function (err2)
                {
                    if (err2 != null)
                    {
                        connection.end();
                        console.log(err1);
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (4)." }) + "');</script>");
                        res.end();
                        return;
                    }

                    ImportMap(res, connection, req.body.game, importData.maps);
                });
            });
        });
    });
}

function ImportMap(res, connection, gameId, maps: any[])
{
    try
    {
        if (maps.length == 0)
        {
            connection.end();
            //console.log("Import done.");
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ result: "Done." }) + "');</script>");
            res.end();
            return;
        }

        var m = maps.shift();
        //console.log("Importing " + m.x + "," + m.y + "," + m.zone);
        connection.query('replace game_maps(game_id,area_x,area_y,zone,data) values(?,?,?,?,?)', [gameId, m.x, m.y, m.zone, m.data], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (5)." }) + "');</script>");
                res.end();
                return;
            }

            ImportMap(res, connection, gameId, maps);
        });
    }
    catch (ex)
    {
    }
}

app.get('/backend/ExportGame', function (req, res, next)
{
    if (!req.query.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.query.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
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
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.query.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
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

            var exportResult: SerializedGame = { gameData: null, maps: [] };
            connection.query('select data from games where id = ?', [req.query.game], function (err2, result)
            {

                exportResult.gameData = JSON.parse(result[0].data);

                var zip = new (<any>require('node-zip'))();
                ChangeGameUrls(exportResult.gameData, "", (origName: string, newName: string) =>
                {
                    zip.file(newName, fs.readFileSync(__dirname + '/public' + origName));
                });

                connection.query('select area_x, area_y, zone, data from game_maps where game_id = ?', [req.query.game], function (err2, r2)
                {
                    connection.end();
                    if (err2 != null)
                    {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }

                    for (var i = 0; i < r2.length; i++)
                    {
                        exportResult.maps[i] = { x: r2[i].area_x, y: r2[i].area_y, zone: r2[i].zone, data: JSON.parse(r2[i].data) };
                    }

                    //res.writeHead(200, { 'Content-Type': 'binary/json', 'Content-Disposition': 'attachment; filename=game_export.json' });
                    //res.write(JSON.stringify(exportResult));
                    zip.file('game.json', JSON.stringify(exportResult));
                    res.writeHead(200, { 'Content-Type': 'application/zip, application/octet-stream', 'Content-Disposition': 'attachment; filename=game.zip' });
                    res.write(zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
                    res.end();
                    return;
                });
            });
        });
    });
});

function CleanupUrl(url: string, prefix, changeCallback: (origName: string, newName: string) => void): string
{
    if (changeCallback)
        changeCallback(url.replace(/\?.*$/, ""), url.replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
    return prefix + url.replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, "");
}

function CleanupFileCodeVariable(code: string, prefix: string, changeCallback: (origName: string, newName: string) => void)
{
    var m = code.match(/\/\/\/ [a-z]+:\s+(\/[^\/]+\/[^\/]+\/[^,]+),image_upload/i);
    if (changeCallback)
        changeCallback(m[1].replace(/\?.*$/, ""), m[1].replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
    /// Icon: /art/tileset1/fast_attack.png,image_upload
    return code.replace(/(\/\/\/ [a-z]+:\s+)\/[^\/]+\/[^\/]+\/([^,]+,image_upload)/gi, "$1$2");
}

function ChangeGameUrls(world: SerializedWorld, urlPrefix: string = "", changeCallback: (origName: string, newName: string) => void = null)
{
    if (world.Tileset.background.file)
        world.Tileset.background.file = CleanupUrl(world.Tileset.background.file, urlPrefix, changeCallback);
    if (world.Tileset.splashImage)
        world.Tileset.splashImage = CleanupUrl(world.Tileset.splashImage, urlPrefix, changeCallback);
    if (world.Tileset.panelStyle.file)
        world.Tileset.panelStyle.file = CleanupUrl(world.Tileset.panelStyle.file, urlPrefix, changeCallback);
    if (world.Tileset.statBarStyle.file)
        world.Tileset.statBarStyle.file = CleanupUrl(world.Tileset.statBarStyle.file, urlPrefix, changeCallback);
    if (world.Tileset.quickslotStyle.file)
        world.Tileset.quickslotStyle.file = CleanupUrl(world.Tileset.quickslotStyle.file, urlPrefix, changeCallback);

    for (var item in world.Tileset.characters)
        world.Tileset.characters[item].file = CleanupUrl(world.Tileset.characters[item].file, urlPrefix, changeCallback);
    for (var item in world.Tileset.objects)
        world.Tileset.objects[item].file = CleanupUrl(world.Tileset.objects[item].file, urlPrefix, changeCallback);
    for (var item in world.Tileset.house_parts)
        world.Tileset.house_parts[item].file = CleanupUrl(world.Tileset.house_parts[item].file, urlPrefix, changeCallback);
    for (var item in world.Tileset.sounds)
        world.Tileset.sounds[item].mp3 = CleanupUrl(world.Tileset.sounds[item].mp3, urlPrefix, changeCallback);
    for (var i = 0; i < world.Skills.length; i++)
        world.Skills[i].Source = CleanupFileCodeVariable(world.Skills[i].Source, urlPrefix, changeCallback);
}
