var artQuickslotEditor = new (class
{
    public quickslotStyle: HTMLImageElement;
    public refreshStyle: number;
});


class ArtQuickslotEditor
{
    public static Dispose()
    {
        if (artQuickslotEditor.refreshStyle)
            clearInterval(artQuickslotEditor.refreshStyle);
        artQuickslotEditor.refreshStyle = null;
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
            $("#panelDetails").css("top", "5px");
        }

        artQuickslotEditor.quickslotStyle = new Image();
        artQuickslotEditor.quickslotStyle.src = world.art.quickslotStyle.file;
        artQuickslotEditor.refreshStyle = setInterval(ArtQuickslotEditor.UpdateQuickslot, 100);
        if (world.art.quickslotStyle.quickslotVisible === null || world.art.quickslotStyle.quickslotVisible === undefined)
            world.art.quickslotStyle.quickslotVisible = true;

        $("#leftBorder").val(world.art.quickslotStyle.leftBorder);
        $("#topBorder").val(world.art.quickslotStyle.topBorder);
        $("#itemSpacing").val(world.art.quickslotStyle.itemSpacing);
        $("#selectedSkillColor").val(world.art.quickslotStyle.selectedSkillColor);
        (<HTMLSelectElement>$("#quickslotVisible").first()).selectedIndex = (world.art.quickslotStyle.quickslotVisible ? 0 : 1);
    }

    static ChangeParam(fieldName: string, paramName: string)
    {
        var val = $("#" + fieldName).val();
        if (typeof world.art.quickslotStyle[paramName] == "number")
        {
            var nVal = parseInt(val);
            if (!isNaN(nVal))
                world.art.quickslotStyle[paramName] = nVal;
        }
        else if (typeof world.art.quickslotStyle[paramName] == "boolean")
        {
            world.art.quickslotStyle[paramName] = (val == "Yes");
        }
        else
            world.art.quickslotStyle[paramName] = val;
        Main.GenerateGameStyle();
    }

    static UpdateQuickslot()
    {
        if (!artQuickslotEditor.quickslotStyle || !artQuickslotEditor.quickslotStyle.width)
            return;
        var canvas = <HTMLCanvasElement>$("#panelStyle").first();
        if (canvas.width != artQuickslotEditor.quickslotStyle.width)
            canvas.width = artQuickslotEditor.quickslotStyle.width;
        if (canvas.height != artQuickslotEditor.quickslotStyle.height)
            canvas.height = artQuickslotEditor.quickslotStyle.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(artQuickslotEditor.quickslotStyle, 0, 0);

        world.art.quickslotStyle.width = artQuickslotEditor.quickslotStyle.width;
        world.art.quickslotStyle.height = artQuickslotEditor.quickslotStyle.height;

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        for (var i = 0; i < 10; i++)
            ctx.rect(world.art.quickslotStyle.leftBorder + 0.5 + (32 + world.art.quickslotStyle.itemSpacing) * i, world.art.quickslotStyle.topBorder + 0.5, 32, 32);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#0000E0";
        ctx.beginPath();
        for (var i = 0; i < 10; i++)
            ctx.rect(world.art.quickslotStyle.leftBorder + 0.5 + (32 + world.art.quickslotStyle.itemSpacing) * i, world.art.quickslotStyle.topBorder + 0.5, 32, 32);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(0, world.art.quickslotStyle.topBorder + 0.5);
        ctx.lineTo(canvas.width, world.art.quickslotStyle.topBorder + 0.5);

        ctx.moveTo(world.art.quickslotStyle.leftBorder + 0.5, 0);
        ctx.lineTo(world.art.quickslotStyle.leftBorder + 0.5, canvas.height);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#E00000";
        ctx.beginPath();
        ctx.moveTo(0, world.art.quickslotStyle.topBorder + 0.5);
        ctx.lineTo(canvas.width, world.art.quickslotStyle.topBorder + 0.5);

        ctx.moveTo(world.art.quickslotStyle.leftBorder + 0.5, 0);
        ctx.lineTo(world.art.quickslotStyle.leftBorder + 0.5, canvas.height);
        ctx.stroke();
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtQuickslotEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtQuickslotEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtQuickslotEditor.ImportFileImage).val("");
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
            ArtQuickslotEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        skillBar.SlotBar = null;

        // Change background, we need to reset all the types, transitions, and world generators.
        world.art.quickslotStyle.file = filename + "?v=" + Math.round((new Date()).getTime() / 1000);
        artQuickslotEditor.quickslotStyle = new Image();
        artQuickslotEditor.quickslotStyle.src = world.art.quickslotStyle.file;
        artQuickslotEditor.quickslotStyle.onload = () =>
        {
            world.art.quickslotStyle.width = artQuickslotEditor.quickslotStyle.width;
            world.art.quickslotStyle.height = artQuickslotEditor.quickslotStyle.height;
        };
        //artQuickslotEditor.refreshStyle = setInterval(ArtQuickslotEditor.UpdateQuickslot, 100);
    }
}