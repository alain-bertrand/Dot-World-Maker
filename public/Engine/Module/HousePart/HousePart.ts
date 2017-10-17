var housePart = new (class
{
    public listParts: ListSelector = null;
    public currentHousePart: string = null;
    public currentHousePartImage: HTMLImageElement = null;
    public refresher: number = null;
    public mouseOffset: Point;
});

class HousePart
{
    public static Dispose()
    {
        if (!housePart.refresher)
            clearInterval(housePart.refresher);
        housePart.refresher = null;
        if (!housePart.listParts)
            housePart.listParts.Dispose();
        housePart.listParts = null;
        $("#housePartEditor").unbind("mousedown", HousePart.MouseDown);
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
            $("#listHouseParts").css("top", "5px");
            $("#housePartContainer").css("top", "5px");
            $("#houseDetails").css("top", "0px");
            $("#housePartEditorContainer").css("top", "95px");
            $("#buttonUpload").html("Add");
        }

        housePart.listParts = new ListSelector("listHouseParts", world.art.house_parts);
        housePart.listParts.OnSelect = (partName) =>
        {
            Framework.SetLocation({ action: "HousePart", id: partName });
            housePart.currentHousePart = partName;
            if (!partName)
            {
                $("#housePartName").css('backgroundColor', '').prop("disabled", true).val("");
                $("#housePartX").prop("disabled", true).val("");
                $("#housePartY").prop("disabled", true).val("");
                $("#housePartWidth").prop("disabled", true).val("");
                $("#housePartHeight").prop("disabled", true).val("");
                return;
            }
            $("#housePartName").css('backgroundColor', '').prop("disabled", false).val(partName);
            $("#housePartX").prop("disabled", false).val("" + world.art.house_parts[partName].x);
            $("#housePartY").prop("disabled", false).val("" + world.art.house_parts[partName].y);
            $("#housePartWidth").prop("disabled", false).val("" + world.art.house_parts[partName].width);
            $("#housePartHeight").prop("disabled", false).val("" + world.art.house_parts[partName].height);

            if (housePart.currentHousePartImage && housePart.currentHousePartImage.src != world.art.house_parts[partName].file)
                housePart.currentHousePartImage = null;
        };
        housePart.refresher = setInterval(HousePart.UpdateDisplay, 100);
        $("#housePartEditor").bind("mousedown", HousePart.MouseDown);
        if (framework.CurrentUrl.id)
        {
            if (!world.art.house_parts[framework.CurrentUrl.id])
            {
                Framework.SetLocation({
                    action: "HousePart"
                });
                housePart.listParts.Select(null);
            }
            else
                housePart.listParts.Select(framework.CurrentUrl.id);
        }
        else
            housePart.listParts.Select(null);
    }

    static ChangeValue(propName: string, fieldName: string)
    {
        if (!housePart.currentHousePart)
            return;
        var part = world.art.house_parts[housePart.currentHousePart];
        var val = parseInt($("#" + fieldName).val());
        if (!isNaN(val))
            part[propName] = val;
    }

    static UpdateDisplay()
    {
        var canvas = <HTMLCanvasElement>$("#housePartEditor").first();
        if (!canvas)
            return;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!housePart.currentHousePart)
            return;

        var part = world.art.house_parts[housePart.currentHousePart];
        if (!housePart.currentHousePartImage)
        {
            housePart.currentHousePartImage = new Image();
            housePart.currentHousePartImage.src = part.file;
        }
        ctx.drawImage(housePart.currentHousePartImage, 0, 0);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(part.x + 0.5, part.y + 0.5, part.width, part.height);

        ctx.strokeStyle = "#E00000";
        ctx.lineWidth = 1;
        ctx.strokeRect(part.x + 0.5, part.y + 0.5, part.width, part.height);
    }

    static MouseDown(evt: MouseEvent)
    {
        if (!housePart.currentHousePart)
            return;

        var x = evt.pageX - $("#housePartEditor").position().left + $("#housePartEditorContainer").first().scrollLeft;
        var y = evt.pageY - $("#housePartEditor").position().top + $("#housePartEditorContainer").first().scrollTop;

        housePart.mouseOffset = { X: x, Y: y };

        $("#houseEditorMouseOverlay").bind("mouseup", HousePart.MouseUp).bind("mousemove", HousePart.MouseMove).show();
    }

    static MouseUp(evt: MouseEvent)
    {
        $("#houseEditorMouseOverlay").unbind("mousemove", HousePart.MouseMove).unbind("mouseup", HousePart.MouseUp).hide();
    }

    static MouseMove(evt: MouseEvent)
    {
        if (!housePart.currentHousePart)
            return;

        var x = evt.pageX - $("#housePartEditor").position().left + $("#housePartEditorContainer").first().scrollLeft;
        var y = evt.pageY - $("#housePartEditor").position().top + $("#housePartEditorContainer").first().scrollTop;

        var part = world.art.house_parts[housePart.currentHousePart];

        part.width = Math.abs(x - housePart.mouseOffset.X);
        part.height = Math.abs(y - housePart.mouseOffset.Y);
        part.x = Math.min(housePart.mouseOffset.X, x);
        part.y = Math.min(housePart.mouseOffset.Y, y);

        $("#housePartX").val("" + part.x);
        $("#housePartY").val("" + part.y);
        $("#housePartWidth").val("" + part.width);
        $("#housePartHeight").val("" + part.height);
    }

    static ChangeName()
    {
        if (!housePart.currentHousePart)
            return;
        var newName = $("#housePartName").val();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.art.house_parts[newName] && world.art.house_parts[newName] != world.art.house_parts[housePart.currentHousePart]))
        {
            $("#housePartName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#housePartName").css('backgroundColor', '');

        if (!newName || newName.trim() == "")
            return;
        if (newName == housePart.currentHousePart)
            return;
        if (world.art.house_parts[newName])
            return;

        var oldName = housePart.currentHousePart;
        var part = world.art.house_parts[housePart.currentHousePart];
        delete world.art.house_parts[housePart.currentHousePart];
        world.art.house_parts[newName] = part;
        housePart.listParts.UpdateList();
        housePart.listParts.Select(newName);
        SearchPanel.Update();

        for (var item in world.Houses)
        {
            for (var i = 0; i < world.Houses[item].parts.length; i++)
            {
                if (world.Houses[item].parts[i].part == oldName)
                    world.Houses[item].parts[i].part = newName;
            }
        }

        for (var item in world.art.houses)
        {
            for (var i = 0; i < world.art.houses[item].parts.length; i++)
            {
                if (world.art.houses[item].parts[i].part == oldName)
                    world.art.houses[item].parts[i].part = newName;
            }
        }
    }

    static Clone()
    {
        if (!housePart.currentHousePart)
            return;
        var id = 1;
        while (world.art.house_parts["part_" + id])
            id++;
        var newName = "part_" + id;
        var part = JSON.parse(JSON.stringify(world.art.house_parts[housePart.currentHousePart]));
        world.art.house_parts[newName] = part;
        housePart.listParts.UpdateList();
        housePart.listParts.Select(newName);
        SearchPanel.Update();
    }

    static Delete()
    {
        if (!housePart.currentHousePart)
            return;
        Framework.Confirm("Are you sure you want to delete this house part?", () =>
        {
            var oldName = housePart.currentHousePart;
            delete world.art.house_parts[housePart.currentHousePart];
            housePart.listParts.UpdateList();
            housePart.listParts.Select(null);
            SearchPanel.Update();

            for (var item in world.Houses)
            {
                for (var i = 0; i < world.Houses[item].parts.length;)
                {
                    if (world.Houses[item].parts[i].part == oldName)
                        world.Houses[item].parts.splice(i, 1);
                    else
                        i++;
                }
            }

            for (var item in world.art.houses)
            {
                for (var i = 0; i < world.art.houses[item].parts.length;)
                {
                    if (world.art.houses[item].parts[i].part == oldName)
                        world.art.houses[item].parts.splice(i, 1);
                    else
                        i++;
                }
            }
        });
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", HousePart.ImportFileImage).first().click();
            return;
        }

        $("#uploadHousePart").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        HousePart.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", HousePart.ImportFileImage).val("");
    }

    static Upload()
    {
        $("#uploadHousePart").hide();
        $("#artHousePartUploadForm").submit();
    }

    static CloseUpload()
    {
        $("#uploadHousePart").hide();
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
            HousePart.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        var plainUrl = filename;
        var fileUrl = filename + "?v=" + Math.round((new Date()).getTime() / 1000);

        var id = 1;
        while (world.art.house_parts["part_" + id])
            id++;
        var newName = "part_" + id;

        for (var item in world.art.house_parts)
        {
            if (world.art.house_parts[item].file.indexOf(plainUrl) == 0)
                world.art.house_parts[item].file = fileUrl;
        }

        world.art.house_parts[newName] = { x: 0, y: 0, width: 0, height: 0, file: fileUrl };
        housePart.listParts.UpdateList();
        housePart.listParts.Select(newName);
        SearchPanel.Update();
    }
}