/// <reference path="WorldObject.ts" />
var worldChest = new (class
{
    public currentChest: WorldChest;
    public area: WorldArea;
});

class WorldChest implements WorldObject
{
    public Name: string;
    public X: number;
    public Y: number;
    public AX: number;
    public AY: number;
    public DisplayName: string = "Chest";
    public Stats: MonsterDrop[] = [];
    public Items: MonsterDrop[] = [];
    public particleSystem: ParticleSystem;
    public currentFrame: number = 0;

    constructor(name: string, x: number, y: number, ax: number, ay: number)
    {
        this.Name = name;
        this.X = x;
        this.Y = y;
        this.AX = ax;
        this.AY = ay;
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public GetId(): string
    {
        var cx = (this.AX * world.areaWidth * world.art.background.width + this.X);
        var cy = (this.AY * world.areaHeight * world.art.background.height + this.Y);
        return "" + cx + "," + cy;
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        var px = (world.Player.AX * world.areaWidth * world.art.background.width + world.Player.X);
        var py = (world.Player.AY * world.areaHeight * world.art.background.height + world.Player.Y);
        var cx = (this.AX * world.areaWidth * world.art.background.width + this.X);
        var cy = (this.AY * world.areaHeight * world.art.background.height + this.Y);
        var a = px - cx;
        var b = py - cy;
        var d = Math.sqrt(a * a + b * b);
        if (d > 160)
        {
            Framework.ShowMessage("You are too far, move nearer.");
            return false;
        }

        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(this.DisplayName ? this.DisplayName.htmlEntities() : "Chest");
        if (world.Player.HasVisitedChest(this.GetId()))
        {
            this.Items = [];
            this.Stats = [];
        }
        worldChest.currentChest = this;
        WorldChest.ShowContent();
        return true;
    }

    static ShowContent()
    {
        var html = "";
        html += "<table>";
        for (var i = 0; i < worldChest.currentChest.Items.length; i++)
        {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='WorldChest.GetItem(" + i + ")'>Get</div></td>";
            html += "<td>" + worldChest.currentChest.Items[i].Name + "</td>";
            html += "<td>" + worldChest.currentChest.Items[i].Quantity + "</td>";
            html += "</tr>";
        }
        for (var i = 0; i < worldChest.currentChest.Stats.length; i++)
        {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='WorldChest.GetStat(" + i + ")'>Get</div></td>";
            var stat = world.GetStat(worldChest.currentChest.Stats[i].Name);
            html += "<td>" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : worldChest.currentChest.Stats[i].Name) + "</td>";
            html += "<td>" + worldChest.currentChest.Stats[i].Quantity + "</td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#dialogSentence").html(html);
        play.onDialogPaint = [];

        html = "";
        html += "<div onclick='WorldChest.TakeAll();' class='gameButton'>Take All</div>";
        html += "<div onclick='WorldChest.Close();' class='gameButton'>Close</div>";
        $("#dialogAnswers").html(html);
    }

    static GetItem(rowId: number)
    {
        world.Player.VisitChest(worldChest.currentChest.GetId());

        var v = parseFloat("" + worldChest.currentChest.Items[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.AddItem(worldChest.currentChest.Items[rowId].Name, v);
        worldChest.currentChest.Items.splice(rowId, 1);

        if (worldChest.currentChest.Items.length == 0 && worldChest.currentChest.Stats.length == 0)
            WorldChest.Close();
        else
            WorldChest.ShowContent();
    }

    static GetStat(rowId: number)
    {
        world.Player.VisitChest(worldChest.currentChest.GetId());

        var v = parseFloat("" + worldChest.currentChest.Stats[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.SetStat(worldChest.currentChest.Stats[rowId].Name, world.Player.GetStat(worldChest.currentChest.Stats[rowId].Name) + v);
        worldChest.currentChest.Stats.splice(rowId, 1);
        if (worldChest.currentChest.Items.length == 0 && worldChest.currentChest.Stats.length == 0)
            WorldChest.Close();
        else
            WorldChest.ShowContent();
    }

    static TakeAll()
    {
        world.Player.VisitChest(worldChest.currentChest.GetId());

        for (var i = 0; i < worldChest.currentChest.Stats.length; i++)
        {
            var v = parseFloat("" + worldChest.currentChest.Stats[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.SetStat(worldChest.currentChest.Stats[i].Name, world.Player.GetStat(worldChest.currentChest.Stats[i].Name) + v);
        }

        for (var i = 0; i < worldChest.currentChest.Items.length; i++)
        {
            var v = parseFloat("" + worldChest.currentChest.Items[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.AddItem(worldChest.currentChest.Items[i].Name, v);
        }

        WorldChest.Close();
    }

    static Close()
    {
        world.Player.InDialog = false;
        $("#npcDialog").hide();
    }

    static ShowEditor()
    {
        if (!mapEditor.currentChest)
        {
            $("#mapEditorActions").html("");
            return;
        }

        var html = "<style>";
        html += "#mapEditorActions table { width: calc(100% - 35px); border-collapse: collapse; }";
        html += "#mapEditorActions table tr > td:first-child { width: 1px; font-weight: bold; white-space: nowrap; }";
        html += "#mapEditorActions table tr > td:nth-child(3) { width: 1px; font-weight: bold; white-space: nowrap; }";
        html += "#mapEditorActions input { width: 100%; }";
        html += "#mapEditorActions > select { width: calc(100% - 35px); }";
        html += "</style>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='chest_display_name' value='" + ("" + mapEditor.currentChest.DisplayName).htmlEntities() + "' onkeyup='WorldChest.UpdateField(\"chest_display_name\",\"DisplayName\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Art:</td><td><select id='chest_display' onchange='WorldChest.UpdateField(\"chest_display\",\"Name\");'>";
        var names: string[] = [];
        for (var item in world.art.objects)
            names.push(item);
        names.sort();
        for (var i = 0; i < names.length; i++)
        {
            html += "<option" + (mapEditor.currentChest.Name == names[i] ? " selected" : "") + ">" + names[i] + "</option>";
        }
        html += "</select></td></tr>";
        html += "<tr><td>Position X:</td><td><input id='chest_x' type='text' value='" + mapEditor.currentChest.X + "' onkeyup='WorldChest.UpdateField(\"chest_x\",\"X\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Y:</td><td><input id='chest_y' type='text' value='" + mapEditor.currentChest.Y + "' onkeyup='WorldChest.UpdateField(\"chest_y\",\"Y\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "</table>";

        html += "<h2>Items:</h2>";

        html += "<table>";
        for (var i = 0; i < mapEditor.currentChest.Items.length; i++)
        {
            html += "<tr><td>";
            html += "<div class='button' onclick='WorldChest.DeleteItem(" + i + ")'>Remove</div> ";
            html += mapEditor.currentChest.Items[i].Name + "</td>";
            html += "<td><input type='text' value='" + ("" + mapEditor.currentChest.Items[i].Quantity).htmlEntities() + "' id='item_" + i + "' onkeyup='WorldChest.UpdateItem(" + i + ");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        }
        html += "</table>";

        names = world.InventoryObjects.map((c) => c.Name).sort();
        html += "<select id='chest_add_item' onchange='WorldChest.AddItem()'>";
        html += "<option>-- Add new item --</option>";
        for (var i = 0; i < names.length; i++)
            html += "<option>" + names[i] + "</option>";
        html += "</select>";

        html += "<h2>Stats:</h2>";

        html += "<table>";
        for (var i = 0; i < mapEditor.currentChest.Stats.length; i++)
        {
            html += "<tr><td>";
            html += "<div class='button' onclick='WorldChest.DeleteStat(" + i + ")'>Remove</div> ";
            html += mapEditor.currentChest.Stats[i].Name + "</td>";
            html += "<td><input type='text' value='" + ("" + mapEditor.currentChest.Stats[i].Quantity).htmlEntities() + "' id='stat_" + i + "' onkeyup='WorldChest.UpdateStat(" + i + ");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        }
        html += "</table>";

        names = world.Stats.map((c) => c.Name).sort();
        html += "<select id='chest_add_stat' onchange='WorldChest.AddStat()'>";
        html += "<option>-- Add new stat --</option>";
        for (var i = 0; i < names.length; i++)
            html += "<option>" + names[i] + "</option>";
        html += "</select>";

        $("#mapEditorActions").html(html);
    }

    static AddItem()
    {
        var item = $("#chest_add_item").val();
        (<HTMLSelectElement>$("#chest_add_item").first()).selectedIndex = 0;
        for (var i = 0; i < mapEditor.currentChest.Items.length; i++)
            if (mapEditor.currentChest.Items[i].Name == item)
                return;
        mapEditor.currentChest.Items.push({ Name: item, Quantity: 0, Probability: 100 });
        worldChest.area.edited = true;
        WorldChest.ShowEditor();
    }

    static UpdateItem(rowId: number)
    {
        var val = parseFloat($("#item_" + rowId).val());
        if (isNaN(val))
            return;
        mapEditor.currentChest.Items[rowId].Quantity = val;
        worldChest.area.edited = true;
    }

    static DeleteItem(rowId: number)
    {
        mapEditor.currentChest.Items.splice(rowId, 1);
        worldChest.area.edited = true;
        WorldChest.ShowEditor();
    }

    static AddStat()
    {
        var item = $("#chest_add_stat").val();
        (<HTMLSelectElement>$("#chest_add_stat").first()).selectedIndex = 0;
        for (var i = 0; i < mapEditor.currentChest.Stats.length; i++)
            if (mapEditor.currentChest.Stats[i].Name == item)
                return;
        mapEditor.currentChest.Stats.push({ Name: item, Quantity: 0, Probability: 100 });
        WorldChest.ShowEditor();
        worldChest.area.edited = true;
    }

    static UpdateStat(rowId: number)
    {
        var val = parseFloat($("#stat_" + rowId).val());
        if (isNaN(val))
            return;
        mapEditor.currentChest.Stats[rowId].Quantity = val;
        worldChest.area.edited = true;
    }

    static DeleteStat(rowId: number)
    {
        mapEditor.currentChest.Stats.splice(rowId, 1);
        WorldChest.ShowEditor();
        worldChest.area.edited = true;
    }

    static UpdateField(fieldName: string, propName: string)
    {
        var val = $("#" + fieldName).val();
        if (typeof mapEditor.currentChest[propName] == "number")
        {
            var n = parseInt(val);
            if (isNaN(n))
                return;
            mapEditor.currentChest[propName] = n;
            worldChest.area.CleanObjectCache();
        }
        else
            mapEditor.currentChest[propName] = val;
        mapEditor.modified = true;
        worldChest.area.edited = true;
    }
}