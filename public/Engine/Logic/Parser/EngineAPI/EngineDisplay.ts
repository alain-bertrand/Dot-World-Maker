/// <reference path="../CodeEnvironement.ts" />

var engineDisplay = new (class
{
    dialogSideButtons: string[] = [];
    dialogButtons: string[] = [];
    canRestartInline: boolean = false;
});


@ApiClass
class EngineDisplay
{
    @ApiMethod([{ name: "x", description: "The X coordinate where to place the map message" }, { name: "y", description: "The Y coordinate where to place the map message" }, { name: "message", description: "The message to place the map message" }, { name: "color", description: "(optional) The color to use to display the message. If skipped it will be white. Otherwise use the web color format." }], "Place a small floating temporary message on the map.")
    AddMapMessage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null || values[1] === null || values[2] === null)
            return;
        var x = (values[0] ? values[0].GetNumber() : 0);
        var y = (values[1] ? values[1].GetNumber() : 0);
        var color = (values[3] ? values[3].GetString() : "#FFFFFF");

        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;

        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area)
        {
            area.actors.push(MapMessage.Create(values[2].GetString(), color, area, mx, my));
        }

        return null;
    }

    @ApiMethod([], "Shows the minimap on the screen.")
    ShowMinimap(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        play.showMinimap = true;
        return null;
    }

    @ApiMethod([], "Hides the minimap on the screen.")
    HideMinimap(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        play.showMinimap = false;
        return null;
    }

    @ApiMethod([{ name: "x", description: "The X coordinate where to place the map message" }, { name: "y", description: "The Y coordinate where to place the map message" }, { name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on a map for a given time.")
    ParticleEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var x = values[0].GetNumber();
        var y = values[1].GetNumber();

        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;

        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area)
        {
            var effect = new TemporaryParticleEffect(values[2].GetString(), mx, my, area, new Date(new Date().getTime() + values[3].GetNumber() * 1000));
            area.tempObjects.push(effect);
            area.CleanObjectCache();
            area.actors.push();
        }
        return null;
    }

    Verify_ParticleEffect(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetParticleSystem(values[2]))
            throw "The particle effect '" + values[2] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "message", description: "The message to show on the error log" }], "Display a message in the error log.")
    Log(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var msg = (values[0] ? values[0].GetString() : "null");
        Main.AddErrorMessage(msg);
        return null;
    }

    @ApiMethod([{ name: "title", description: "The title of the dialog box." }], "Set the title of the dialog box.")
    SetDialogTitle(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog .gamePanelHeader").text(values[0].GetString());
        return null;
    }

    @ApiMethod([], "Shows the dialog box.")
    ShowDialog(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").show();
        world.Player.InDialog = true;
        return;
    }

    static OnChange(functionCallback: string)
    {
        var env = CodeParser.Parse("function toExec() { " + functionCallback + "();}");
        env.ExecuteFunction("toExec", []);
    }

    @ApiMethod([{ name: "content", description: "The content as BB code." }], "Set the content of the dialog box.")
    SetDialogText(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        play.onDialogPaint = [];
        npc.canJump = false;
        var html = Main.TextTransform(values[0].GetString(), true);
        // Dropdown Lists
        html = html.replace(/\[dropdown([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            m = capture.match(/\onchange=['"]{0,1}([a-z_0-9\.]+)/i);
            var onchange = (m && m[1] ? m[1] : null);

            return "<select style='width: 100%;'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;'" + (onchange ? " onchange=\"EngineDisplay.OnChange('" + onchange + "');\"" : "") + "></select>";
        });
        // Text areas
        html = html.replace(/\[textarea([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\srows=['"]{0,1}([0-9]+)/);
            var rows = (m && m[1] ? parseInt(m[1]) : 2);

            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);

            return "<textarea style='resize: none; width: 100%;' rows='" + rows + "'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;'></textarea>";
        });
        // Buttons
        html = html.replace(/\[button([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\label=['"]{0,1}([^'"]+)/);
            var label = (m && m[1] ? m[1] : "");

            var m = capture.match(/\sid=['"]{0,1}([0-9]+)/i);
            var id = (m && m[1] ? parseInt(m[1]) : 0);

            return "<span class='button' onclick='EngineDisplay.InlineButton(" + id + ")'>" + label + "</span>";
        });
        // Text field
        html = html.replace(/\[text([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);

            return "<input type='text' style='width: 100%;'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;' />";
        });
        // Image tag
        html = html.replace(/\[img([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);

            var m = capture.match(/\ssrc=['"]{0,1}([a-z_0-9\:\.]+)/i);
            var src = (m && m[1] ? m[1] : null);
            return EngineDisplay.ImageSrc(src, id);
        });
        // Image tag
        html = html.replace(/\[canvas([^\]]*)\]/gi, (substr: string, capture: string) =>
        {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);

            var m = capture.match(/\swidth=['"]{0,1}([0-9]+)/i);
            var width = parseInt(m && m[1] ? m[1] : "300");

            var m = capture.match(/\sheight=['"]{0,1}([0-9]+)/i);
            var height = parseInt(m && m[1] ? m[1] : "300");

            m = capture.match(/\onpaint=['"]{0,1}([a-z_0-9\.]+)/i);
            var onpaint = (m && m[1] ? m[1] : null);
            if (onpaint)
                play.onDialogPaint.push("Graphics.Canvas('" + id + "');" + onpaint + "();");

            return "<canvas id='" + id + "' width='" + width + "' height='" + height + "'>";
        });

        $("#dialogSentence").html(html);
        engineDisplay.canRestartInline = true;
        return null;
    }

    private static ImageSrc(src: string, id: string): string
    {
        if (!src)
            return "-- Must specify a src --";

        if (src.toLowerCase().indexOf("http:") == 0 || src.toLowerCase().indexOf("https:") == 0)
        {
            return "-- No external images allowed --";
        }
        if (src.toLowerCase().indexOf(".png") != -1 || src.toLowerCase().indexOf(".jpg") != -1)
            return "<img" + (id ? " id='dialogimg_" + id + "'" : "") + " sec='/user_art/" + EngineDisplay.GameDir(world.Id) + "/" + src + "'>";
        else if (src.toLowerCase().indexOf("item:") == 0)
        {
            var item = world.GetInventoryObject(src.substr(5));
            if (!item || !item.Image)
                return "-- inventory item '" + src.substr(5) + "' is unknown or doesn't have an image --";
            return "<img" + (id ? " id='dialogimg_" + id + "'" : "") + " src='" + item.Image + "' />";
        }
        else if (src.toLowerCase().indexOf("character:") == 0)
        {
            var char = world.art.characters[src.substr(10)];
            if (!char)
                return "-- character '" + src.substr(10) + "' is unknown  --";
            var w = Math.floor(char.width / char.frames);
            var h = Math.floor(char.height / char.directions);
            return "<span" + (id ? " id='dialogimg_" + id + "'" : "") + " style='width: " + w + "px; height: " + h + "px; display: inline-block; background-image: url(\"" + char.file + "\");'></span>";
        }
        else if (src.toLowerCase().indexOf("object:") == 0)
        {
            var obj = world.art.objects[src.substr(7)];
            if (!obj)
                return "-- map object '" + src.substr(7) + "' is unknown  --";
            return "<span" + (id ? " id='dialogimg_" + id + "'" : "") + " style='width: " + obj.width + "px; height: " + obj.height + "px; background-position: -" + obj.x + "px -" + obj.y + "px; display: inline-block; background-image: url(\"" + obj.file + "\");'></span>";
        }
    }

    @ApiMethod([{ name: "imageId", description: "The id of the image." }, { name: "src", description: "Image source info." }], "Replace the current image with a new image.")
    ReplaceImage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var elem = $("#dialogimg_" + values[0].GetString()).first();
        if (!elem)
            return null;
        elem.outerHTML = EngineDisplay.ImageSrc(values[1].GetString(), values[0].GetString());
        return null;
    }

    public static GameDir(gameId: number): string
    {
        return "" + gameId + "_" + (gameId ^ 8518782);
    }

    @ApiMethod([{ name: "fieldName", description: "The field to read." }], "Reads a field and returns the value.")
    GetFieldValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var val = $("#" + values[0].GetString()).val();
        // Remove potential nasty elements
        val = val.replace(/\[textarea([^\]]*)\]/gi, "");
        val = val.replace(/\[button([^\]]*)\]/gi, "");
        val = val.replace(/\[dropdown([^\]]*)\]/gi, "");
        val = val.replace(/\[text([^\]]*)\]/gi, "");
        return new VariableValue(val);
    }

    @ApiMethod([{ name: "fieldName", description: "The field to set." }, { name: "value", description: "The value to set." }], "Set the value of a field.")
    SetFieldValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#" + values[0].GetString()).val(values[1].GetString());
        return null;
    }

    @ApiMethod([{ name: "fieldName", description: "The field to change." }, { name: "value", description: "The value of the option to set." }, { name: "text", description: "(optional) The text to display for the option." }], "Add a value to a dropdown menu.")
    AddOption(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var value = values[1].GetString();
        var text = value;
        if (values[2])
            text = values[2].GetString();
        $("#" + values[0].GetString()).append("<option value='" + value + "'>" + text + "</option>");
        return null;
    }

    @ApiMethod([{ name: "fieldName", description: "The field to change." }], "Remove all the options of a dropdown.")
    ClearOptions(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#" + values[0].GetString()).find("option").remove();
        return null;
    }

    @ApiMethod([], "Clear up all the buttons on the side of the dialog.")
    ClearDialogSideButtons(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineDisplay.dialogSideButtons = [];
        $("#dialogAnswers").html("");
        return null;
    }

    @ApiMethod([{ name: "label", description: "Label of the button to add." }, { name: "functionToCall", description: "Function to call back when the button is pressed." }], "Add a button to the side of the dialog.")
    AddDialogSideButton(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#dialogAnswers").html($("#dialogAnswers").html() + "<div class='gameButton' onclick='EngineDisplay.SideButton(" + engineDisplay.dialogSideButtons.length + ")'>" + values[0].GetString() + "</div>");
        engineDisplay.dialogSideButtons.push(values[1].GetString());
        return null;
    }

    @ApiMethod([], "Dock the dialog to the bottom of the screen.")
    DockDialogBottom(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("top", "auto").css("bottom", "0px");
        return null;
    }

    @ApiMethod([], "Dock the dialog to the top of the screen.")
    DockDialogTop(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("top", "0px").css("bottom", "auto");
        return null;
    }

    @ApiMethod([], "Dock the dialog to the left of the screen.")
    DockDialogLeft(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("left", "0px").css("right", "auto");
        return null;
    }

    @ApiMethod([], "Dock the dialog to the right of the screen.")
    DockDialogRight(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("left", "auto").css("right", "0px");
        return null;
    }

    @ApiMethod([], "Place the dialog in the center.")
    DialogCenter(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("top", "").css("left", "").css("right", "").css("width", "").css("height", "").css("bottom", "");
        return null;
    }

    @ApiMethod([], "Dialog will take all the width of the screen.")
    DialogFillWidth(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("left", "0px").css("right", "0px").css("width", "100%");
        return null;
    }

    @ApiMethod([], "Dialog will take all the height of the screen.")
    DialogFillHeight(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#npcDialog").css("top", "0px").css("bottom", "0px").css("height", "100%");
        return null;
    }

    @ApiMethod([{ name: "height", description: "The wished height of the dialog box. If the parameter is a string and ends with a % sign it will be taken as % of the screen size." }], "Dialog will take all the height of the screen.")
    DialogHeight(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var val: string = null;
        if (values[0].Type == ValueType.String && ("" + values[0].Value).trim().endsWith("%"))
            val = "" + parseInt("" + values[0].Value) + "%";
        else
            val = "" + values[0].GetNumber() + "px";
        $("#npcDialog").css("height", val);
        return null;
    }

    @ApiMethod([{ name: "width", description: "The wished width of the dialog box. If the parameter is a string and ends with a % sign it will be taken as % of the screen size." }], "Dialog will take all the height of the screen.")
    DialogWidth(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var val: string = null;
        if (values[0].Type == ValueType.String && ("" + values[0].Value).trim().endsWith("%"))
            val = "" + parseInt("" + values[0].Value) + "%";
        else
            val = "" + values[0].GetNumber() + "px";
        $("#npcDialog").css("width", val);
        return null;
    }

    @ApiMethod([], "Hide the dialog box.")
    HideDialog(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $("#dialogAnswers").html("");
        $("#dialogSentence").html("");
        $("#npcDialog .gamePanelHeader").html("Dialog");
        $("#npcDialog").hide();
        $("#npcDialog").css("top", "").css("left", "").css("right", "").css("width", "").css("height", "").css("bottom", "");
        world.Player.InDialog = false;
        return null;
    }

    @ApiMethod([{ name: "source", description: "Source text to cleanup." }], "Removes all the BB codes.")
    CleanupBBCodes(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var source = values[0].GetString();
        return new VariableValue(source.replace(/\[[^]]+\]/g, ""));
    }

    @ApiMethod([{ name: "label", description: "Label of the button to add." }, { name: "functionToCall", description: "Function to call back when the button is pressed." }], "Generate button BB code to place within the text of a dialog.")
    InlineButton(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (engineDisplay.canRestartInline)
        {
            engineDisplay.dialogButtons = [];
            engineDisplay.canRestartInline = false;
        }
        engineDisplay.dialogButtons.push(values[1].GetString());
        return new VariableValue("[button id='" + (engineDisplay.dialogButtons.length - 1) + "' label='" + values[0].GetString() + "']");
    }

    static SideButton(rowId: number)
    {
        var func = engineDisplay.dialogSideButtons[rowId];
        if (func.indexOf("(") == -1)
            func += "();";
        if (func.charAt(func.length - 1) != ";")
            func += ";";
        var env = CodeParser.Parse("function buttonToExec() { " + func + "}");
        env.ExecuteFunction("buttonToExec", []);
    }

    static InlineButton(rowId: number)
    {
        var func = engineDisplay.dialogButtons[rowId];
        if (func.indexOf("(") == -1)
            func += "();";
        if (func.charAt(func.length - 1) != ";")
            func += ";";
        var env = CodeParser.Parse("function buttonToExec() { " + func + "}");
        env.ExecuteFunction("buttonToExec", []);
    }
}