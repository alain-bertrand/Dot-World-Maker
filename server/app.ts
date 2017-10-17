///<reference path="../typings/node.d.ts" />

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var hash = require('crypto');
var compression = require('compression');
var multer = require('multer');

var packageJson = require(__dirname + '/package.json');

var app = express();
app.disable('x-powered-by');
app.use(staticInclude);
app.use(compression({ threshold: 9000 }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
    limit: '50mb'
}));
//app.use(compress({ filter: shouldCompress }));

var upload = multer({
    dest: __dirname + '/temp_upload/', rename: function (fieldname, filename)
    {
        return filename.replace(/\W+/g, '-').toLowerCase();
    }
});

function shouldCompress(req, res)
{
    if (req.headers['x-no-compression'])
    {
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    //return compress.filter(req, res)
    return true;
}

var server = require('http').Server(app);
var io = require('socket.io')(server);

interface String
{
    htmlEntities(): string;
    trim(): string;
    endsWith(suffix): boolean;
    startsWith(prefix): boolean;
    contains(toSearch): boolean;
}

String.prototype.htmlEntities = function ()
{
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

String.prototype.trim = function ()
{
    return this.replace(/^\s+|\s+$/g, '');
}

String.prototype.endsWith = function (suffix)
{
    return (this.indexOf(suffix, this.length - suffix.length) !== -1);
}

String.prototype.startsWith = function (prefix)
{
    return (this.substr(0, prefix.length) == prefix);
}

String.prototype.contains = function (toSearch)
{
    return (this.indexOf(toSearch) != -1);
}

function md5(source)
{
    return hash.createHash('md5').update(source).digest('hex');
}

function sha256(source, secret)
{
    if (!secret)
        secret = "aBcD3FgH1";
    return hash.createHmac('sha256', secret)
        .update(source)
        .digest('hex');
}

function base64decode(source: string): Buffer
{
    // Node 5.10+
    if (typeof (<any>Buffer).from === "function")
        return (<any>Buffer).from(source, 'base64');
    // older Node versions
    else
        return new Buffer(source, 'base64');
}

function staticInclude(req, res, next)
{
    var url = req.originalUrl;
    if (url.indexOf("?") !== -1)
        url = url.substr(0, url.indexOf("?"));
    req.originalUrl = url;

    if (url.charAt(url.length - 1) == "/")
        url += "index.html";
    if (url.indexOf(".html") !== -1)
    {
        var p: string = path.resolve(__dirname + '/public/' + url).replace(/\\/g, "/");
        var mustStart = (__dirname + '/public/').replace(/\\/g, "/");
        if (!p.startsWith(mustStart) || !fs.existsSync(p))
        {
            next();
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = "" + fs.readFileSync(p);
        var title = <string>(<any>html.match(/<title>[^<]*<\/title>/i));
        var m = <any>html.match(/<meta[^<]*>/gi);
        var meta = (m ? m.join("") : "");
        var included = false;
        html = html.trim().replace(/\<\!\-\-\# include file\=\"([^"]+)\" \-\-\>/g, function (match, capture)
        {
            included = true;
            if (!fs.existsSync(__dirname + '/public/' + capture))
                return "";
            return "" + fs.readFileSync(__dirname + '/public/' + capture);
        });

        if (included)
        {
            if (title)
                html = html.replace(/<title>[^<]*<\/title>/i, title);
            if (meta && meta != "")
                html = html.replace(/<\/head>/i, meta + "</head>");
            // Removes the titles which are within the document
            html = html.replace(/(<\/head>(.|\n|\r)*)(<title>[^<]+<\/title>)/gi, "$1")
            // Removes the meta which are within the document
            html = html.replace(/(<\/head>(.|\n|\r)*)(<meta[^>]+>)/gi, "$1");
        }

        res.write(html);
        res.end();
        return;
    }
    else
    {
        if (req.originalUrl.indexOf(".png") !== -1 || req.originalUrl.indexOf(".jpg") !== -1 || req.originalUrl.indexOf(".jpeg") !== -1 || req.originalUrl.indexOf(".mp3") !== -1)
        {
            res.setHeader("Cache-Control", "public, max-age=" + (360 * 864000));
            res.setHeader("Expires", new Date(Date.now() + 360 * 86400000).toUTCString());
        }
        next();
    }
}

function getConnection()
{
    try
    {
        var conn = mysql.createConnection({
            host: packageJson.config.dbhost,
            user: packageJson.config.dbuser,
            password: packageJson.config.dbpass,
            database: packageJson.config.dbname,
            insecureAuth: true
        });
        conn.on("error", function (err)
        {

        });
        return conn;
    }
    catch (ex)
    {
        return null;
    }
}

module.exports = { app: app, http: server };
