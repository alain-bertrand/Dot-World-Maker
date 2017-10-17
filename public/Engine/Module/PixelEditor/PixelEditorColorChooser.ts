class PixelEditorColorChooser
{
    static ColorPickerMouseDown(evt: MouseEvent)
    {
        $(window.document).bind("mousemove", PixelEditorColorChooser.ColorPickerMouseMove);
        $(window.document).bind("mouseup", PixelEditorColorChooser.ColorPickerMouseUp);

        var pos = $("#pixelEditorColorMouseSelector").position();
        var x = evt.pageX - pos.left;
        var y = evt.pageY - pos.top;

        if (x > 165)
            pixelEditor.colorPickerItem = "hue";
        else
            pixelEditor.colorPickerItem = "color";

        PixelEditorColorChooser.ColorPickerMouseMove(evt);
    }

    static ColorPickerMouseMove(evt: MouseEvent)
    {
        var pos = $("#pixelEditorColorMouseSelector").position();
        var x = evt.pageX - pos.left;
        var y = evt.pageY - pos.top;

        if (pixelEditor.colorPickerItem == "color")
        {
            x -= 6;
            if (x < 0)
                x = 0;
            if (x > 159)
                x = 159;
            y -= 7;
            if (y < 0)
                y = 0;
            if (y > 182)
                y = 182;
            pixelEditor.colorPositionX = x / 159;
            pixelEditor.colorPositionY = y / 182;
            $("#pixelEditorCurrentColor").css("top", (y - 5) + "px").css("left", (x - 6) + "px");
            if (y > 100)
                $("#pixelEditorCurrentColor").css("border", "solid 2px white");
            else
                $("#pixelEditorCurrentColor").css("border", "solid 2px black");
        }
        else
        {
            y -= 7;
            if (y < 0)
                y = 0;
            if (y > 182)
                y = 182;
            $("#pixelEditorCurrentHue").css("top", (y + 64) + "px");

            var h = y * 100 / 182;
            pixelEditor.huePosition = h;

            var fullRgb = ColorHandling.HSVtoRGB((Math.round(h) == 0 ? 0 : (100 - h)) * 3.6, 1, 1);
            $("#pixelEditorColorSelection").css("background", "linear-gradient(to right, #FFFFFF 0%, " + ColorHandling.RgbToHex(fullRgb.Red * 255, fullRgb.Green * 255, fullRgb.Blue * 255) + " 100%)");
        }
        var color = PixelEditorColorChooser.ColorFromPosition();
        $("#pixelEditorFieldCurrentColor").val(color.toUpperCase());
        $("#pixelEditorColorPreview").css("backgroundColor", color);
        PixelEditorColorChooser.UpdateShades();
        framework.Preferences['PixelEditorColor'] = $("#pixelEditorFieldCurrentColor").val();
        Framework.SavePreferences();
    }

    static ColorFromPosition(): string
    {
        var c = ColorHandling.HSVtoRGB(Math.round(pixelEditor.huePosition) == 0 ? 0 : ((100 - pixelEditor.huePosition) * 3.6), pixelEditor.colorPositionX, 1 - pixelEditor.colorPositionY);
        return ColorHandling.RgbToHex(c.Red * 255, c.Green * 255, c.Blue * 255);
    }

    static ChangeColorField()
    {
        var rgb = ColorHandling.HexToRgb($("#pixelEditorFieldCurrentColor").val());
        if (!rgb)
            return;
        $("#pixelEditorColorPreview").css("backgroundColor", $("#pixelEditorFieldCurrentColor").val());
        framework.Preferences['PixelEditorColor'] = $("#pixelEditorFieldCurrentColor").val();
        Framework.SavePreferences();

        var hsv = ColorHandling.RGBtoHSV(rgb.r / 255, rgb.g / 255, rgb.b / 255);

        pixelEditor.huePosition = (360 - hsv.h) / 360 * 100;
        $("#pixelEditorCurrentHue").css("top", (pixelEditor.huePosition * 1.82 + 64) + "px");

        pixelEditor.colorPositionX = hsv.s;
        $("#pixelEditorCurrentHue").css("top", (pixelEditor.huePosition * 1.82 + 64) + "px");
        pixelEditor.colorPositionY = 1 - hsv.v;
        $("#pixelEditorCurrentColor").css("top", (Math.round(pixelEditor.colorPositionY * 182) - 5) + "px").css("left", (Math.round(pixelEditor.colorPositionX * 159) - 6) + "px");

        var fullRgb = ColorHandling.HSVtoRGB(hsv.h, 1, 1);
        $("#pixelEditorColorSelection").css("background", "linear-gradient(to right, #FFFFFF 0%, " + ColorHandling.RgbToHex(fullRgb.Red * 255, fullRgb.Green * 255, fullRgb.Blue * 255) + " 100%)");

        PixelEditorColorChooser.UpdateShades();
    }

    static UpdateShades()
    {
        var rgb = ColorHandling.HexToRgb($("#pixelEditorFieldCurrentColor").val());
        var hsv = ColorHandling.RGBtoHSV(rgb.r / 255, rgb.g / 255, rgb.b / 255);

        for (var i = 0; i < 5; i++)
        {
            var fullRgb = ColorHandling.HSVtoRGB(hsv.h, hsv.s, 0.10 * i + 0.2 * hsv.v);
            var hexColor = ColorHandling.RgbToHex(fullRgb.Red * 255, fullRgb.Green * 255, fullRgb.Blue * 255);
            $("#colorShades tr > td").eq(i).css("backgroundColor", hexColor);
        }
        for (var i = 0; i < 5; i++)
        {
            var s = i * 0.25;
            var v = i * 0.2;
            var fullRgb = ColorHandling.HSVtoRGB(hsv.h, hsv.s * (1 - s), hsv.v + (1 - hsv.v) * v);
            var hexColor = ColorHandling.RgbToHex(fullRgb.Red * 255, fullRgb.Green * 255, fullRgb.Blue * 255);
            $("#colorShades tr > td").eq(i + 5).css("backgroundColor", hexColor);
        }
        $("#colorShades tr > td").removeClass("selectedShade");
        $("#colorShades tr > td").eq(5).addClass("selectedShade");
    }

    static ColorPickerMouseUp(evt: MouseEvent)
    {
        $(window.document).unbind("mousemove", PixelEditorColorChooser.ColorPickerMouseMove);
        $(window.document).unbind("mouseup", PixelEditorColorChooser.ColorPickerMouseUp);
    }

    static ChooseShade(shadeNumber: number)
    {
        var val = $("#colorShades tr > td").eq(shadeNumber).css("backgroundColor");
        if (val.indexOf("rgb") == 0)
        {
            var p = val.replace("rgb(", "").replace(")").split(',');
            p[0] = parseInt(p[0]);
            p[1] = parseInt(p[1]);
            p[2] = parseInt(p[2]);
            val = ColorHandling.RgbToHex(p[0], p[1], p[2]).toUpperCase();
        }
        $("#pixelEditorFieldCurrentColor").val(val);
        $("#pixelEditorColorPreview").css("backgroundColor", val);

        $("#colorShades tr > td").removeClass("selectedShade");
        $("#colorShades tr > td").eq(shadeNumber).addClass("selectedShade");
    }
}