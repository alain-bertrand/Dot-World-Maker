app.post('/backend/DirectoryList', function (req, res)
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
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtObjectEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
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

            connection.query('select editor_version, rented_space, rented_space_till from users where id = (select main_owner from games where id = ?)', [req.body.game], function (err2, r2)
            {
                if (err2 != null)
                {
                    connection.end();
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                connection.end();

                var size = r2[0].editor_version == 's' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
                var baseSize = size;
                var tillWhen: Date = null;
                if (r2[0].rented_space_till)
                {
                    //console.log('have rented till ' + r2[0].rented_space_till);
                    tillWhen = new Date(r2[0].rented_space_till);
                    //console.log('parsed to ' + tillWhen.toString());
                    if (tillWhen.getTime() > new Date().getTime())
                        size = r2[0].rented_space * 1024 * 1024;
                    else
                        tillWhen = null;
                }

                var dir = __dirname + '/public/user_art/' + GameDir(req.body.game);

                if (!fs.existsSync(dir))
                {
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({
                        userDirectory: '/user_art/' + GameDir(req.body.game),
                        totalSize: 0,
                        usableSize: size,
                        tillWhen: tillWhen,
                        baseSize: baseSize,
                        files: []
                    }));
                    res.end();
                    return;
                }

                var info = [];
                var files = fs.readdirSync(dir);
                var tot = 0;
                for (var i = 0; i < files.length; i++)
                {
                    var stat = fs.statSync(dir + "/" + files[i]);
                    info.push({
                        name: files[i], size: stat.size
                    });
                }

                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({
                    userDirectory: '/user_art/' + GameDir(req.body.game),
                    totalSize: DirectoryCheck(req.body.game),
                    usableSize: size,
                    tillWhen: tillWhen,
                    baseSize: baseSize,
                    files: info
                }));
                res.end();
                return;
            });
        });
    });
});

app.post('/backend/DeleteFile', function (req, res)
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

    if (!req.body.filename)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'filename' is missing." }));
        res.end();
        return;
    }

    if (("" + req.body.filename).match(/[\/\\]/))
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'filename' is invalid." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtObjectEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
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

            connection.end();

            var dir = __dirname + '/public/user_art/' + GameDir(req.body.game);
            if (fs.existsSync(dir + "/" + req.body.filename))
                fs.unlinkSync(dir + "/" + req.body.filename);

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(true));
            res.end();
            return;
        });
    });
});