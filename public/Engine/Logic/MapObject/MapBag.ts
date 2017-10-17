interface BagData
{
    Items: MonsterDrop[];
    Stats: MonsterDrop[];
}

var mapBag = new (class
{
    public currentBag: TemporaryWorldObject;
    public content: BagData;
});

class MapBag
{
    static ShowBag(obj: TemporaryWorldObject)
    {
        mapBag.currentBag = obj;
        mapBag.content = mapBag.currentBag.LinkedData;

        setTimeout(Play.MouseUp, 100);

        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html("Bag");
        MapBag.ShowContent();

        return true;
    }

    static ShowContent()
    {
        var html = "";

        html += "<table>";
        for (var i = 0; i < mapBag.content.Items.length; i++)
        {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='MapBag.GetItem(" + i + ")'>Get</div></td>";
            html += "<td>" + mapBag.content.Items[i].Name + "</td>";
            html += "<td>" + mapBag.content.Items[i].Quantity + "</td>";
            html += "</tr>";
        }
        for (var i = 0; i < mapBag.content.Stats.length; i++)
        {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='MapBag.GetStat(" + i + ")'>Get</div></td>";
            var stat = world.GetStat(mapBag.content.Stats[i].Name);
            html += "<td>" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : mapBag.content.Stats[i].Name) + "</td>";
            html += "<td>" + mapBag.content.Stats[i].Quantity + "</td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#dialogSentence").html(html);
        play.onDialogPaint = [];

        html = "";
        html += "<div onclick='MapBag.TakeAll();' class='gameButton'>Take All</div>";
        html += "<div onclick='MapBag.Close();' class='gameButton'>Close</div>";
        $("#dialogAnswers").html(html);
    }

    static GetItem(rowId: number)
    {
        var v = parseFloat("" + mapBag.content.Items[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.AddItem(mapBag.content.Items[rowId].Name, v);
        mapBag.content.Items.splice(rowId, 1);

        if (mapBag.content.Items.length == 0 && mapBag.content.Stats.length == 0)
            MapBag.Close();
        else
            MapBag.ShowContent();
    }

    static GetStat(rowId: number)
    {
        var v = parseFloat("" + mapBag.content.Stats[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.SetStat(mapBag.content.Stats[rowId].Name, world.Player.GetStat(mapBag.content.Stats[rowId].Name) + v);
        mapBag.content.Stats.splice(rowId, 1);
        if (mapBag.content.Items.length == 0 && mapBag.content.Stats.length == 0)
            MapBag.Close();
        else
            MapBag.ShowContent();
    }

    static TakeAll()
    {
        for (var i = 0; i < mapBag.content.Stats.length;i++)
        {
            var v = parseFloat("" + mapBag.content.Stats[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.SetStat(mapBag.content.Stats[i].Name, world.Player.GetStat(mapBag.content.Stats[i].Name) + v);
        }

        for (var i = 0; i < mapBag.content.Items.length; i++)
        {
            var v = parseFloat("" + mapBag.content.Items[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.AddItem(mapBag.content.Items[i].Name, v);
        }

        MapBag.Close();
    }

    static Close()
    {
        mapBag.currentBag.EndOfLife = new Date();
        world.Player.InDialog = false;
        $("#npcDialog").hide();
    }
}