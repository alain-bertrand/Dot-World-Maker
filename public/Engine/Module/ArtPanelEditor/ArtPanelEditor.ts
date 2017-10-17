var artPanelEditor = new (class
{
    public panelStyle: HTMLImageElement;
    public refreshStyle: number;
});


class ArtPanelEditor
{
    public static Dispose()
    {
        if (artPanelEditor.refreshStyle)
            clearInterval(artPanelEditor.refreshStyle);
        artPanelEditor.refreshStyle = null;
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

        artPanelEditor.panelStyle = new Image();
        artPanelEditor.panelStyle.src = world.art.panelStyle.file;
        artPanelEditor.refreshStyle = setInterval(ArtPanelEditor.UpdateStyle, 100);

        $("#leftBorder").val(world.art.panelStyle.leftBorder);
        $("#rightBorder").val(world.art.panelStyle.rightBorder);
        $("#topBorder").val(world.art.panelStyle.topBorder);
        $("#bottomBorder").val(world.art.panelStyle.bottomBorder);
        $("#headerHeight").val(world.art.panelStyle.header);
        $("#headerColor").val(world.art.panelStyle.headerColor);
        $("#contentColor").val(world.art.panelStyle.contentColor);
        $("#contentHeaderBackgroundColor").val(world.art.panelStyle.contentHeaderBackgroundColor);
        $("#contentHeaderColor").val(world.art.panelStyle.contentHeaderColor);
        $("#contentSelectedColor").val(world.art.panelStyle.contentSelectedColor);
        $("#buttonBorder").val(world.art.panelStyle.buttonBorder);
        $("#buttonBackground").val(world.art.panelStyle.buttonBackground);
        $("#buttonBackgroundHover").val(world.art.panelStyle.buttonBackgroundHover);
        $("#chatPlaceholderColor").val(world.art.panelStyle.chatPlaceholderColor ? world.art.panelStyle.chatPlaceholderColor : "#c7c7cd");
        $("#chatNormalColor").val(world.art.panelStyle.chatNormalColor ? world.art.panelStyle.chatNormalColor : "#ffffff");
        $("#chatSeparatorColor").val(world.art.panelStyle.chatSeparatorColor ? world.art.panelStyle.chatSeparatorColor : "#7a7ead");
        $("#chatSystemMessageColor").val(world.art.panelStyle.chatSystemMessageColor ? world.art.panelStyle.chatSystemMessageColor : "#00e000");

        Main.GenerateGameStyle();
    }

    static ChangeParam(fieldName: string, paramName: string)
    {
        var val = $("#" + fieldName).val();
        if (typeof world.art.panelStyle[paramName] == "number")
        {
            var nVal = parseInt(val);
            if (!isNaN(nVal))
                world.art.panelStyle[paramName] = nVal;
        }
        else
            world.art.panelStyle[paramName] = val;
        Main.GenerateGameStyle();
    }

    static UpdateStyle()
    {
        if (!artPanelEditor.panelStyle || !artPanelEditor.panelStyle.width)
            return;
        var canvas = <HTMLCanvasElement>$("#panelStyle").first();
        if (canvas.width != artPanelEditor.panelStyle.width)
            canvas.width = artPanelEditor.panelStyle.width;
        if (canvas.height != artPanelEditor.panelStyle.height)
            canvas.height = artPanelEditor.panelStyle.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(artPanelEditor.panelStyle, 0, 0);

        ctx.strokeStyle = "#E00000";
        ctx.beginPath();
        ctx.moveTo(0, world.art.panelStyle.topBorder + 0.5);
        ctx.lineTo(canvas.width, world.art.panelStyle.topBorder + 0.5);

        ctx.moveTo(0, world.art.panelStyle.topBorder + world.art.panelStyle.header + 0.5);
        ctx.lineTo(canvas.width, world.art.panelStyle.topBorder + world.art.panelStyle.header + 0.5);

        ctx.moveTo(0, canvas.height - world.art.panelStyle.bottomBorder + 0.5);
        ctx.lineTo(canvas.width, canvas.height - world.art.panelStyle.bottomBorder + 0.5);

        ctx.moveTo(world.art.panelStyle.leftBorder + 0.5, 0);
        ctx.lineTo(world.art.panelStyle.leftBorder + 0.5, canvas.height);

        ctx.moveTo(canvas.width - world.art.panelStyle.leftBorder + 0.5, 0);
        ctx.lineTo(canvas.width - world.art.panelStyle.leftBorder + 0.5, canvas.height);
        ctx.stroke();
    }

    public static GenerateHTML(divId: string): string
    {
        var html = "";
        html += "<div id='" + divId + "' class='gamePanel'>\n";
        html += "<div class='gamePanelTopBorder'></div>\n";
        html += "<div class='gamePanelHeader'>Test Panel</div>\n";
        html += "<div class='gamePanelContent'></div>\n";
        html += "<div class='gamePanelBottomBorder'></div>\n";
        html += "</div>";
        return html;
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtPanelEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtPanelEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtPanelEditor.ImportFileImage).val("");
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
            ArtPanelEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        // Change background, we need to reset all the types, transitions, and world generators.
        world.art.panelStyle.file = filename + "?v=" + Math.round((new Date()).getTime() / 1000);
        artPanelEditor.panelStyle = new Image();
        artPanelEditor.panelStyle.src = world.art.panelStyle.file;
        artPanelEditor.panelStyle.onload = () =>
        {
            Main.GenerateGameStyle();
        };
        //artPanelEditor.refreshStyle = setInterval(ArtPanelEditor.UpdateStyle, 100);
    }
}