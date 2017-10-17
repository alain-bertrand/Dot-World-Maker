app.get('/backend/RSS', function (req, res)
{
    var data = fs.readFileSync(__dirname + "/public/todo.html", "utf-8");

    var m: any = data.match(/<h2>Completed<\/h2>[\s\n\r]*(<h3>[\w\W\s\S\n\r]*<\/ul>)/i);
    var news: string[] = m[1].split("</ul>");
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
    for (var i = 0; i < news.length; i++)
    {
        if (!news[i] || news[i] == "" || news[i].trim() == "")
            continue;
        var textDate = news[i].match(/<h3>([^<]*)<\/h3>/)[1];
        var date = textDate.split('.');
        var dt = new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), 0, 0, 0);

        var items: string[] = news[i].match(/<li>([^<]*)<\/li>/g);
        for (var j = 0; j < items.length; j++)
        {
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