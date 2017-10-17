var viewPlayer = new (class
{
    selector: ListSelector;
    selectedUser: string;
    refreshTimeout: number;
});

class ViewPlayer
{
    public static Dispose()
    {
        if (viewPlayer.selector)
            viewPlayer.selector.Dispose();
        viewPlayer.selector = null;
        if (viewPlayer.refreshTimeout)
            clearTimeout(viewPlayer.refreshTimeout);
        viewPlayer.refreshTimeout = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/OwnerPlayers',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (!data)
                    return;
                data = data.map((c) => { return { Name: c }; });

                viewPlayer.selector = new ListSelector("userList", data, "Name");
                viewPlayer.selector.OnSelect = (rowId) =>
                {
                    viewPlayer.selectedUser = data[rowId].Name;
                    ViewPlayer.View();
                };

            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    public static View()
    {
        clearTimeout(viewPlayer.refreshTimeout);
        viewPlayer.refreshTimeout = null;

        if (!viewPlayer.selectedUser)
            return;

        $.ajax({
            type: 'POST',
            url: '/backend/OwnerViewPlayer',
            data: {
                game: world.Id,
                user: viewPlayer.selectedUser,
                token: framework.Preferences['token'],
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (!data)
                    return;
                ViewPlayer.DisplayData(data);

                viewPlayer.refreshTimeout =setTimeout(ViewPlayer.View, 5000);
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    public static DisplayData(data: any)
    {
        var html = "";

        var user: PlayerSerialization = TryParse(data.data);

        html += "<h3>Base information:</h3>";
        html += "<table>";
        html += "<tr><td>Username:</td><td>" + viewPlayer.selectedUser.htmlEntities() + "</td>";
        html += "<tr><td>Position:</td><td>" + data.x + ", " + data.y + ", " + data.zone.htmlEntities() + " <span class='button' onclick='ViewPlayer.Recall();'>Respawn</span></td></tr>";
        html += "<tr><td>Look:</td><td>" + user.name.htmlEntities() + "</td></tr>";
        html += "</table>";

        html += "<h3>Stats:</h3>";
        user.stats.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        html += "<table>";
        for (var i = 0; i < user.stats.length; i++)
            html += "<tr><td>" + user.stats[i].Name.title().htmlEntities() + "</td><td>" + user.stats[i].Value + "</td></tr>";
        html += "</table>";

        html += "<h3>Skills:</h3>";
        user.skills.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        html += "<table>";
        for (var i = 0; i < user.skills.length; i++)
            html += "<tr><td>" + user.skills[i].Name.title().htmlEntities() + "</td><td>" + (user.skills[i].Level ? user.skills[i].Level : "&nbsp;") + "</td></tr>";
        html += "</table>";

        html += "<h3>Inventory:</h3>";
        user.inventory.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        html += "<table>";
        for (var i = 0; i < user.inventory.length; i++)
            html += "<tr><td>" + user.inventory[i].Name.title().htmlEntities() + "</td><td>" + ("" + user.inventory[i].Count).htmlEntities() + "</td></tr>";
        html += "</table>";

        html += "<h3>Equipped:</h3>";
        var items: string[] = [];
        for (var item in user.equipedObjects)
            items.push(user.equipedObjects[item].Name);
        items.sort();
        html += "<table>";
        for (var i = 0; i < items.length; i++)
            html += "<tr><td>" + items[i].htmlEntities() + "</td></tr>";
        html += "</table>";
        html += "<br>";
        html += "<center><span class='button' onclick='ViewPlayer.Reset();'>Reset</span></center>";
        $("#userParameters").html(html);
    }

    static Recall()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/OwnerRecallPlayer',
            data: {
                game: world.Id,
                user: viewPlayer.selectedUser,
                token: framework.Preferences['token'],
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (data === true)
                    Framework.ShowMessage("Player has been respwaned (if he/she is currently online)");
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    static Reset()
    {
        Framework.Confirm("Are you sure you want to reset this player? He/she will lose all the progress.", () =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/OwnerResetPlayer',
                data: {
                    game: world.Id,
                    user: viewPlayer.selectedUser,
                    token: framework.Preferences['token'],
                },
                success: (msg) =>
                {
                    var data = TryParse(msg);
                    if (data === true)
                        Framework.ShowMessage("Player has been reset");
                },
                error: function (msg, textStatus)
                {
                }
            });
        });
    }
}