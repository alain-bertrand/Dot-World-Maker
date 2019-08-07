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
    var hash = require('crypto');

    return hash.createHash('md5').update(source).digest('hex');
}

function sha256(source, secret)
{
    var hash = require('crypto');

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