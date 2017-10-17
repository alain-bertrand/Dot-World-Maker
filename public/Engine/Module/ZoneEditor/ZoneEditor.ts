class ZoneEditor
{
    public static Dispose()
    {
        if (zoneEditor.selector)
            zoneEditor.selector.Dispose();
        zoneEditor.selector = null;
        zoneEditor.selectedZone = null;

        world.ResetGenerator();
        world.ResetAreas();

        zoneEditor.tempWorld = null;
        if (zoneEditor.worldPreview)
            zoneEditor.worldPreview.Dispose();
        zoneEditor.worldPreview = null;
        if (zoneEditor.renderInterval)
            clearInterval(zoneEditor.renderInterval);
        zoneEditor.renderInterval = null;
        if (zoneEditor.rebuildRender)
            clearTimeout(zoneEditor.rebuildRender);
        zoneEditor.rebuildRender = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || ("" + document.location).indexOf("/demo_zone_editor.html") != -1 || Main.CheckNW());
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
            $("#zoneList").css("top", "5px");
            $("#zoneParameters").css("top", "5px");
        }

        zoneEditor.selector = new ListSelector("zoneList", world.Zones, "Name");
        zoneEditor.selector.OnSelect = (rowId) =>
        {
            Framework.SetLocation({
                action: "ZoneEditor", id: rowId === null ? null : world.Zones[rowId].Name
            });
            if (rowId === null)
                zoneEditor.selectedZone = world.Zones[0];
            else
                zoneEditor.selectedZone = world.Zones[rowId];
            ZoneEditor.Render();
            ZoneEditor.MakeZonePreview();
        };
        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Zones.length; i++)
            {
                if (world.Zones[i].Name == framework.CurrentUrl.id)
                {
                    zoneEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "ZoneEditor"
                });
                zoneEditor.selector.Select(null);
                return;
            }
        }
        else
            zoneEditor.selector.Select(0);

        if (("" + document.location).indexOf("/demo_zone_editor.html") !== -1)
        {
            $(".elementCommands").hide();
            $("#zoneList").css("top", "5px");
            $("#zoneParameters").css("top", "5px");
        }
    }

    public static MakeZonePreview()
    {
        if (zoneEditor.rebuildRender)
            clearTimeout(zoneEditor.rebuildRender);
        zoneEditor.rebuildRender = setTimeout(ZoneEditor.DoMakeZonePreview, 500);
    }

    public static DoMakeZonePreview()
    {
        zoneEditor.rebuildRender = null;

        if (!zoneEditor.tempWorld)
        {
            zoneEditor.tempWorld = new World();
            zoneEditor.tempWorld.Id = -1;
            zoneEditor.tempWorld.art = world.art;
            zoneEditor.tempWorld.Init();
            zoneEditor.tempWorld.art = world.art;
        }

        zoneEditor.tempWorld.Zones = [JSON.parse(JSON.stringify(zoneEditor.selectedZone))];
        zoneEditor.tempWorld.Zones[0].Name = "Base";
        zoneEditor.tempWorld.ResetGenerator();
        zoneEditor.tempWorld.ResetAreas();

        if (!zoneEditor.worldPreview)
        {
            zoneEditor.worldPreview = new WorldRender(zoneEditor.tempWorld, "zonePreviewMap", 2);
            zoneEditor.renderInterval = setInterval(ZoneEditor.RenderMap, 100);
        }
    }

    static RenderMap()
    {
        zoneEditor.worldPreview.Render();
    }

    static Render()
    {
        if (!zoneEditor.selectedZone)
        {
            $("#zoneParameters").html("");
            return;
        }

        var html = "<h1>Zone " + zoneEditor.selectedZone.Name + "</h1>";
        html += "<table>";
        if (zoneEditor.selectedZone.Name == "Base")
            html += "<tr><td>Name:</td><td>" + zoneEditor.selectedZone.Name.htmlEntities() + "</td></tr>";
        else
            html += "<tr><td>Name:</td><td><input type='text' id='zoneName' value='" + zoneEditor.selectedZone.Name.htmlEntities() + "' onkeyup='ZoneEditor.ChangeValue(\"zoneName\",\"Name\")'></td></tr>";

        if (!zoneEditor.selectedZone.MapEffect)
            zoneEditor.selectedZone.MapEffect = "None";
        html += "<tr><td>Effect:</td><td><select onchange='ZoneEditor.ChangeValue(\"mapEffect\",\"MapEffect\")' id='mapEffect'>";
        for (var i = 0; i < knownEffects.length; i++)
        {
            html += "<option value='" + knownEffects[i] + "'" + (knownEffects[i] == zoneEditor.selectedZone.MapEffect ? " selected" : "") + ">" + knownEffects[i] + "</option>";
        }
        html += "</select></td></tr>";

        html += "<tr><td>Music:</td><td><select onchange='ZoneEditor.ChangeValue(\"mapMusic\",\"MapMusic\")' id='mapMusic'>";
        var musics: string[] = [];
        for (item in world.art.sounds)
            musics.push(item);
        html += "<option value=''" + (!zoneEditor.selectedZone.MapMusic || zoneEditor.selectedZone.MapMusic == "" ? " selected" : "") + ">- No music-</option>";
        for (var i = 0; i < musics.length; i++)
        {
            html += "<option value='" + musics[i] + "'" + (musics[i] == zoneEditor.selectedZone.MapMusic ? " selected" : "") + ">" + musics[i] + "</option>";
        }
        html += "</select></td></tr>";


        html += "<tr><td>Generator:</td><td><select onchange='ZoneEditor.ChangeValue(\"zoneGenerator\",\"Generator\")' id='zoneGenerator'>";
        for (var i = 0; i < knownGenerators.length; i++)
            html += "<option value='" + knownGenerators[i] + "'" + (knownGenerators[i] == zoneEditor.selectedZone.Generator ? " selected" : "") + ">" + knownGenerators[i] + "</option>";
        html += "</select></td></tr>";


        html += "<tr><td>Base Tile:</td><td><select onchange='ZoneEditor.ChangeValue(\"zoneBase\",\"BaseTileType\")' id='zoneBase'>";
        for (var item in world.art.background.types)
        {
            html += "<option value='" + item + "'" + (item == zoneEditor.selectedZone.BaseTileType ? " selected" : "") + ">" + item + "</option>";
        }
        html += "</select></td></tr>";


        html += window[zoneEditor.selectedZone.Generator + "Generator"]["DisplayParameters"](zoneEditor.selectedZone.GeneratorParameters);

        html += "</table>";

        html += "<h2>Objects on map:</h2>";
        if (zoneEditor.selectedZone.Objects)
        {
            html += "<table>";
            for (var i = 0; i < zoneEditor.selectedZone.Objects.length; i++)
            {
                if (i != 0)
                    html += "<tr><td colspan=2><hr></td><tr>";
                html += "<tr><td>Name:</td><td>" + zoneEditor.selectedZone.Objects[i].Name + "<span class='button' onclick='ZoneEditor.RemoveObject(" + i + ")'>Remove</span></td></tr>";
                html += "<tr><td>Frequency (%):</td><td><input type='text' id='obj_" + i + "_freq' onkeyup='ZoneEditor.ChangeObjectValue(" + i + ",\"frequency\")' value='" + (zoneEditor.selectedZone.Objects[i].Frequency) + "'>";
                html += "<tr><td>Place on:</td><td><select id='obj_" + i + "_place' onchange='ZoneEditor.ChangeObjectValue(" + i + ",\"place\")' multiple size='4'>";
                var names: string[] = [];
                for (var item in world.art.background.types)
                    names.push(item);
                names.sort();
                for (var j = 0; j < names.length; j++)
                {
                    html += "<option " + (zoneEditor.selectedZone.Objects[i].PlaceOn.indexOf(names[j]) != -1 ? " selected" : "") + ">" + names[j] + "</option>";
                }
                html += "</select></td></tr>";
                //value = '" + zoneEditor.selectedZone.Objects[i].PlaceOn.join(", ").htmlEntities() + "' > ";
            }
            html += "</table>";
        }
        html += "<select onchange='ZoneEditor.AddObject()' id='addObject'>";
        html += "<option value=''>-- Add an object --</option>";
        for (var item in world.art.objects)
        {
            html += "<option value='" + item + "'>" + item + "</option>";
        }
        html += "</select>";

        html += "<h2>Monsters on map:</h2>";
        if (zoneEditor.selectedZone.Monsters)
        {
            html += "<table>";
            for (var i = 0; i < zoneEditor.selectedZone.Monsters.length; i++)
            {
                if (i != 0)
                    html += "<tr><td colspan=2><hr></td><tr>";
                html += "<tr><td>Name:</td><td>" + zoneEditor.selectedZone.Monsters[i].Name + "<span class='button' onclick='ZoneEditor.RemoveMonster(" + i + ")'>Remove</span></td></tr>";
                html += "<tr><td>Frequency (%):</td><td><input type='text' id='monster_" + i + "_freq' onkeyup='ZoneEditor.ChangeMonsterValue(" + i + ",\"frequency\")' value='" + (zoneEditor.selectedZone.Monsters[i].Frequency) + "'>";
                html += "<tr><td>Place on:</td><td><select id='monster_" + i + "_place' onchange='ZoneEditor.ChangeMonsterValue(" + i + ",\"place\")' multiple size='4'>";// value='" + zoneEditor.selectedZone.Monsters[i].PlaceOn.join(", ").htmlEntities() + "'>";
                var names: string[] = [];
                for (var item in world.art.background.types)
                    names.push(item);
                names.sort();
                for (var j = 0; j < names.length; j++)
                {
                    html += "<option " + (zoneEditor.selectedZone.Monsters[i].PlaceOn.indexOf(names[j]) != -1 ? " selected" : "") + ">" + names[j] + "</option>";
                }
                html += "</select></td></tr>";
            }
            html += "</table>";
        }
        html += "<select onchange='ZoneEditor.AddMonster()' id='addMonster'>";
        html += "<option value=''>-- Add a monster --</option>";
        for (var i = 0; i < world.Monsters.length; i++)
        {
            if (world.Monsters[i].Name == "DefaultMonster")
                continue;
            html += "<option value='" + i + "'>" + world.Monsters[i].Name + "</option>";
        }
        html += "</select>";
        $("#zoneParameters").html(html);
    }

    static ChangeValue(htmlField: string, dataField: string)
    {
        if (dataField == "Name")
        {
            var newName = $("#" + htmlField).val();

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetZone(newName) && world.GetZone(newName) != zoneEditor.selectedZone))
            {
                $("#" + htmlField).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#" + htmlField).css('backgroundColor', '');

            zoneEditor.selectedZone[dataField] = $("#" + htmlField).val();

            $("#zoneParameters > h1").html("Zone " + zoneEditor.selectedZone.Name);
            zoneEditor.selector.UpdateList();
            SearchPanel.Update();
        }
        else if (dataField == "Generator")
        {
            zoneEditor.selectedZone[dataField] = $("#" + htmlField).val();
            zoneEditor.selectedZone.GeneratorParameters = window[$("#" + htmlField).val() + "Generator"]["DefaultParameters"]();
            ZoneEditor.Render();

            world.ResetGenerator();
            world.ResetAreas();
        }
        else
            zoneEditor.selectedZone[dataField] = $("#" + htmlField).val();
        ZoneEditor.MakeZonePreview();
    }

    static AddMonster()
    {
        var item = parseInt($("#addMonster").val());
        if (!zoneEditor.selectedZone.Monsters)
            zoneEditor.selectedZone.Monsters = [];
        zoneEditor.selectedZone.Monsters.push({ Name: world.Monsters[item].Name, Frequency: 0.01, PlaceOn: [world.art.background.mainType] });
        ZoneEditor.Render();
        $("#addObject").val('');
    }

    static ChangeMonsterValue(objId: number, field: string)
    {
        switch (field)
        {
            case "frequency":
                var num = parseFloat($("#monster_" + objId + "_freq").val());
                if (!isNaN(num))
                    zoneEditor.selectedZone.Monsters[objId].Frequency = num / 1;
                break;
            case "place":
                /*var types = $("#monster_" + objId + "_place").val().split(',');
                for (var i = 0; i < types.length; i++)
                    types[i] = types[i].trim();*/
                var types: string[] = <any>$("#monster_" + objId + "_place").val();
                zoneEditor.selectedZone.Monsters[objId].PlaceOn = types;
                break;
            default:
                break;
        }
        ZoneEditor.MakeZonePreview();
    }

    static RemoveMonster(objId: number)
    {
        zoneEditor.selectedZone.Monsters.splice(objId, 1);
        ZoneEditor.Render();
        ZoneEditor.MakeZonePreview();
    }

    static AddObject()
    {
        var item = $("#addObject").val();
        if (!zoneEditor.selectedZone.Objects)
            zoneEditor.selectedZone.Objects = [];
        zoneEditor.selectedZone.Objects.push({ Name: item, Frequency: 0.01, PlaceOn: [world.art.background.mainType] });
        ZoneEditor.Render();
        $("#addObject").val('');
    }

    static ChangeObjectValue(objId: number, field: string)
    {
        switch (field)
        {
            case "frequency":
                var num = parseFloat($("#obj_" + objId + "_freq").val());
                if (!isNaN(num))
                    zoneEditor.selectedZone.Objects[objId].Frequency = num / 1;
                break;
            case "place":
                /*var types = $("#obj_" + objId + "_place").val().split(',');
                for (var i = 0; i < types.length; i++)
                    types[i] = types[i].trim();*/
                var types: string[] = <any>$("#obj_" + objId + "_place").val();
                zoneEditor.selectedZone.Objects[objId].PlaceOn = types;
                break;
            default:
                break;
        }
        ZoneEditor.MakeZonePreview();
    }

    static RemoveObject(objId: number)
    {
        zoneEditor.selectedZone.Objects.splice(objId, 1);
        ZoneEditor.Render();
        ZoneEditor.MakeZonePreview();
    }

    static Delete()
    {
        if (zoneEditor.selectedZone.Name == "Base")
        {
            Framework.Alert("Cannot delete the 'Base' zone.");
            return;
        }

        Framework.Confirm("Are you sure you want to delete this zone? This removes also the edited map of this zone.", () =>
        {
            for (var i = 0; i < world.Zones.length; i++)
            {
                if (world.Zones[i] == zoneEditor.selectedZone)
                {
                    $.ajax({
                        type: 'POST',
                        url: '/backend/RemoveZoneMap',
                        data: {
                            game: world.Id,
                            token: framework.Preferences['token'],
                            zone: zoneEditor.selectedZone.Name
                        },
                        success: (msg) =>
                        {
                        },
                        error: function (msg, textStatus)
                        {
                        }
                    });

                    world.Zones.splice(i, 1);
                    break;
                }
            }

            zoneEditor.selector.UpdateList();
            zoneEditor.selector.Select(0);
            SearchPanel.Update();
        });
    }

    static Add()
    {
        if (world.Zones.length >= 5 && world.Edition == EditorEdition.Demo)
        {
            Framework.Alert("The demo editor doesn't allows more than 5 zones. Upgrade to the standard edition if you need more.");
            return;
        }

        var nextId = world.Zones.length;
        while (world.GetZone("zone_" + nextId))
            nextId++;

        var zone = new WorldZone();
        zone.Name = "zone_" + nextId;
        zone.MapEffect = "None";
        zone.BaseTileType = FirstItem(world.art.background.types);
        zone.Generator = "Perlin";
        zone.GeneratorParameters = PerlinGenerator.DefaultParameters();
        world.Zones.push(zone);
        zoneEditor.selector.UpdateList();
        zoneEditor.selector.Select(world.Zones.length - 1);
        SearchPanel.Update();
    }

    static Clone()
    {
        if (world.Zones.length >= 5 && world.Edition == EditorEdition.Demo)
        {
            Framework.Alert("The demo editor doesn't allows more than 5 zones. Upgrade to the standard edition if you need more.");
            return;
        }

        var nextId = world.Zones.length;
        while (world.GetZone("zone_" + nextId))
            nextId++;

        var zone = JSON.parse(JSON.stringify(zoneEditor.selectedZone));
        zone.Name = "zone_" + nextId;
        world.Zones.push(zone);
        zoneEditor.selector.UpdateList();
        zoneEditor.selector.Select(world.Zones.length - 1);
        SearchPanel.Update();
    }

    static DeleteStoredMap()
    {
        Framework.Confirm("Are you sure you want to delete all your manual modifications on the map? This operation cannot be un-done!", () =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/RemoveZoneMap',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    zone: zoneEditor.selectedZone.Name
                },
                success: (msg) =>
                {
                    world.ResetAreas();
                    Framework.Alert("Done.");
                },
                error: function (msg, textStatus)
                {
                }
            });
        });
    }
}