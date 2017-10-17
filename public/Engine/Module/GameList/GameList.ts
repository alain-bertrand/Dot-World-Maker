var gameList = new (class
{
    public data: GameInfo[];
    public searchTimeout: number;
});

interface GameInfo
{
    id: number;
    name: string;
    description: string;
    can_edit: string;
}

class GameList
{
    public static Dispose()
    {
    }

    public static Recover()
    {
        if (Main.CheckNW())
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };

        GameList.Search();
    }

    public static Search()
    {
        if (gameList.searchTimeout)
            clearTimeout(gameList.searchTimeout);
        gameList.searchTimeout = setTimeout(GameList.DoSearch, 500);
    }

    public static DoSearch()
    {
        gameList.searchTimeout = null;
        $.ajax({
            type: 'POST',
            url: '/backend/GameList',
            data: {
                token: framework.Preferences['token'],
                search: $("#searchGame").val().trim()
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                gameList.data = data.games;
                GameList.ShowList();
            },
            error: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.error)
                    $("#gameList").html(data.error);
                else
                    $("#gameList").html(("" + msg).htmlEntities());
            }
        });
    }

    static ShowList()
    {
        var html = "";
        html += "<table>";
        html += "<thead>";
        html += "<tr><td>&nbsp;</td><td>Name</td><td>Description</td></tr>";
        html += "</thead>";
        html += "<tbody>";
        for (var i = 0; i < gameList.data.length; i++)
        {
            html += "<tr>";
            html += "<td>";
            if (gameList.data[i].can_edit == 'Y')
                html += "<a class='button' href='/maker.html?game=" + gameList.data[i].name.replace(/ /g, "_") + "'>Manage</a>";
            else
                html += "<a class='button' href='/play.html?game=" + gameList.data[i].name.replace(/ /g, "_") + "'>Play</a>";

            html += "</td>";
            html += "<td>" + (gameList.data[i].name ? gameList.data[i].name.htmlEntities() : "") + "</td>";
            html += "<td>" + Main.TextTransform(gameList.data[i].description ? gameList.data[i].description : "") + "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        $("#gameList").html(html);
    }

    static ShowCreateGame()
    {
        $("#showCreateGame").show();
    }

    static HideCreateGame()
    {
        $("#showCreateGame").hide();
    }

    static CreateGame()
    {
        var name = $("#newGameName").val().trim();
        if (name.replace(/[a-z 0-9]+/gi, "").length > 0)
        {
            Framework.Alert("Only letters, numbers and spaces are allowed within a game name");
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/OwnerCreateGame',
            data: {
                token: framework.Preferences['token'],
                name: name
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data.error)
                {
                    $("#result").html(data.error);
                    return;
                }

                document.location.replace("/maker.html?id=" + data.id);
            },
            error: function (msg)
            {
                var data = TryParse(msg);
                if (data.error)
                    $("#result").html(data.error);
                else
                    $("#result").html(("" + msg).htmlEntities());
            }
        });
    }
}