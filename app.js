var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var hash = require('crypto');
var compression = require('compression');
var multer = require('multer');
var packageJson = require(__dirname + '/package.json');
var app = express();
app.disable('x-powered-by');
app.use(staticInclude);
app.use(compression({ threshold: 9000 }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
//app.use(compress({ filter: shouldCompress }));
var upload = multer({
    dest: __dirname + '/temp_upload/', rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase();
    }
});
function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
    }
    // fallback to standard filter function
    //return compress.filter(req, res)
    return true;
}
var server = require('http').Server(app);
var io = require('socket.io')(server);
String.prototype.htmlEntities = function () {
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
};
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.endsWith = function (suffix) {
    return (this.indexOf(suffix, this.length - suffix.length) !== -1);
};
String.prototype.startsWith = function (prefix) {
    return (this.substr(0, prefix.length) == prefix);
};
String.prototype.contains = function (toSearch) {
    return (this.indexOf(toSearch) != -1);
};
function md5(source) {
    return hash.createHash('md5').update(source).digest('hex');
}
function sha256(source, secret) {
    if (!secret)
        secret = "aBcD3FgH1";
    return hash.createHmac('sha256', secret)
        .update(source)
        .digest('hex');
}
function base64decode(source) {
    // Node 5.10+
    if (typeof Buffer.from === "function")
        return Buffer.from(source, 'base64');
    // older Node versions
    else
        return new Buffer(source, 'base64');
}
function staticInclude(req, res, next) {
    var url = req.originalUrl;
    if (url.indexOf("?") !== -1)
        url = url.substr(0, url.indexOf("?"));
    req.originalUrl = url;
    if (url.charAt(url.length - 1) == "/")
        url += "index.html";
    if (url.indexOf(".html") !== -1) {
        var p = path.resolve(__dirname + '/public/' + url).replace(/\\/g, "/");
        var mustStart = (__dirname + '/public/').replace(/\\/g, "/");
        if (!p.startsWith(mustStart) || !fs.existsSync(p)) {
            next();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = "" + fs.readFileSync(p);
        var title = html.match(/<title>[^<]*<\/title>/i);
        var m = html.match(/<meta[^<]*>/gi);
        var meta = (m ? m.join("") : "");
        var included = false;
        html = html.trim().replace(/\<\!\-\-\# include file\=\"([^"]+)\" \-\-\>/g, function (match, capture) {
            included = true;
            if (!fs.existsSync(__dirname + '/public/' + capture))
                return "";
            return "" + fs.readFileSync(__dirname + '/public/' + capture);
        });
        if (included) {
            if (title)
                html = html.replace(/<title>[^<]*<\/title>/i, title);
            if (meta && meta != "")
                html = html.replace(/<\/head>/i, meta + "</head>");
            // Removes the titles which are within the document
            html = html.replace(/(<\/head>(.|\n|\r)*)(<title>[^<]+<\/title>)/gi, "$1");
            // Removes the meta which are within the document
            html = html.replace(/(<\/head>(.|\n|\r)*)(<meta[^>]+>)/gi, "$1");
        }
        res.write(html);
        res.end();
        return;
    }
    else {
        if (req.originalUrl.indexOf(".png") !== -1 || req.originalUrl.indexOf(".jpg") !== -1 || req.originalUrl.indexOf(".jpeg") !== -1 || req.originalUrl.indexOf(".mp3") !== -1) {
            res.setHeader("Cache-Control", "public, max-age=" + (360 * 864000));
            res.setHeader("Expires", new Date(Date.now() + 360 * 86400000).toUTCString());
        }
        next();
    }
}
module.exports = { app: app, http: server };
function CreateGameDir(gameId) {
    if (!fs.existsSync(__dirname + '/public/user_art/' + GameDir(gameId)))
        fs.mkdirSync(__dirname + '/public/user_art/' + GameDir(gameId));
}
function GameDir(gameId) {
    return "" + gameId + "_" + (gameId ^ 8518782);
}
app.post('/upload/AndGet', upload.single('fileUpload'), function (req, res) {
    if (!req.body.returnClass) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write("Missing parameter function");
        res.end();
        return;
    }
    if (!req.file) {
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
app.post('/upload/Art', upload.single('fileUpload'), async function (req, res) {
    if (!req.body.returnClass) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write("Missing parameter function");
        res.end();
        return;
    }
    if (!req.file) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "the file is missing." }) + "');</script>");
        res.end();
        return;
    }
    if (!req.body.game) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }
    if (!req.file.originalname.toLowerCase().endsWith(".jpg") && !req.file.originalname.toLowerCase().endsWith(".png")) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "must upload a jpg or png file" }) + "');</script>");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }
    req.file.originalname = req.file.originalname.match(/[^\\\/]*$/)[0];
    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, fs.statSync(req.file.path).size);
    if (canUpload) {
        CreateGameDir(parseInt(req.body.game));
        var finalName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.file.originalname;
        if (fs.existsSync(finalName))
            fs.unlinkSync(finalName);
        fs.renameSync(req.file.path, finalName);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ new_file: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.file.originalname }) + "');</script>");
        res.end();
    }
    else {
        if (fs.existsSync(req.file.path))
            fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent." + req.body.returnClass + ".Result('" + JSON.stringify({ error: "you do not have enough space left." }) + "');</script>");
        res.end();
    }
});
app.post('/upload/Sounds', upload.fields([{ name: 'mp3Upload', maxCount: 1 }, { name: 'oggUpload', maxCount: 1 }]), async function (req, res) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.files['mp3Upload'] || !req.files['mp3Upload'][0]) {
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
    if (!req.body.game) {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        //fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }
    if (!req.files['mp3Upload'][0].originalname.toLowerCase().endsWith(".mp3")) {
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
    if (!tokenInfo) {
        fs.unlinkSync(req.files['mp3Upload'][0].path);
        //fs.unlinkSync(req.files['oggUpload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }
    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, fs.statSync(req.files['mp3Upload'][0].path).size);
    if (canUpload) {
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
            mp3: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['mp3Upload'][0].originalname /*,
    ogg: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.files['oggUpload'][0].originalname*/
        }) + "');</script>");
        res.end();
    }
    else {
        if (fs.existsSync(req.files['mp3Upload'][0].path))
            fs.unlinkSync(req.files['mp3Upload'][0].path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtSoundEditor.Result('" + JSON.stringify({ error: "you do not have enough space left." }) + "');</script>");
        res.end();
        return;
    }
});
app.post('/backend/GetPixelPaint', async function (req, res) {
    if (!req.body.file) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }
    var file = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + req.body.file.match(/[^\\\/]*$/)[0].split('?')[0];
    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, 0);
    if (canUpload) {
        if (fs.existsSync(file + ".work")) {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(fs.readFileSync(file + ".work"));
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(null));
        }
        res.end();
    }
    else {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
    }
});
app.post('/upload/SavePixelArt', async function (req, res) {
    if (!req.body.file) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
        res.end();
        return;
    }
    if (!req.body.data) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }
    if (!req.body.workData) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'workData' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.file.toLowerCase().endsWith(".png")) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "The file must be png." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }
    var file = req.body.file.match(/[^\\\/]*$/)[0];
    var data = base64decode(req.body.data.split(',')[1]);
    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, data.length + req.body.workData.length);
    if (canUpload) {
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
    else {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "You do not have enough space left." }));
        res.end();
    }
});
app.post('/upload/SaveBase64Art', async function (req, res) {
    if (!req.body.file) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'file' is missing." }));
        res.end();
        return;
    }
    if (!req.body.data) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.file.toLowerCase().endsWith(".png") && !req.body.file.toLowerCase().endsWith(".jpeg") && !req.body.file.toLowerCase().endsWith(".jpg")) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "The file must be png or jpeg." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid token." }));
        res.end();
        return;
    }
    var file = req.body.file.match(/[^\\\/]*$/)[0];
    var data = base64decode(req.body.data.split(',')[1]);
    var canUpload = await CanStoreSize(tokenInfo.id, req.body.game, data.length);
    if (canUpload) {
        CreateGameDir(parseInt(req.body.game));
        var finalName = __dirname + '/public/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file;
        if (fs.existsSync(finalName))
            fs.unlinkSync(finalName);
        fs.writeFileSync(finalName, data);
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ file: '/user_art/' + GameDir(parseInt(req.body.game)) + '/' + file }));
        res.end();
    }
    else {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "You do not have enough space left." }));
        res.end();
    }
});
// Based on https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/mysql/index.d.ts
// As it wasn't compiling correctly it has been re-imported and modified here as static code.
var mysql = require('mysql');
function getConnection() {
    try {
        var conn = mysql.createConnection({
            host: packageJson.config.dbhost,
            user: packageJson.config.dbuser,
            password: packageJson.config.dbpass,
            database: packageJson.config.dbname,
            insecureAuth: true
        });
        conn.on("error", function (err) {
        });
        return conn;
    }
    catch (ex) {
        return null;
    }
}
/// <reference path="Database.ts" />
app.post('/backend/SaveGameStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.headers) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'headers' is missing." }));
        res.end();
        return;
    }
    if (!req.body.values) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'values' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
    try {
        var result = await connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        // First time writing data to this storage
        if (result.length == 0)
            CreateEngineStorage(res, connection, req.body.game, req.body.table, JSON.parse(req.body.headers), JSON.parse(req.body.values));
        else
            CheckInsertRowEngineStorage(res, connection, result[0].id, JSON.parse(req.body.headers), JSON.parse(req.body.values));
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
async function CreateEngineStorage(res, connection, gameId, table, headers, values) {
    var result = await connection.query('insert into storage_table(game_id, table_name) values(?, ?)', [gameId, table]);
    CheckInsertRowEngineStorage(res, connection, result.insertId, headers, values);
}
async function CheckInsertRowEngineStorage(res, connection, tableId, headers, values) {
    var result = await connection.query('select id, column_name from storage_table_column where table_id = ?', [tableId]);
    var missingNames = headers.slice();
    var missingValues = values.slice();
    var names = [];
    var todo = [];
    for (var i = 0; i < result.length; i++) {
        var n = result[i].column_name.toLowerCase();
        for (var j = 0; j < headers.length; j++) {
            if (missingNames[j].toLowerCase() == n) {
                names.push({
                    name: missingNames[j],
                    id: result[i].id,
                    value: missingValues[j]
                });
                missingNames.splice(j, 1);
                missingValues.splice(j, 1);
                break;
            }
        }
    }
    for (var i = 0; i < missingNames.length; i++)
        names.push({
            name: missingNames[i],
            id: -1,
            value: missingValues[i]
        });
    if (missingNames.length == 0)
        await InsertRowEngineStorage(res, connection, tableId, names);
    else {
        var sql = 'insert into storage_table_column(table_id, column_name) values';
        var sqlValues = [];
        for (var i = 0; i < missingNames.length; i++) {
            if (i != 0)
                sql += ", ";
            sql += "(?,?)";
            sqlValues.push(tableId, missingNames[i]);
        }
        //console.log(sql);
        var res2 = await connection.query(sql, sqlValues);
        for (var i = 0; i < missingNames.length; i++) {
            for (var j = 0; j < names.length; j++) {
                if (names[j].name == missingNames[i]) {
                    names[j].id = res2.insertId + i;
                    break;
                }
            }
        }
        await InsertRowEngineStorage(res, connection, tableId, names);
    }
}
async function InsertRowEngineStorage(res, connection, tableId, headers) {
    var result = await connection.query('insert into storage_entry(table_id) values(?)', [tableId]);
    var rowId = result.insertId;
    var sqlValues = [];
    var sql = 'insert into storage_value(row_id, column_id, value) value';
    for (var i = 0; i < headers.length; i++) {
        if (i != 0)
            sql += ", ";
        sql += "(?,?,?)";
        sqlValues.push(rowId);
        sqlValues.push(headers[i].id);
        sqlValues.push(headers[i].value);
    }
    var res2 = await connection.query(sql, sqlValues);
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify(rowId));
    res.end();
}
app.post('/backend/GetGameStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.headers) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'headers' is missing." }));
        res.end();
        return;
    }
    if (!req.body.condition)
        req.body.condition = "";
    if (!req.body.orderBy)
        req.body.orderBy = "";
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
    try {
        var result = await connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        if (result.length == 0) {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ headers: [], rows: [] }));
            res.end();
            return;
        }
        else {
            var output = await SelectColumnEngineStorage(res, connection, (0 + result[0].id), JSON.parse(req.body.headers), req.body.condition, req.body.orderBy);
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ headers: output.Columns, rows: output.Rows }));
            res.end();
            return;
        }
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
async function SelectColumnEngineStorage(res, connection, tableId, headers, condition, orderBy) {
    var names = [];
    if (!headers || headers.length == 0) {
        var result = await connection.query('select id, column_name from storage_table_column where table_id = ?', [tableId]);
        names.push({ id: 0, name: "rowId" });
        for (var i = 0; i < result.length; i++)
            names.push({ id: result[i].id, name: result[i].column_name });
        return SelectEngineStorage(res, connection, tableId, names, condition, orderBy);
    }
    else {
        for (var i = 0; i < headers.length; i++) {
            if (!headers[i].match(/^[a-z][a-z_0-9]*$/i))
                throw new Error("Column '" + headers[i] + "' is not a valid column name.");
        }
        var columnsNames = "('" + headers.join("','") + "')";
        var result = await connection.query('select id, column_name from storage_table_column where table_id = ? and column_name in ' + columnsNames, [tableId]);
        for (var j = 0; j < headers.length; j++) {
            var found = false;
            for (var i = 0; i < result.length; i++) {
                if (headers[j].toLowerCase() == result[i].column_name.toLowerCase()) {
                    names.push({ id: result[i].id, name: result[i].column_name });
                    found = true;
                    break;
                }
            }
            if (!found)
                names.push({ id: -1, name: headers[j] });
        }
        return SelectEngineStorage(res, connection, tableId, names, condition, orderBy);
    }
}
async function SelectEngineStorage(res, connection, tableId, columns, condition, orderBy) {
    var select = "";
    var join = "";
    var cols = [];
    for (var i = 0; i < columns.length; i++) {
        cols.push(columns[i].name);
        if (columns[i].id > 0) {
            select += ", col_" + i + ".value as c" + i;
            join += " left join storage_value as col_" + i + " on storage_entry.id = col_" + i + ".row_id and col_" + i + ".column_id = " + (columns[i].id + 0);
        }
    }
    var sql = 'select * from (select storage_entry.id' + select + ' from storage_entry ' + join + ' where table_id = ?) as s1';
    if (condition && condition != "") {
        var cond = QueryParser.BuildSQL(condition, columns);
        if (cond != "" && cond != " ")
            sql += " where " + cond + "";
    }
    if (orderBy) {
        if (orderBy == "rowId desc")
            sql += " order by id desc";
        if (orderBy == "rowId")
            sql += " order by id";
    }
    sql += " limit 30";
    var result = await connection.query(sql, [tableId]);
    var rows = [];
    for (var i = 0; i < result.length; i++) {
        var row = [];
        for (var j = 0; j < columns.length; j++) {
            if (columns[j].id == 0)
                row.push(result[i].id);
            else if (columns[j].id > 0)
                row.push(result[i]["c" + j]);
            else
                row.push(null);
        }
        rows.push(row);
    }
    return { Columns: cols, Rows: rows, Storage: columns };
}
app.post('/backend/DeleteOlderStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.keep) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'keep' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
        var result = await connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        var tableId = result[0].id;
        var res2 = await connection.query('select id from storage_entry where table_id = ? order by id desc limit 0, ?', [tableId, parseInt(req.body.keep)]);
        var ids = [];
        for (var i = 0; i < res2.length; i++)
            ids.push(res2[i].id);
        if (ids.length == 0) {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(true));
            res.end();
            return;
        }
        await connection.query('delete from storage_entry where id not in (' + ids.join(",") + ') and table_id = ?', [tableId]);
        await connection.query('delete from storage_value where row_id not in (select id from storage_entry)', []);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(true));
        res.end();
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
app.post('/backend/DeleteRowStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.row) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'row' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
        var result = await connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        var tableId = result[0].id;
        await connection.query('delete from storage_entry where id = ? and table_id = ?', [req.body.row, tableId]);
        await connection.query('delete from storage_value where row_id not in (select id from storage_entry)', []);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(true));
        res.end();
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
app.post('/backend/UpdateStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.column) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'column' is missing." }));
        res.end();
        return;
    }
    if (!req.body.value) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }
    if (!req.body.condition) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
        var result = await connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        if (result.length == 0) {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(0));
            res.end();
            return;
        }
        var output = await SelectColumnEngineStorage(res, connection, (0 + result[0].id), null, req.body.condition, null);
        if (!output || output.Rows.length == 0) {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(0));
            res.end();
            return;
        }
        var rows = output.Rows;
        var storageColumns = output.Storage;
        var ids = [];
        for (var i = 0; i < rows.length; i++)
            ids.push(rows[i][0]);
        var c = -1;
        for (var i = 0; i < storageColumns.length; i++) {
            if (storageColumns[i].name.toLowerCase() == req.body.column.toLowerCase()) {
                c = storageColumns[i].id;
                break;
            }
        }
        if (c == -1) {
            connection.end();
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "column '" + req.body.column + "' unknown." }));
            res.end();
            return;
        }
        var sql = "update storage_value set value = ? where row_id in (" + ids.join(",") + ") and column_id = " + c;
        //console.log(sql);
        var result2 = await connection.query(sql, [req.body.value]);
        connection.end();
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(result2.changedRows));
        res.end();
        return;
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
app.post('/backend/DeleteStorage', async function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    if (!req.body.condition) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    try {
        await connection.connect();
        var result = connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table]);
        if (result.length == 0) {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(0));
            res.end();
            return;
        }
        else {
            var output = await SelectColumnEngineStorage(res, connection, (0 + result[0].id), null, req.body.condition, null);
            var rows = output.Rows;
            if (rows.length == 0) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(0));
                res.end();
                return;
            }
            var ids = [];
            for (var i = 0; i < rows.length; i++)
                ids.push(rows[i][0]);
            var sql = "delete from storage_value where row_id in (" + ids.join(",") + ")";
            console.log(sql);
            await connection.query(sql, [req.body.value]);
            var sql = "delete from storage_entry where id in (" + ids.join(",") + ")";
            //console.log(sql);
            var result3 = await connection.query(sql, [req.body.value]);
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(result3.changedRows));
            res.end();
            return;
        }
    }
    catch (ex) {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});
app.post('/backend/DropTable', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        var sql = "delete from storage_value where column_id in (select id from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?))";
        connection.query(sql, [req.body.game, req.body.table], function (err1, result) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var sql = "delete from storage_entry where table_id in (select id from storage_table where game_id = ? and table_name = ?)";
            connection.query(sql, [req.body.game, req.body.table], function (err2, result2) {
                if (err2 != null) {
                    connection.end();
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                var sql = "delete from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?)";
                connection.query(sql, [req.body.game, req.body.table], function (err3, result3) {
                    if (err3 != null) {
                        connection.end();
                        console.log(err3);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    var sql = "delete from storage_table where game_id = ? and table_name = ?";
                    connection.query(sql, [req.body.game, req.body.table], function (err4, result4) {
                        connection.end();
                        if (err4 != null) {
                            console.log(err4);
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
        });
    });
});
app.post('/backend/ListStorage', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id,table_name from storage_table where game_id = ? order by table_name', [req.body.game], function (err1, result) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var list = [];
            for (var i = 0; i < result.length; i++)
                list.push({ id: result[i].id, name: result[i].table_name });
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(list));
            res.end();
        });
    });
});
app.post('/backend/ListColumnsStorage', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id, column_name from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?) order by column_name', [req.body.game, req.body.table], function (err1, result) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var list = [];
            for (var i = 0; i < result.length; i++)
                list.push({ id: result[i].id, name: result[i].column_name });
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(list));
            res.end();
        });
    });
});
app.post('/backend/StorageTableExists', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.table) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result) {
            connection.end();
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (result.length == 0) {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(false));
                res.end();
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(true));
                res.end();
            }
        });
    });
});
var sockets = [];
function findSockets(game_id, user_id) {
    var result = [];
    for (var i = 0; i < sockets.length; i++)
        if (sockets[i].game_id == game_id && sockets[i].user_id == user_id)
            result.push(sockets[i]);
    return result;
}
function ChatSendTo(gameId, username, message, data) {
    for (var i = 0; i < sockets.length; i++) {
        if (sockets[i].game_id == gameId && sockets[i].username == username) {
            var calls = [message];
            if (data && data.lenegth)
                calls.concat(data);
            else if (data)
                calls.push(data);
            sockets[i].emit.apply(sockets[i], calls);
            return true;
        }
    }
    return false;
}
io.on('connection', function (socket) {
    socket.serverId = sockets.length;
    sockets.push(socket);
    socket.channels = [];
    socket.on('disconnect', function () {
        if (!socket.username)
            return;
        io.to("" + socket.game_id + "@#global").emit('remove', socket.username);
        for (var i = 0; i < socket.channels.length; i++)
            io.to(socket.channels[i]).emit('leave', socket.username, socket.channels[i].split('@')[1]);
        //io.to("" + socket.game_id + "@" + socket.channels[i]).emit('leave', socket.username, socket.channels[i]);
        var id = socket.serverId;
        // Remove this socket from the known list
        for (var i = id + 1; i < sockets.length; i++)
            sockets[i].serverId--;
        sockets.splice(id, 1);
    });
    socket.on('join', function (game_id, token_id, channel) {
        if (!token_id)
            return;
        var tokenInfo = currentTokens[token_id];
        if (!tokenInfo)
            return;
        if (channel != "#global" && !("" + channel).match(/^[a-z _01-9\(\)\-]+$/i))
            return;
        socket.channels.push(game_id + "@" + channel);
        //console.log('Set name: ' + name + ' / ' + game_id);
        socket.game_id = game_id;
        socket.username = tokenInfo.user;
        socket.user_id = tokenInfo.id;
        socket.join("" + game_id + "@" + channel);
        io.to("" + socket.game_id + "@" + channel).emit('join', socket.username, channel);
    });
    socket.on('leave', function (game_id, token_id, channel) {
        if (!token_id)
            return;
        var tokenInfo = currentTokens[token_id];
        if (!tokenInfo)
            return;
        if (!("" + channel).match(/^[a-z _01-9\(\)\-]+$/i))
            return;
        for (var i = 0; i < socket.channels.length; i++) {
            if (socket.channels[i] == game_id + "@" + channel) {
                socket.channels.splice(i, 1);
                break;
            }
        }
        //console.log('Set name: ' + name + ' / ' + game_id);
        socket.game_id = game_id;
        socket.username = tokenInfo.user;
        socket.user_id = tokenInfo.id;
        io.to("" + socket.game_id + "@" + channel).emit('leave', socket.username, channel);
        socket.leave("" + game_id + "@" + channel);
    });
    socket.on('bot', function (botName, channel, message) {
        if (!socket.username)
            return;
        if (socket.channels.indexOf(socket.game_id + "@" + channel) == -1)
            return;
        /*if (!channel || channel.length < 3 || channel.charAt(0) != '#')
            return;*/
        if (socket.game_id == null || socket.game_id == undefined)
            return;
        io.to("" + socket.game_id + "@" + channel).emit('chatBot', botName, socket.username, channel, message);
    });
    socket.on('getChannelUserList', function (game_id, channel) {
        var users = [];
        for (var j = 0; j < sockets.length; j++) {
            for (var i = 0; i < sockets[j].channels.length; i++) {
                if (sockets[j].channels[i] == game_id + "@" + channel) {
                    users.push(sockets[j].username);
                    break;
                }
            }
        }
        socket.emit('channelUserList', channel, users);
    });
    socket.on('send', function (channel, message) {
        if (!socket.username)
            return;
        if (socket.channels.indexOf(socket.game_id + "@" + channel) == -1)
            return;
        /*if (!channel || channel.length < 3 || channel.charAt(0) != '#')
            return;*/
        if (socket.game_id == null || socket.game_id == undefined)
            return;
        //console.log("Send message on " + channel + ": " + message);
        io.to("" + socket.game_id + "@" + channel).emit('chat', socket.username, channel, message);
    });
    socket.on('position', function (zone, x, y, look, emote, emoteTimer, direction) {
        if (!socket.username)
            return;
        if (!socket.last_update) {
            socket.last_update = new Date();
        }
        else {
            var now = new Date();
            if ((now.getTime() - socket.last_update.getTime()) / 1000 > 10000)
                UpdatePosition(socket.user_id, socket.game_id, x, y, zone);
        }
        io.to("" + socket.game_id + "@#global").emit('position', zone, x, y, socket.username, look, emote, emoteTimer, direction);
    });
});
function DirectoryCheck(gameId) {
    var dir = __dirname + '/public/user_art/' + GameDir(gameId);
    if (!fs.existsSync(dir))
        return 0;
    var files = fs.readdirSync(dir);
    var tot = 0;
    for (var i = 0; i < files.length; i++) {
        var stat = fs.statSync(dir + "/" + files[i]);
        tot += stat.size;
    }
    return tot;
}
async function OwnerMaxSize(userId, gameId) {
    var connection = getConnection();
    if (!connection || gameId == -1)
        return 0;
    try {
        await connection.connect();
    }
    catch (ex) {
        connection.end();
        return 0;
    }
    try {
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [gameId, userId, userId]);
    }
    catch (ex) {
        console.log(ex);
        connection.end();
        return 0;
    }
    if (!r1 || !r1.length) {
        connection.end();
        console.log('No access right');
        return 0;
    }
    try {
        var r2 = await connection.query('select editor_version, rented_space, rented_space_till from users where id = (select main_owner from games where id = ?)', [gameId]);
        connection.end();
        if (!r2 || r2.length == 0)
            return 0;
        var size = r2[0].editor_version == 's' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (r2[0].rented_space_till) {
            var tillWhen = new Date(r2[0].rented_space_till);
            if (tillWhen.getTime() > new Date().getTime())
                size = r2[0].rented_space * 1024 * 1024;
        }
        return size;
    }
    catch (ex) {
        console.log(ex);
        connection.end();
        return 0;
    }
}
async function CanStoreSize(userId, gameId, sizeToPlace) {
    var maxSize = await OwnerMaxSize(userId, gameId);
    if (DirectoryCheck(gameId) + sizeToPlace < maxSize)
        return true;
    return false;
}
app.post('/backend/DirectoryList', function (req, res) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtObjectEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('select editor_version, rented_space, rented_space_till from users where id = (select main_owner from games where id = ?)', [req.body.game], function (err2, r2) {
                if (err2 != null) {
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
                var tillWhen = null;
                if (r2[0].rented_space_till) {
                    //console.log('have rented till ' + r2[0].rented_space_till);
                    tillWhen = new Date(r2[0].rented_space_till);
                    //console.log('parsed to ' + tillWhen.toString());
                    if (tillWhen.getTime() > new Date().getTime())
                        size = r2[0].rented_space * 1024 * 1024;
                    else
                        tillWhen = null;
                }
                var dir = __dirname + '/public/user_art/' + GameDir(req.body.game);
                if (!fs.existsSync(dir)) {
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
                for (var i = 0; i < files.length; i++) {
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
app.post('/backend/DeleteFile', function (req, res) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.filename) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'filename' is missing." }));
        res.end();
        return;
    }
    if (("" + req.body.filename).match(/[\/\\]/)) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'filename' is invalid." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ArtObjectEditor.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
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
app.post('/backend/AddGameNews', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.news) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'news' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('insert into game_news(game_id,user_id,news) values(?,?,?)', [req.body.game, tokenInfo.id, req.body.news], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(result.insertId));
                res.end();
                return;
            });
        });
    });
});
app.post('/backend/UpdateGameNews', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.news) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'news' is missing." }));
        res.end();
        return;
    }
    if (!req.body.id) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'id' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('update game_news set news = ?, user_id = ? where game_id = ? and id = ?', [req.body.news, tokenInfo.id, req.body.game, req.body.id], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
app.post('/backend/DeleteGameNews', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.id) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'news' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('delete from game_news where game_id = ? and id = ?', [req.body.game, req.body.id], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
app.post('/backend/GameNews', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select game_news.id, users.name, game_news.posted_on, game_news.posted_on, game_news.news from game_news left join users on game_news.user_id = users.id where game_id = ? order by game_news.id desc limit 20', [req.body.game], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(results.map((c) => { return { id: c.id, username: c.name, postedOn: c.posted_on, news: c.news }; })));
            res.end();
            return;
        });
    });
});
///<reference path="../app.ts" />
app.post('/backend/CanEdit', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
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
app.post('/backend/OwnerPlayers', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
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
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0) order by users.name limit 500', [tokenInfo.id, req.body.game, tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!results || results.length == 0) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(results.map(c => c.name)));
            res.end();
            return;
        });
    });
});
app.post('/backend/OwnerViewPlayer', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
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
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!results || results.length != 1) {
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
app.post('/backend/OwnerRecallPlayer', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
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
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!results || results.length != 1) {
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
app.post('/backend/OwnerResetPlayer', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
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
and (game_player.game_id in (select game_id from game_access_rights where user_id = ?) or rights.nb > 0)', [tokenInfo.id, req.body.user, req.body.game, tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!results || results.length != 1) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(false));
                res.end();
                return;
            }
            var userId = results[0].user_id;
            connection.query('delete from game_player where game_id = ? and user_id = ?', [req.body.game, tokenInfo.id], function (err1, r1) {
                connection.end();
                if (err1 != null) {
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
app.post('/backend/ResetContent', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('update games set data=null where id = ?', [req.body.game], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
app.post('/backend/ResetFullContent', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('update games set data=null where id = ?', [req.body.game], function (err2, result) {
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                connection.query('delete from game_maps where game_id = ?', [req.body.game], function (err2, result) {
                    connection.end();
                    if (err2 != null) {
                        console.log(err2);
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
    });
});
app.post('/backend/ResetMap', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('delete from game_maps where game_id = ?', [req.body.game], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
var StatType;
(function (StatType) {
    StatType[StatType["Player_Join"] = 1] = "Player_Join";
    StatType[StatType["Player_Login"] = 2] = "Player_Login";
    StatType[StatType["Monster_Kill"] = 100] = "Monster_Kill";
    StatType[StatType["Level_Up"] = 101] = "Level_Up";
    StatType[StatType["Player_Kill"] = 102] = "Player_Kill";
})(StatType || (StatType = {}));
function GameIncreaseStat(gameId, statId) {
    var connection = getConnection();
    if (!connection) {
        return;
    }
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    connection.connect(function (err) {
        if (err != null)
            return;
        connection.query("insert into game_stat_year(game_id, stat_id, year) values(?,?,?)", [gameId, statId, year], function (err1, r1) {
            connection.query("update game_stat_year set m" + month + "=m" + month + "+1 where game_id = ? and stat_id = ? and year = ?", [gameId, statId, year], function (err2, r2) {
                connection.query("insert into game_stat_month(game_id, stat_id, year, month) values(?,?,?,?)", [gameId, statId, year, month], function (err3, r3) {
                    connection.query("update game_stat_month set d" + day + "=d" + day + "+1 where game_id = ? and stat_id = ? and year = ? and month = ?", [gameId, statId, year, month], function (err4, r4) {
                        connection.query("insert into game_stat_day(game_id, stat_id, year, month, day) values(?,?,?,?,?)", [gameId, statId, year, month, day], function (err5, r5) {
                            connection.query("update game_stat_day set h" + hour + "=h" + hour + "+1 where game_id = ? and stat_id = ? and year = ? and month = ? and day = ?", [gameId, statId, year, month, day], function (err6, r6) {
                                connection.end();
                                return;
                            });
                        });
                    });
                });
            });
        });
    });
}
app.post('/backend/AddStat', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.stat) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }
    if (isNaN(parseInt(req.body.stat)) || parseInt(req.body.stat) < 100) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is wrong." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    GameIncreaseStat(req.body.game, req.body.stat);
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify(true));
    res.end();
});
app.post('/backend/GetYearStat', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.stat) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }
    if (!req.body.year) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }
            connection.query('select m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12 from game_stat_year where game_id = ? and stat_id = ? and year = ?', [req.body.game, req.body.stat, req.body.year], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0) {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                var resValue = [];
                for (var i = 1; i <= 12; i++)
                    resValue.push(result[0]['m' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});
app.post('/backend/GetMonthStat', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.stat) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }
    if (!req.body.year) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }
    if (!req.body.month) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'month' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database 2." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }
            connection.query('select d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31 from game_stat_month where game_id = ? and stat_id = ? and year = ? and month = ?', [req.body.game, req.body.stat, req.body.year, req.body.month], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0) {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                var resValue = [];
                for (var i = 1; i <= 31; i++)
                    resValue.push(result[0]['d' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});
app.post('/backend/GetDayStat', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.stat) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }
    if (!req.body.year) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }
    if (!req.body.month) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'month' is missing." }));
        res.end();
        return;
    }
    if (!req.body.day) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'day' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database 2." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }
            connection.query('select h0,h1,h2,h3,h4,h5,h6,h7,h8,h9,h10,h11,h12,h13,h14,h15,h16,h17,h18,h19,h20,h21,h22,h23 from game_stat_day where game_id = ? and stat_id = ? and year = ? and month = ? and day = ?', [req.body.game, req.body.stat, req.body.year, req.body.month, req.body.day], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0) {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                var resValue = [];
                for (var i = 0; i <= 23; i++)
                    resValue.push(result[0]['h' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});
var defaultTilesets = {};
/// <reference path="TilesetInformation.ts" />
/// <reference path="../../Libs/Point.ts" />
/// <reference path="../../public/Engine/Logic/World/SerializedWorld.ts" />
app.get('/backend/ExportJson', function (req, res, next) {
    if (!req.query.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.query.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.query.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            var exportResult = { gameData: null, maps: [] };
            connection.query('select data from games where id = ?', [req.query.game], function (err2, result) {
                exportResult.gameData = result[0].data;
                connection.query('select area_x, area_y, zone, data from game_maps where game_id = ?', [req.query.game], function (err2, r2) {
                    connection.end();
                    if (err2 != null) {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    for (var i = 0; i < r2.length; i++) {
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
app.post('/upload/ImportJson', upload.single('fileUpload'), function (req, res) {
    if (!req.file) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "the file is missing." }) + "');</script>");
        res.end();
        return;
    }
    if (!req.file.originalname.toLowerCase().endsWith(".json")) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "must upload a json file" }) + "');</script>");
        res.end();
        return;
    }
    var importData = null;
    try {
        importData = JSON.parse(fs.readFileSync(req.file.path));
        if (!importData.gameData)
            throw "Invalid format";
        if (!importData.maps)
            throw "Invalid format";
    }
    catch (ex) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Import file invalid." }) + "');</script>");
        res.end();
        return;
    }
    ImportData(importData, req, res);
});
app.post('/backend/DirectImportJson', function (req, res) {
    if (!req.body.data) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "parameter 'data' is missing." }) + "');</script>");
        res.end();
        return;
    }
    try {
        ImportData(JSON.parse(req.body.data), req, res);
    }
    catch (ex) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Import file invalid." }) + "');</script>");
        res.end();
        return;
    }
});
function ImportData(importData, req, res) {
    if (!importData.gameData || !importData.maps) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "invalid format." }) + "');</script>");
        res.end();
        return;
    }
    if (!req.body.game) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "parameter 'game' is missing." }) + "');</script>");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        fs.unlinkSync(req.file.path);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "token not valid." }) + "');</script>");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (1)." }) + "');</script>");
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (2)." }) + "');</script>");
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "No write access." }) + "');</script>");
                res.end();
                return;
            }
            connection.query('update games set data = ? where id = ?', [importData.gameData, req.body.game], function (err1) {
                if (err1 != null) {
                    connection.end();
                    console.log(err1);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ error: "Error with the database (3)." }) + "');</script>");
                    res.end();
                    return;
                }
                connection.query('delete from game_maps where game_id = ?', [req.body.game], function (err2) {
                    if (err2 != null) {
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
function ImportMap(res, connection, gameId, maps) {
    try {
        if (maps.length == 0) {
            connection.end();
            //console.log("Import done.");
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<script>window.parent.ImportExport.Result('" + JSON.stringify({ result: "Done." }) + "');</script>");
            res.end();
            return;
        }
        var m = maps.shift();
        //console.log("Importing " + m.x + "," + m.y + "," + m.zone);
        connection.query('replace game_maps(game_id,area_x,area_y,zone,data) values(?,?,?,?,?)', [gameId, m.x, m.y, m.zone, m.data], function (err1, result) {
            if (err1 != null) {
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
    catch (ex) {
    }
}
app.get('/backend/ExportGame', function (req, res, next) {
    if (!req.query.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.query.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.query.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            var exportResult = { gameData: null, maps: [] };
            connection.query('select data from games where id = ?', [req.query.game], function (err2, result) {
                exportResult.gameData = JSON.parse(result[0].data);
                var zip = new (require('node-zip'))();
                ChangeGameUrls(exportResult.gameData, "", (origName, newName) => {
                    zip.file(newName, fs.readFileSync(__dirname + '/public' + origName));
                });
                connection.query('select area_x, area_y, zone, data from game_maps where game_id = ?', [req.query.game], function (err2, r2) {
                    connection.end();
                    if (err2 != null) {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    for (var i = 0; i < r2.length; i++) {
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
function CleanupUrl(url, prefix, changeCallback) {
    if (changeCallback)
        changeCallback(url.replace(/\?.*$/, ""), url.replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
    return prefix + url.replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, "");
}
function CleanupFileCodeVariable(code, prefix, changeCallback) {
    var m = code.match(/\/\/\/ [a-z]+:\s+(\/[^\/]+\/[^\/]+\/[^,]+),image_upload/i);
    if (changeCallback)
        changeCallback(m[1].replace(/\?.*$/, ""), m[1].replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
    /// Icon: /art/tileset1/fast_attack.png,image_upload
    return code.replace(/(\/\/\/ [a-z]+:\s+)\/[^\/]+\/[^\/]+\/([^,]+,image_upload)/gi, "$1$2");
}
function ChangeGameUrls(world, urlPrefix = "", changeCallback = null) {
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
var key = "ThisIsMyS3Cr3!K3Y";
function CreateLicensePayment(userId, price) {
    var data = { id: userId, price: price, buy: "license" };
    data['trx'] = sha256(JSON.stringify(data) + key, key);
    return JSON.stringify(data);
}
function CreateCreditPayment(userId, credits, price) {
    var data = { id: userId, price: price, buy: "credits", credits: credits };
    data['trx'] = sha256(JSON.stringify(data) + key, key);
    return JSON.stringify(data);
}
function VerifyPayment(source) {
    try {
        var data = JSON.parse(source);
    }
    catch (ex) {
        console.log("Not a correct JSON: " + source);
        return false;
    }
    var cert = data.trx;
    delete data.trx;
    return (sha256(JSON.stringify(data) + key, key) == cert && data.buy == "license");
}
app.post('/backend/GetCreditButton', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.credits) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'credits' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var credits = parseInt(req.body.credits);
    if (isNaN(credits)) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid value" }));
        res.end();
        return;
    }
    var price = [];
    price[50] = 7;
    price[100] = 13;
    price[200] = 24;
    if (!price[credits]) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid value" }));
        res.end();
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(CreateCreditPayment(tokenInfo.id, credits, price[credits]));
    res.end();
    return;
});
app.post('/backend/GetTotalCredits', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("select credits from users where id = ? limit 1", [tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write("" + results[0].credits);
            res.end();
        });
    });
    return;
});
app.post('/backend/GetIpnLicenseButton', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("select editor_version from users where id = ? limit 1", [tokenInfo.id], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.end();
            if (results && results.length && results.length == 1 && results[0].editor_version == 'f') {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(CreateLicensePayment(tokenInfo.id, 30));
                //res.write(CreateLicensePayment(tokenInfo.id, 24));
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ "license": results[0].editor_version }));
            res.end();
        });
    });
    return;
});
function UpgradeToStandardLicense(userId) {
    var connection = getConnection();
    if (!connection) {
        console.log("Error while connecting to the db");
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("update users set editor_version = 's' where id = ?", [userId], function (err1, r1) {
            connection.end();
        });
    });
}
function AddCredits(userId, credits) {
    var connection = getConnection();
    if (!connection) {
        console.log("Error while connecting to the db");
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("update users set credits = credits + ? where id = ?", [credits, userId], function (err1, r1) {
            connection.query("insert into credits_log(from_user, to_user, quantity, reason) values(null, ?, ?, 'Purchase credits.')", [userId, credits], function (err2, r2) {
                connection.end();
            });
        });
    });
}
function CheckTransaction(trx, email, data, gross, fee, callbackOk) {
    var connection = getConnection();
    if (!connection) {
        console.log("Error while connecting to the db");
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("select count(id) \"nb\" from paypal_transactions where id = ?", [trx], function (err1, r1) {
            if (err1) {
                connection.end();
                console.log("Error while checking transactions: " + err1);
            }
            else if (r1 && r1.length && r1[0].nb == 0) {
                connection.query("insert into paypal_transactions(id, data, payer_email, mc_gross, mc_fee) values(?,?,?,?,?)", [trx, data, email, gross, fee], function (err2, r2) {
                    connection.end();
                    if (err2)
                        console.log("Error while inserting transaction: " + err2);
                    else
                        callbackOk();
                    return;
                });
                return;
            }
            else {
                //console.log("Transaction already received.");
                connection.end();
            }
        });
    });
}
app.post('/backend/IpnVerify', function (req, res, next) {
    var ipn = require('paypal-ipn');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("Ok");
    var ipnSandbox = false;
    var callback = function (err, msg) {
        if (err) {
            console.error(err);
        }
        else {
            //console.log(req.body.payment_status);
            // Do stuff with original params here
            //console.log(req.body);
            if (req.body.payment_status == 'Completed' && req.body.mc_currency == "USD" && ((req.body.receiver_email == "bertrand@nodalideas.com" && ipnSandbox == false) || (req.body.receiver_email == "hazard3d-facilitator@yahoo.com" && ipnSandbox == true))) {
                //console.log('Transaction received as completed');
                if (VerifyPayment(req.body.custom) && req.body.mc_gross == JSON.parse(req.body.custom).price) {
                    CheckTransaction(req.body.txn_id, req.body.payer_email, req.body.custom, req.body.mc_gross, req.body.mc_fee, () => {
                        //console.log("Got IPN verification");
                        // Payment has been confirmed as completed
                        switch (req.body.item_name) {
                            case "license_standard":
                                console.log("Verification succeed");
                                var data = JSON.parse(req.body.custom);
                                UpgradeToStandardLicense(data.id);
                                break;
                            case "credits":
                                console.log("Verification succeed");
                                var data = JSON.parse(req.body.custom);
                                AddCredits(data.id, data.credits);
                                break;
                        }
                    });
                }
                else
                    console.log("Verification failed...");
            }
        }
    };
    // Sandbox one
    //You can also pass a settings object to the verify function:
    if (ipnSandbox)
        ipn.verify(req.body, { 'allow_sandbox': true }, callback);
    // Full one
    else
        ipn.verify(req.body, callback);
});
///<reference path="../app.ts" />
app.post('/backend/GetMap', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.x) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }
    if (!req.body.y) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }
    if (!req.body.zone) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'zone' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select data from game_maps where game_id = ? and area_x = ? and area_y = ? and zone = ?', [req.body.game, req.body.x, req.body.y, req.body.zone], function (err1, result) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (result.length == 0) {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(result[0].data));
                res.end();
                return;
            }
        });
    });
});
app.post('/backend/FindNPC', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.npc) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'npc' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select area_x, area_y, zone, data from game_maps where game_id = ? ', [req.body.game], function (err1, results) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            for (var i = 0; i < results.length; i++) {
                if (!results[i].data)
                    continue;
                var map = JSON.parse(results[i].data);
                if (map.StoredNPC)
                    for (var j = 0; j < map.StoredNPC.length; j++) {
                        if (map.StoredNPC[j].Name == req.body.npc) {
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
        });
    });
});
app.post('/backend/UpdateMapDetails', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('select area_x,area_y,zone,data from game_maps where game_id = ?', [req.body.game], function (err2, r2) {
                if (err1 != null) {
                    connection.end();
                    console.log(err1);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                var query = 'replace game_maps(game_id,area_x,area_y,zone,data)';
                var queryData = [];
                var modified = false;
                for (var i = 0; i < r2.length; i++) {
                    var rowModified = false;
                    var data = MapSerializer.Parse(r2[i].data);
                    if (req.body.oldObject) {
                        // Work on the map objects
                        for (var j = 0; j < data.Objects.length;) {
                            if (req.body.newObject && data.Objects[j].Name == req.body.oldObject) {
                                rowModified = true;
                                data.Objects[j].Name = req.body.newObject;
                                j++;
                            }
                            else if (data.Objects[j].Name == req.body.oldObject) {
                                rowModified = true;
                                data.Objects.splice(j, 1);
                            }
                            else
                                j++;
                        }
                        // Work on the map chests
                        for (var j = 0; j < data.Chests.length;) {
                            if (req.body.newObject && data.Chests[j].Name == req.body.oldObject) {
                                rowModified = true;
                                data.Chests[j].Name = req.body.newObject;
                                j++;
                            }
                            else if (data.Chests[j].Name == req.body.oldObject) {
                                rowModified = true;
                                data.Objects.splice(j, 1);
                            }
                            else
                                j++;
                        }
                    }
                    // Work on the map houses
                    if (req.body.oldHouse) {
                        for (var j = 0; j < data.Houses.length;) {
                            if (req.body.newHouse && data.Houses[j].Name == req.body.oldHouse) {
                                rowModified = true;
                                data.Houses[j].Name = req.body.newHouse;
                                j++;
                            }
                            else if (data.Houses[j].Name == req.body.oldHouse) {
                                rowModified = true;
                                data.Houses.splice(j, 1);
                            }
                            else
                                j++;
                        }
                    }
                    // Work on the map monsters
                    if (req.body.oldMonster) {
                        for (var j = 0; j < data.StoredMonsters.length;) {
                            if (req.body.newMonster && data.StoredMonsters[j].Name == req.body.oldMonster) {
                                rowModified = true;
                                data.StoredMonsters[j].Name = req.body.newMonster;
                                j++;
                            }
                            else if (data.StoredMonsters[j].Name == req.body.oldMonster) {
                                rowModified = true;
                                data.StoredMonsters.splice(j, 1);
                            }
                            else
                                j++;
                        }
                    }
                    // Work on the map NPC
                    if (req.body.oldNpc) {
                        for (var j = 0; j < data.StoredNPC.length;) {
                            if (req.body.newNpc && data.StoredNPC[j].Name == req.body.oldNpc) {
                                rowModified = true;
                                data.StoredNPC[j].Name = req.body.newNpc;
                                j++;
                            }
                            else if (data.StoredNPC[j].Name == req.body.oldNpc) {
                                rowModified = true;
                                data.StoredNPC.splice(j, 1);
                            }
                            else
                                j++;
                        }
                    }
                    if (rowModified) {
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
                if (!modified) {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(modified));
                    res.end();
                    return;
                }
                connection.query(query, queryData, function (err3, res3) {
                    connection.end();
                    if (err3 != null) {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(modified));
                    res.end();
                    return;
                });
            });
        });
    });
});
app.post('/backend/SaveMap', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.x) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }
    if (!req.body.y) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }
    if (!req.body.zone) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'zone' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.data) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('replace game_maps(game_id,area_x,area_y,zone,data) values(?,?,?,?,?)', [req.body.game, req.body.x, req.body.y, req.body.zone, req.body.data], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
app.post('/backend/RemoveZoneMap', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.zone) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'zone' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('delete from game_maps where game_id = ? and zone = ?', [req.body.game, req.body.zone], function (err2, result) {
                connection.end();
                if (err2 != null) {
                    console.log(err2);
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
});
var numberCompressionPossibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
class NumberCompression {
    static StringToNumber(source, position, nbChar) {
        var result = 0;
        for (var i = 0; i < nbChar; i++) {
            var c = source.charAt(i + position);
            result += numberCompressionPossibleChars.indexOf(c) * Math.pow(numberCompressionPossibleChars.length, i);
        }
        return result;
    }
    static StringToArray(source) {
        var result = [];
        var strNb = "";
        var i = 0;
        for (; i < source.length; i++) {
            var c = source.charAt(i);
            if (c == "-")
                break;
            strNb += c;
        }
        i++;
        var nbChar = parseInt(strNb);
        strNb = "";
        for (; i < source.length; i++) {
            var k = source.charCodeAt(i);
            if (k >= 48 && k <= 57)
                strNb += source.charAt(i);
            else {
                var nb = NumberCompression.StringToNumber(source, i, nbChar);
                i += nbChar - 1;
                if (strNb == "")
                    result.push(nb);
                else {
                    var n = parseInt(strNb);
                    for (var j = 0; j < n; j++)
                        result.push(nb);
                    strNb = "";
                }
            }
        }
        return result;
    }
    // Numbers must be positive!
    static NumberToString(source, nbChar) {
        var result = "";
        var rest = source;
        for (var i = 0; i < nbChar; i++) {
            result += numberCompressionPossibleChars.charAt(rest % numberCompressionPossibleChars.length);
            rest = Math.floor(rest / numberCompressionPossibleChars.length);
        }
        return result;
    }
    // Numbers must be positive!
    static ArrayToString(source) {
        var result = "";
        var m = Math.max.apply(null, source);
        // Calculate how many characters we need to encode the numbers
        var nbChar = Math.max(1, Math.ceil(Math.log(Math.max.apply(null, source)) / Math.log(numberCompressionPossibleChars.length - 1)));
        result += "" + nbChar + "-";
        var last = null;
        var count = 0;
        for (var i = 0; i < source.length; i++) {
            var n = NumberCompression.NumberToString(source[i], nbChar);
            if (n == last)
                count++;
            else {
                if (last != null) {
                    if (count > 1)
                        result += "" + count + last;
                    else
                        result += last;
                }
                last = n;
                count = 1;
            }
        }
        if (count > 1)
            result += "" + count + last;
        else
            result += last;
        return result;
    }
}
/// <reference path="../../public/Engine/Libs/NumberCompression.ts" />
class MapSerializer {
    static Parse(data) {
        var result = JSON.parse(data);
        result.Background = NumberCompression.StringToArray(result.Background);
        var objects = result.Objects;
        result.Objects = [];
        for (var i in objects)
            for (var j = 0, s = objects[i]; j < s.length; j += 6)
                result.Objects.push({ Name: i, X: NumberCompression.StringToNumber(s, j, 3), Y: NumberCompression.StringToNumber(s, j + 3, 3) });
        return result;
    }
    static Stringify(data) {
        var objects = {};
        for (var i = 0; i < data.Objects.length; i++) {
            if (!objects[data.Objects[i].Name])
                objects[data.Objects[i].Name] = "";
            objects[data.Objects[i].Name] += NumberCompression.NumberToString(data.Objects[i].X, 3) + NumberCompression.NumberToString(data.Objects[i].Y, 3);
        }
        data.Background = NumberCompression.ArrayToString(data.Background);
        data.Objects = objects;
        return JSON.stringify(data);
    }
}
app.post('/backend/AddGameMessage', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.to) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'to' is missing." }));
        res.end();
        return;
    }
    if (!req.body.subject) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'subject' is missing." }));
        res.end();
        return;
    }
    if (!req.body.message) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'message' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        var toUsers = "";
        var users = [];
        var p = req.body.to.replace(/,/g, ";").replace(/ /g, "").split(';');
        for (var i = 0; i < p.length; i++) {
            if (p[i] == "")
                continue;
            if (!p[i].match(/^[a-z0-9]+$/i)) {
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
        connection.query('select game_player.user_id, users.name from game_player left join users on game_player.user_id = users.id where user_id in (select id from users where name in (' + toUsers + ')) and game_id = ?', [req.body.game], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var toIds = [];
            if (r1) {
                for (var i = 0; i < r1.length; i++)
                    users.splice(users.indexOf(r1[i].name.toLowerCase()), 1);
            }
            var unknown = "";
            for (var i = 0; i < users.length; i++) {
                if (unknown == "")
                    unknown = "'" + users[i] + "'";
                else
                    unknown = ", '" + users[i] + "'";
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "Unknown user(s): " + unknown + "." }));
                res.end();
                return;
            }
            for (var i = 0; i < r1.length; i++) {
                SendGameMessage(req.body.game, tokenInfo.id, r1[i].user_id, req.body.to, req.body.subject, req.body.message, req.body.attachments);
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(true));
            res.end();
        });
    });
});
function SendGameMessage(gameId, fromUser, toUser, destination, subject, message, attachments) {
    var connection = getConnection();
    if (!connection)
        return;
    connection.connect(function (err) {
        if (err != null)
            return;
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].user_id == toUser && sockets[i].game_id == gameId) {
                sockets[i].emit('new_message', null);
            }
        }
        connection.query('insert into game_player_messages(game_id,inbox,from_user,to_user,subject,message,attachments) values(?,?,?,?,?,?,?)', [gameId, toUser, fromUser, destination, subject, message, attachments], function (err2, result) {
            if (err2 != null) {
                console.log(err2);
                return;
            }
            return;
        });
    });
}
app.post('/backend/CheckNewGameMessage', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("select count(id) \"nb\" from game_player_messages where inbox = ? and game_id = ? and new_message = 'y'", [tokenInfo.id, req.body.game], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
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
        });
    });
});
app.post('/backend/GetGameMessageList', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("select game_player_messages.id, game_player_messages.new_message, \
game_player_messages.sent, users.name \"from_user\", \
game_player_messages.subject \
from game_player_messages left join users on game_player_messages.from_user = users.id \
where inbox = ? and game_id = ? \
order by game_player_messages.id desc \
limit 100", [tokenInfo.id, req.body.game], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            connection.end();
            var resData = [];
            for (var i = 0; i < r1.length; i++) {
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
            return;
        });
    });
});
app.post('/backend/GetGameMessage', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.id) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'id' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("update game_player_messages set new_message='n', sent=sent \
where inbox = ? and game_id = ? and game_player_messages.id = ? and new_message <> 'n' limit 1", [tokenInfo.id, req.body.game, req.body.id], function (err0, r0) {
            if (err0 != null) {
                connection.end();
                console.log(err0);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var isNew = (r0.changedRows != 0);
            connection.query("select game_player_messages.id, \
game_player_messages.sent, users.name \"from_user\", \
game_player_messages.to_user, \
game_player_messages.subject, \
game_player_messages.message, \
game_player_messages.attachments \
from game_player_messages left join users on game_player_messages.from_user = users.id \
where inbox = ? and game_id = ? and game_player_messages.id = ? limit 1", [tokenInfo.id, req.body.game, req.body.id], function (err1, r1) {
                if (err1 != null) {
                    connection.end();
                    console.log(err1);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                if (!r1 || !r1.length) {
                    connection.end();
                    console.log(err1);
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                connection.end();
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
                return;
            });
        });
    });
});
app.post('/backend/DeleteGameMessage', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.id) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'id' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query("delete from game_player_messages \
where inbox = ? and game_id = ? and game_player_messages.id = ? limit 1", [tokenInfo.id, req.body.game, req.body.id], function (err0, r0) {
            if (err0 != null) {
                connection.end();
                console.log(err0);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(true));
            res.end();
            return;
        });
    });
});
var charsRegex = /[\0\b\t\n\r\x1a\"\'\\]/g;
var charsMap = {
    '\0': '\\0',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\x1a': '\\Z',
    '"': '\\"',
    '\'': '\\\'',
    '\\': '\\\\'
};
class QueryParser {
    constructor(query) {
        this.inSeparator = "(),";
        this.query = query;
        this.position = 0;
        this.length = this.query.length;
    }
    static BuildSQL(queryString, columns) {
        var query = new QueryParser(queryString);
        return QueryParser.ToSql(query.Parse(), columns);
    }
    static ToSql(queryElement, columns) {
        if (queryElement.first)
            return "(" + QueryParser.ToSql(queryElement.first, columns) + (queryElement.or ? " OR " + QueryParser.ToSql(queryElement.or, columns) : " AND " + QueryParser.ToSql(queryElement.and, columns)) + ")";
        //console.log(queryElement);
        var result = "";
        var c = QueryParser.FindColumn(queryElement.col, columns);
        switch (queryElement.check) {
            case "is":
                result += "c" + c;
                result += " = ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case "is not":
                result += "c" + c;
                result += " <> ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case "is empty":
                result += "(c" + c;
                result += " is empty or c" + c + " = '')";
                break;
            case "contains":
                result += "c" + c;
                result += " like '%" + QueryParser.EscapeString(queryElement.value) + "%'";
                break;
            case "not contains":
                result += "c" + c;
                result += " not like '%" + QueryParser.EscapeString(queryElement.value) + "%'";
                break;
            case "starts":
                result += "c" + c;
                result += " like '" + QueryParser.EscapeString(queryElement.value) + "%'";
                break;
            case "ends":
                result += "c" + c;
                result += " like '%" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case ">":
                result += "c" + c;
                result += " > ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case ">=":
                result += "c" + c;
                result += " >= ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case "<":
                result += "c" + c;
                result += " < ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            case "<=":
                result += "c" + c;
                result += " <= ";
                result += "'" + QueryParser.EscapeString(queryElement.value) + "'";
                break;
            default:
                throw "Operation " + queryElement.check + " not yet supported.";
        }
        return result;
    }
    static FindColumn(name, columns) {
        for (var i = 0; i < columns.length; i++) {
            //console.log("? " + columns[i].name + " == " + name);
            if (columns[i].name.toLowerCase() == name.toLowerCase())
                return i;
        }
        throw "Column '" + name + "' not known";
    }
    static EscapeString(toEscape) {
        var chunkIndex = charsRegex.lastIndex = 0;
        var result = '';
        var match;
        while ((match = charsRegex.exec(toEscape))) {
            result += toEscape.slice(chunkIndex, match.index) + charsMap[match[0]];
            chunkIndex = charsRegex.lastIndex;
        }
        // Nothing was escaped
        if (chunkIndex === 0)
            return toEscape;
        if (chunkIndex < toEscape.length)
            return result + toEscape.slice(chunkIndex);
        return result;
        /*var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-_.,:;";
        var result = "";
        for (var i = 0; i < toEscape.length; i++)
        {
            var c = toEscape[i];
            if (allowedChars.indexOf(c) != -1)
                result += c;
            else if (c == "'")
                result += "''";
        }
        return result;*/
    }
    Parse() {
        return this.ParseCondition();
    }
    ParseCondition() {
        this.SkipWhiteSpaces();
        var first = null;
        if (this.PeekChar() == "(") {
            this.NextChar();
            this.SkipWhiteSpaces();
            first = this.ParseCondition();
            if (this.PeekChar() != ")")
                throw "Missing closing bracket (position: " + this.position + ").";
            this.NextChar();
        }
        else {
            var valA = this.NextValue();
            if (valA.toLowerCase() == "any")
                valA = "ANY";
            var cond = this.NextCondition();
            var valB = null;
            if (cond == "in") {
                if (this.NextWord() != "(")
                    throw "Missing '(' with the in operator.";
                var values = [];
                while (this.PeekWord() != ")") {
                    values.push(this.NextValue());
                    if (this.PeekWord() == ")") {
                        this.NextWord();
                        break;
                    }
                    if (this.PeekWord() != ",")
                        throw "Missing ',' between the 'in' options.";
                    this.NextWord();
                }
                first = { col: valA, check: "is", value: values.shift() };
                while (values.length > 0)
                    first = { first: first, or: { col: valA, check: "is", value: values.shift() } };
            }
            else {
                if (cond != "Is not empty" && cond != "Is empty")
                    valB = this.NextValue();
                else
                    valB = "";
                first = { col: valA, check: cond, value: valB };
            }
        }
        this.SkipWhiteSpaces();
        if (!this.HasChar())
            return first;
        if (this.PeekChar() == ")")
            return first;
        if (this.PeekWord().toLowerCase() != "and" && this.PeekWord().toLowerCase() != "or")
            throw "Missing logic operator (and / or)  (position: " + this.position + ").";
        var logic = this.NextWord();
        this.SkipWhiteSpaces();
        var second = this.ParseCondition();
        switch (logic.toLowerCase()) {
            case "and":
                return { first: first, and: second };
            case "or":
                return { first: first, or: second };
        }
    }
    HasChar() {
        return this.position < this.length;
    }
    PeekChar() {
        if (this.position >= this.length)
            return null;
        return this.query.charAt(this.position);
    }
    RollbackChar() {
        this.position--;
    }
    NextChar() {
        if (this.position >= this.length)
            throw "End reached while expecting a character.";
        return this.query.charAt(this.position++);
    }
    PeekWord() {
        var storedPosition = this.position;
        this.SkipWhiteSpaces();
        var result = "";
        while (this.HasChar()) {
            if (result != "" && this.inSeparator.indexOf(this.PeekChar()) != -1)
                break;
            var c = this.NextChar();
            if (c == " ")
                break;
            result += c;
            if (this.inSeparator.indexOf(c) != -1)
                break;
        }
        this.position = storedPosition;
        return result;
    }
    NextWord() {
        this.SkipWhiteSpaces();
        var result = "";
        while (this.HasChar()) {
            if (result != "" && this.inSeparator.indexOf(this.PeekChar()) != -1)
                break;
            var c = this.NextChar();
            if (c == " ")
                break;
            result += c;
            if (this.inSeparator.indexOf(c) != -1)
                break;
        }
        return result;
    }
    SkipWhiteSpaces() {
        while (this.PeekChar() == " " || this.PeekChar() == "\t" || this.PeekChar() == "\n") {
            this.NextChar();
        }
    }
    NextCondition() {
        switch (this.PeekWord().toLowerCase()) {
            case "contains":
            case "contain":
                this.NextWord();
                return "contains";
            case "doesn't":
            case "not":
                this.NextWord();
                switch (this.PeekWord().toLowerCase()) {
                    case "contains":
                    case "contain":
                        this.NextWord();
                        return "not contains";
                    case "like":
                        this.NextWord();
                        return "not Like";
                    case "empty":
                        this.NextWord();
                        return "not empty";
                    case "equal":
                    case "equals":
                    case "is":
                        this.NextWord();
                        return "not Is";
                    default:
                        throw "Unknown condition (position: " + this.position + ").";
                }
            case "starts":
            case "start":
                this.NextWord();
                if (this.PeekWord().toLowerCase() == "with")
                    this.NextWord();
                return "starts with";
            case "ends":
            case "end":
                this.NextWord();
                if (this.PeekWord().toLowerCase() == "with")
                    this.NextWord();
                return "ends with";
            /*case "like":
                this.NextWord();
                return "like";*/
            case "empty":
                this.NextWord();
                return "is empty";
            case "is":
                this.NextWord();
                if (this.PeekWord() == "not") {
                    this.NextWord();
                    if (this.PeekWord().toLowerCase() == "empty") {
                        this.NextWord();
                        return "not empty";
                    }
                    else
                        return "not Is";
                    //throw "Unknown condition (position: " + this.position + ").";
                }
                else if (this.PeekWord().toLowerCase() == "empty") {
                    this.NextWord();
                    return "is empty";
                }
                return "is";
            /*case "in":
                this.NextWord();
                if (this.PeekWord() != "(")
                    throw "Missing '(' after the in condition (position: " + this.position + ").";
                return "in";*/
            case "!=":
            case "<>":
                this.NextWord();
                return "not Is";
            case "equal":
            case "equals":
            case "=":
            case "==":
                this.NextWord();
                return "is";
            case ">":
                this.NextWord();
                return ">";
            case ">=":
                this.NextWord();
                return ">=";
            case "<":
                this.NextWord();
                return "<";
            case "<=":
                this.NextWord();
                return "<=";
            default:
                throw "Unknown condition (position: " + this.position + ").";
        }
    }
    NextValue() {
        this.SkipWhiteSpaces();
        var init = this.PeekChar();
        if (init == "'" || init == "\"" || init == "[")
            this.NextChar();
        var result = "";
        while (this.HasChar()) {
            var c = this.NextChar();
            if (init == "'" && c == "'") {
                if (this.HasChar() && this.PeekChar() == "'") {
                    c += "'";
                    this.NextChar();
                }
                else
                    break;
            }
            if (init == "\"" && c == "\"")
                break;
            if (init == "[" && c == "]")
                break;
            if (init != "'" && init != "\"" && init != "[" && (c == " " || c == ")")) {
                if (c == ")")
                    this.RollbackChar();
                break;
            }
            result += c;
        }
        return result;
    }
}
app.get('/backend/RSS', function (req, res) {
    var data = fs.readFileSync(__dirname + "/public/todo.html", "utf-8");
    var m = data.match(/<h2>Completed<\/h2>[\s\n\r]*(<h3>[\w\W\s\S\n\r]*<\/ul>)/i);
    var news = m[1].split("</ul>");
    var rss = '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
    rss += '<channel>';
    rss += '<atom:link href= "https://www.dotworldmaker.com/backend/RSS" rel= "self" type= "application/rss+xml" />';
    rss += '<title>Dot World Maker</title>';
    rss += '<link>https://www.dotworldmaker.com/</link>';
    rss += '<description>News about Dot World Maker - The tool which let you create 2D MORPG directly from your browser.</description>';
    rss += '<language>en-us</language>';
    rss += '<copyright>Copyright 2016 Alain Bertrand</copyright>';
    rss += '<lastBuildDate>' + (new Date()).toUTCString() + '</lastBuildDate>';
    rss += '<ttl>40</ttl>';
    for (var i = 0; i < news.length; i++) {
        if (!news[i] || news[i] == "" || news[i].trim() == "")
            continue;
        var textDate = news[i].match(/<h3>([^<]*)<\/h3>/)[1];
        var date = textDate.split('.');
        var dt = new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), 0, 0, 0);
        var items = news[i].match(/<li>([^<]*)<\/li>/g);
        for (var j = 0; j < items.length; j++) {
            if (!items[j] || items[j] == "" || items[j].trim() == "")
                continue;
            rss += '<item>';
            var itemText = items[j].replace(/<li>/g, "").replace(/<\/li>/g, "").replace(/\r/g, "").replace(/\n/g, "").replace(/\s{1,}/g, " ").trim();
            rss += '<title>' + itemText + '</title>';
            rss += '<description>' + itemText + '</description>';
            rss += '<link>https://www.dotworldmaker.com/todo.html#' + textDate + '</link>';
            rss += '<pubDate>' + dt.toUTCString() + '</pubDate>';
            rss += '<guid>https://www.dotworldmaker.com/todo.html#' + textDate + "-" + (j + 1) + '</guid>';
            rss += '</item>';
        }
    }
    rss += '</channel>';
    rss += '</rss>';
    //res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.write(rss);
    res.end();
});
///<reference path="../app.ts" />
var currentTokens = {};
function BuildToken(id, username, ip) {
    if (!ip)
        ip = '127.0.0.1';
    if (ip && ip.endsWith('127.0.0.1'))
        ip = '::1';
    var dt = new Date();
    var token = md5("" + id + "-" + username.toLowerCase() + "-" + dt.toString());
    currentTokens[token] = { id: id, lastUsage: new Date(), user: username, ip: ip };
    return { token: token };
}
function GetTokenInformation(token, ip) {
    var now = (new Date());
    if (ip.endsWith('127.0.0.1'))
        ip = '::1';
    // Check all the tokens
    var toDelete = [];
    for (var i in currentTokens) {
        if ((now.getTime() - currentTokens[i].lastUsage.getTime()) > 60000 * 5)
            toDelete.push(i);
    }
    // Removes the one which are too old
    for (var j = 0; j < toDelete.length; j++)
        delete currentTokens[toDelete[j]];
    if (currentTokens[token] && currentTokens[token].ip == ip && (now.getTime() - currentTokens[token].lastUsage.getTime()) < 60000 * 5) {
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
app.post('/backend/RecoverPassword', function (req, res, next) {
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("User is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('select id,email from users where name = ?', [req.body.user], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write("Error with database.");
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0 || !r1[0].email) {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write("User not found or it doesn't have an email.");
                res.end();
                return;
            }
            var email = r1[0].email;
            var id = r1[0].id;
            var key = md5(email + "SomethingPrr1vat3T0mak3ItH@rd" + r1[0].id + ((new Date()).toLocaleTimeString()) + Math.round(Math.random() * Number.MAX_VALUE));
            connection.query('update users set random_reset_key=?, reset_valid_till=? where id = ?', [key, new Date(new Date().getTime() + 3600000), id], function (err2, r2) {
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
                }, (err3, message) => {
                    if (err3)
                        console.log(err3);
                });
            });
        });
    });
});
app.post('/backend/GetRoles', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            var result = [];
            if (r1 && r1.length > 0)
                for (var i = 0; i < r1.length; i++)
                    result.push(r1[i].access_right_id);
            res.write(JSON.stringify(result));
            res.end();
        });
    });
});
app.post('/backend/HasRole', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }
    if (!req.body.role) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("role is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        var access = 0;
        switch (("" + req.body.role).toLowerCase()) {
            case "admin":
            case "game admin":
                access = 100;
                break;
            case "moderator":
            case "chat moderator":
                access = 10;
                break;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ? and access_right_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, access, tokenInfo.id], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/json' });
            if (!r1 || !r1.length)
                res.write(JSON.stringify(false));
            else
                res.write(JSON.stringify(true));
            res.end();
        });
    });
});
app.post('/backend/ChatBan', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }
    if (!req.body.username) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("username is missing.");
        res.end();
        return;
    }
    if (!req.body.days) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("days is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('select data from game_player where game_id = ? and user_id in (select id from users where name = ?)', [req.body.game, req.body.username], function (err2, r2) {
                if (err2 != null) {
                    connection.end();
                    console.log(err2);
                    res.writeHead(50, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify({ error: "Error with database." }));
                    res.end();
                    return;
                }
                // Not yet registered
                if (r2.length != 1) {
                    connection.end();
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify({ error: "User not found." }));
                    res.end();
                    return;
                }
                var data = JSON.parse(r2[0].data);
                data.chatBannedTill = new Date((new Date()).getTime() + parseInt(req.body.days) * 24 * 3600 * 1000);
                ChatSendTo(parseInt(req.body.game), req.body.username, "ban", data.chatBannedTill);
                connection.query('update game_player set data = ? where  game_id = ? and user_id in (select id from users where name = ?)', [JSON.stringify(data), req.body.game, req.body.username], function (err3, r3) {
                    connection.end();
                    if (err3) {
                        console.log(err3);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.write(JSON.stringify({ error: "Error with database." }));
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify(true));
                    res.end();
                    return;
                });
            });
        });
    });
});
app.post('/backend/ChatMute', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("game is missing.");
        res.end();
        return;
    }
    if (!req.body.username) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("username is missing.");
        res.end();
        return;
    }
    if (!req.body.minutes) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("minutes is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('select data from game_player where game_id = ? and user_id in (select id from users where name = ?)', [req.body.game, req.body.username], function (err2, r2) {
                if (err2 != null) {
                    connection.end();
                    console.log(err2);
                    res.writeHead(50, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify({ error: "Error with database." }));
                    res.end();
                    return;
                }
                // Not yet registered
                if (r2.length != 1) {
                    connection.end();
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify({ error: "User not found." }));
                    res.end();
                    return;
                }
                var data = JSON.parse(r2[0].data);
                data.chatMutedTill = new Date((new Date()).getTime() + parseInt(req.body.minutes) * 60 * 1000);
                ChatSendTo(parseInt(req.body.game), req.body.username, "mute", data.chatMutedTill);
                connection.query('update game_player set data = ? where  game_id = ? and user_id in (select id from users where name = ?)', [JSON.stringify(data), req.body.game, req.body.username], function (err3, r3) {
                    connection.end();
                    if (err3) {
                        console.log(err3);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.write(JSON.stringify({ error: "Error with database." }));
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify(true));
                    res.end();
                    return;
                });
            });
        });
    });
});
app.post('/backend/ResetPassword', function (req, res, next) {
    if (!req.body.key) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Key is missing.");
        res.end();
        return;
    }
    if (!req.body.id) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Id is missing.");
        res.end();
        return;
    }
    if (!req.body.password) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("password is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('select random_reset_key,reset_valid_till from users where id = ?', [req.body.id], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write("Error with database.");
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0 || !r1[0].random_reset_key) {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write("Operation is not allowed sorry.");
                res.end();
                return;
            }
            if (r1[0].random_reset_key != req.body.key || new Date(r1[0].reset_valid_till).getTime() < new Date().getTime()) {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write("Operation is not allowed sorry.");
                res.end();
                return;
            }
            connection.query('update users set random_reset_key = null, reset_valid_till = null, password = ? where id = ? and random_reset_key = ?', ["*" + req.body.password, req.body.id, req.body.key], function (err2, r2) {
                connection.end();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write("Password has been reset. You can now log-in.");
                res.end();
                return;
            });
        });
    });
});
app.post('/backend/ChangePassword', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Token is missing.");
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write("Token not valid.");
        res.end();
        return;
    }
    if (!req.body.password) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("password is missing.");
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write("Connection failed.");
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Error with database.");
            res.end();
            return;
        }
        connection.query('update users set password = ? where id = ?', ["*" + req.body.password, tokenInfo.id], function (err2, r2) {
            connection.end();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write("Password has been changed.");
            res.end();
            return;
        });
    });
});
app.post('/backend/UserInfo', function (req, res, next) {
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify({ error: "Token is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify({ error: "Connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify({ error: "Error with database." }));
            res.end();
            return;
        }
        connection.query('select users.name, users.email, editor_version, (select count(id) from games where main_owner = ?) "nb", credits from users where id = ?', [tokenInfo.id, tokenInfo.id], function (err2, r2) {
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
app.post('/backend/VerifyToken', function (req, res, next) {
    if (!req.body.token) {
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
app.post('/backend/UserExists', function (req, res, next) {
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from users where name = ?', [req.body.user], function (err1, r1) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0) {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ result: false }));
                res.end();
                return;
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ result: true }));
                res.end();
                return;
            }
        });
    });
});
app.post('/backend/RegisterUser', function (req, res, next) {
    var reserved = ["root", "admin", "administrator", "boss", "master", "moderator", "helper"];
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.password) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'password' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    var username = req.body.user.trim();
    if (username.replace(/[a-z0-9]+/gi, "").length > 0 || reserved.indexOf(username.trim().toLowerCase()) != -1) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid username." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from users where name = ?', [username], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0) {
                connection.query('insert users(name,password,email) values(?,?,?)', [username, HashPassword(req.body.user, req.body.password), req.body.email], function (err, results) {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(BuildToken(results.insertId, req.body.user, req.headers['x-forwarded-for'] || req.connection.remoteAddress)));
                    res.end();
                    return;
                });
            }
            else {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "user already exists." }));
                res.end();
                return;
            }
        });
    });
});
app.post('/backend/Login', function (req, res, next) {
    if (!req.body.user) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'user' is missing." }));
        res.end();
        return;
    }
    if (!req.body.password) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'password' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    // Introduce a sleep, to avoid DoS or password brute force attacks.
    setTimeout(function () {
        connection.connect(function (err) {
            if (err != null) {
                connection.end();
                console.log(err);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            connection.query('select id,password from users where name = ?', [req.body.user], function (err1, results) {
                if (err1 != null) {
                    connection.end();
                    console.log(err1);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                // Not yet registered
                if (results.length == 0 || (results[0].password != HashPassword(req.body.user, req.body.password) && results[0].password != "*" + req.body.password)) {
                    connection.end();
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "wrong username or password" }));
                    res.end();
                    return;
                }
                else {
                    if (results[0].password == "*" + req.body.password) {
                        connection.query('update users set password = ? where name = ?', [HashPassword(req.body.user, req.body.password), req.body.user], function (err2) {
                            connection.end();
                        });
                    }
                    else
                        connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(BuildToken(results[0].id, req.body.user, req.headers['x-forwarded-for'] || req.connection.remoteAddress)));
                    res.end();
                    return;
                }
            });
        });
    }, 2000);
});
app.post('/backend/LoadPlayer', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select x, y, zone, data from game_player where user_id = ? and game_id = ?', [tokenInfo.id, req.body.game], function (err1, r1) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0) {
                GameIncreaseStat(req.body.game, StatType.Player_Join);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            else {
                GameIncreaseStat(req.body.game, StatType.Player_Login);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ x: r1[0].x, y: r1[0].y, zone: r1[0].zone, data: r1[0].data }));
                res.end();
                return;
            }
        });
    });
});
function UpdatePosition(userId, gameId, x, y, zone) {
    var connection = getConnection();
    if (!connection) {
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            return;
        }
        connection.query('update game_player x=?,y=?,zone=? where game_id=? and user_id=?', [x, y, zone, gameId, userId], function (err1, r1) {
            connection.end();
            return;
        });
    });
}
app.post('/backend/SavePlayer', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.x) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'x' is missing." }));
        res.end();
        return;
    }
    if (!req.body.y) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'y' is missing." }));
        res.end();
        return;
    }
    if (!req.body.zone) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'zone' is missing." }));
        res.end();
        return;
    }
    if (!req.body.data) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select data from game_player where game_id = ? and user_id = ?', [req.body.game, tokenInfo.id], function (err0, r0) {
            if (err0 != null) {
                connection.end();
                console.log(err0);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var newData = null;
            try {
                newData = JSON.parse(req.body.data);
            }
            catch (ex) {
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
            else {
                try {
                    var savedData = JSON.parse(r0[0].data);
                }
                catch (ex) {
                }
                //console.log("" + newData.saveId + " ?== " + savedData.saveId);
                // We don't have yet a saveId, then all fine...
                if (!savedData.saveId)
                    isOk = true;
                // Saved info and new data are the same
                else if (newData.saveId == savedData.saveId)
                    isOk = true;
            }
            if (!isOk) {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "Save doesn't match. Be sure you have only one browser open." }));
                res.end();
                return;
            }
            newData.saveId = md5("D0tW0rldMak3r2016" + req.body.game + "_" + tokenInfo.id + "_" + (new Date()).toString() + "_" + (Math.random() * 100000));
            connection.query('replace game_player(game_id,user_id,x,y,zone,data) values(?,?,?,?,?,?)', [req.body.game, tokenInfo.id, req.body.x, req.body.y, req.body.zone, JSON.stringify(newData)], function (err1, r1) {
                connection.end();
                if (err1 != null) {
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
app.post('/backend/ResetPlayer', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('delete from game_player where game_id = ? and user_id = ?', [req.body.game, tokenInfo.id], function (err1, r1) {
            connection.end();
            if (err1 != null) {
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
app.post('/backend/ResetAllPlayers', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('delete from game_player where game_id = ?', [req.body.game], function (err1, r1) {
                connection.end();
                if (err1 != null) {
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
app.post('/backend/PublicViewPlayer', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.name) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'name' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select x, y, zone, data from game_player where user_id in (select id from users where name = ?) and game_id = ?', [req.body.name, req.body.game], function (err1, r1) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (r1.length == 0) {
                GameIncreaseStat(req.body.game, StatType.Player_Join);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(null));
                res.end();
                return;
            }
            else {
                GameIncreaseStat(req.body.game, StatType.Player_Login);
                res.writeHead(200, { 'Content-Type': 'text/json' });
                var rawData = null;
                try {
                    rawData = JSON.parse(r1[0].data);
                }
                catch (ex) {
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
app.post('/backend/PremiumPurchase', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.item) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'item' is missing." }));
        res.end();
        return;
    }
    if (!req.body.credits) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'credits' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select main_owner,name from games where id = ?', [req.body.game], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "game doesn't exists." }));
                res.end();
                return;
            }
            var destCreditUser = r1[0].main_owner;
            var gameName = r1[0].name;
            connection.query('update users set credits = credits - ? where id = ? and credits >= ?', [req.body.credits, tokenInfo.id, req.body.credits], function (err2, r2) {
                if (err2 != null) {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                if (r2.affectedRows < 1) {
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(true));
                    res.end();
                }
                else {
                    connection.query('update users set credits = credits + ? where id = ?', [req.body.credits, destCreditUser], function (err3, r3) {
                        if (err3 != null) {
                            console.log(err3);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }
                        connection.query("insert into credits_log(from_user, to_user, quantity, reason) values(?, ?, ?, ?)", [tokenInfo.id, destCreditUser, req.body.credits, "Premium purchase of " + req.body.item + " for game " + gameName], function (err4, r4) {
                            connection.end();
                            if (err4 != null) {
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
///<reference path="../app.ts" />
app.post('/backend/GetWorld', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select games.name, games.data, users.editor_version from games left join users on games.main_owner = users.id where games.id = ?', [req.body.game], function (err1, result) {
            connection.end();
            if (err1 != null) {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // Not yet registered
            if (result.length == 0) {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write("");
                res.end();
                return;
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ name: result[0] && result[0].name ? result[0].name : "", edition: result[0] && result[0].editor_version ? result[0].editor_version : "f", data: result[0] && result[0].data ? result[0].data : "" }));
                res.end();
                return;
            }
        });
    });
});
app.post('/backend/SaveWorld', function (req, res, next) {
    if (!req.body.game) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }
    if (!req.body.token) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }
    if (!req.body.data) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'data' is missing." }));
        res.end();
        return;
    }
    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }
    var connection = getConnection();
    if (!connection) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }
    var name = "";
    var description = "";
    var publicView;
    try {
        var data = JSON.parse(req.body.data);
        name = data.Name;
        description = data.Description;
        publicView = data.PublicView;
    }
    catch (ex) {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Not a valid JSON." }));
        res.end();
        return;
    }
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1) {
            if (err1 != null) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length) {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            connection.query('select data from games where id = ?', [req.body.game], function (err3, r3) {
                if (err3 != null) {
                    connection.end();
                    console.log(err3);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                var newData = null;
                try {
                    newData = JSON.parse(req.body.data);
                }
                catch (ex) {
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
                else {
                    var savedData = null;
                    try {
                        savedData = JSON.parse(r3[0].data);
                    }
                    catch (ex) {
                    }
                    //console.log("" + newData.SaveId + " ?== " + savedData.SaveId);
                    // We don't have yet a SaveId, then all fine...
                    if (!savedData || !savedData.SaveId)
                        isOk = true;
                    // Saved info and new data are the same
                    else if (newData.SaveId == savedData.SaveId)
                        isOk = true;
                }
                if (!isOk) {
                    connection.end();
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "Save doesn't match. Be sure you have only one browser open." }));
                    res.end();
                    return;
                }
                newData.SaveId = md5("D0tW0rldMak3r2016" + req.body.game + "_" + tokenInfo.id + "_" + (new Date()).toString() + "_" + (Math.random() * 100000));
                connection.query('update games set description = ?, data = ?, public = ? where id = ?', [description, JSON.stringify(newData), (publicView ? "y" : "n"), req.body.game], function (err2, result) {
                    connection.end();
                    if (err2 != null) {
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(newData.SaveId));
                    res.end();
                    return;
                });
            });
        });
    });
});
///<reference path="../app.ts" />
function HashPassword(user, password) {
    return md5(packageJson.config.fixedHashSalt + "-" + user.toLowerCase() + "-" + password.toLowerCase());
}

//# sourceMappingURL=app.js.map
