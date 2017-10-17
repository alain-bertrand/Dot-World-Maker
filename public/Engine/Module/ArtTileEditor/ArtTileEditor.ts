var artTileEditor = new (class
{
    backgroundTiles: HTMLImageElement;
    loaded: boolean = false;
    loadTimeout: number;
    listOfTypes: ListSelector;
    listOfTransitions: ListSelector;
    selectedType: string;
    transitionId: number;
    transitionTilePosition: number;
    transitionTileSelected: number;

    listOfPaths: ListSelector;
    selectedPath: string;
});

interface PixelColor
{
    R: number;
    G: number;
    B: number;
    A: number;
}

class ArtTileEditor
{
    public static Dispose()
    {
        artTileEditor.backgroundTiles = null;
        artTileEditor.loaded = false;
        if (artTileEditor.loadTimeout)
            clearTimeout(artTileEditor.loadTimeout);
        artTileEditor.loadTimeout = null;
        if (artTileEditor.listOfTypes)
            artTileEditor.listOfTypes.Dispose();
        artTileEditor.listOfTypes = null;
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
            $("#buttonUpload").html("Change");
            $("#tilesPropertiesTitle").css("top", "5px");
            $("#tilesProperties").css("top", "20px");
            $("#listCurrentTiles").css("top", "20px");
        }

        if (!artTileEditor.backgroundTiles)
        {
            artTileEditor.listOfTypes = new ListSelector("listTypes", world.art.background.types);
            artTileEditor.listOfTypes.OnSelect = ArtTileEditor.SelectTileType;

            var transitions = [];
            for (var i = 0; i < world.art.background.transitions.length; i++)
                transitions.push({ name: world.art.background.transitions[i].from + " to " + world.art.background.transitions[i].to, position: i });
            artTileEditor.listOfTransitions = new ListSelector("listTransitions", transitions, "name");
            artTileEditor.listOfTransitions.OnSelect = ArtTileEditor.SelectTransition;

            $("#width").val("" + world.art.background.width);
            $("#height").val("" + world.art.background.height);

            ArtTileEditor.UpdateMainTypeSelector();

            artTileEditor.backgroundTiles = new Image();
            artTileEditor.backgroundTiles.src = world.art.background.file;
            artTileEditor.backgroundTiles.onload = ArtTileEditor.LoadFinished;
            artTileEditor.loaded = false;

            artTileEditor.listOfPaths = new ListSelector("listPaths", world.art.background.paths);
            artTileEditor.listOfPaths.OnSelect = ArtTileEditor.SelectPath;
        }

        if (artTileEditor.loaded)
        {
            $("#tileEditorLoading").hide();
            ArtTileEditor.ListCurrentTiles();
        }
        else
            artTileEditor.loadTimeout = setTimeout(ArtTileEditor.Recover, 100);
    }

    static UpdateMainTypeSelector()
    {
        var options = "";
        var types: string[] = [];
        for (var item in world.art.background.types)
            types.push(item);
        types.sort();
        for (var i = 0; i < types.length; i++)
            options += "<option value='" + types[i].htmlEntities() + "'>" + types[i] + "</option>";
        $("#mainType").find("option").remove().end().append(options).val(world.art.background.mainType);
    }

    static ListCurrentTiles()
    {
        var html = "";
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            var x = i % world.art.background.nbColumns;
            if (x == 0 && i != 0)
                html += "<br>";
            var y = Math.floor(i / world.art.background.nbColumns);
            html += "<div>" + ArtTileEditor.GenerateThumb(x, y) + "</div>";
        }
        $("#listCurrentTiles").html(html);
    }

    static SelectTileType(tileType: string)
    {
        if (!tileType)
            return;
        artTileEditor.selectedType = tileType;
        $("#tileTypeName").val(tileType);

        var html = "";
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            var x = i % world.art.background.nbColumns;
            if (x == 0 && i != 0)
                html += "<br>";
            var y = Math.floor(i / world.art.background.nbColumns);
            html += "<div id='tile_" + i + "' onclick='ArtTileEditor.ToggleInType(" + i + ");'";
            if (world.art.background.types[tileType].contains(i))
                html += "class='tileInTypeSelected'";
            html += ">" + ArtTileEditor.GenerateThumb(x, y) + "</div>";
        }
        $("#listTileInType").html(html);

        $("#tileInType").show();
    }

    static ToggleInType(tileId: number)
    {
        $("#tile_" + tileId).toggleClass("tileInTypeSelected");
        if (world.art.background.types[artTileEditor.selectedType].contains(tileId))
            world.art.background.types[artTileEditor.selectedType].splice(world.art.background.types[artTileEditor.selectedType].indexOf(tileId), 1);
        else
            world.art.background.types[artTileEditor.selectedType].push(tileId);
    }

    static RenameTileType()
    {
        var newName = $("#tileTypeName").val();

        if ((newName.match(/[^a-z_0-9]/gi) || !newName || newName.length < 1) || (world.art.background.types[newName] && world.art.background.types[newName] != world.art.background.types[artTileEditor.selectedType]))
        {
            $("#tileTypeName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#tileTypeName").css('backgroundColor', '');


        if (newName == artTileEditor.selectedType)
            return;
        if (newName.trim() == "" || world.art.background.types[newName])
            return;

        var oldName = artTileEditor.selectedType;
        var tileType = world.art.background.types[artTileEditor.selectedType];
        delete world.art.background.types[artTileEditor.selectedType];
        world.art.background.types[newName] = tileType;

        // Is the main type renamed?
        if (artTileEditor.selectedType == world.art.background.mainType)
            world.art.background.mainType = newName;
        ArtTileEditor.UpdateMainTypeSelector();

        // Is any of the transition type renamed?
        for (var i = 0; i < world.art.background.transitions.length; i++)
        {
            if (world.art.background.transitions[i].from == artTileEditor.selectedType)
                world.art.background.transitions[i].from = newName;
            if (world.art.background.transitions[i].to == artTileEditor.selectedType)
                world.art.background.transitions[i].to = newName;
        }
        ArtTileEditor.UpdateListTransitions();

        artTileEditor.selectedType = newName;
        artTileEditor.listOfTypes.UpdateList();

        // Change all zones
        for (var i = 0; i < world.Zones.length; i++)
        {
            if (world.Zones[i].BaseTileType == oldName)
                world.Zones[i].BaseTileType = newName;
            var gen = <WorldGenerator>new window[world.Zones[i].Generator + "Generator"](world, "Game_" + world.Id, world.Zones[i]);
            gen.RenameTileType(oldName, newName);

            for (var j = 0;j < world.Zones[i].Monsters.length; j++)
                for (var k = 0; k < world.Zones[i].Monsters[j].PlaceOn.length; k++)
                    if (world.Zones[i].Monsters[j].PlaceOn[k] == oldName)
                        world.Zones[i].Monsters[j].PlaceOn[k] = newName;

            for (var j = 0; j < world.Zones[i].Objects.length; j++)
                for (var k = 0; k < world.Zones[i].Objects[j].PlaceOn.length; k++)
                    if (world.Zones[i].Objects[j].PlaceOn[k] == oldName)
                        world.Zones[i].Objects[j].PlaceOn[k] = newName;
        }
    }

    static CreateType()
    {
        var newName = "type_";
        for (var i = 1; ; i++)
        {
            if (!world.art.background.types["type_" + i])
            {
                newName = "type_" + i;
                break;
            }
        }
        world.art.background.types[newName] = [];

        ArtTileEditor.UpdateMainTypeSelector();
        artTileEditor.listOfTypes.UpdateList();

        artTileEditor.listOfTypes.Select(newName);
    }

    static DeleteType()
    {
        Framework.Confirm("Are you sure you want to delete this type of tiles? This will delete all the transitions using it.", () =>
        {
            var nb = 0;
            for (var item in world.art.background.types)
                nb++;
            if (nb < 2)
            {
                Framework.Alert("Cannot remove the last type.");
                return;
            }
            var oldName = artTileEditor.selectedType;

            delete world.art.background.types[artTileEditor.selectedType];
            artTileEditor.listOfTypes.UpdateList();
            ArtTileEditor.CloseTileInType();

            for (var i = 0; i < world.art.background.transitions.length;)
            {
                if (world.art.background.transitions[i].from == artTileEditor.selectedType || world.art.background.transitions[i].to == artTileEditor.selectedType)
                    world.art.background.transitions.splice(i, 1);
                else
                    i++;
            }

            if (world.art.background.mainType == artTileEditor.selectedType)
                world.art.background.mainType = FirstItem(world.art.background.types);

            ArtTileEditor.UpdateMainTypeSelector();
            ArtTileEditor.UpdateListTransitions();

            // Change all zones
            for (var i = 0; i < world.Zones.length; i++)
            {
                if (world.Zones[i].BaseTileType == oldName)
                    world.Zones[i].BaseTileType = world.art.background.mainType;
                var gen = <WorldGenerator>new window[world.Zones[i].Generator + "Generator"](world, "Game_" + world.Id, world.Zones[i]);
                gen.RenameTileType(oldName, world.art.background.mainType);

                for (var j = 0; j < world.Zones[i].Monsters.length; j++)
                    for (var k = 0; k < world.Zones[i].Monsters[j].PlaceOn.length; )
                        if (world.Zones[i].Monsters[j].PlaceOn[k] == oldName)
                            world.Zones[i].Monsters[j].PlaceOn[k] = world.art.background.mainType;

                for (var j = 0; j < world.Zones[i].Monsters.length; j++)
                    for (var k = 0; k < world.Zones[i].Objects[j].PlaceOn.length;)
                        if (world.Zones[i].Objects[j].PlaceOn[k] == oldName)
                            world.Zones[i].Objects[j].PlaceOn[k] = world.art.background.mainType;
            }
        });
    }

    static ShowWalkable()
    {
        var html = "";
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            var x = i % world.art.background.nbColumns;
            if (x == 0 && i != 0)
                html += "<br>";
            var y = Math.floor(i / world.art.background.nbColumns);
            html += "<div id='tile_" + i + "' onclick='ArtTileEditor.ToggleWalkable(" + i + ");'";
            if (world.art.background.nonWalkable.contains(i))
                html += "class='nonWalkable'";
            html += ">" + ArtTileEditor.GenerateThumb(x, y) + "</div>";
        }
        $("#listTileWalkable").html(html);

        $("#tileWalkable").show();
    }

    static ToggleWalkable(tileId: number)
    {
        $("#tile_" + tileId).toggleClass("nonWalkable");
        if (world.art.background.nonWalkable.contains(tileId))
            world.art.background.nonWalkable.splice(world.art.background.nonWalkable.indexOf(tileId), 1);
        else
            world.art.background.nonWalkable.push(tileId);
    }

    static CloseWalkable()
    {
        $("#tileWalkable").hide();
    }

    static CloseTileInType()
    {
        artTileEditor.listOfTypes.Select(null);
        $("#tileInType").hide();
    }

    static LoadFinished()
    {
        artTileEditor.loaded = true;
    }

    static ProposeTypes()
    {
        var html = "";

        html += "<div class='button' onclick='ArtTileEditor.ShowUpload()'>Upload</div><br>";

        var img = ArtTileEditor.ResizeTo(1);
        var tileId = 0;
        for (var y = 0; y < img.height; y++)
        {
            for (var x = 0; x < img.width; x++)
            {
                var p = ArtTileEditor.GetPixelColor(x, y, img);
                if (p.A == 0)
                    continue;

                html += "Tile " + tileId + ": ";
                html += ArtTileEditor.GenerateThumb(x, y);
                //html += "" + p.R + "," + p.G + "," + p.B + " ~ " + (Math.round(((p.R - p.G) / p.R) * 100) / 100);
                //html += "<div style='width: 10px; height: 10px; display: inline-block; background-color: rgb(" + p.R + "," + p.G + "," + p.B + ")'></div>";
                var min = Math.min(p.R, p.G, p.B);
                if (p.R > 180 && Math.abs(p.R - p.G) / p.R < 0.05 && Math.abs(p.B - p.G) / p.R < 0.05)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?snow") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if (p.R > 150 && (p.R - p.G) / p.R > 0 && (p.R - p.G) / p.R < 0.2 && p.G > p.B && p.R >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?sand") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if ((p.R - p.G) / p.R > -0.05 && (p.R - p.G) / p.R < 0.05 && p.G > p.B && p.R >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?stone") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if ((p.R - p.G) / p.R > 0 && (p.R - p.G) / p.R < 0.2 && p.G > p.B && p.R >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?dirt") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if (p.G > 100 && p.G > p.R && p.G > p.B && p.G >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?grass") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if (p.G > p.R && p.G > p.B && p.G >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?dark grass") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                else if (p.B > p.R && p.B > p.G && p.B >= 1.2 * min)
                    html += " => Is it a " + ArtTileEditor.TileOptions(tileId, "?water") + " tile? " + ArtTileEditor.TileTypeYesNo(tileId);
                html += "<br>";
                tileId++;
            }
        }

        $("#tileProposeType").html(html);
    }

    static TileOptions(tileId: number, value: string): string
    {
        var options = ["", "?grass", "grass", "?dark grass", "dark grass", "?sand", "sand", "?dirt", "dirt", "?snow", "snow", "?stone", "stone", "?water", "water"];
        var result = "<select id='tile_type_" + tileId + "'>";
        for (var i = 0; i < options.length; i++)
        {
            result += "<option value='" + options[i] + "'" + (options[i] == value ? " selected" : "") + ">" + options[i] + "</option>";
        }
        result += "</select>";
        return result;
    }

    static TileTypeYesNo(tileId: number): string
    {
        return "<span class='button' onclick='$(\"#tile_type_" + tileId + "\").val($(\"#tile_type_" + tileId + "\").val().replace(\"?\",\"\"))'>Yes</span><span class='button' onclick='$(\"#tile_type_" + tileId + "\").val(\"\")'>No</span>";
    }

    public static GenerateThumb(x: number, y: number): string
    {
        var html = "<span style='";
        html += "display: inline-block;";
        html += "width: " + world.art.background.width + "px;";
        html += "height: " + world.art.background.height + "px;";
        html += "background-image: url(\"" + artTileEditor.backgroundTiles.src + "\");";
        html += "background-position: -" + Math.floor(x * world.art.background.width) + "px -" + Math.floor(y * world.art.background.height) + "px;";
        html += "'>&nbsp;</span>";
        return html;
    }

    static GetPixelColor(x: number, y: number, img: ImageData)
    {
        return {
            R: img.data[(x + y * img.width) * 4],
            G: img.data[(x + y * img.width) * 4 + 1],
            B: img.data[(x + y * img.width) * 4 + 2],
            A: img.data[(x + y * img.width) * 4 + 3]
        }
    }

    static ChangeArtProperty(fieldName: string, property: string)
    {
        var val: any = $("#" + fieldName).val();
        if (typeof world.art.background[property] == "number")
        {
            val = parseInt(val);
            if (isNaN(val))
                return;
        }
        world.art.background[property] = val;
        if (property == "width")
            world.art.background.nbColumns = Math.floor(artTileEditor.backgroundTiles.width / world.art.background.width);
        if (property == "height" || property == "width")
            world.art.background.lastTile = Math.floor(artTileEditor.backgroundTiles.height / world.art.background.height) * world.art.background.nbColumns;
    }

    static ResizeTo(nbPixel: number): ImageData
    {
        var w = Math.floor(artTileEditor.backgroundTiles.width / world.art.background.width);
        var h = Math.floor(artTileEditor.backgroundTiles.height / world.art.background.width);
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(artTileEditor.backgroundTiles, 0, 0, artTileEditor.backgroundTiles.width, artTileEditor.backgroundTiles.height, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h);
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtTileEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtTileEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtTileEditor.ImportFileImage).val("");
    }

    static CloseUpload()
    {
        $("#uploadArtObject").hide();
    }

    static Upload()
    {
        $("#uploadArtObject").hide();
        $("#artObjectUploadForm").submit();
    }

    static Result(result: string)
    {
        var data = JSON.parse(result);
        if (data.error)
        {
            Framework.Alert(data.error);
            return;
        }
        else if (data.new_file)
        {
            ArtTileEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        var baseName = world.art.background.file.split('?')[0];
        // Change background, we need to reset all the types, transitions, and world generators.
        if (baseName != filename)
        {
            world.art.background.types = { grass: [0] };
            world.art.background.mainType = "grass";
            world.art.background.transitions = [];
            world.art.background.nonWalkable = [];
            world.Zones = [new WorldZone()];
            world.Zones[0].Generator = "Constant";
            world.Zones[0].Name = "Base";
            world.Zones[0].GeneratorParameters = ConstantGenerator.DefaultParameters();
            world.Zones[0].BaseTileType = "grass";

            artTileEditor.listOfTypes.UpdateList(world.art.background.types);
            ArtTileEditor.UpdateListTransitions();
        }

        world.art.background.file = filename + "?v=" + Math.round((new Date()).getTime() / 1000);

        artTileEditor.backgroundTiles = new Image();
        artTileEditor.backgroundTiles.src = world.art.background.file;
        artTileEditor.backgroundTiles.onload = ArtTileEditor.LoadFinished;
        artTileEditor.loaded = false;

        ArtTileEditor.LoadUploaded();
    }

    static LoadUploaded()
    {
        if (artTileEditor.loaded)
        {
            world.art.background.nbColumns = Math.floor(artTileEditor.backgroundTiles.width / world.art.background.width);
            world.art.background.lastTile = Math.floor(artTileEditor.backgroundTiles.height / world.art.background.height) * world.art.background.nbColumns;
            ArtTileEditor.ListCurrentTiles();
        }
        //ArtTileEditor.ProposeTypes();
        else
            artTileEditor.loadTimeout = setTimeout(ArtTileEditor.LoadUploaded, 100);
    }

    static SelectTransition(transitionPosition: number)
    {
        if (transitionPosition < 0)
            return;
        artTileEditor.transitionId = transitionPosition;
        var transitionFrom = world.art.background.transitions[transitionPosition].from;
        var transitionTo = world.art.background.transitions[transitionPosition].to;
        if (artTileEditor.transitionId == -1)
            return;

        var options = "";
        for (var item in world.art.background.types)
            options += "<option value='" + item + "'>" + item + "</option>";
        $("#transitionFrom").find("option").remove().end().append(options);
        $("#transitionTo").find("option").remove().end().append(options);
        $("#transitionSize").val(world.art.background.transitions[transitionPosition].size == 4 ? "4" : "12");

        ArtTileEditor.UpdateTileTransitionProperties();

        var html = "";
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            var x = i % world.art.background.nbColumns;
            if (x == 0 && i != 0)
                html += "<br>";
            var y = Math.floor(i / world.art.background.nbColumns);
            html += "<div id='tile_" + i + "' onclick='ArtTileEditor.SelectTileListTransition(" + i + ");'>" + ArtTileEditor.GenerateThumb(x, y) + "</div>";
        }
        $("#listPossibleTransitionTiles").html(html);

        $("#transitionFrom").val(transitionFrom);
        $("#transitionTo").val(transitionTo);

        $("#tileTransition").show();

        artTileEditor.transitionTilePosition = null;
        artTileEditor.transitionTileSelected = null;
    }

    static UpdateTileTransitionProperties()
    {
        var html = "";
        var transition = world.art.background.transitions[artTileEditor.transitionId];
        html += "<tr>";
        for (var i = 0; i < (transition.size ? transition.size : 12); i++)
        {
            html += "<td><span style='width: " + world.art.background.width + "px;height: " + world.art.background.height + "px; display: inline-block; background-image: url(\"/images/masks.png\"); background-position: -" + ((i + (transition.size == 4 ? 8 : 0)) * world.art.background.width) + "px 0px;'>&nbsp;</span></td>";
        }
        html += "</tr>";
        html += "<tr>";
        for (var i = 0; i < (transition.size ? transition.size : 12); i++)
        {
            var tile = transition.transition[i];
            html += "<td onclick='ArtTileEditor.SelectTileTransition(" + i + ");' style='cursor: pointer;'>";
            if (tile === null || tile === undefined)
            {
                html += "<span class='width: " + world.art.background.width + "px;width: " + world.art.background.height + "px;display: inline-block;'></span>";
            }
            else
            {
                var x = tile % world.art.background.nbColumns;
                var y = Math.floor(tile / world.art.background.nbColumns);
                html += ArtTileEditor.GenerateThumb(x, y);
            }
            html += "</td>";
        }
        html += "</tr>";
        $("#transitionTiles").html(html);
    }

    static SelectTileTransition(position: number)
    {
        if (artTileEditor.transitionTileSelected == null)
        {
            artTileEditor.transitionTilePosition = position;
        }
        else
        {
            world.art.background.transitions[artTileEditor.transitionId].transition[position] = artTileEditor.transitionTileSelected;

            artTileEditor.transitionTilePosition = null;
            artTileEditor.transitionTileSelected = null;
            ArtTileEditor.UpdateTileTransitionProperties();
        }
    }

    static SelectTileListTransition(tileId: number)
    {
        if (artTileEditor.transitionTilePosition == null)
        {
            artTileEditor.transitionTileSelected = tileId;
        }
        else
        {
            world.art.background.transitions[artTileEditor.transitionId].transition[artTileEditor.transitionTilePosition] = tileId;

            artTileEditor.transitionTilePosition = null;
            artTileEditor.transitionTileSelected = null;
            ArtTileEditor.UpdateTileTransitionProperties();
        }
    }

    static ChangeTransition(which: string)
    {
        switch (which)
        {
            case "from":
                world.art.background.transitions[artTileEditor.transitionId].from = $("#transitionFrom").val();
                break;
            case "to":
                world.art.background.transitions[artTileEditor.transitionId].to = $("#transitionTo").val();
                break;
            case "size":
                world.art.background.transitions[artTileEditor.transitionId].size = parseInt($("#transitionSize").val());
                if (parseInt($("#transitionSize").val()) == 4)
                    world.art.background.transitions[artTileEditor.transitionId].transition = world.art.background.transitions[artTileEditor.transitionId].transition.slice(0, 4);
                else
                {
                    while (world.art.background.transitions[artTileEditor.transitionId].transition.length < 12)
                        world.art.background.transitions[artTileEditor.transitionId].transition.push(0);
                }
                ArtTileEditor.UpdateTileTransitionProperties();
                break;
            default:
                break;
        }
        ArtTileEditor.UpdateListTransitions();
    }

    static UpdateListTransitions()
    {
        var transitions = [];
        for (var i = 0; i < world.art.background.transitions.length; i++)
            transitions.push({ name: world.art.background.transitions[i].from + " to " + world.art.background.transitions[i].to, position: i });
        artTileEditor.listOfTransitions.UpdateList(transitions);
    }

    static CreateTransition()
    {
        var firstItem = null;
        for (var item in world.art.background.types)
        {
            firstItem = item;
            break;
        }
        if (firstItem === null)
            return;
        world.art.background.transitions.push({ from: firstItem, to: firstItem, size: 12, transition: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
        ArtTileEditor.UpdateListTransitions();

        ArtTileEditor.SelectTransition(world.art.background.transitions.length - 1);
    }

    static ReverseTransition()
    {
        var from = world.art.background.transitions[artTileEditor.transitionId].from;
        var to = world.art.background.transitions[artTileEditor.transitionId].to;

        world.art.background.transitions[artTileEditor.transitionId].from = to;
        world.art.background.transitions[artTileEditor.transitionId].to = from;

        var oldT = world.art.background.transitions[artTileEditor.transitionId].transition.slice();
        world.art.background.transitions[artTileEditor.transitionId].transition = [oldT[7], oldT[6], oldT[5], oldT[4], oldT[3], oldT[2], oldT[1], oldT[0], oldT[11], oldT[10], oldT[9], oldT[8]]

        ArtTileEditor.UpdateListTransitions();
        ArtTileEditor.UpdateTileTransitionProperties();
    }

    static CloseTransition()
    {
        artTileEditor.listOfTransitions.Select(-1);
        $("#tileTransition").hide();
    }

    static DeleteTransition()
    {
        Framework.Confirm("Are you sure you want to delete this transition?", () =>
        {
            world.art.background.transitions.splice(artTileEditor.transitionId, 1);
            ArtTileEditor.UpdateListTransitions();
            ArtTileEditor.CloseTransition();
        });
    }

    static SelectPath(name: string)
    {
        if (!name)
            return;

        artTileEditor.selectedPath = name;
        artTileEditor.listOfPaths.Select(null);
        ArtTileEditor.ShowPath();

        artTileEditor.transitionTilePosition = null;
        artTileEditor.transitionTileSelected = null;
    }

    static CreatePath()
    {
        var nextId = 1;
        while (world.art.background.paths["path_" + nextId])
            nextId++;
        world.art.background.paths["path_" + nextId] = [];
        for (var i = 0; i < 15; i++)
            world.art.background.paths["path_" + nextId].push(0);
        artTileEditor.listOfPaths.UpdateList();
        artTileEditor.listOfPaths.Select("path_" + nextId);
    }

    static ShowPath()
    {
        $("#tilePath").show();
        $("#pathName").val(artTileEditor.selectedPath);

        ArtTileEditor.ShowPathTiles();

        var html = "";
        for (var i = 0; i < world.art.background.lastTile; i++)
        {
            var x = i % world.art.background.nbColumns;
            if (x == 0 && i != 0)
                html += "<br>";
            var y = Math.floor(i / world.art.background.nbColumns);
            html += "<div id='tile_" + i + "' onclick='ArtTileEditor.SelectTilePathList(" + i + ");'>" + ArtTileEditor.GenerateThumb(x, y) + "</div>";
        }
        $("#listPossiblePathTiles").html(html);
    }

    static ShowPathTiles()
    {
        var html = "<tr>";
        for (var i = 0; i < 15; i++)
        {
            html += "<td><span style='width: " + world.art.background.width + "px;height: " + world.art.background.height + "px; display: inline-block; background-image: url(\"/images/path_mask.png\"); background-position: -" + (i * world.art.background.width) + "px 0px;'>&nbsp;</span></td>";
        }
        html += "</tr>";
        html += "<tr>";
        for (var i = 0; i < 15; i++)
        {
            var tile = world.art.background.paths[artTileEditor.selectedPath][i];
            html += "<td onclick='ArtTileEditor.SelectTilePath(" + i + ");' style='cursor: pointer;'>";
            if (tile === null || tile === undefined)
            {
                html += "<span class='width: " + world.art.background.width + "px;width: " + world.art.background.height + "px;display: inline-block;'></span>";
            }
            else
            {
                var x = tile % world.art.background.nbColumns;
                var y = Math.floor(tile / world.art.background.nbColumns);
                html += ArtTileEditor.GenerateThumb(x, y);
            }
            html += "</td>";
        }
        html += "</tr>";
        $("#pathTiles").html(html);
    }

    static ChangeMainType()
    {
        world.art.background.mainType = $("#mainType").val();
    }

    static ChangePathName()
    {
        var newName = $("#pathName").val();

        if ((newName.match(/[^a-z_0-9]/gi) || !newName || newName.length < 1) || (world.art.background.paths[newName] && world.art.background.paths[newName] != world.art.background.paths[artTileEditor.selectedPath]))
        {
            $("#pathName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#pathName").css('backgroundColor', '');

        var path = world.art.background.paths[artTileEditor.selectedPath];
        delete world.art.background.paths[artTileEditor.selectedPath];
        world.art.background.paths[newName] = path;
        artTileEditor.selectedPath = newName;
        artTileEditor.listOfPaths.UpdateList();
    }

    static DeletePath()
    {
        Framework.Confirm("Are you sure you want to delete this path?", () =>
        {
            delete world.art.background.paths[artTileEditor.selectedPath];
            artTileEditor.listOfPaths.UpdateList();
            ArtTileEditor.ClosePath();
        });

    }

    static ClosePath()
    {
        $("#tilePath").hide();
    }

    static SelectTilePath(position: number)
    {
        if (artTileEditor.transitionTileSelected == null)
        {
            artTileEditor.transitionTilePosition = position;
        }
        else
        {
            world.art.background.paths[artTileEditor.selectedPath][position] = artTileEditor.transitionTileSelected;

            artTileEditor.transitionTilePosition = null;
            artTileEditor.transitionTileSelected = null;
            ArtTileEditor.ShowPathTiles();
        }
    }

    static SelectTilePathList(tileId: number)
    {
        if (artTileEditor.transitionTilePosition == null)
        {
            artTileEditor.transitionTileSelected = tileId;
        }
        else
        {
            world.art.background.paths[artTileEditor.selectedPath][artTileEditor.transitionTilePosition] = tileId;

            artTileEditor.transitionTilePosition = null;
            artTileEditor.transitionTileSelected = null;
            ArtTileEditor.ShowPathTiles();
        }
    }

    static EditImage()
    {
        Framework.SetLocation({
            action: "PixelEditor", type: "tiles", file: world.art.background.file
        }, false);

    }
}