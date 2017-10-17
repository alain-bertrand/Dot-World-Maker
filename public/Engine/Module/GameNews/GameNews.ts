var gameNews = new (class
{
    selector: ListSelector;
    data: any;
    selectedRow: number;
});

class GameNews
{
    public static Dispose()
    {
        if (gameNews.selector)
            gameNews.selector.Dispose();
        gameNews.selector = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        if (Main.CheckNW())
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };

        GameNews.UpdateList();
    }

    public static UpdateList()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GameNews',
            data: {
                game: world.Id
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (!data)
                    return;
                gameNews.data = data;

                if (gameNews.selector)
                {
                    gameNews.selector.UpdateList(gameNews.data);
                }
                else
                {
                    gameNews.selector = new ListSelector("newsList", gameNews.data, "postedOn");
                    gameNews.selector.OnSelect = GameNews.Select;
                }
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    static Select(rowId: number)
    {
        gameNews.selectedRow = rowId;
        if (rowId === null)
        {
            GameNews.Add();
            return;
        }

        var html = "";
        html += "<h3>Update News:</h3>";
        html += "<textarea id='news_content' rows='30' style='width: 100%; resize: none;'>" + ("" + gameNews.data[rowId].news).htmlEntities() + "</textarea>";
        html += "<center><span class='button' onclick='GameNews.SaveUpdate();'>Save</span><span class='button' onclick='GameNews.Delete();'>Delete</span></center>";
        $("#newsParameters").html(html);
    }

    static Add()
    {
        var html = "";
        html += "<h3>Add News:</h3>";
        html += "<textarea id='news_content' rows='30' style='width: 100%; resize: none;'></textarea>";
        html += "<center><span class='button' onclick='GameNews.DoAdd();'>Save</span></center>";
        $("#newsParameters").html(html);
    }

    static DoAdd()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/AddGameNews',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                news: $("#news_content").val()
            },
            success: (msg) =>
            {
                GameNews.UpdateList();
                gameNews.selector.Select(null);
                GameNews.Add();
            },
            error: function (msg, textStatus)
            {
            }
        });
    }


    static SaveUpdate()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/UpdateGameNews',
            data: {
                game: world.Id,
                id: gameNews.data[gameNews.selectedRow].id,
                token: framework.Preferences['token'],
                news: $("#news_content").val()
            },
            success: (msg) =>
            {
                GameNews.UpdateList();
                gameNews.selector.Select(null);
                GameNews.Add();
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    static Delete()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/DeleteGameNews',
            data: {
                game: world.Id,
                id: gameNews.data[gameNews.selectedRow].id,
                token: framework.Preferences['token']
            },
            success: (msg) =>
            {
                GameNews.UpdateList();
                gameNews.selector.Select(null);
                GameNews.Add();
            },
            error: function (msg, textStatus)
            {
            }
        });
    }
}