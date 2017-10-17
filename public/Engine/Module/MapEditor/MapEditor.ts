class MapEditor
{
    public static Dispose()
    {
        mapEditor.currentPosition = null;

        if (mapEditor.refresher)
            clearInterval(mapEditor.refresher);
        mapEditor.refresher = null;

        if (mapEditor.keyboardChecker)
            clearInterval(mapEditor.keyboardChecker);
        mapEditor.keyboardChecker = null;


        if (mapEditor.renderer)
            mapEditor.renderer.Dispose();
        mapEditor.renderer = null;
        mapEditor.keys = [];

        $("#gameCanvas").unbind("mousedown", MapEditor.MouseDown);
        $("#gameCanvas").unbind("mouseup", MapEditor.MouseUp);
        $("#gameCanvas").unbind("mousemove", MapEditor.MouseMove);
        $("#gameCanvas").unbind("mousewheel", MapEditor.MouseWheel);
        $(window).unbind("keypress", MapEditor.KeyDown);
        $(window).unbind("keypress", MapEditor.KeyUp);

        areaFragment.canRunFragment = null;
        world.editMode = false;
        world.ToPlayAreas();
        $(window).unbind("resize", MapEditor.Resize);
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || ("" + document.location).indexOf("/demo_map_editor.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        $(window).bind("resize", MapEditor.Resize);
        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#mapEditorPalette").css("top", "5px");
            $("#mapEditorToolbar").css("top", "0px");
            $("#mapEditorContainer").css("top", "32px");
        }
        mapEditor.previousBackgroundTiles = [];
        mapEditor.emptyTiles = null;
        dialogCondition.currentEditor = "MapAction";
        dialogAction.currentEditor = "MapAction";
        mapEditor.mouseDown = false;
        mapEditor.currentFragment = "Root";

        mapEditor.renderer = new WorldRender(world);
        mapEditor.renderer.OnRender = MapEditor.OnRender;
        mapEditor.modified = true;
        areaFragment.canRunFragment = MapEditor.MapEditorCanRunFragment;

        mapEditor.currentPosition = new Monster(world);
        mapEditor.currentPosition.CurrentArea = (world.Player.CurrentArea ? world.Player.CurrentArea : world.GetArea(0, 0, mapEditor.currentZone));
        mapEditor.currentPosition.X = world.Player.X;
        mapEditor.currentPosition.Y = world.Player.Y;

        mapEditor.renderer.areaX = world.Player.AX;
        mapEditor.renderer.areaY = world.Player.AY;

        mapEditor.renderer.showGrid = (framework.Preferences["MapEditorShowGrid"] !== false);
        if (mapEditor.renderer.showGrid)
            $("#mapEditorGrid").addClass("activeToolbarIcon");
        else
            $("#mapEditorGrid").removeClass("activeToolbarIcon");

        mapEditor.minimap = (framework.Preferences["MapEditor_minimap"] !== false);
        mapEditor.gridSnap = (framework.Preferences["MapEditor_gridSnap"] !== false);
        mapEditor.objectSnap = (framework.Preferences["MapEditor_objectSnap"] !== false);
        mapEditor.objectSpray = (framework.Preferences["MapEditor_objectSpray"] !== false);
        mapEditor.objectSprayRadius = IfIsNull(framework.Preferences["MapEditor_objectSprayRadius"], 32);

        if (mapEditor.minimap)
            $("#mapEditorMinimap").addClass("activeToolbarIcon");
        else
            $("#mapEditorMinimap").removeClass("activeToolbarIcon");

        //mapEditor.renderer.drawMinimap = true;
        //(<HTMLInputElement>$("#mapEditorGrid").first()).checked = mapEditor.renderer.showGrid;

        world.editMode = true;
        //world.ResetAreas();
        //world.ToMapEditorAreas();

        mapEditor.refresher = setInterval(MapEditor.Refresh, 16);

        mapEditor.keyboardChecker = setInterval(MapEditor.HandleKeys, 50);

        $("#gameCanvas").bind("mousedown", MapEditor.MouseDown);
        $("#gameCanvas").bind("mousemove", MapEditor.MouseMove);
        $("#gameCanvas").bind("mousewheel", MapEditor.MouseWheel);


        var names: string[] = [];
        for (var i = 0; i < world.Zones.length; i++)
            names.push(world.Zones[i].Name);
        names.sort();
        var options = "";
        for (var i = 0; i < names.length; i++)
            options += "<option value='" + names[i] + "'>" + names[i] + "</option>";
        //$("#mapZone").find("option").remove().end().append(options).val("Base");
        $("#mapZone").find("option").remove().end().append(options).val(world.Player.Zone);
        mapEditor.currentZone = $("#mapZone").val();

        $(window).bind("keydown", MapEditor.KeyDown);
        $(window).bind("keyup", MapEditor.KeyUp);

        var action = mapEditor.currentOperation;
        if (framework.Preferences['mapEditorAction'])
            action = framework.Preferences['mapEditorAction'];
        if (mapEditor.currentOperation != action)
            MapEditor.SelectAction(action);
        $("#mapEditorPalette > span").removeClass("selectedButton");
        mapEditor.renderer.Resize();
        $("#" + action).addClass("selectedButton");

        MapEditor.ShowPreview();
        $("#gameCanvas").focus();
        $(window).focus();

        setTimeout(() =>
        {
            $("#gameCanvas").focus();
            $(window).focus();
        }, 500);

        MapEditor.CheckEmptyTiles();
        world.ResetGenerator();
        world.VisibleCenter(world.Player.AX, world.Player.AY, mapEditor.currentZone);
        world.ResetAreas();

        if (("" + document.location).indexOf("/demo_map_editor.html") !== -1)
        {
            $("#mapEditorPalette span").eq(0).hide();
            $("#mapEditorPalette").css("top", "2px");
            $("#mapEditorContainer").css("top", "2px");
        }

        if (framework.CurrentUrl.npc)
        {
            MapEditor.SearchNPC(null, framework.CurrentUrl.npc);
            Framework.SetLocation({ action: "MapEditor" }, true);
        }
    }

    static OnRender(ctx: CanvasRenderingContext2D)
    {
        if (MapEditor[mapEditor.currentOperation + "Render"])
            MapEditor[mapEditor.currentOperation + "Render"](ctx);
    }

    static Resize()
    {
        if (mapEditor.renderer)
            mapEditor.modified = true;
    }

    static IsOpen(): boolean
    {
        if (mapEditor && mapEditor.refresher)
            return true;
        return false;
    }

    static CheckEmptyTiles()
    {
        var img = new Image();
        img.src = world.art.background.file;
        img.onload = () =>
        {
            mapEditor.emptyTiles = [];

            var w = Math.floor(img.width / world.art.background.width);
            var h = Math.floor(img.height / world.art.background.width);
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
            var data = ctx.getImageData(0, 0, w, h);

            for (var i = 0; i < w * h; i++)
            {
                var x = i % w;
                var y = Math.floor(i / w);

                var a = data.data[i * 4 + 3];
                mapEditor.emptyTiles[i] = (a < 100);
            }

            if (mapEditor.currentOperation == "Tile")
                $("#tilePreview").html(MapEditor.ShowTile());
        };
    }

    static Refresh()
    {
        if (!mapEditor.currentPosition.CurrentArea)
        {
            mapEditor.currentPosition.CurrentArea = world.GetArea(mapEditor.renderer.areaX, mapEditor.renderer.areaY, mapEditor.currentZone);
            return;
        }

        if (mapEditor.mouseDown && MapEditor[mapEditor.currentOperation + "ActionRepeat"])
        {
            var coord = mapEditor.renderer.ScreenToMap(mapEditor.mousePosition.X, mapEditor.mousePosition.Y);
            MapEditor[mapEditor.currentOperation + "ActionRepeat"](coord.TileX, coord.TileY, coord.AreaX, coord.AreaY, coord.OffsetX, coord.OffsetY, mapEditor.mouseButton, true);
        }

        mapEditor.renderer.zone = mapEditor.currentZone;
        mapEditor.renderer.offsetX = mapEditor.currentPosition.X - Math.round(mapEditor.renderer.width / 2);
        mapEditor.renderer.offsetY = mapEditor.currentPosition.Y - Math.round(mapEditor.renderer.height / 2);
        mapEditor.renderer.areaX = mapEditor.currentPosition.CurrentArea.X;
        mapEditor.renderer.areaY = mapEditor.currentPosition.CurrentArea.Y;

        if (mapEditor.renderer.offsetX != mapEditor.renderer.oldOffsetX ||
            mapEditor.renderer.offsetY != mapEditor.renderer.oldOffsetY)
        {
            mapEditor.modified = true;
            mapEditor.renderer.oldOffsetX = mapEditor.renderer.offsetX;
            mapEditor.renderer.oldOffsetY = mapEditor.renderer.offsetY;
        }

        if (mapEditor.mousePosition)
        {
            var coord = mapEditor.renderer.ScreenToMap(mapEditor.mousePosition.X, mapEditor.mousePosition.Y);
            var html = "";
            var x = (coord.TileX * world.art.background.width + coord.OffsetX);
            var y = (coord.TileY * world.art.background.height + coord.OffsetY);
            if (mapEditor.showCoordinates)
            {
                html += "X: " + (x + coord.AreaX * world.areaWidth * world.art.background.width);
                html += ", Y: " + (y + coord.AreaY * world.areaHeight * world.art.background.height);
            }
            else
            {
                html += "TileX: " + coord.TileX + ", TileY: " + coord.TileY;
            }
            $("#currentPosition").html(html);
        }

        if (world.CountAreaToLoad() != 0)
            mapEditor.modified = true;

        if (mapEditor.renderer.loaded < mapEditor.renderer.toLoad || world.CountAreaToLoad() != 0 || world.IsLoading())
            mapEditor.modified = true;

        mapEditor.renderer.minimap = mapEditor.minimap;
        if (mapEditor.modified)
            mapEditor.renderer.Render();

        if (mapEditor.renderer.loaded >= mapEditor.renderer.toLoad && world.CountAreaToLoad() == 0 && !world.IsLoading())
            mapEditor.modified = false;
    }

    public static Save()
    {
        world.SaveMapChanges();
    }

    public static ChangeGrid()
    {
        mapEditor.renderer.showGrid = !mapEditor.renderer.showGrid;
        if (mapEditor.renderer.showGrid)
            $("#mapEditorGrid").addClass("activeToolbarIcon");
        else
            $("#mapEditorGrid").removeClass("activeToolbarIcon");
        //mapEditor.renderer.showGrid = (<HTMLInputElement>$("#mapEditorGrid").first()).checked;
        framework.Preferences["MapEditorShowGrid"] = mapEditor.renderer.showGrid;
        mapEditor.modified = true;
        Framework.SavePreferences();
    }

    public static ChangeToolbarOption(button: string, property: string)
    {
        if (property == "objectSprayRadius")
        {
            var val = parseInt($("#" + button).val());
            if (!isNaN(val))
                mapEditor[property] = val;
            framework.Preferences["MapEditor_" + property] = mapEditor[property];
            mapEditor.modified = true;
            Framework.SavePreferences();
            return;
        }

        mapEditor[property] = !mapEditor[property];
        if (property == "gridSnap")
        {
            mapEditor.objectSnap = false;
            mapEditor.objectSpray = false;
            $("#mapEditorObjectSnap").removeClass("activeToolbarIcon");
            $("#mapEditorObjectSpray").removeClass("activeToolbarIcon");
        }
        else if (property == "objectSnap")
        {
            mapEditor.gridSnap = false;
            mapEditor.objectSpray = false;
            $("#mapEditorGridSnap").removeClass("activeToolbarIcon");
            $("#mapEditorObjectSpray").removeClass("activeToolbarIcon");
        }
        else if (property == "objectSpray")
        {
            mapEditor.gridSnap = false;
            mapEditor.objectSnap = false;
            $("#mapEditorObjectSnap").removeClass("activeToolbarIcon");
            $("#mapEditorGridSnap").removeClass("activeToolbarIcon");
        }
        if (mapEditor[property])
            $("#" + button).addClass("activeToolbarIcon");
        else
            $("#" + button).removeClass("activeToolbarIcon");
        framework.Preferences["MapEditor_" + property] = mapEditor[property];
        mapEditor.modified = true;
        Framework.SavePreferences();
    }

    public static ShowSelector()
    {
        $("#tileList").html(MapEditor["Show" + mapEditor.currentOperation]());
        $("#mapEditorSelectTile").show();
    }

    public static ShowTile()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "";

        var firstValue = null;
        var found = false;

        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            /*if (i % game.tileSetDefinition.background.nbColumns == 0 && i != 0)
                html += "<br>";*/

            if (mapEditor.emptyTiles && mapEditor.emptyTiles[i] === true)
                continue;

            if (!firstValue)
                firstValue = i;
            if (i == mapEditor.currentCellTile)
                found = true;
            var x = (i % world.art.background.nbColumns) * world.art.background.width;
            var y = Math.floor(i / world.art.background.nbColumns) * world.art.background.height;

            html += "<div onclick='MapEditor.SelectTile(" + i + ");'" + (i == mapEditor.currentCellTile ? " class='toolSelected'" : "") + ">";
            html += MapEditor.GenerateThumb(world.art.background.file, x, y, world.art.background.width, world.art.background.height, "tile");
            html += "</div>";
        }

        if (!found)
        {
            mapEditor.currentCellTile = firstValue;
            return MapEditor.ShowTile();
        }

        return html;
    }

    static TilePrevious()
    {
        var newId = mapEditor.currentCellTile;
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            if (newId > 0)
                newId--;
            else
                newId = world.art.background.lastTile - 1;
            if (!mapEditor.emptyTiles || mapEditor.emptyTiles[newId] === false)
                break;
        }
        MapEditor.SelectTile(newId);
    }

    static TileNext()
    {
        var newId = mapEditor.currentCellTile;
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            if (newId < world.art.background.lastTile - 1)
                newId++;
            else
                newId = 0;
            if (!mapEditor.emptyTiles || mapEditor.emptyTiles[newId] === false)
                break;
        }
        MapEditor.SelectTile(newId);
    }

    public static ShowObject()
    {
        var html = "<span id='mapEditorGridSnap' onclick=\"MapEditor.ChangeToolbarOption('mapEditorGridSnap', 'gridSnap');\">Grid Snap</span>";
        html += "<span id='mapEditorObjectSnap' onclick=\"MapEditor.ChangeToolbarOption('mapEditorObjectSnap', 'objectSnap');\">Object Snap</span>";
        html += "<span id='mapEditorObjectSpray' onclick=\"MapEditor.ChangeToolbarOption('mapEditorObjectSpray', 'objectSpray');\">Spray</span>";
        html += "Radius <input type='text' value='" + ("" + mapEditor.objectSprayRadius).htmlEntities(true) + "' id='mapEditorObjectSprayRadius' onkeyup=\"MapEditor.ChangeToolbarOption('mapEditorObjectSprayRadius', 'objectSprayRadius');\">";
        $("#mapEditorAdditionalTools").html(html);

        if (mapEditor.gridSnap)
        {
            $("#mapEditorGridSnap").addClass("activeToolbarIcon");
            mapEditor.objectSnap = false;
            mapEditor.objectSpray = false;
        }
        else if (mapEditor.objectSnap)
        {
            mapEditor.gridSnap = false;
            mapEditor.objectSpray = false;
            $("#mapEditorObjectSnap").addClass("activeToolbarIcon");
        }
        else if (mapEditor.objectSpray)
        {
            mapEditor.gridSnap = false;
            mapEditor.objectSnap = false;
            $("#mapEditorObjectSpray").addClass("activeToolbarIcon");
        }

        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "<table>";
        var names: string[] = [];
        for (var i in world.art.objects)
            names.push(i);
        names.sort();

        var firstValue = null;
        var found = false;

        for (var j = 0; j < names.length; j++)
        {
            if (!firstValue)
                firstValue = names[j];
            if (names[j] == mapEditor.currentObject)
                found = true;

            html += "<tr onclick='MapEditor.SelectObject(\"" + names[j] + "\");'" + (names[j] == mapEditor.currentObject ? " class='toolSelected'" : "") + ">";
            var obj = world.art.objects[names[j]];
            html += "<td>" + MapEditor.GenerateThumb(obj.file, obj.x, obj.y, obj.width, obj.height, "object", MapEditor.ShowPreview) + "</td>";
            html += "<td>" + names[j] + "</td>";
            html += "</tr>";
        }
        html += "</table>";

        if (!found && names && names.length > 0)
        {
            mapEditor.currentObject = firstValue;
            return MapEditor.ShowObject();
        }

        return html;
    }

    public static ShowChest()
    {
        $("#mapEditorContainer").addClass("mapWithSubPanel");
        $("#mapEditorActions").show().html("");
        mapEditor.renderer.Resize();
        mapEditor.modified = true;

        return "Left click on the map to place a new chest. You will then be able to select the art and more.";
    }

    static ObjectPrevious()
    {
        MapEditor.ObjectSelectOffset(-1);
    }

    static ObjectNext()
    {
        MapEditor.ObjectSelectOffset(1);
    }

    static ObjectSelectOffset(offset: number)
    {
        var names: string[] = [];
        for (var i in world.art.objects)
            names.push(i);
        names.sort();

        var selectedPos = 0;
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
            {
                selectedPos = j;
                break;
            }
        }

        selectedPos += offset;
        if (selectedPos < 0)
            selectedPos = names.length - 1;
        if (selectedPos >= names.length)
            selectedPos = 0;
        MapEditor.SelectObject(names[selectedPos]);
    }

    public static DisableMonster()
    {
        $("#mapEditorContainer").removeClass("mapWithSmallSubPanel");
        $("#mapEditorActions").removeClass("mapSmallSubPanel").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;
    }

    public static ShowMonster()
    {
        $("#mapEditorContainer").addClass("mapWithSmallSubPanel");
        $("#mapEditorActions").show().addClass("mapSmallSubPanel").html("");
        mapEditor.renderer.Resize();

        var html = "<table>";
        var names: string[] = [];
        for (var i = 0; i < world.Monsters.length; i++)
        {
            if (world.Monsters[i].Name.toLowerCase() == "defaultmonster" || !world.Monsters[i].Art)
                continue;
            names.push(world.Monsters[i].Name);
        }
        names.sort();

        var firstValue = null;
        var found = false;

        for (var j = 0; j < names.length; j++)
        {

            var monster = world.GetMonster(names[j]);

            if (!firstValue)
                firstValue = names[j];
            if (names[j] == mapEditor.currentObject)
                found = true;

            var obj = world.art.characters[monster.Art];
            if (!obj)
                continue;
            html += "<tr onclick='MapEditor.SelectObject(\"" + names[j] + "\");'" + (names[j] == mapEditor.currentObject ? " class='toolSelected'" : "") + ">";
            html += "<td>" + MapEditor.GenerateThumb(obj.file, 0, 0, obj.width / obj.frames, obj.height / obj.directions, "actor", MapEditor.ShowPreview) + "</td>";
            html += "<td>" + names[j] + "</td>";
            html += "</tr>";
        }
        html += "</table>";

        if (!found && world.Monsters && world.Monsters.length > 0)
        {
            mapEditor.currentObject = firstValue;
            return MapEditor.ShowMonster();
        }
        return html;
    }

    static MonsterPrevious()
    {
        MapEditor.MonsterSelectOffset(-1);
    }

    static MonsterNext()
    {
        MapEditor.MonsterSelectOffset(1);
    }

    static MonsterSelectOffset(offset: number)
    {
        var names: string[] = [];
        for (var i = 0; i < world.Monsters.length; i++)
        {
            if (world.Monsters[i].Name.toLowerCase() == "defaultmonster" || !world.Monsters[i].Art)
                continue;
            names.push(world.Monsters[i].Name);
        }
        names.sort();

        var selectedPos = 0;
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
            {
                selectedPos = j;
                break;
            }
        }

        selectedPos += offset;
        if (selectedPos < 0)
            selectedPos = names.length - 1;
        if (selectedPos >= names.length)
            selectedPos = 0;
        MapEditor.SelectObject(names[selectedPos]);
    }

    public static ShowNPC()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "<table>";
        var names: string[] = [];
        for (var i = 0; i < world.NPCs.length; i++)
        {
            names.push(world.NPCs[i].Name);
        }
        names.sort();

        var firstValue = null;
        var found = false;

        for (var j = 0; j < names.length; j++)
        {

            var npc = world.GetNPC(names[j]);
            var obj = world.art.characters[npc.Look];
            if (!obj || !obj.file)
                continue;

            if (!firstValue)
                firstValue = names[j];
            if (names[j] == mapEditor.currentObject)
                found = true;

            html += "<tr onclick='MapEditor.SelectObject(\"" + names[j] + "\");'" + (names[j] == mapEditor.currentObject ? " class='toolSelected'" : "") + ">";
            html += "<td>" + MapEditor.GenerateThumb(obj.file, 0, 0, obj.width / obj.frames, obj.height / obj.directions, "actor") + "</td>";
            html += "<td>" + names[j] + "</td>";
            html += "<td><span class='smallSearch' onclick='return MapEditor.SearchNPC(event,\"" + names[j] + "\", MapEditor.ShowPreview);'></span></td>";
            html += "</tr>";
        }
        html += "</table>";

        if (!found && world.NPCs && world.NPCs.length > 0)
        {
            mapEditor.currentObject = firstValue;
            return MapEditor.ShowNPC();
        }
        return html;
    }

    static SearchNPC(evt: Event, name)
    {
        if (evt)
            evt.cancelBubble = true;

        $.ajax({
            type: 'POST',
            url: '/backend/FindNPC',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                npc: name
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (!data)
                {
                    Framework.ShowMessage("NPC Not found.");
                    return;
                }

                if (data.zone != mapEditor.currentZone)
                {

                    mapEditor.currentZone = data.zone;

                    world.ResetGenerator();
                    world.VisibleCenter(data.ax, data.ay, data.zone);
                    //world.ResetAreas();
                    mapEditor.currentPosition.Y = 0;
                    mapEditor.currentPosition.CurrentArea = world.GetArea(data.ax, data.ay, data.zone);
                    mapEditor.currentPosition.X = data.x;
                    mapEditor.currentPosition.Y = data.y;
                    mapEditor.renderer.offsetX = 0;
                    mapEditor.renderer.offsetY = 0;
                    mapEditor.renderer.areaX = data.ax;
                    mapEditor.renderer.areaY = data.ay;

                    mapEditor.renderer.oldOffsetX = 0;
                    mapEditor.renderer.oldOffsetY = 0;
                }

                mapEditor.currentPosition.X = data.x;
                mapEditor.currentPosition.Y = data.y;
                mapEditor.renderer.areaX = data.ax;
                mapEditor.renderer.areaY = data.ay;

                if (mapEditor.currentPosition.CurrentArea)
                {
                    mapEditor.currentPosition.UpdatePosition(false);
                    world.VisibleCenter(mapEditor.currentPosition.CurrentArea.X, mapEditor.currentPosition.CurrentArea.Y, mapEditor.currentZone);
                }

                mapEditor.modified = true;
                var waitTillLoaded = () =>
                {
                    mapEditor.modified = true;
                    if (!mapEditor.currentPosition.CurrentArea || world.CountAreaToLoad() > 0 || world.areas.length < 9)
                        setTimeout(waitTillLoaded, 100);
                    else
                    {
                        mapEditor.currentPosition.UpdatePosition(false);
                        world.VisibleCenter(mapEditor.currentPosition.CurrentArea.X, mapEditor.currentPosition.CurrentArea.Y, mapEditor.currentZone);
                        mapEditor.modified = true;
                    }
                };
                setTimeout(waitTillLoaded, 100);

                //Teleport.Teleport(data.ax * world.areaWidth + data.x, data.ay * world.areaHeight + data.y, data.zone);
            },
            error: function (msg, textStatus)
            {
                Framework.ShowMessage("NPC Not found.");
            }
        });

        return false;
    }

    static NPCPrevious()
    {
        MapEditor.NPCSelectOffset(-1);
    }

    static NPCNext()
    {
        MapEditor.NPCSelectOffset(1);
    }

    static NPCSelectOffset(offset: number)
    {
        var names: string[] = [];
        for (var i = 0; i < world.NPCs.length; i++)
        {
            names.push(world.NPCs[i].Name);
        }
        names.sort();

        var selectedPos = 0;
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
            {
                selectedPos = j;
                break;
            }
        }

        selectedPos += offset;
        if (selectedPos < 0)
            selectedPos = names.length - 1;
        if (selectedPos >= names.length)
            selectedPos = 0;
        MapEditor.SelectObject(names[selectedPos]);
    }

    public static ShowSmartTile()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "<table>";
        var knownTypes = {};
        var firstValue = null;
        var found = false;
        for (var i = 0; i < world.art.background.transitions.length; i++)
        {
            var type = world.art.background.transitions[i].from;
            if (!knownTypes[type])
            {
                if (!firstValue)
                    firstValue = type;
                if (type == mapEditor.currentCellType)
                    found = true;
                knownTypes[type] = true;
                html += "<tr onclick='MapEditor.SelectCellType(\"" + type + "\");'" + (type == mapEditor.currentCellType ? " class='toolSelected'" : "") + ">";
                var t = world.art.background.types[type][0];
                var x = (t % world.art.background.nbColumns) * world.art.background.width;
                var y = Math.floor(t / world.art.background.nbColumns) * world.art.background.height;
                html += "<td>" + MapEditor.GenerateThumb(world.art.background.file, x, y, world.art.background.width, world.art.background.height, "object") + "</td>";
                html += "<td>" + type + "</td>";
                html += "</tr>";
            }

            var type = world.art.background.transitions[i].to;
            if (!knownTypes[type])
            {
                if (!firstValue)
                    firstValue = type;
                if (type == mapEditor.currentCellType)
                    found = true;
                knownTypes[type] = true;
                html += "<tr onclick='MapEditor.SelectCellType(\"" + type + "\");'" + (type == mapEditor.currentCellType ? " class='toolSelected'" : "") + ">";
                var t = world.art.background.types[type][0];
                var x = (t % world.art.background.nbColumns) * world.art.background.width;
                var y = Math.floor(t / world.art.background.nbColumns) * world.art.background.height;
                html += "<td>" + MapEditor.GenerateThumb(world.art.background.file, x, y, world.art.background.width, world.art.background.height, "object") + "</td>";
                html += "<td>" + type + "</td>";
                html += "</tr>";
            }
        }
        html += "</table>";
        if (!found && world.art.background.transitions && world.art.background.transitions.length > 0)
        {
            mapEditor.currentCellType = firstValue;
            return MapEditor.ShowSmartTile();
        }

        return html;
    }

    static SmartTileNext()
    {
        MapEditor.SmartTitleSelect(1);
    }

    static SmartTilePrevious()
    {
        MapEditor.SmartTitleSelect(-1);
    }

    static SmartTitleSelect(offset: number)
    {
        var list: string[] = [];
        var knownTypes = {};
        var currentPos = 0;
        for (var i = 0; i < world.art.background.transitions.length; i++)
        {
            var type = world.art.background.transitions[i].from;
            if (!knownTypes[type])
            {
                knownTypes[type] = true;
                list.push(type);
            }
            var type = world.art.background.transitions[i].to;
            if (!knownTypes[type])
            {
                knownTypes[type] = true;
                list.push(type);
            }
        }

        for (var i = 0; i < list.length; i++)
        {
            if (list[i] == mapEditor.currentCellType)
            {
                currentPos = i;
                break;
            }
        }
        currentPos += offset;
        if (currentPos < 0)
            currentPos = list.length - 1;
        if (currentPos >= list.length)
            currentPos = 0;
        MapEditor.SelectCellType(list[currentPos]);
    }

    public static ShowHouse()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "<table>";
        var names: string[] = [];
        for (var i in world.Houses)
        {
            names.push(i);
        }
        names.sort();

        var firstValue = null;
        var found = false;

        for (var j = 0; j < names.length; j++)
        {

            var npc = world.GetHouse(names[j]);

            if (!firstValue)
                firstValue = names[j];
            if (names[j] == mapEditor.currentObject)
                found = true;

            html += "<tr onclick='MapEditor.SelectObject(\"" + names[j] + "\");'" + (names[j] == mapEditor.currentObject ? " class='toolSelected'" : "") + ">";
            html += "<td>&nbsp;</td>";
            html += "<td>" + names[j] + "</td>";
            html += "</tr>";
        }
        html += "</table>";

        if (!found && names && names.length)
        {
            mapEditor.currentObject = firstValue;
            return MapEditor.ShowHouse();
        }
        return html;
    }

    static HousePrevious()
    {
        MapEditor.HouseSelectOffset(-1);
    }

    static HouseNext()
    {
        MapEditor.HouseSelectOffset(1);
    }

    static HouseSelectOffset(offset: number)
    {
        var names: string[] = [];
        for (var i in world.Houses)
        {
            names.push(i);
        }
        names.sort();

        var selectedPos = 0;
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
            {
                selectedPos = j;
                break;
            }
        }

        selectedPos += offset;
        if (selectedPos < 0)
            selectedPos = names.length - 1;
        if (selectedPos >= names.length)
            selectedPos = 0;
        MapEditor.SelectObject(names[selectedPos]);
    }

    static ShowPath(): string
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.renderer.showMapActions = false;

        var html = "";
        var names: string[] = [];
        for (var item in world.art.background.paths)
            names.push(item);
        names.sort();

        var found: boolean = false;

        html += "<table>";
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
                found = true;

            html += "<tr onclick='MapEditor.SelectObject(\"" + names[j] + "\");'" + (names[j] == mapEditor.currentObject ? " class='toolSelected'" : "") + ">";
            html += "<td>&nbsp;</td>";
            html += "<td>" + names[j] + "</td>";
            html += "</tr>";
        }
        html += "</table>";

        if (!found && names && names.length)
        {
            mapEditor.currentObject = names[0];
            return MapEditor.ShowPath();
        }
        return html;
    }

    static PathPrevious()
    {
        MapEditor.HouseSelectOffset(-1);
    }

    static PathNext()
    {
        MapEditor.PathSelectOffset(1);
    }

    static PathSelectOffset(offset: number)
    {
        var names: string[] = [];
        for (var i in world.art.background.paths)
        {
            names.push(i);
        }
        names.sort();

        var selectedPos = 0;
        for (var j = 0; j < names.length; j++)
        {
            if (names[j] == mapEditor.currentObject)
            {
                selectedPos = j;
                break;
            }
        }

        selectedPos += offset;
        if (selectedPos < 0)
            selectedPos = names.length - 1;
        if (selectedPos >= names.length)
            selectedPos = 0;
        MapEditor.SelectObject(names[selectedPos]);
    }


    public static DisableMapAction()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.modified = true;
        mapEditor.renderer.showMapActions = false;
    }

    public static ShowMapAction()
    {
        dialogCondition.currentEditor = "MapAction";
        mapEditor.renderer.showMapActions = true;
        $("#mapEditorContainer").addClass("mapWithSubPanel");
        $("#mapEditorActions").show().html("");
        mapEditor.renderer.Resize();
        mapEditor.modified = true;
        return "Click on the map to choose where a map action should be triggered, and then edit the map action & conditions in the bottom right panel.";
    }

    public static SelectCellType(name: string)
    {
        mapEditor.currentCellType = name;
        MapEditor.ShowPreview();
        MapEditor.CloseSelection();
    }

    public static SelectObject(name: string)
    {
        mapEditor.currentObject = name;
        MapEditor.ShowPreview();
        MapEditor.CloseSelection();
    }

    public static SelectChest(name: string)
    {
        mapEditor.currentChest = null;;
        MapEditor.ShowPreview();
        MapEditor.CloseSelection();
    }

    public static SelectTile(id: number)
    {
        mapEditor.currentCellTile = id;
        MapEditor.ShowPreview();
        MapEditor.CloseSelection();
    }

    public static GenerateThumb(filename: string, x: number, y: number, width: number, height: number, imageType: string, callbackOnLoad: () => void = null): string
    {
        var html = "<span style='";
        html += "display: inline-block;";
        var fx = Math.min(1, 32 / Math.max(width, height));
        var fw = (32 / width);
        var fh = (32 / height);
        var w = Math.floor((fx / fw) * 32);
        var h = Math.floor((fx / fh) * 32);
        html += "width: " + w + "px;";
        html += "height: " + h + "px;";
        html += "background-image: url(\"" + filename + "\");";
        var img: HTMLImageElement;
        switch (imageType)
        {
            case "object":
                img = mapEditor.renderer.GetObjectSpriteSheet(filename);
                break;
            case "tile":
                img = mapEditor.renderer.GetTileSheet();
                break;
            case "actor":
                img = mapEditor.renderer.GetActorSpriteSheet(filename);
                break;
        }
        if (img && img.width)
            html += "background-size: " + Math.floor(img.width * fw) + "px " + Math.floor(img.height * fh) + "px;";
        else if (callbackOnLoad)
            img.addEventListener("load", callbackOnLoad);
        html += "background-position: -" + Math.floor(x * fw) + "px -" + Math.floor(y * fh) + "px;";
        html += "'></span>";
        return html;
    }

    public static ToggleSelection()
    {
        if ($("#mapEditorSelectTile").css("display") != "none")
            MapEditor.CloseSelection();
        else
            MapEditor.ShowSelector();
    }

    public static CloseSelection()
    {
        $("#mapEditorSelectTile").hide();
    }

    static SelectAction(action: string)
    {
        mapEditor.previousBackgroundTiles = [];

        if ($("#mapEditorSelectTile").css("display") != "none")
            MapEditor.CloseSelection();
        // Second click on the action => show the selector instead.
        /*else if ($("#mapEditorSelectTile").css("display") == "none" && mapEditor.currentOperation == action)
        {
            MapEditor.ShowSelector();
            return;
        }*/

        $("#mapEditorPalette > span").removeClass("selectedButton");
        mapEditor.renderer.Resize();
        $("#" + action).addClass("selectedButton");
        $("#mapEditorAdditionalTools").html("");

        if (typeof window['MapEditor']['Disable' + mapEditor.currentOperation] == 'function')
            window['MapEditor']['Disable' + mapEditor.currentOperation]();

        mapEditor.currentOperation = action;
        framework.Preferences['mapEditorAction'] = mapEditor.currentOperation;
        Framework.SavePreferences();
        MapEditor.ShowPreview();
    }

    static ShowPreview()
    {
        $("#tilePreview").html(MapEditor["Show" + mapEditor.currentOperation]());
        setTimeout(() =>
        {
            var selected = $("#tilePreview .toolSelected").first();
            if (selected)
            {
                selected.scrollIntoView();
                if ($("#tilePreview").first().scrollTop < $("#tilePreview").first().scrollHeight - $("#tilePreview").height())
                    $("#tilePreview").first().scrollTop -= $("#tilePreview").height() / 2;
            }
        }, 100);
    }

    public static KeyDown(evt: KeyboardEvent)
    {
        if (play.inField)
            return;
        //console.log(evt.keyCode);
        mapEditor.keys[evt.keyCode] = true;

        /*switch (evt.keyCode)
        {
            case 32:
                MapEditor.ToggleSelection();
                break;
        }*/
    }

    public static KeyUp(evt: KeyboardEvent)
    {
        if (play.inField)
            return;
        mapEditor.keys[evt.keyCode] = false;
    }

    public static HandleKeys()
    {
        if (world.IsLoading())
            return;
        if (!mapEditor.currentPosition.CurrentArea)
            return;

        // Up key
        if (mapEditor.keys[38] === true || mapEditor.keys[87] === true)
        {
            mapEditor.currentPosition.Y -= 32;
            mapEditor.modified = true;
        }
        // Left key
        if (mapEditor.keys[37] === true || mapEditor.keys[65] === true)
        {
            mapEditor.currentPosition.X -= 32;
            mapEditor.modified = true;
        }
        // Right key
        if (mapEditor.keys[39] === true || mapEditor.keys[68] === true)
        {
            mapEditor.currentPosition.X += 32;
            mapEditor.modified = true;
        }
        // Down key
        if (mapEditor.keys[40] === true || mapEditor.keys[83] === true)
        {
            mapEditor.currentPosition.Y += 32;
            mapEditor.modified = true;
        }

        mapEditor.currentPosition.UpdatePosition(false);
        if (mapEditor.currentPosition.CurrentArea)
            world.VisibleCenter(mapEditor.currentPosition.CurrentArea.X, mapEditor.currentPosition.CurrentArea.Y, mapEditor.currentZone);
    }

    static MouseDown(evt: MouseEvent): void
    {
        var pos = $("#gameCanvas").position();
        var x = evt.pageX - pos.left;
        var y = evt.pageY - pos.top;
        // Click on the minimap
        if (mapEditor.minimap && x > mapEditor.renderer.width - 210 && x < mapEditor.renderer.width - 10 && y > 10 && y < 210)
        {
            mapEditor.currentPosition.X += (Math.round((x - (mapEditor.renderer.width - 210)) / 2) - 50) * world.art.background.width;
            mapEditor.currentPosition.Y += (Math.round((y - 10) / 2) - 50) * world.art.background.height;
            mapEditor.modified = true;
            return;
        }

        $("#gameCanvas").bind("mouseup", MapEditor.MouseUp);
        mapEditor.modified = true;
        mapEditor.mouseDown = true;
        mapEditor.mouseButton = evt.buttons;

        mapEditor.mousePosition = { X: evt.pageX, Y: evt.pageY };
        var coord = mapEditor.renderer.ScreenToMap(evt.pageX, evt.pageY);
        MapEditor[mapEditor.currentOperation + "Action"](coord.TileX, coord.TileY, coord.AreaX, coord.AreaY, coord.OffsetX, coord.OffsetY, evt.buttons, true);
    }
    static MouseMove(evt: MouseEvent): void
    {
        mapEditor.mousePosition = { X: evt.pageX, Y: evt.pageY };
        if (mapEditor.mouseDown)
        {
            mapEditor.modified = true;
            var coord = mapEditor.renderer.ScreenToMap(evt.pageX, evt.pageY);
            MapEditor[mapEditor.currentOperation + "Action"](coord.TileX, coord.TileY, coord.AreaX, coord.AreaY, coord.OffsetX, coord.OffsetY, evt.buttons, false);
        }
        if (MapEditor[mapEditor.currentOperation + "MouseHover"])
        {
            var coord = mapEditor.renderer.ScreenToMap(evt.pageX, evt.pageY);
            MapEditor[mapEditor.currentOperation + "MouseHover"](coord.TileX, coord.TileY, coord.AreaX, coord.AreaY, coord.OffsetX, coord.OffsetY, evt.buttons, false);
        }
    }

    static MouseWheel(evt: MouseWheelEvent)
    {
        var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
        if (delta < 0 && MapEditor[mapEditor.currentOperation + "Next"])
            MapEditor[mapEditor.currentOperation + "Next"]();
        if (delta > 0 && MapEditor[mapEditor.currentOperation + "Previous"])
            MapEditor[mapEditor.currentOperation + "Previous"]();
    }

    static TileAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (mouseButton == 2)
            MapEditor.RollbackBackground(x, y, cx, cy);
        else
        {
            if (mapEditor.keys[17] === true)
            {
                var startTile = MapEditor.GetBackgroundCell(x, y, cx, cy);
                var todo: Point[] = [MapEditor.AreaToAbsolute(x, y, cx, cy)];
                var visited: Point[] = [];

                var canVisit = (x: number, y: number) =>
                {
                    for (var i = 0; i < todo.length; i++)
                    {
                        if (todo[i].X == x && todo[i].Y == y)
                            return false;
                    }
                    for (var i = 0; i < visited.length; i++)
                    {
                        if (visited[i].X == x && visited[i].Y == y)
                            return false;
                    }
                    return true;
                };

                var nbSteps = 0;
                while (todo.length > 0 && nbSteps < 5000)
                {
                    var p = todo.pop();
                    var n = MapEditor.AbsoluteToArea(p.X - 1, p.Y);
                    var na = MapEditor.AreaToAbsolute(n.x, n.y, n.ax, n.ay);
                    if (MapEditor.GetBackgroundCell(n.x, n.y, n.ax, n.ay) == startTile && canVisit(na.X, na.Y))
                        todo.push(na);

                    var n = MapEditor.AbsoluteToArea(p.X + 1, p.Y);
                    var na = MapEditor.AreaToAbsolute(n.x, n.y, n.ax, n.ay);
                    if (MapEditor.GetBackgroundCell(n.x, n.y, n.ax, n.ay) == startTile && canVisit(na.X, na.Y))
                        todo.push(na);

                    var n = MapEditor.AbsoluteToArea(p.X, p.Y - 1);
                    var na = MapEditor.AreaToAbsolute(n.x, n.y, n.ax, n.ay);
                    if (MapEditor.GetBackgroundCell(n.x, n.y, n.ax, n.ay) == startTile && canVisit(na.X, na.Y))
                        todo.push(na);

                    var n = MapEditor.AbsoluteToArea(p.X, p.Y + 1);
                    var na = MapEditor.AreaToAbsolute(n.x, n.y, n.ax, n.ay);
                    if (MapEditor.GetBackgroundCell(n.x, n.y, n.ax, n.ay) == startTile && canVisit(na.X, na.Y))
                        todo.push(na);
                    var n = MapEditor.AbsoluteToArea(p.X, p.Y);
                    MapEditor.SetBackgroundCell(n.x, n.y, mapEditor.currentCellTile, n.ax, n.ay);
                    nbSteps++;
                }
            }
            else
                MapEditor.SetBackgroundCell(x, y, mapEditor.currentCellTile, cx, cy);
        }
    }

    static AbsoluteToArea(x: number, y: number)
    {
        var ax = Math.floor(x / world.areaWidth);
        var ay = Math.floor(y / world.areaHeight);
        var mx = Math.abs(x) % world.areaWidth;
        var my = Math.abs(y) % world.areaHeight;
        if (ax < 0)
            mx = world.areaWidth - mx;
        if (ay < 0)
            my = world.areaHeight - my;

        return { x: mx, y: my, ax: ax, ay: ay };
    }

    static AreaToAbsolute(tx: number, ty: number, ax: number, ay: number): Point
    {
        return {
            X: tx + ax * world.areaWidth,
            Y: ty + ay * world.areaHeight
        }
    }

    static ObjectRender(ctx: CanvasRenderingContext2D)
    {
        if (!mapEditor.renderRectrangle)
            return;
        var sx = mapEditor.renderRectrangle.X - (mapEditor.currentPosition.X + mapEditor.currentPosition.CurrentArea.X * world.areaWidth * world.art.background.width) + Math.round(mapEditor.renderer.width / 2);
        var sy = mapEditor.renderRectrangle.Y - (mapEditor.currentPosition.Y + mapEditor.currentPosition.CurrentArea.Y * world.areaHeight * world.art.background.height) + Math.round(mapEditor.renderer.height / 2);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 0.5, sy + 0.5, mapEditor.renderRectrangle.Width, mapEditor.renderRectrangle.Height);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, mapEditor.renderRectrangle.Width, mapEditor.renderRectrangle.Height);
    }

    static ObjectMouseHover(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        var obj_info = world.art.objects[mapEditor.currentObject];
        if (!obj_info)
        {
            mapEditor.renderRectrangle = null;
            mapEditor.modified = true;
            return;
        }
        var newCoords = MapEditor.SnapObject(px, py, cx, cy, ox, oy);
        px = newCoords.X;
        py = newCoords.Y;

        mapEditor.renderRectrangle = { X: Math.floor(px + cx * world.areaWidth * world.art.background.width - obj_info.groundX), Y: Math.floor(py + cy * world.areaHeight * world.art.background.height - obj_info.groundY), Width: obj_info.width, Height: obj_info.height };
        mapEditor.modified = true;
    }

    static SnapObject(px: number, py: number, cx: number, cy: number, ox: number, oy: number): Point
    {
        if (mapEditor.gridSnap)
        {
            var obj_info = world.art.objects[mapEditor.currentObject];
            px = Math.round((px - ox) + obj_info.groundX - obj_info.width / 2 + world.art.background.width / 2);
            py = Math.round((py - oy) + obj_info.groundY - obj_info.height / 2 + world.art.background.height / 2);
        }

        if (mapEditor.objectSnap)
        {
            var px2 = px + cx * world.areaWidth * world.art.background.width;
            var py2 = py + cy * world.areaHeight * world.art.background.height;

            var obj_info = world.art.objects[mapEditor.currentObject];
            var nearestObject: WorldObject = null;
            var nearestObjectDistance: number = null;
            // Check out all the loaded world areas
            for (var i = 0; i < world.areas.length; i++)
            {
                for (var j = 0; j < world.areas[i].objects.length; j++)
                {
                    var a = (world.areas[i].objects[j].X + world.areas[i].X * world.areaWidth * world.art.background.width) - px2;
                    var b = (world.areas[i].objects[j].Y + world.areas[i].Y * world.areaHeight * world.art.background.height) - py2;
                    var d = Math.sqrt(a * a + b * b);
                    if (nearestObjectDistance === null || nearestObjectDistance > d)
                    {
                        nearestObjectDistance = d;
                        nearestObject = world.areas[i].objects[j];
                    }
                }
            }

            if (nearestObject && nearestObjectDistance < 64)
            {
                var nearest_info = world.art.objects[nearestObject.Name];
                if (nearest_info)
                {
                    var nx1 = nearestObject.X - nearest_info.groundX;
                    var nx2 = nearestObject.X - nearest_info.groundX + nearest_info.width;
                    var ny1 = nearestObject.Y - nearest_info.groundY;
                    var ny2 = nearestObject.Y - nearest_info.groundY + nearest_info.height;

                    var dx1 = px - obj_info.groundX;
                    var dx2 = px - obj_info.groundX + obj_info.width;
                    var dy1 = py - obj_info.groundY;
                    var dy2 = py - obj_info.groundY + obj_info.height;

                    // Snap left
                    if (Math.abs(dx1 - nx1) < 10)
                    {
                        px = nx1 + obj_info.groundX;
                    }
                    // Snap right
                    else if (Math.abs(dx2 - nx2) < 10)
                    {
                        px = nx2 + obj_info.groundX;
                    }
                    // Snap sides if sides are less than 10 pixels
                    else if (Math.abs(dx2 - nx1) <= 10 || Math.abs(dx1 - nx2) <= 10)
                    {
                        // Going on the left side of the old object
                        if (Math.abs(dx2 - nx1) < Math.abs(dx1 - nx2))
                        {
                            px = nx1 - (obj_info.width - obj_info.groundX);
                        }
                        // Going on the right side of the old object
                        else
                        {
                            px = nx2 + (obj_info.groundX);
                        }
                    }

                    // Snap on top
                    if (Math.abs(dy1 - ny1) <= 5)
                    {
                        py = ny1 + (obj_info.groundY);
                    }
                    // Snap on bottom
                    else if (Math.abs(dy2 - ny2) <= 5)
                    {
                        py = ny2 - (obj_info.groundY);
                    }
                    // Snap sides if top/bottom are less than 10 pixels
                    else if (Math.abs(dy2 - ny1) <= 10 || Math.abs(dy1 - ny2) <= 10)
                    {
                        // Going on the left side of the old object
                        if (Math.abs(dy2 - ny1) < Math.abs(dy1 - ny2))
                        {
                            py = ny1 - (obj_info.height - obj_info.groundY);
                        }
                        // Going on the right side of the old object
                        else
                        {
                            py = ny2 + (obj_info.groundY);
                        }
                    }
                }
            }
        }
        return { X: px, Y: py };
    }

    static ObjectAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (!firstEvent)
            return;
        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;
        if (mapEditor.objectSpray && mouseButton != 2)
        {
            px += Math.round(Math.random() * (mapEditor.objectSprayRadius * 2) - mapEditor.objectSprayRadius);
            py += Math.round(Math.random() * (mapEditor.objectSprayRadius * 2) - mapEditor.objectSprayRadius);
        }

        var newCoords = MapEditor.SnapObject(px, py, cx, cy, ox, oy);
        px = newCoords.X;
        py = newCoords.Y;

        if (px < 0)
        {
            px += world.areaWidth * world.art.background.width;
            cx--;
        }
        else if (px >= world.areaWidth * world.art.background.width)
        {
            px -= world.areaWidth * world.art.background.width;
            cx++;
        }
        if (py < 0)
        {
            py += world.areaHeight * world.art.background.height;
            cy--;
        }
        else if (py >= world.areaHeight * world.art.background.height)
        {
            py -= world.areaHeight * world.art.background.height;
            cy++;
        }

        if (mouseButton == 2)
        {
            if (mapEditor.currentFragment == "Root")
            {
                var objs = area.HitObjects(px, py, mapEditor.currentZone);
                for (var j = 0; j < area.objects.length;)
                {
                    if (area.objects[j] == objs[objs.length - 1])
                    {
                        area.objects.splice(j, 1);
                        break;
                    }
                    else
                        j++;
                }
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        var objs = area.HitObjects(px, py, mapEditor.currentZone);
                        var found = false;
                        if (objs) for (var k = 0; k < objs.length && found == false; k++)
                        {
                            for (var j = 0; j < fragment.Modifications.length; j++)
                            {
                                if (fragment.Modifications[j].Action == "object" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == objs[k].X && fragment.Modifications[j].Y == objs[k].Y && fragment.Modifications[j].Value == objs[k].Name)
                                {
                                    fragment.Modifications.splice(j, 1);
                                    found = true;
                                    break;
                                }
                            }

                        }
                        area.ResetFragments();
                        break;
                    }
                }
            }

            area.edited = true;
            area.CleanObjectCache();
        }
        else
        {
            if (mapEditor.currentFragment == "Root")
            {
                area.objects.push(new WorldObject(mapEditor.currentObject, px, py));
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        for (var j = 0; j < fragment.Modifications.length; j++)
                        {
                            if (fragment.Modifications[j].Action == "object" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == x && fragment.Modifications[j].Y == y)
                            {
                                fragment.Modifications.splice(j, 1);
                                break;
                            }
                        }
                        fragment.Modifications.push({ Action: "object", AX: cx, AY: cy, X: px, Y: py, Value: mapEditor.currentObject });
                        area.ResetFragments();
                        break;
                    }
                }
            }

            area.edited = true;
            area.CleanObjectCache();
            if (!mapEditor.objectSpray)
            {
                $("#gameCanvas").unbind("mouseup", MapEditor.MouseUp);
                mapEditor.mouseDown = false;
            }
        }
    }

    static ObjectActionRepeat(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (mouseButton != 1 || !mapEditor.objectSpray)
            return;
        mapEditor.repeatTimer++;
        if (mapEditor.repeatTimer < 5)
            return;
        mapEditor.repeatTimer = 0;

        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox + Math.round(Math.random() * (mapEditor.objectSprayRadius * 2) - mapEditor.objectSprayRadius);
        var py = y * world.art.background.height + oy + Math.round(Math.random() * (mapEditor.objectSprayRadius * 2) - mapEditor.objectSprayRadius);

        var newCoords = MapEditor.SnapObject(px, py, cx, cy, ox, oy);
        px = newCoords.X;
        py = newCoords.Y;

        if (px < 0)
        {
            px += world.areaWidth * world.art.background.width;
            cx--;
        }
        else if (px >= world.areaWidth * world.art.background.width)
        {
            px -= world.areaWidth * world.art.background.width;
            cx++;
        }
        if (py < 0)
        {
            py += world.areaHeight * world.art.background.height;
            cy--;
        }
        else if (py >= world.areaHeight * world.art.background.height)
        {
            py -= world.areaHeight * world.art.background.height;
            cy++;
        }

        if (mapEditor.currentFragment == "Root")
        {
            area.objects.push(new WorldObject(mapEditor.currentObject, px, py));
        }
        else
        {
            var zone = world.GetZone(mapEditor.currentZone);
            for (var i = 0; i < zone.MapFragments.length; i++)
            {
                if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                {
                    var fragment = zone.MapFragments[i];
                    for (var j = 0; j < fragment.Modifications.length; j++)
                    {
                        if (fragment.Modifications[j].Action == "object" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == x && fragment.Modifications[j].Y == y)
                        {
                            fragment.Modifications.splice(j, 1);
                            break;
                        }
                    }
                    fragment.Modifications.push({ Action: "object", AX: cx, AY: cy, X: px, Y: py, Value: mapEditor.currentObject });
                    area.ResetFragments();
                    break;
                }
            }
        }

        area.edited = true;
        area.CleanObjectCache();
        mapEditor.modified = true;
    }

    public static DisableChest()
    {
        $("#mapEditorContainer").removeClass("mapWithSubPanel");
        $("#mapEditorActions").hide();
        mapEditor.renderer.Resize();
        mapEditor.modified = true;
    }

    static ChestAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (!firstEvent)
            return;
        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        mapEditor.currentChest = null;
        WorldChest.ShowEditor();

        if (mapEditor.currentFragment != "Root")
        {
            Framework.ShowMessage("Can be handled currently only on the Root fragment.");
            return;
        }

        if (mouseButton == 2)
        {
            var objs = area.HitObjects(px, py, mapEditor.currentZone);
            for (var j = 0; j < area.objects.length;)
            {
                if (area.objects[j] == objs[objs.length - 1])
                {
                    area.objects.splice(j, 1);
                    break;
                }
                else
                    j++;
            }
            area.edited = true;
            area.CleanObjectCache();
        }
        else
        {
            mapEditor.currentChest = null;
            var objs = area.HitObjects(px, py, mapEditor.currentZone);
            if (objs && objs.length > 0)
            {
                for (var j = area.objects.length - 1; j >= 0; j--)
                {
                    if (objs[j] instanceof WorldChest)
                    {
                        mapEditor.currentChest = (<any>objs[j]);
                        break;
                    }
                }
            }

            if (!mapEditor.currentChest)
            {
                if (!mapEditor.currentObject)
                    mapEditor.currentObject = FirstItem(world.art.objects);

                var chest = new WorldChest(mapEditor.currentObject, px, py, area.X, area.Y);
                chest.Name = FirstItem(world.art.objects);
                mapEditor.currentChest = chest;

                area.objects.push(chest);
                area.edited = true;
                area.CleanObjectCache();
            }

            $("#gameCanvas").unbind("mouseup", MapEditor.MouseUp);
            mapEditor.mouseDown = false;
            worldChest.area = area;
            WorldChest.ShowEditor();
        }
    }

    static RollbackBackground(x, y, cx, cy)
    {
        if (x < 0)
        {
            x += world.areaWidth;
            cx--;
        }
        if (x >= world.areaWidth)
        {
            x -= world.areaWidth;
            cx++;
        }
        if (y < 0)
        {
            y += world.areaHeight;
            cy--;
        }
        if (y > world.areaHeight)
        {
            y += world.areaHeight;
            cy++;
        }

        if (mapEditor.currentFragment == "Root")
        {
            var foundHistory: MapTile = null;
            for (var i = 0; i < mapEditor.previousBackgroundTiles.length; i++)
            {
                if (mapEditor.previousBackgroundTiles[i].x == x && mapEditor.previousBackgroundTiles[i].y == y && mapEditor.previousBackgroundTiles[i].ax == cx && mapEditor.previousBackgroundTiles[i].ay == cy)
                {
                    foundHistory = mapEditor.previousBackgroundTiles[i];
                    break;
                }
            }

            if (foundHistory)
            {
                MapEditor.SetBackgroundCell(foundHistory.x, foundHistory.y, foundHistory.tile, foundHistory.ax, foundHistory.ay);
            }
        }
        else
        {
            var area = world.GetArea(cx, cy, mapEditor.currentZone);
            var zone = world.GetZone(mapEditor.currentZone);
            for (var i = 0; i < zone.MapFragments.length; i++)
            {
                if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                {
                    var fragment = zone.MapFragments[i];
                    for (var j = 0; j < fragment.Modifications.length; j++)
                    {
                        if (fragment.Modifications[j].Action == "tile" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == x && fragment.Modifications[j].Y == y)
                        {
                            fragment.Modifications.splice(j, 1);
                            break;
                        }
                    }
                    area.ResetFragments();
                    break;
                }
            }
        }

    }

    static SmartTileAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (mouseButton == 2)
        {
            MapEditor.RollbackBackground(x, y, cx, cy);
        }
        else
        {

            var tiles = world.art.background.types[mapEditor.currentCellType];
            var toPlace = tiles[Math.floor(Math.random() * tiles.length)];
            MapEditor.SetBackgroundCell(x, y, toPlace, cx, cy);

            for (var a = -1; a < 2; a++)
            {
                for (var b = -1; b < 2; b++)
                {
                    if (a == 0 && b == 0)
                        continue;
                    var t = world.GetGenerator("Base").ChangeTransition(x + a, y + b, cx, cy, mapEditor.currentZone);
                    if (t != null)
                        MapEditor.SetBackgroundCell(x + a, y + b, t, cx, cy);
                }
            }
        }
    }

    static MonsterAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (!firstEvent)
            return;
        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        mapEditor.currentMonster = null;

        if (mouseButton == 2)
        {
            var objs = area.HitMonster(px, py, mapEditor.currentZone);
            if (mapEditor.currentFragment == "Root")
            {
                for (var j = 0; j < area.storedMonsters.length;)
                {
                    if (area.storedMonsters[j] == objs[objs.length - 1])
                    {
                        area.storedMonsters.splice(j, 1);
                        break;
                    }
                    else
                        j++;
                }
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        for (var j = 0; j < fragment.Modifications.length; j++)
                        {
                            if (fragment.Modifications[j].Action == "monster" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == objs[objs.length - 1].X && fragment.Modifications[j].Y == objs[objs.length - 1].Y)
                            {
                                fragment.Modifications.splice(j, 1);
                                break;
                            }
                        }
                        area.ResetFragments();
                        break;
                    }
                }
            }
        }
        else
        {
            var objs = area.HitMonster(px, py, mapEditor.currentZone);
            var objs = area.HitMonster(px, py, mapEditor.currentZone);
            if (objs && objs.length > 0)
            {
                mapEditor.currentMonster = objs[objs.length - 1];
            }
            else
            {
                if (mapEditor.currentFragment == "Root")
                {
                    var monster = Monster.Create(world.GetMonster(mapEditor.currentObject), area, px, py);
                    if (!area.storedMonsters)
                        area.storedMonsters = [];
                    mapEditor.currentMonster = { Name: mapEditor.currentObject, X: px, Y: py };
                    area.storedMonsters.push(mapEditor.currentMonster);
                }
                else
                {
                    var zone = world.GetZone(mapEditor.currentZone);
                    for (var i = 0; i < zone.MapFragments.length; i++)
                    {
                        if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                        {
                            var fragment = zone.MapFragments[i];
                            fragment.Modifications.push({ Action: "monster", AX: cx, AY: cy, X: px, Y: py, Value: { Name: mapEditor.currentObject, RespawnTime: 0 } });
                            mapEditor.currentMonster = <any>fragment.Modifications[fragment.Modifications.length - 1];
                            area.ResetFragments();
                            break;
                        }
                    }
                }
            }

            var html = "";
            html += "<table>";
            html += "<tr><td>Respawn Time (in min., empty means never, 0 means next area loading):</td>";
            html += "<td><input type='text' id='monsterRespawn' value='" + (mapEditor.currentMonster['Value'] ? mapEditor.currentMonster['Value'].RespawnTime + "" : (mapEditor.currentMonster.RespawnTime ? "" + mapEditor.currentMonster.RespawnTime : "")).htmlEntities() + "' onkeyup='MapEditor.ChangeMonsterRespawn()'></td></tr>";
            html += "</table>";
            $("#mapEditorActions").html(html);
        }
        area.edited = true;
        area.RecoverActors();
        area.CleanObjectCache();
    }

    static ChangeMonsterRespawn()
    {
        var textVal = $("#monsterRespawn").val();
        if (!textVal || textVal.trim() == "")
        {
            if (mapEditor.currentMonster['Value'])
                mapEditor.currentMonster['Value'].RespawnTime = null;
            else
                mapEditor.currentMonster.RespawnTime = null;
            return;
        }
        var val = parseInt(textVal);
        if (!isNaN(val))
        {
            if (mapEditor.currentMonster['Value'])
                mapEditor.currentMonster['Value'].RespawnTime = val;
            else
                mapEditor.currentMonster.RespawnTime = val;
        }
    }

    static NPCAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (!firstEvent)
            return;
        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        if (mouseButton == 2)
        {
            var npcs = area.HitNpc(px, py, mapEditor.currentZone);
            if (npcs && npcs.length > 0)
            {
                if (mapEditor.currentFragment == "Root")
                {
                    for (var i = 0; i < area.storedNPC.length; i++)
                    {
                        if (area.storedNPC[i] == npcs[npcs.length - 1])
                        {
                            area.storedNPC.splice(i, 1);
                            area.OnlyDefinedActors();
                            break;
                        }
                    }
                }
                else
                {
                    var zone = world.GetZone(mapEditor.currentZone);
                    for (var i = 0; i < zone.MapFragments.length; i++)
                    {
                        if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                        {
                            var fragment = zone.MapFragments[i];
                            for (var j = 0; j < fragment.Modifications.length; j++)
                            {
                                if (fragment.Modifications[j].Action == "npc" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == npcs[npcs.length - 1].X && fragment.Modifications[j].Y == npcs[npcs.length - 1].Y)
                                {
                                    fragment.Modifications.splice(j, 1);
                                    area.ResetFragments();
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        else
        {
            if (mapEditor.currentFragment == "Root")
            {
                var npc = NPCActor.Create(world.GetNPC(mapEditor.currentObject), area, px, py);
                area.storedNPC.push({ Name: mapEditor.currentObject, X: px, Y: py });
                area.actors.push(npc);
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        fragment.Modifications.push({ Action: "npc", AX: cx, AY: cy, X: px, Y: py, Value: mapEditor.currentObject });
                        area.ResetFragments();
                        break;
                    }
                }
            }
        }
        area.edited = true;
        area.CleanObjectCache();
    }

    static HouseRender(ctx: CanvasRenderingContext2D)
    {
        if (!mapEditor.renderRectrangle)
            return;
        var sx = mapEditor.renderRectrangle.X - (mapEditor.currentPosition.X + mapEditor.currentPosition.CurrentArea.X * world.areaWidth * world.art.background.width) + Math.round(mapEditor.renderer.width / 2);
        var sy = mapEditor.renderRectrangle.Y - (mapEditor.currentPosition.Y + mapEditor.currentPosition.CurrentArea.Y * world.areaHeight * world.art.background.height) + Math.round(mapEditor.renderer.height / 2);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 0.5, sy + 0.5, mapEditor.renderRectrangle.Width, mapEditor.renderRectrangle.Height);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, mapEditor.renderRectrangle.Width, mapEditor.renderRectrangle.Height);
    }

    static HouseMouseHover(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        var obj_info = WorldHouse.HouseSize(mapEditor.currentObject);
        if (!obj_info)
        {
            mapEditor.renderRectrangle = null;
            mapEditor.modified = true;
            return;
        }
        /*var newCoords = MapEditor.SnapObject(px, py, cx, cy, ox, oy);
        px = newCoords.X;
        py = newCoords.Y;*/

        mapEditor.renderRectrangle = { X: Math.floor(px + cx * world.areaWidth * world.art.background.width + obj_info.X), Y: Math.floor(py + cy * world.areaHeight * world.art.background.height + obj_info.Y), Width: obj_info.Width, Height: obj_info.Height };
        mapEditor.modified = true;
    }

    static HouseAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (!firstEvent)
            return;
        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;

        var px = x * world.art.background.width + ox;
        var py = y * world.art.background.height + oy;

        if (mouseButton == 2)
        {
            var objs = area.HitHouse(px, py, mapEditor.currentZone);
            if (mapEditor.currentFragment == "Root")
            {
                for (var j = 0; j < area.houses.length;)
                {
                    if (area.houses[j] == objs[objs.length - 1])
                    {
                        area.houses.splice(j, 1);
                        break;
                    }
                    else
                        j++;
                }
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        for (var j = 0; j < fragment.Modifications.length; j++)
                        {
                            if (fragment.Modifications[j].Action == "house" && fragment.Modifications[j].AX == cx && fragment.Modifications[j].AY == cy && fragment.Modifications[j].X == objs[objs.length - 1].X && fragment.Modifications[j].Y == objs[objs.length - 1].Y)
                            {
                                fragment.Modifications.splice(j, 1);
                                area.ResetFragments();
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        else
        {
            if (mapEditor.currentFragment == "Root")
            {
                var house = new WorldHouse(mapEditor.currentObject, px, py);
                area.houses.push(house);
            }
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        fragment.Modifications.push({ Action: "house", AX: cx, AY: cy, X: px, Y: py, Value: mapEditor.currentObject });
                        area.ResetFragments();
                        break;
                    }
                }
            }
        }
        area.edited = true;
        area.CleanObjectCache();
    }

    static MapActionAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (mapEditor.currentFragment != "Root")
        {
            Framework.ShowMessage("Can be handled currently only on the Root fragment.");
            return;
        }

        var area = world.GetArea(cx, cy, mapEditor.currentZone);
        if (!area)
            return;
        var mx = x * world.art.background.width + ox;
        var my = y * world.art.background.height + oy;
        var action = area.GetActions(mx, my, mapEditor.currentZone);
        if (!action)
        {
            action = new MapAction();
            action.X = mx;
            action.Y = my;
            action.Area = area;
            area.mapActions.push(action);
            area.edited = true;
        }

        mapEditor.currentMapAction = action;
        action.Display();
    }

    static PathAction(x: number, y: number, cx: number, cy: number, ox: number, oy: number, mouseButton: number, firstEvent: boolean)
    {
        if (mouseButton == 2)
        {
            MapEditor.RollbackBackground(x, y, cx, cy);
        }
        else
        {
            var tiles = world.art.background.paths[mapEditor.currentObject];
            if (!tiles)
                return;

            MapEditor.SetBackgroundCell(x, y, tiles[0], cx, cy);

            for (var a = -1; a < 2; a++)
            {
                for (var b = -1; b < 2; b++)
                {
                    MapEditor.ChangePath(tiles, x + a, y + b, cx, cy);
                }
            }
        }
    }

    static ChangePath(tiles: number[], x: number, y: number, cx: number, cy: number)
    {
        var isPath: boolean[][] = [];

        if (tiles.indexOf(MapEditor.GetBackgroundCell(x, y, cx, cy)) == -1)
            return;

        for (var a = -1; a < 2; a++)
        {
            isPath[a] = [];
            for (var b = -1; b < 2; b++)
            {
                var t = tiles.indexOf(MapEditor.GetBackgroundCell(x + a, y + b, cx, cy));
                isPath[a][b] = (t == -1 ? false : true);
            }
        }

        if (isPath[-1][0] && isPath[+1][0] && isPath[0][-1] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[0], cx, cy);
        else if (isPath[-1][0] && isPath[0][-1] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[10], cx, cy);
        else if (isPath[-1][0] && isPath[+1][0] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[9], cx, cy);
        else if (isPath[+1][0] && isPath[0][-1] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[8], cx, cy);
        else if (isPath[-1][0] && isPath[+1][0] && isPath[0][-1])
            MapEditor.SetBackgroundCell(x, y, tiles[7], cx, cy);
        else if (isPath[+1][0] && isPath[0][-1])
            MapEditor.SetBackgroundCell(x, y, tiles[6], cx, cy);
        else if (isPath[-1][0] && isPath[0][-1])
            MapEditor.SetBackgroundCell(x, y, tiles[5], cx, cy);
        else if (isPath[-1][0] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[4], cx, cy);
        else if (isPath[+1][0] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[3], cx, cy);
        else if (isPath[0][-1] && isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[2], cx, cy);
        else if (isPath[-1][0] && isPath[+1][0])
            MapEditor.SetBackgroundCell(x, y, tiles[1], cx, cy);
        else if (isPath[-1][0])
            MapEditor.SetBackgroundCell(x, y, tiles[11], cx, cy);
        else if (isPath[0][-1])
            MapEditor.SetBackgroundCell(x, y, tiles[12], cx, cy);
        else if (isPath[+1][0])
            MapEditor.SetBackgroundCell(x, y, tiles[13], cx, cy);
        else if (isPath[0][+1])
            MapEditor.SetBackgroundCell(x, y, tiles[14], cx, cy);
    }

    public static MouseUp(evt: MouseEvent): void
    {
        $("#gameCanvas").unbind("mouseup", MapEditor.MouseUp);
        //$("#gameCanvas").unbind("mousemove", MapEditor.MouseMove);
        mapEditor.mouseDown = false;
    }

    public static SetBackgroundCell(x, y, t, areaX, areaY): void
    {
        while (x < 0)
        {
            areaX--;
            x += world.areaWidth;
        }
        while (x >= world.areaWidth)
        {
            areaX++;
            x -= world.areaWidth;
        }
        while (y < 0)
        {
            areaY--;
            y += world.areaHeight;
        }
        while (y >= world.areaHeight)
        {
            areaY++;
            y -= world.areaHeight;
        }
        var area = world.GetArea(areaX, areaY, mapEditor.currentZone);
        if (!area)
            return;
        if (MapEditor.GetBackgroundCell(x, y, areaX, areaY) != t)
        {
            var inHistory = false;

            for (var i = 0; i < mapEditor.previousBackgroundTiles.length; i++)
            {
                if (mapEditor.previousBackgroundTiles[i].ax == areaX &&
                    mapEditor.previousBackgroundTiles[i].ay == areaY &&
                    mapEditor.previousBackgroundTiles[i].x == x &&
                    mapEditor.previousBackgroundTiles[i].y == y &&
                    mapEditor.previousBackgroundTiles[i].tile == t)
                {
                    inHistory = true;
                    break;
                }
            }

            area.edited = true;
            if (!inHistory)
                mapEditor.previousBackgroundTiles.push({ ax: areaX, ay: areaY, x: x, y: y, tile: area.backgroundTiles[x + y * world.areaWidth] });
            if (mapEditor.currentFragment == "Root")
                area.backgroundTiles[x + y * world.areaWidth] = t;
            else
            {
                var zone = world.GetZone(mapEditor.currentZone);
                for (var i = 0; i < zone.MapFragments.length; i++)
                {
                    if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                    {
                        var fragment = zone.MapFragments[i];
                        for (var j = 0; j < fragment.Modifications.length; j++)
                        {
                            if (fragment.Modifications[j].Action == "tile" && fragment.Modifications[j].AX == areaX && fragment.Modifications[j].AY == areaY && fragment.Modifications[j].X == x && fragment.Modifications[j].Y == y)
                            {
                                fragment.Modifications.splice(j, 1);
                                break;
                            }
                        }
                        fragment.Modifications.push({ Action: "tile", AX: areaX, AY: areaY, X: x, Y: y, Value: t });
                        area.ResetFragments();
                        break;
                    }
                }
            }
        }
    }

    public static GetBackgroundCell(x, y, areaX, areaY): number
    {
        while (x < 0)
        {
            areaX--;
            x += world.areaWidth;
        }
        while (x >= world.areaWidth)
        {
            areaX++;
            x -= world.areaWidth;
        }
        while (y < 0)
        {
            areaY--;
            y += world.areaHeight;
        }
        while (y >= world.areaHeight)
        {
            areaY++;
            y -= world.areaHeight;
        }
        var area = world.GetArea(areaX, areaY, mapEditor.currentZone);
        if (!area)
            return null;
        return area.backgroundTiles[x + y * world.areaWidth];
    }

    static ChangeZone()
    {
        var zone = world.GetZone($("#mapZone").val());
        if (!zone)
            return;
        mapEditor.currentZone = zone.Name;
        mapEditor.currentFragment = "Root";

        world.ResetGenerator();
        world.VisibleCenter(0, 0, zone.Name);
        //world.ResetAreas();
        mapEditor.currentPosition.Y = 0;
        mapEditor.currentPosition.CurrentArea = world.GetArea(0, 0, zone.Name);
        mapEditor.currentPosition.X = 0;
        mapEditor.currentPosition.Y = 0;
        mapEditor.renderer.offsetX = 0;
        mapEditor.renderer.offsetY = 0;
        mapEditor.renderer.areaX = 0;
        mapEditor.renderer.areaY = 0;

        mapEditor.renderer.oldOffsetX = 0;
        mapEditor.renderer.oldOffsetY = 0;

        $("#mapZone").blur();
        $("#gameCanvas").focus();
        setTimeout(() => { $("#currentPosition").focus(); }, 500);
        mapEditor.modified = true;
        $(window).focus();
    }

    static ShowFragments()
    {
        var html = "";

        var zone = world.GetZone(mapEditor.currentZone);
        html += "<span" + (mapEditor.currentFragment == "Root" ? " class='toolSelected'" : "") + " onclick='MapEditor.SelectFragment(\"Root\");'>Root</span>";
        if (zone.MapFragments) for (var i = 0; i < zone.MapFragments.length; i++)
        {
            html += "<span" + (mapEditor.currentFragment == zone.MapFragments[i].Name ? " class='toolSelected'" : "") + " onclick='MapEditor.SelectFragment(\"" + zone.MapFragments[i].Name + "\");'>" + zone.MapFragments[i].Name + "</span>";
        }

        html += "<span class='button' onclick='MapEditor.AddNewFragment();'>New Fragment</span>";

        $("#tilePreview").html(html);
    }

    static SelectFragment(name: string)
    {
        mapEditor.currentFragment = name;
        mapEditor.modified = true;
        world.ResetFragments();
        for (var i = 0; i < world.areas.length; i++)
            world.areas[i].RecoverActors();
        MapEditor.ShowFragments();

        if (name == "Root")
        {
            $("#mapEditorContainer").removeClass("mapWithSubPanel");
            $("#mapEditorActions").hide();
            mapEditor.renderer.Resize();
            mapEditor.renderer.showMapActions = false;
        }
        else
        {
            mapEditor.renderer.showMapActions = false;
            $("#mapEditorContainer").addClass("mapWithSubPanel");
            MapEditor.ShowFragmentCondition();
            mapEditor.renderer.Resize();
        }
    }

    static ShowFragmentCondition()
    {
        dialogCondition.currentEditor = "MapEditor";
        var html = "";

        var zone = world.GetZone(mapEditor.currentZone);
        var fragment: MapFragment = null;
        for (var i = 0; i < zone.MapFragments.length; i++)
        {
            if (zone.MapFragments[i].Name == mapEditor.currentFragment)
            {
                fragment = zone.MapFragments[i];
                break;
            }
        }

        html += "<b>Conditions:</b><br>";

        for (var j = 0; j < fragment.Conditions.length; j++)
        {
            var cond: DialogCondition = fragment.Conditions[j];
            html += "<span class='dialogBlock'>";
            html += "<div class='dialogBlockDelete' onclick='MapEditor.DeleteFragmentCondition(" + j + ")'>X</div>";
            html += "<b>" + cond.Name.title() + ":</b><br>";
            html += dialogCondition.code[cond.Name].Display(j, cond.Values, "UpdateFragmentCondition");
            html += "</span>";
        }

        html += "<select onchange='MapEditor.AddFragmentCondition()' id='addFragmentCondition'>";
        html += "<option>-- Select new condition --</option>";
        for (var item in dialogCondition.code)
            html += "<option value='" + item + "'>" + item.title() + "</option>";
        html += "</select>";
        html += "<br />";
        if (mapEditor.currentFragment != "Root")
            html += "<center><span class='button' onclick='MapEditor.DeleteFragment()'>Delete Fragment</span></center>";
        $("#mapEditorActions").show().html(html);
    }

    static DeleteFragment()
    {
        if (mapEditor.currentFragment == "Root")
            return;
        Framework.Confirm("Are you sure you want to delete this fragment?", () =>
        {
            var zone = world.GetZone(mapEditor.currentZone);
            for (var i = 0; i < zone.MapFragments.length; i++)
            {
                if (zone.MapFragments[i].Name == mapEditor.currentFragment)
                {
                    zone.MapFragments.splice(i, 1);
                    MapEditor.SelectFragment("Root");
                    return;
                }
            }
        });
    }

    static UpdateFragmentCondition(id: number, position: number)
    {
        var zone = world.GetZone(mapEditor.currentZone);
        var fragment: MapFragment = null;
        for (var i = 0; i < zone.MapFragments.length; i++)
        {
            if (zone.MapFragments[i].Name == mapEditor.currentFragment)
            {
                fragment = zone.MapFragments[i];
                break;
            }
        }

        fragment.Conditions[id].Values[position] = $("#UpdateFragmentCondition_" + id + "_" + position).val();
    }

    static AddFragmentCondition()
    {
        var zone = world.GetZone(mapEditor.currentZone);
        var fragment: MapFragment = null;
        for (var i = 0; i < zone.MapFragments.length; i++)
        {
            if (zone.MapFragments[i].Name == mapEditor.currentFragment)
            {
                fragment = zone.MapFragments[i];
                break;
            }
        }

        fragment.Conditions.push({
            Name: $("#addFragmentCondition").val(), Values: []
        });

        MapEditor.ShowFragmentCondition();
    }

    static DeleteFragmentCondition(id: number)
    {
        var zone = world.GetZone(mapEditor.currentZone);
        var fragment: MapFragment = null;
        for (var i = 0; i < zone.MapFragments.length; i++)
        {
            if (zone.MapFragments[i].Name == mapEditor.currentFragment)
            {
                fragment = zone.MapFragments[i];
                break;
            }
        }
        fragment.Conditions.splice(id, 1);
        MapEditor.ShowFragmentCondition();
    }

    static AddNewFragment()
    {
        var zone = world.GetZone(mapEditor.currentZone);
        if (!zone.MapFragments)
            zone.MapFragments = [];
        var next_layer = 1;
        while (true)
        {
            var found = false;
            for (var i = 0; i < zone.MapFragments.length; i++)
            {
                if (zone.MapFragments[i].Name == "fragment_" + next_layer)
                {
                    found = true;
                    break;
                }
            }
            if (!found)
                break;
            next_layer++;
        }

        Framework.Prompt("New fragment name", "fragment_" + next_layer, (newValue: string) =>
        {
            var found = false;
            for (var i = 0; i < zone.MapFragments.length; i++)
            {
                if (zone.MapFragments[i].Name == newValue)
                {
                    found = true;
                    break;
                }
            }

            if (newValue.match(databaseNameRule) || !newValue || newValue.length < 1 || found) 
            {
                MapEditor.AddNewFragment();
                return;
            }

            zone.MapFragments.push({ Name: newValue, Conditions: [], Modifications: [] });
            MapEditor.SelectFragment(newValue);
        });
    }

    static MapEditorCanRunFragment(fragment: MapFragment): boolean
    {
        return (fragment.Name == mapEditor.currentFragment);
    }
}