/// <reference path="../../Logic/World/WorldRender.ts" />

var houseEditor = new (class
{
    listHouses: ListSelector;
    listParts: ListSelector;

    currentHouseName: string;
    currentHouse: TilesetHouseDetails;
    housePartImages: ImageCache = {};
    partSelected: TilesetHousePartDetails[];
    mouseOffset: Point;

    sticky: boolean = true;
    glueDistance: number = 5;

    keys: boolean[] = [];

    multiSelection: Rectangle = null;
    collisionSelection: Rectangle = null;
});

class HouseEditor
{
    public static Dispose()
    {
        houseEditor.listHouses.Dispose();
        houseEditor.listHouses = null;
        houseEditor.listParts.Dispose();
        houseEditor.listParts = null;

        houseEditor.housePartImages = null;

        $(window).unbind("resize", HouseEditor.Resize);

        $(window).unbind("keydown", HouseEditor.KeyDown);
        $(window).unbind("keyup", HouseEditor.KeyUp);
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#listHouses").css("top", "5px");
            $("#houseDetailsContainer").css("top", "5px");
        }

        houseEditor.keys = [];
        houseEditor.partSelected = null;
        houseEditor.multiSelection = null;
        houseEditor.housePartImages = {};

        houseEditor.listHouses = new ListSelector("listHouses", world.Houses);
        houseEditor.listHouses.OnSelect = (houseName) =>
        {
            Framework.SetLocation({
                action: "HouseEditor", id: houseName
            });
            if (!houseName)
            {
                $("#houseTitle").html("");
                houseEditor.currentHouse = houseEditor.currentHouseName = null;
                $("#houseName").css('backgroundColor', '').val("").prop("disabled", true);
                $("#houseCollisionX").val("").prop("disabled", true);
                $("#houseCollisionY").val("").prop("disabled", true);
                $("#houseCollisionWidth").val("").prop("disabled", true);
                $("#houseCollisionHeight").val("").prop("disabled", true);
            }
            else
            {
                $("#houseTitle").html("Details " + houseName);
                houseEditor.currentHouseName = houseName;
                houseEditor.currentHouse = world.Houses[houseEditor.currentHouseName];
                $("#houseName").css('backgroundColor', '').val(houseEditor.currentHouseName).prop("disabled", false);
                $("#houseCollisionX").val("" + houseEditor.currentHouse.collisionX).prop("disabled", false);
                $("#houseCollisionY").val("" + houseEditor.currentHouse.collisionY).prop("disabled", false);
                $("#houseCollisionWidth").val("" + houseEditor.currentHouse.collisionWidth).prop("disabled", false);
                $("#houseCollisionHeight").val("" + houseEditor.currentHouse.collisionHeight).prop("disabled", false);
            }
        };

        var firstHouse = null;
        for (var item in world.Houses)
        {
            firstHouse = item;
            break;
        }

        houseEditor.listParts = new ListSelector("houseParts", world.art.house_parts);
        houseEditor.listParts.OnSelect = (partName) =>
        {
            if (!partName)
                return;
            houseEditor.listParts.Select(null);
            if (!houseEditor.currentHouse)
                return;
            houseEditor.currentHouse.parts.push({ part: partName, x: 0, y: 0 });
            houseEditor.partSelected = [houseEditor.currentHouse[houseEditor.currentHouse.parts.length - 1]];
        };
        if (framework.CurrentUrl.id)
        {
            if (!world.GetHouse(framework.CurrentUrl.id))
            {
                Framework.SetLocation({
                    action: "HouseEditor"
                });
                houseEditor.listHouses.Select(null);
            }
            else
                houseEditor.listHouses.Select(framework.CurrentUrl.id);
        }
        else if (firstHouse)
            houseEditor.listHouses.Select(firstHouse);
        else
            houseEditor.listHouses.Select(null);

        $(window).bind("resize", HouseEditor.Resize);
        HouseEditor.Resize();
        HouseEditor.Draw();

        $("#houseEditor").bind("mousedown", HouseEditor.MouseDown);

        $(window).bind("keydown", HouseEditor.KeyDown);
        $(window).bind("keyup", HouseEditor.KeyUp);

        if (framework.Preferences['houseSticky'] === false)
        {
            houseEditor.sticky = false;
            $("#stickyButton").removeClass("selectedButton");
        }
    }

    static ChangeName()
    {
        var newName = $("#houseName").val().trim();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.Houses[newName] && world.Houses[newName] != world.Houses[houseEditor.currentHouseName]))
        {
            $("#houseName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#houseName").css('backgroundColor', '');

        if (newName == "" || newName == houseEditor.currentHouseName || world.Houses[newName])
            return;
        var oldName = houseEditor.currentHouseName;
        delete world.Houses[houseEditor.currentHouseName];
        world.Houses[newName] = houseEditor.currentHouse;
        houseEditor.currentHouseName = newName;

        //houseEditor.listHouses.UpdateList();
        HouseEditor.UpdateHouseList();
        SearchPanel.Update();

        for (var i = 0; i < world.Zones.length; i++)
        {
            var zone = world.Zones[i];

            for (var j = 0; j < zone.MapFragments.length; j++)
            {
                var fragment = zone.MapFragments[i].Modifications;
                for (var k = 0; k < fragment.length; k++)
                    if (fragment[k].Action == "house" && fragment[k].Value == oldName)
                        fragment[k].Value = newName;
            }
        }

        MapUtilities.Modify("house", oldName, newName);
    }

    static UpdateHouseList()
    {
        houseEditor.listHouses.UpdateList();
        houseEditor.listHouses.Select(houseEditor.currentHouseName);
    }

    static ChangeCollisionX()
    {
        houseEditor.currentHouse.collisionX = parseInt($("#houseCollisionX").val());
    }

    static ChangeCollisionY()
    {
        houseEditor.currentHouse.collisionY = parseInt($("#houseCollisionY").val());
    }

    static ChangeCollisionWidth()
    {
        houseEditor.currentHouse.collisionWidth = parseInt($("#houseCollisionWidth").val());
    }

    static ChangeCollisionHeight()
    {
        houseEditor.currentHouse.collisionHeight = parseInt($("#houseCollisionHeight").val());
    }

    static CollisionSelection()
    {
        houseEditor.collisionSelection = { X: 0, Y: 0, Width: 1, Height: 1 };
    }

    public static MouseDown(evt: MouseEvent)
    {
        if (!houseEditor.currentHouse)
            return;

        var x = evt.pageX - $("#houseEditor").position().left + $("#houseEditorContainer").first().scrollLeft;
        var y = evt.pageY - $("#houseEditor").position().top + $("#houseEditorContainer").first().scrollTop;

        if (houseEditor.collisionSelection != null)
        {
            houseEditor.mouseOffset = { X: x, Y: y };
            houseEditor.collisionSelection = { X: x, Y: y, Width: 1, Height: 1 };

            HouseEditor.HandleCollisionSelection(evt);
        }
        else
        {
            var newSelection: TilesetHousePartDetails[] = null;
            for (var i = 0; i < houseEditor.currentHouse.parts.length; i++)
            {
                var item = houseEditor.currentHouse.parts[i];
                var partInfo = world.art.house_parts[item.part];

                if (x >= item.x && x <= item.x + partInfo.width && y >= item.y && y <= item.y + partInfo.height)
                {
                    newSelection = [item];
                    houseEditor.mouseOffset = { X: x - item.x, Y: y - item.y };
                }
            }
            if (newSelection && houseEditor.partSelected && houseEditor.partSelected.indexOf(newSelection[0]) != -1)
                houseEditor.mouseOffset = { X: x - houseEditor.partSelected[0].x, Y: y - houseEditor.partSelected[0].y };
            else
                houseEditor.partSelected = newSelection;

            if (!houseEditor.partSelected)
            {
                houseEditor.multiSelection = { X: x, Y: y, Width: 1, Height: 1 };
                houseEditor.mouseOffset = { X: x, Y: y };
            }
        }
        $("#houseEditorMouseOverlay").bind("mouseup", HouseEditor.MouseUp).bind("mousemove", HouseEditor.MouseMove).show();
    }

    public static MouseUp(evt: MouseEvent)
    {
        houseEditor.multiSelection = null;
        houseEditor.collisionSelection = null;
        $("#houseEditorMouseOverlay").unbind("mousemove", HouseEditor.MouseMove).unbind("mouseup", HouseEditor.MouseUp).hide();
    }

    public static MouseMove(evt: MouseEvent)
    {
        if (!houseEditor.currentHouse)
            return;

        if (houseEditor.collisionSelection)
            HouseEditor.HandleCollisionSelection(evt);
        else if (houseEditor.partSelected && houseEditor.partSelected.length > 0 && !houseEditor.multiSelection)
            HouseEditor.MoveItems(evt);
        else
            HouseEditor.HandleMultiSelect(evt);
    }

    static HandleCollisionSelection(evt: MouseEvent)
    {
        if (!houseEditor.currentHouse)
            return;

        var x = evt.pageX - $("#houseEditor").position().left + $("#houseEditorContainer").first().scrollLeft;
        var y = evt.pageY - $("#houseEditor").position().top + $("#houseEditorContainer").first().scrollTop;

        houseEditor.currentHouse.collisionWidth = houseEditor.collisionSelection.Width = Math.abs(x - houseEditor.mouseOffset.X);
        houseEditor.currentHouse.collisionHeight = houseEditor.collisionSelection.Height = Math.abs(y - houseEditor.mouseOffset.Y);
        houseEditor.currentHouse.collisionX = houseEditor.collisionSelection.X = Math.min(houseEditor.mouseOffset.X, x);
        houseEditor.currentHouse.collisionY = houseEditor.collisionSelection.Y = Math.min(houseEditor.mouseOffset.Y, y);

        $("#houseCollisionX").val("" + houseEditor.currentHouse.collisionX);
        $("#houseCollisionY").val("" + houseEditor.currentHouse.collisionY);
        $("#houseCollisionWidth").val("" + houseEditor.currentHouse.collisionWidth);
        $("#houseCollisionHeight").val("" + houseEditor.currentHouse.collisionHeight);
    }

    static HandleMultiSelect(evt: MouseEvent)
    {
        if (!houseEditor.currentHouse)
            return;

        var x = evt.pageX - $("#houseEditor").position().left + $("#houseEditorContainer").first().scrollLeft;
        var y = evt.pageY - $("#houseEditor").position().top + $("#houseEditorContainer").first().scrollTop;

        houseEditor.multiSelection.Width = Math.abs(x - houseEditor.mouseOffset.X);
        houseEditor.multiSelection.Height = Math.abs(y - houseEditor.mouseOffset.Y);
        houseEditor.multiSelection.X = Math.min(houseEditor.mouseOffset.X, x);
        houseEditor.multiSelection.Y = Math.min(houseEditor.mouseOffset.Y, y);

        var a = houseEditor.multiSelection.X;
        var b = houseEditor.multiSelection.Y;
        var c = houseEditor.multiSelection.X + houseEditor.multiSelection.Width;
        var d = houseEditor.multiSelection.Y + houseEditor.multiSelection.Height;

        houseEditor.partSelected = [];
        for (var i = 0; i < houseEditor.currentHouse.parts.length; i++)
        {
            var item = houseEditor.currentHouse.parts[i];
            var partInfo = world.art.house_parts[item.part];

            if (!(item.x + partInfo.width < a || item.x > c || item.y + partInfo.height < b || item.y > d))
                houseEditor.partSelected.push(item);
        }
        if (houseEditor.partSelected.length == 0)
            houseEditor.partSelected = null;
    }

    static MoveItems(evt: MouseEvent)
    {
        var partInfo = world.art.house_parts[houseEditor.partSelected[0].part];

        var x = evt.pageX - $("#houseEditor").position().left + $("#houseEditorContainer").first().scrollLeft - houseEditor.mouseOffset.X;
        var y = evt.pageY - $("#houseEditor").position().top + $("#houseEditorContainer").first().scrollTop - houseEditor.mouseOffset.Y;
        /*var x = (evt.pageX - $("#houseEditor").position().left) - houseEditor.mouseOffset.X;
        var y = (evt.pageY - $("#houseEditor").position().top) - houseEditor.mouseOffset.Y;*/

        if (houseEditor.sticky)
        {
            // Search others to glue
            var gluedX = false;
            var gluedY = false;
            for (var i = 0; i < houseEditor.currentHouse.parts.length && !(gluedX && gluedY); i++)
            {
                var other = houseEditor.currentHouse.parts[i];
                // Don't glue on myself
                if (houseEditor.partSelected.indexOf(other) != -1)
                    continue;
                var otherInfo = world.art.house_parts[other.part];

                var a = Math.abs(other.x - x);
                var b = Math.abs(other.y - y);

                var c = Math.abs((other.x + otherInfo.width) - x);
                var d = Math.abs((other.y + otherInfo.height) - y);

                var e = Math.abs(other.x - (x + partInfo.width));
                var f = Math.abs(other.y - (y + partInfo.height));

                var g = Math.abs((other.x + otherInfo.width) - (x + partInfo.width));
                var h = Math.abs((other.y + otherInfo.height) - (y + partInfo.height));

                if (a <= houseEditor.glueDistance && gluedX == false)
                {
                    x = other.x;
                    gluedX = true;
                }
                if (b <= houseEditor.glueDistance && gluedY == false)
                {
                    y = other.y;
                    gluedY = true;
                }

                if (c <= houseEditor.glueDistance && gluedX == false)
                {
                    x = other.x + otherInfo.width;
                    gluedX = true;
                }
                if (d <= houseEditor.glueDistance && gluedY == false)
                {
                    y = other.y + otherInfo.height;
                    gluedY = true;
                }

                if (e <= houseEditor.glueDistance && gluedX == false)
                {
                    x = other.x - partInfo.width;
                    gluedX = true;
                }
                if (f <= houseEditor.glueDistance && gluedY == false)
                {
                    y = other.y - partInfo.height;
                    gluedY = true;
                }

                if (g <= houseEditor.glueDistance && gluedX == false)
                {
                    x = other.x + otherInfo.width - partInfo.width;
                    gluedX = true;
                }
                if (h <= houseEditor.glueDistance && gluedY == false)
                {
                    y = other.y + otherInfo.height - partInfo.height;
                    gluedY = true;
                }
            }
        }

        x = Math.max(0, Math.min(x, 500 - partInfo.width));
        y = Math.max(0, Math.min(y, 500 - partInfo.height));

        var dx = x - houseEditor.partSelected[0].x;
        var dy = y - houseEditor.partSelected[0].y;

        for (var i = 0; i < houseEditor.partSelected.length; i++)
        {
            houseEditor.partSelected[i].x += dx;
            houseEditor.partSelected[i].y += dy;
        }
    }

    public static Draw()
    {
        if (!houseEditor.housePartImages)
            return;

        if (window['mozRequestAnimationFrame'])
            window['mozRequestAnimationFrame'](HouseEditor.Draw);
        else if (window['requestAnimationFrame'])
            window['requestAnimationFrame'](HouseEditor.Draw);
        else
            setTimeout(HouseEditor.Draw, 16);

        var ctx = (<HTMLCanvasElement>$("#houseEditor").first()).getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 500, 500);

        if (!houseEditor.currentHouse)
            return;

        for (var i = 0; i < houseEditor.currentHouse.parts.length; i++)
        {
            var item = houseEditor.currentHouse.parts[i];
            var part = HouseEditor.GetPart(item.part);
            if (!part)
                continue;
            var partInfo = world.art.house_parts[item.part];
            ctx.drawImage(part, partInfo.x, partInfo.y, partInfo.width, partInfo.height, item.x, item.y, partInfo.width, partInfo.height);
        }

        // Highlight selected parts
        if (houseEditor.partSelected && houseEditor.partSelected.length) for (var i = 0; i < houseEditor.currentHouse.parts.length; i++)
        {
            var item = houseEditor.currentHouse.parts[i];
            if (houseEditor.partSelected.indexOf(item) != -1)
            {
                var partInfo = world.art.house_parts[item.part];
                ctx.strokeStyle = "#8080FF";
                ctx.strokeRect(item.x + 0.5, item.y + 0.5, partInfo.width, partInfo.height);
            }
        }

        if (houseEditor.multiSelection)
        {
            ctx.strokeStyle = "#8080FF";
            ctx.strokeRect(houseEditor.multiSelection.X + 0.5, houseEditor.multiSelection.Y + 0.5, houseEditor.multiSelection.Width, houseEditor.multiSelection.Height);
        }

        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(houseEditor.currentHouse.collisionX + 0.5, houseEditor.currentHouse.collisionY + 0.5, houseEditor.currentHouse.collisionWidth, houseEditor.currentHouse.collisionHeight);
    }

    static GetPart(name: string): HTMLImageElement
    {
        if (!world.art.house_parts[name])
            return null;
        var file = world.art.house_parts[name].file;
        if (!houseEditor.housePartImages[file])
        {
            houseEditor.housePartImages[file] = new Image();
            houseEditor.housePartImages[file].src = file;
        }
        return houseEditor.housePartImages[file];
    }

    static Resize()
    {
        var w = $("#houseEditorContainer").width();
        var h = $("#houseEditorContainer").height();
    }

    static SwitchSticky()
    {
        if (houseEditor.sticky)
            $("#stickyButton").removeClass("selectedButton");
        else
            $("#stickyButton").addClass("selectedButton");

        houseEditor.sticky = !houseEditor.sticky;
        framework.Preferences['houseSticky'] = houseEditor.sticky;
        Framework.SavePreferences();
    }

    static DeleteSelected()
    {
        if (!houseEditor.partSelected)
            return;
        for (var i = 0; i < houseEditor.currentHouse.parts.length;)
        {
            if (houseEditor.partSelected.indexOf(houseEditor.currentHouse.parts[i]) != -1)
                houseEditor.currentHouse.parts.splice(i, 1);
            else
                i++;
        }
    }

    static ToFront()
    {
        if (!houseEditor.partSelected)
            return;
        HouseEditor.DeleteSelected();
        for (var i = 0; i < houseEditor.partSelected.length; i++)
            houseEditor.currentHouse.parts.push(houseEditor.partSelected[i]);
    }

    static ToBack()
    {
        if (!houseEditor.partSelected)
            return;
        HouseEditor.DeleteSelected();
        for (var i = 0; i < houseEditor.partSelected.length; i++)
            houseEditor.currentHouse.parts.unshift(houseEditor.partSelected[i]);
    }

    public static KeyDown(evt: KeyboardEvent)
    {
        houseEditor.keys[evt.keyCode] = true;
        //console.log(evt.keyCode);
        HouseEditor.HandleKeys();
    }

    public static KeyUp(evt: KeyboardEvent)
    {
        houseEditor.keys[evt.keyCode] = false;
    }

    static HandleKeys()
    {
        // Up key
        if (houseEditor.keys[38] === true || houseEditor.keys[87] === true)
        {
            if (houseEditor.partSelected) for (var i = 0; i < houseEditor.partSelected.length; i++)
                houseEditor.partSelected[i].y -= (houseEditor.keys[16] ? 5 : 1);
        }
        // Left key
        if (houseEditor.keys[37] === true || houseEditor.keys[65] === true)
        {
            if (houseEditor.partSelected) for (var i = 0; i < houseEditor.partSelected.length; i++)
                houseEditor.partSelected[i].x -= (houseEditor.keys[16] ? 5 : 1);
        }
        // Right key
        if (houseEditor.keys[39] === true || houseEditor.keys[68] === true)
        {
            if (houseEditor.partSelected) for (var i = 0; i < houseEditor.partSelected.length; i++)
                houseEditor.partSelected[i].x += (houseEditor.keys[16] ? 5 : 1);
        }
        // Down key
        if (houseEditor.keys[40] === true || houseEditor.keys[83] === true)
        {
            if (houseEditor.partSelected) for (var i = 0; i < houseEditor.partSelected.length; i++)
                houseEditor.partSelected[i].y += (houseEditor.keys[16] ? 5 : 1);
        }
    }

    static NewHouse()
    {
        var nextId = 1;
        while (world.Houses["house_" + nextId])
            nextId++;

        world.Houses["house_" + nextId] = {
            collisionX: 0,
            collisionY: 0,
            collisionWidth: 0,
            collisionHeight: 0,
            parts: []
        };
        houseEditor.currentHouse = world.Houses["house_" + nextId];
        houseEditor.currentHouseName = "house_" + nextId;
        houseEditor.partSelected = [];

        HouseEditor.UpdateHouseList();
        SearchPanel.Update();
    }

    static DeleteHouse()
    {
        Framework.Confirm("Are you sure you want to delete this house?", () =>
        {
            var oldName = houseEditor.currentHouseName;
            delete world.Houses[houseEditor.currentHouseName];
            houseEditor.listHouses.Select(null);
            HouseEditor.UpdateHouseList();
            SearchPanel.Update();

            for (var i = 0; i < world.Zones.length; i++)
            {
                var zone = world.Zones[i];

                for (var j = 0; j < zone.MapFragments.length; j++)
                {
                    var fragment = zone.MapFragments[i].Modifications;
                    for (var k = 0; k < fragment.length;)
                    {
                        if (fragment[k].Action == "house" && fragment[k].Value == oldName)
                            fragment.splice(k, 1);
                        else
                            k++;
                    }
                }
            }

            MapUtilities.Modify("house", oldName, null);
        });
    }

    static CloneHouse()
    {
        var nextId = 1;
        while (world.Houses["house_" + nextId])
            nextId++;

        world.Houses["house_" + nextId] = JSON.parse(JSON.stringify(world.Houses[houseEditor.currentHouseName]));
        houseEditor.currentHouse = world.Houses["house_" + nextId];
        houseEditor.currentHouseName = "house_" + nextId;
        houseEditor.partSelected = [];

        HouseEditor.UpdateHouseList();
        SearchPanel.Update();
    }

}