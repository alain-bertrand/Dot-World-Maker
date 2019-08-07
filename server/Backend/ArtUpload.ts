interface FileRequest
{
    originalname: string;
    path: string;
}


function CreateGameDir(gameId: number)
{
    if (!fs.existsSync(__dirname + '/public/user_art/' + GameDir(gameId)))
        fs.mkdirSync(__dirname + '/public/user_art/' + GameDir(gameId));
}

function GameDir(gameId: number): string
{
    return "" + gameId + "_" + (gameId ^ 8518782);
}

app.post('/upload/AndGet', upload.single('fileUpload'), function (req, res)
{
    if (!req.body.returnClass)
    {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write("Missing parameter function");
        res.end();
        return;
    }

    if (!req.file)
    {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "the file is missing." }) + "');</script>");
        res.end();
        return;
    }

    req.file.originalname = req.file.originalname.match(/[^\\\/]*$/)[0];

    var data = fs.readFileSync(req.file.path, "utf8");
    fs.unlinkSync(req.file.path);


    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ file: req.file.originalname, data: data }) + "');</script>");
    res.end();
});


app.post('/upload/Art', upload.single('fileUpload'), async function (req, res)
{
    if (!req.body.returnClass)
    {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write("Missing parameter function");
        res.end();
        return;
    }


    if (!req.file)
    {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "the file is missing." }) + "');</script>");
        res.end();
        return;
    }

    if (!req.body.game)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }

    if (!req.file.originalname.toLowerCase().endsWith(".jpg") && !req.file.originalname.toLowerCase().endsWith(".png"))
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "must upload a jpg or png file" }) + "');</script>");
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }

    req.file.originalname = req.file.originalname.match(/[^\\\/]*$/)[0];

    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, fs.statSync(req.file.path).size);
    if (canUpload)
    {
        CreateGameDir(parseInt(req.body.game));

        var finalName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.file.originalname;
        if (fs.existsSync(finalName))
            fs.unlinkSync(finalName);
        fs.renameSync(req.file.path, finalName);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ new_file: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.file.originalname }) + "');</script>");
        res.end();
    }
    else
    {
        if (fs.existsSync(req.file.path))
            fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "you do not have enough space left." }) + "');</script>");
        res.end();
    }
});

app.post('/upload/Sounds', upload.fields([{ name: 'mp3Upload', maxCount: 1 }, { name: 'oggUpload', maxCount: 1 }]), async function (req, res)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.files['mp3Upload'] || !req.files['mp3Upload'][0])
    {
        if (req.files['oggUpload'] && req.files['oggUpload'][0])
            fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "the MP3 file is missing." }) + "');</script>");
        res.end();
        return;
    }
    /*if (!req.files['oggUpload']  || !req.files['oggUpload'][0])
    {
        if (req.files['mp3Upload'] && req.files['mp3Upload'][0])
            fs.unlinkSync(req.files['mp3Upload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "the OGG file is missing." }) + "');</script>");
        res.end();
        return;
    }*/

    if (!req.body.game)
    {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        //fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }

    if (!req.files['mp3Upload'][0].originalname.toLowerCase().endsWith(".mp3"))
    {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        //fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "must upload a mp3" }) + "');</script>");
        res.end();
        return;
    }

    /*if (!req.files['oggUpload'][0].originalname.toLowerCase().endsWith(".ogg"))
    {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "must upload a ogg" }) + "');</script>");
        res.end();
        return;
    }*/

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        //fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }

    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, fs.statSync(req.files['mp3Upload'][0].path).size);
    if (canUpload)
    {
        CreateGameDir(parseInt(req.body.game));
        var finalMP3Name = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['mp3Upload'][0].originalname;
        //var finalOGGName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['oggUpload'][0].originalname;

        if (fs.existsSync(finalMP3Name))
            fs.unlinkSync(finalMP3Name);
        /*if (fs.existsSync(finalOGGName))
            fs.unlinkSync(finalOGGName);*/
        fs.renameSync(req.files['mp3Upload'][0].path, finalMP3Name);
        //fs.renameSync(req.files['oggUpload'][0].path, finalOGGName);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({
            mp3: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['mp3Upload'][0].originalname/*,
    ogg: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['oggUpload'][0].originalname*/
        }) + "');</script>");
        res.end();
    }
    else
    {
        if (fs.existsSync(req.files['mp3Upload'][0].path))
            fs.unlinkSync(req.files['mp3Upload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "you do not have enough space left." }) + "');</script>");
        res.end();
        return;
    }
});

app.post('/backend/GetPixelPaint', async function (req, res)
{
    if (!req.body.file)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
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
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }

    var file = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.body.file.match(/[^\\\/]*$/)[0].split('?')[0];

    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, 0);
    if (canUpload)
    {
        if (fs.existsSync(file + ".work"))
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(fs.readFileSync(file + ".work"));
        }
        else   
        {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(null));
        }
        res.end();
    }
    else
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
    }
});

app.post('/upload/SavePixelArt', async function (req, res)
{
    if (!req.body.file)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
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

    if (!req.body.workData)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'workData' is missing." }));
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

    if (!req.body.file.toLowerCase().endsWith(".png"))
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "The file must be png." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }


    var file = req.body.file.match(/[^\\\/]*$/)[0];
    var data = base64decode(req.body.data.split(',')[1]);

    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, data.length + req.body.workData.length);
    if (canUpload)
    {
        CreateGameDir(parseInt(req.body.game));

        var finalName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file;
        if (fs.existsSync(finalName))
            fs.unlinkSync(finalName);
        fs.writeFileSync(finalName, data);

        if (fs.existsSync(finalName + ".work"))
            fs.unlinkSync(finalName + ".work");
        fs.writeFileSync(finalName + ".work", req.body.workData);

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ file: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file }));
        res.end();
    }
    else
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "You do not have enough space left." }));
        res.end();
    }
});

app.post('/upload/SaveBase64Art', async function (req, res)
{
    if (!req.body.file)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
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

    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.file.toLowerCase().endsWith(".png") && !req.body.file.toLowerCase().endsWith(".jpeg") && !req.body.file.toLowerCase().endsWith(".jpg"))
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "The file must be png or jpeg." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }


    var file = req.body.file.match(/[^\\\/]*$/)[0];
    var data = base64decode(req.body.data.split(',')[1]);

    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, data.length);
    if (canUpload)
    {
        CreateGameDir(parseInt(req.body.game));

        var finalName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file;
        if (fs.existsSync(finalName))
            fs.unlinkSync(finalName);
        fs.writeFileSync(finalName, data);

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ file: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file }));
        res.end();
    }
    else
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "You do not have enough space left." }));
        res.end();
    }
});