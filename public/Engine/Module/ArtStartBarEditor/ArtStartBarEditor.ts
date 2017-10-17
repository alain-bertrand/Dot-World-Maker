var artStartBarEditor = new (class
{
    public statbarStyle: HTMLImageElement;
    public refreshStyle: number;
});


class ArtStartBarEditor
{
    public static Dispose()
    {
        if (artStartBarEditor.refreshStyle)
            clearInterval(artStartBarEditor.refreshStyle);
        artStartBarEditor.refreshStyle = null;
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
            $("#panelDetails").css("top", "5px");
            $("#buttonUpload").html("Change");
        }

        artStartBarEditor.statbarStyle = new Image();
        artStartBarEditor.statbarStyle.src = world.art.statBarStyle.file;
        artStartBarEditor.refreshStyle = setInterval(ArtStartBarEditor.UpdateQuickslot, 100);

        $("#topBorder").val(world.art.statBarStyle.topBorder);
        $("#bottomBorder").val(world.art.statBarStyle.bottomBorder);
        if (world.art.statBarStyle.barsToDisplay == null || world.art.statBarStyle.barsToDisplay == undefined)
            world.art.statBarStyle.barsToDisplay = 1;
        $("#barsToDisplay").val("" + world.art.statBarStyle.barsToDisplay);
    }

    static ChangeParam(fieldName: string, paramName: string)
    {
        var val = $("#" + fieldName).val();
        if (typeof world.art.statBarStyle[paramName] == "number")
        {
            var nVal = parseInt(val);
            if (!isNaN(nVal))
                world.art.statBarStyle[paramName] = nVal;
        }
        else
            world.art.statBarStyle[paramName] = val;
        Main.GenerateGameStyle();
    }

    static UpdateQuickslot()
    {
        if (!artStartBarEditor.statbarStyle || !artStartBarEditor.statbarStyle.width)
            return;
        var canvas = <HTMLCanvasElement>$("#panelStyle").first();
        if (canvas.width != artStartBarEditor.statbarStyle.width)
            canvas.width = artStartBarEditor.statbarStyle.width;
        if (canvas.height != artStartBarEditor.statbarStyle.height)
            canvas.height = artStartBarEditor.statbarStyle.height;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(artStartBarEditor.statbarStyle, 0, 0);

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(0, world.art.statBarStyle.topBorder + 0.5);
        ctx.lineTo(canvas.width, world.art.statBarStyle.topBorder + 0.5);

        ctx.moveTo(0, artStartBarEditor.statbarStyle.height - world.art.statBarStyle.bottomBorder + 0.5);
        ctx.lineTo(canvas.width, artStartBarEditor.statbarStyle.height - world.art.statBarStyle.bottomBorder + 0.5);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#E00000";
        ctx.beginPath();
        ctx.moveTo(0, world.art.statBarStyle.topBorder + 0.5);
        ctx.lineTo(canvas.width, world.art.statBarStyle.topBorder + 0.5);

        ctx.moveTo(0, artStartBarEditor.statbarStyle.height - world.art.statBarStyle.bottomBorder + 0.5);
        ctx.lineTo(canvas.width, artStartBarEditor.statbarStyle.height - world.art.statBarStyle.bottomBorder + 0.5);
        ctx.stroke();
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtStartBarEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtStartBarEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtStartBarEditor.ImportFileImage).val("");
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
            ArtStartBarEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        skillBar.StatBar = null;

        // Change background, we need to reset all the types, transitions, and world generators.
        world.art.statBarStyle.file = filename;
        artStartBarEditor.statbarStyle = new Image();
        artStartBarEditor.statbarStyle.src = world.art.statBarStyle.file + "?v=" + Math.round((new Date()).getTime() / 1000);
        artStartBarEditor.statbarStyle.onload = () =>
        {
            world.art.statBarStyle.width = artStartBarEditor.statbarStyle.width;
            world.art.statBarStyle.height = artStartBarEditor.statbarStyle.height;
        };
        //artStartBarEditor.refreshStyle = setInterval(ArtStartBarEditor.UpdateQuickslot, 100);
    }
}