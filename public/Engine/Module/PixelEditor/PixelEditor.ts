class PixelEditor
{
    public static Dispose()
    {
        if (pixelEditor.repaintInterval)
            clearInterval(pixelEditor.repaintInterval);
        pixelEditor.repaintInterval = null;

        pixelEditor.currentImage = null;
        pixelEditor.currentLayer = null;
        pixelEditor.currentSprite = null;
        pixelEditor.selection = null;
        pixelEditor.keys = null;
        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;

        $(window).unbind("keydown", PixelEditor.KeyDown);
        $(window).unbind("keyup", PixelEditor.KeyUp);
        pixelEditor.actionSteps = null;
        pixelEditor.redoSteps = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || ("" + document.location).indexOf("/demo_pixel_editor.html") != -1 || ("" + document.location).indexOf("/pixel_contest.html") != -1 || Main.CheckNW());
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
            $("#pixelEditorPalette").css("top", "5px");
            $("#pixelEditorCanvasContainer").css("top", "5px");
            $("#pixelEditorLayers").css("top", "5px");
            $("#pixelEditorPreview").css("top", "5px");
            $("#pixelEditorPreview").css("top", "5px");
        }

        pixelEditor.inPanel = false;

        if (pixelEditor.repaintInterval)
            clearInterval(pixelEditor.repaintInterval);
        play.inField = false;
        pixelEditor.actionSteps = [];
        pixelEditor.redoSteps = [];

        if (world.Id == -1 && !Main.CheckNW())
        {
            $("#pixelEditorPalette").css("top", "5px");
            $("#pixelEditorCanvasContainer").css("top", "5px");
            $("#pixelEditorLayers").css("top", "5px");
            $("#pixelEditorPalette > span:first-child").hide();
            $("#pixelEditorPreview").css("top", "0px");
        }

        var color = PixelEditorColorChooser.ColorFromPosition();
        $("#pixelEditorFieldCurrentColor").val(color.toUpperCase());
        $("#pixelEditorColorPreview").css("backgroundColor", color);

        PixelEditor.LoadFromWork();

        if (framework.Preferences['PixelEditorBrushSize'])
            pixelEditor.brushSize = framework.Preferences['PixelEditorBrushSize'];
        if (framework.Preferences['PixelEditorZoom'])
            pixelEditor.zoomFactor = framework.Preferences['PixelEditorZoom'];
        if (framework.Preferences['PixelEditorColor'])
        {
            $("#pixelEditorFieldCurrentColor").val(framework.Preferences['PixelEditorColor']);
            PixelEditorColorChooser.ChangeColorField();
        }
        else
            PixelEditorColorChooser.ChangeColorField();

        PixelEditor.BrushSize(0);
        PixelEditor.Zoom(0);

        PixelEditorLayers.UpdateLayers();
        PixelEditor.ResizeCanvas();
        pixelEditor.keys = [];

        pixelEditor.repaintInterval = setInterval(PixelEditor.RepaintCanvasInterval, 500);

        $(window).bind("keydown", PixelEditor.KeyDown);
        $(window).bind("keyup", PixelEditor.KeyUp);
    }

    static LoadFromWork()
    {
        if (!framework.CurrentUrl.file)
        {
            pixelEditor.currentSprite = { x: 0, y: 0, width: 100, height: 100, layers: [] };
            pixelEditor.currentImage = { file: null, sprites: [pixelEditor.currentSprite], type: "none" };
            pixelEditor.currentSprite.layers.push(PixelEditor.InitLayer(100, 100));
            pixelEditor.currentLayer = pixelEditor.currentSprite.layers[0];
            return;
        }

        if (Main.CheckNW())
        {
            var fs = require('fs');
            if (!fs.existsSync(framework.CurrentUrl.file.split('?')[0] + ".work"))
            {
                PixelEditor.LoadFromImage();
                return;
            }
            var data = fs.readFileSync(framework.CurrentUrl.file.split('?')[0] + ".work", "utf-8");
            pixelEditor.currentImage = PixelEditor.BuildWorkData(JSON.parse(data), () =>
            {
                pixelEditor.currentImage.file = PixelEditor.Filename(pixelEditor.currentImage.file);
                pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                PixelEditor.ResizeCanvas();
                PixelEditorLayers.UpdateLayers();
                PixelEditor.UpdateSprites();

                if (pixelEditor.currentImage.type == "tiles" || pixelEditor.currentImage.type == "skill")
                    $("#resizeButton").hide();
                else
                    $("#resizeButton").show();
            });
        }
        else
        {

            $.ajax({
                type: 'POST',
                url: '/backend/GetPixelPaint',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    file: framework.CurrentUrl.file.split('?')[0]
                },
                success: (msg) =>
                {
                    var data: GameImage = TryParse(msg);
                    if (!data)
                    {
                        PixelEditor.LoadFromImage();
                        return;
                    }

                    pixelEditor.currentImage = PixelEditor.BuildWorkData(data, () =>
                    {
                        pixelEditor.currentImage.file = PixelEditor.Filename(pixelEditor.currentImage.file);
                        pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                        pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                        PixelEditor.ResizeCanvas();
                        PixelEditorLayers.UpdateLayers();
                        PixelEditor.UpdateSprites();

                        if (pixelEditor.currentImage.type == "tiles" || pixelEditor.currentImage.type == "skill")
                            $("#resizeButton").hide();
                        else
                            $("#resizeButton").show();
                    });
                },
                error: function (msg, textStatus)
                {
                    PixelEditor.LoadFromImage();
                }
            });
        }
    }

    static LoadFromImage()
    {
        switch (framework.CurrentUrl.type)
        {
            case "inventory":
                pixelEditor.currentImage = {
                    file: PixelEditor.Filename(framework.CurrentUrl.file),
                    sprites: [],
                    type: framework.CurrentUrl.type
                };
                if (framework.CurrentUrl.file.indexOf("/art/") == 0)
                {
                    pixelEditor.currentImage.file = "inventory_" + ("" + framework.CurrentUrl.object).toLowerCase().replace(/ /g, "_") + ".png";
                    world.GetInventoryObject(framework.CurrentUrl.object).Image = pixelEditor.currentImage.file;
                }
                var img = new Image();
                img.src = framework.CurrentUrl.file;
                img.onload = () =>
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var fullData = ctx.getImageData(0, 0, img.width, img.height);
                    var frames = parseInt(framework.CurrentUrl.frames);
                    var w = img.width;
                    var h = img.height;
                    var layer = PixelEditor.InitLayer(w, h);
                    var sprite: ImageSprite = { width: w, height: h, x: 0, y: 0, layers: [layer] };
                    for (var x = 0; x < w; x++)
                    {
                        for (var y = 0; y < h; y++)
                        {
                            var s = (x + (y * img.width)) * 4;
                            layer.pixels[x][y].r = fullData.data[s + 0];
                            layer.pixels[x][y].g = fullData.data[s + 1];
                            layer.pixels[x][y].b = fullData.data[s + 2];
                            layer.pixels[x][y].a = fullData.data[s + 3];
                        }
                    }
                    pixelEditor.currentImage.sprites.push(sprite);
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                };
                // The image doesn't exists yet, we need to create it
                img.onerror = () =>
                {
                    var w = 32;
                    var h = 32;
                    var layer = PixelEditor.InitLayer(w, h);
                    var sprite: ImageSprite = { width: w, height: h, x: 0, y: 0, layers: [PixelEditor.InitLayer(w, h)] };
                    pixelEditor.currentImage.sprites.push(sprite);
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                }
                pixelEditor.currentSprite = null;
                pixelEditor.currentLayer = null;
                break;
            case "skill":
                pixelEditor.currentImage = {
                    file: PixelEditor.Filename(framework.CurrentUrl.file),
                    sprites: [],
                    type: framework.CurrentUrl.type
                };
                if (framework.CurrentUrl.file.indexOf("/art/") == 0)
                {
                    pixelEditor.currentImage.file = "skill_" + ("" + framework.CurrentUrl.skill).toLowerCase().replace(/ /g, "_") + ".png";
                    world.GetSkill(framework.CurrentUrl.skill).Code.CodeVariables["icon"].value = pixelEditor.currentImage.file;
                }
                var img = new Image();
                img.src = framework.CurrentUrl.file;
                img.onload = () =>
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var fullData = ctx.getImageData(0, 0, img.width, img.height);
                    var frames = parseInt(framework.CurrentUrl.frames);
                    var w = img.width;
                    var h = img.height;
                    var layer = PixelEditor.InitLayer(w, h);
                    var sprite: ImageSprite = { width: w, height: h, x: 0, y: 0, layers: [layer] };
                    for (var x = 0; x < w; x++)
                    {
                        for (var y = 0; y < h; y++)
                        {
                            var s = (x + (y * img.width)) * 4;
                            layer.pixels[x][y].r = fullData.data[s + 0];
                            layer.pixels[x][y].g = fullData.data[s + 1];
                            layer.pixels[x][y].b = fullData.data[s + 2];
                            layer.pixels[x][y].a = fullData.data[s + 3];
                        }
                    }
                    pixelEditor.currentImage.sprites.push(sprite);
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                };
                // The image doesn't exists yet, we need to create it
                img.onerror = () =>
                {
                    var w = 32;
                    var h = 32;
                    var layer = PixelEditor.InitLayer(w, h);
                    var sprite: ImageSprite = { width: w, height: h, x: 0, y: 0, layers: [PixelEditor.InitLayer(w, h)] };
                    pixelEditor.currentImage.sprites.push(sprite);
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                }
                pixelEditor.currentSprite = null;
                pixelEditor.currentLayer = null;
                break;
            case "character":
                pixelEditor.currentImage = {
                    file: PixelEditor.Filename(framework.CurrentUrl.file),
                    sprites: [],
                    type: framework.CurrentUrl.type
                };
                var img = new Image();
                img.src = framework.CurrentUrl.file;
                img.onload = () =>
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var fullData = ctx.getImageData(0, 0, img.width, img.height);
                    var frames = parseInt(framework.CurrentUrl.frames);
                    var w = Math.floor(img.width / frames);
                    var h = Math.floor(img.height / 4);
                    for (var d = 0; d < 4; d++)
                    {
                        for (var f = 0; f < frames; f++)
                        {
                            var layer = PixelEditor.InitLayer(w, h);
                            var sprite: ImageSprite = { width: w, height: h, x: w * f, y: d * h, layers: [layer] };
                            for (var x = 0; x < w; x++)
                            {
                                for (var y = 0; y < h; y++)
                                {
                                    var s = ((x + w * f) + (y + d * h) * img.width) * 4;
                                    layer.pixels[x][y].r = fullData.data[s + 0];
                                    layer.pixels[x][y].g = fullData.data[s + 1];
                                    layer.pixels[x][y].b = fullData.data[s + 2];
                                    layer.pixels[x][y].a = fullData.data[s + 3];
                                }
                            }
                            pixelEditor.currentImage.sprites.push(sprite);
                        }
                    }
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                };
                // The image doesn't exists yet, we need to create it
                img.onerror = () =>
                {
                    var frames = parseInt(framework.CurrentUrl.frames);
                    var w = 64;
                    var h = 64;
                    for (var d = 0; d < 4; d++)
                    {
                        for (var f = 0; f < frames; f++)
                        {
                            var layer = PixelEditor.InitLayer(w, h);
                            var sprite: ImageSprite = { width: w, height: h, x: w * f, y: d * h, layers: [PixelEditor.InitLayer(w, h)] };
                            pixelEditor.currentImage.sprites.push(sprite);
                        }
                    }
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                }
                pixelEditor.currentSprite = null;
                pixelEditor.currentLayer = null;
                break;
            case "tiles":
                pixelEditor.currentImage =
                    {
                        file: PixelEditor.Filename(framework.CurrentUrl.file),
                        sprites: [],
                        type: framework.CurrentUrl.type
                    };
                var img = new Image();
                img.src = framework.CurrentUrl.file;
                img.onload = () =>
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var fullData = ctx.getImageData(0, 0, img.width, img.height);
                    var w = world.art.background.width;
                    var h = world.art.background.height;
                    var cols = Math.floor(img.width / w);
                    var rows = Math.floor(img.height / h);
                    for (var row = 0; row < rows; row++)
                    {
                        for (var col = 0; col < cols; col++)
                        {
                            var layer = PixelEditor.InitLayer(w, h);
                            var sprite: ImageSprite = { width: w, height: h, x: w * col, y: row * h, layers: [layer] };
                            var hasPixels = false;
                            for (var x = 0; x < w; x++)
                            {
                                for (var y = 0; y < h; y++)
                                {
                                    var s = ((x + w * col) + (y + row * h) * img.width) * 4;
                                    layer.pixels[x][y].r = fullData.data[s + 0];
                                    layer.pixels[x][y].g = fullData.data[s + 1];
                                    layer.pixels[x][y].b = fullData.data[s + 2];
                                    layer.pixels[x][y].a = fullData.data[s + 3];
                                    if (layer.pixels[x][y].a != 0)
                                        hasPixels = true;
                                }
                            }
                            if (hasPixels)
                                pixelEditor.currentImage.sprites.push(sprite);
                        }
                    }
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                };
                pixelEditor.currentSprite = null;
                pixelEditor.currentLayer = null;
                break;
            case "mapobject":
                pixelEditor.currentImage =
                    {
                        file: PixelEditor.Filename(framework.CurrentUrl.file),
                        sprites: [],
                        type: framework.CurrentUrl.type
                    };
                var img = new Image();
                img.src = framework.CurrentUrl.file;
                img.onload = () =>
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var fullData = ctx.getImageData(0, 0, img.width, img.height);

                    for (var item in world.art.objects)
                    {
                        var objInfo = world.art.objects[item];
                        if (objInfo.file.split('?')[0] == framework.CurrentUrl.file.split('?')[0])
                        {
                            var w = objInfo.width;
                            var h = objInfo.height;

                            var layer = PixelEditor.InitLayer(w, h);
                            var sprite: ImageSprite = { width: w, height: h, x: objInfo.x, y: objInfo.y, layers: [layer] };
                            var hasPixels = false;
                            for (var x = 0; x < w; x++)
                            {
                                for (var y = 0; y < h; y++)
                                {
                                    var s = ((x + objInfo.x) + (y + objInfo.y) * img.width) * 4;
                                    layer.pixels[x][y].r = fullData.data[s + 0];
                                    layer.pixels[x][y].g = fullData.data[s + 1];
                                    layer.pixels[x][y].b = fullData.data[s + 2];
                                    layer.pixels[x][y].a = fullData.data[s + 3];
                                }
                            }
                            pixelEditor.currentImage.sprites.push(sprite);
                        }
                    }

                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                };
                // Generate a new image
                img.onerror = () =>
                {
                    var w = 64;
                    var h = 64;
                    var sprite: ImageSprite = { width: w, height: h, x: 0, y: 0, layers: [PixelEditor.InitLayer(w, h)] };
                    pixelEditor.currentImage.sprites.push(sprite);
                    pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                    pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                    PixelEditor.ResizeCanvas();
                    PixelEditorLayers.UpdateLayers();
                    PixelEditor.UpdateSprites();
                }
                pixelEditor.currentSprite = null;
                pixelEditor.currentLayer = null;
                break;
            default:
                pixelEditor.currentSprite = { x: 0, y: 0, width: 100, height: 100, layers: [] };
                pixelEditor.currentImage = { file: null, sprites: [pixelEditor.currentSprite], type: "none" };
                pixelEditor.currentSprite.layers.push(PixelEditor.InitLayer(100, 100));
                pixelEditor.currentLayer = pixelEditor.currentSprite.layers[0];
                break;
        }

        if (pixelEditor.currentImage.type == "tiles" || pixelEditor.currentImage.type == "mapobject")
            $("#addFromFile").show();
        else
            $("#addFromFile").hide();

        if (pixelEditor.currentImage.type == "tiles" || pixelEditor.currentImage.type == "skill")
            $("#resizeButton").hide();
        else
            $("#resizeButton").show();
    }

    static RepaintCanvasInterval()
    {
        pixelEditor.selectionBlink = !pixelEditor.selectionBlink;
        PixelEditor.RepaintCanvas();
    }

    static InitLayer(w: number, h: number): SpriteLayer
    {
        if (pixelEditor.currentSprite)
            var nextId = pixelEditor.currentSprite.layers.length + 1;
        else
            var nextId = 1;
        var result: SpriteLayer = { pixels: [], name: "Layer " + (nextId) };
        for (var x = 0; x < w; x++)
        {
            result.pixels[x] = [];
            for (var y = 0; y < h; y++)
                result.pixels[x][y] = { r: 0, g: 0, b: 0, a: 0 };
        }
        return result;
    }

    static ResizeCanvas()
    {
        if (!pixelEditor.currentSprite)
            return;
        var canvas = (<HTMLCanvasElement>$("#pixelEditorCanvas").first());
        canvas.width = pixelEditor.currentSprite.width * pixelEditor.zoomFactor;
        canvas.height = pixelEditor.currentSprite.height * pixelEditor.zoomFactor;
        PixelEditor.RepaintCanvas();
    }

    static RepaintCanvas(repaintAllPreviews = false)
    {
        if (!pixelEditor.currentSprite)
            return;
        var ctx = (<HTMLCanvasElement>$("#pixelEditorCanvas").first()).getContext("2d");
        ctx.clearRect(0, 0, (pixelEditor.currentSprite.width + 1) * pixelEditor.zoomFactor, (pixelEditor.currentSprite.height + 1) * pixelEditor.zoomFactor);
        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
        {
            if (pixelEditor.currentSprite.layers[i].hide !== true)
                PixelEditorLayers.PaintLayer(ctx, pixelEditor.currentSprite.width, pixelEditor.currentSprite.height, pixelEditor.currentSprite.layers[i], pixelEditor.zoomFactor);
            if (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer || repaintAllPreviews == true)
            {
                var canvas = (<HTMLCanvasElement>$("#canvas_layer_" + i).first());
                if (canvas)
                {
                    var ctx2 = canvas.getContext("2d");
                    ctx2.clearRect(0, 0, 100, 100);
                    PixelEditorLayers.PaintLayer(ctx2, pixelEditor.currentSprite.width, pixelEditor.currentSprite.height, pixelEditor.currentSprite.layers[i], 1);
                }
            }
        }

        if (pixelEditor.zoomFactor > 3)
        {
            ctx.beginPath();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#E0E0E0";
            for (var x = 0; x < pixelEditor.currentSprite.width; x++)
            {
                ctx.moveTo(x * pixelEditor.zoomFactor + 0.5, 0);
                ctx.lineTo(x * pixelEditor.zoomFactor + 0.5, (pixelEditor.currentSprite.height + 1) * pixelEditor.zoomFactor);
            }
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                ctx.moveTo(0, y * pixelEditor.zoomFactor + 0.5);
                ctx.lineTo((pixelEditor.currentSprite.width + 1) * pixelEditor.zoomFactor, y * pixelEditor.zoomFactor + 0.5);
            }
            ctx.stroke();
        }

        if (pixelEditor.selection && pixelEditor.selectionActive)
        {
            ctx.beginPath();
            ctx.globalAlpha = 1;
            if (pixelEditor.selectionBlink)
                ctx.strokeStyle = "#FFFFFF";
            else
                ctx.strokeStyle = "#000000";
            for (var x = 0; x < pixelEditor.currentSprite.width; x++)
            {
                var found = false;
                for (var y = 0; y < pixelEditor.currentSprite.height; y++)
                {
                    if (pixelEditor.selection[x][y] === true && found === false)
                    {
                        ctx.moveTo(x * pixelEditor.zoomFactor, y * pixelEditor.zoomFactor + 0.5);
                        ctx.lineTo((x + 1) * pixelEditor.zoomFactor, y * pixelEditor.zoomFactor + 0.5);
                        found = true;
                    }
                    else if (pixelEditor.selection[x][y] === false && found === true)
                    {
                        ctx.moveTo(x * pixelEditor.zoomFactor, y * pixelEditor.zoomFactor + 0.5);
                        ctx.lineTo((x + 1) * pixelEditor.zoomFactor, y * pixelEditor.zoomFactor + 0.5);
                        found = false;
                    }
                }
            }

            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                var found = false;
                for (var x = 0; x < pixelEditor.currentSprite.width; x++)
                {
                    if (pixelEditor.selection[x][y] === true && found === false)
                    {
                        ctx.moveTo(x * pixelEditor.zoomFactor + 0.5, y * pixelEditor.zoomFactor);
                        ctx.lineTo(x * pixelEditor.zoomFactor + 0.5, (y + 1) * pixelEditor.zoomFactor);
                        found = true;
                    }
                    else if (pixelEditor.selection[x][y] === false && found === true)
                    {
                        ctx.moveTo(x * pixelEditor.zoomFactor + 0.5, y * pixelEditor.zoomFactor);
                        ctx.lineTo(x * pixelEditor.zoomFactor + 0.5, (y + 1) * pixelEditor.zoomFactor);
                        found = false;
                    }
                }
            }
            ctx.setLineDash([]);
            ctx.stroke();
            if (pixelEditor.selectionBlink)
                ctx.strokeStyle = "#000000";
            else
                ctx.strokeStyle = "#FFFFFF";
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        PixelEditor.UpdateCurrentSpritePreview();
    }

    static UpdateAllSpritePreview()
    {
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            PixelEditor.UpdateSpritePreview(i);
    }

    static UpdateCurrentSpritePreview()
    {
        if (!pixelEditor.currentImage)
            return;
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            if (pixelEditor.currentImage.sprites[i] == pixelEditor.currentSprite)
            {
                PixelEditor.UpdateSpritePreview(i);
                return;
            }
        }
    }

    static UpdateSpritePreview(id: number)
    {
        var sprite = pixelEditor.currentImage.sprites[id];
        var canvas = (<HTMLCanvasElement>$("#canvas_sprite_" + id).first());
        if (!canvas)
            return;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);
        for (var i = 0; i < sprite.layers.length; i++)
            PixelEditorLayers.PaintLayer(ctx, sprite.width, sprite.height, sprite.layers[i], 1);
    }

    static CanvasMouseDown(evt: MouseEvent)
    {
        if (pixelEditor.inPanel)
            return;
        if (pixelEditor.noActionSteps.indexOf(pixelEditor.currentAction) == -1)
            PixelEditor.StoreBeforeActionStep();
        $(window.document).bind("mousemove", PixelEditor.CanvasMouseMove);
        $(window.document).bind("mouseup", PixelEditor.CanvasMouseUp);
        pixelEditor.currentButton = evt.buttons;
        pixelEditor.lastX = null;
        pixelEditor.lastY = null;
        var pos = $("#pixelEditorCanvas").position();
        var x = evt.pageX - 1 - pos.left + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollLeft;
        var y = evt.pageY - 1 - pos.top + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollTop;
        x = Math.floor(x / pixelEditor.zoomFactor);
        y = Math.floor(y / pixelEditor.zoomFactor);
        if (PixelEditorActions["MouseDown" + pixelEditor.currentAction])
            PixelEditorActions["MouseDown" + pixelEditor.currentAction](pixelEditor.currentButton, x, y);
        PixelEditor.CanvasMouseMove(evt);
        return false;
    }

    static CanvasMouseMove(evt: MouseEvent)
    {
        if (pixelEditor.inPanel)
            return;
        var pos = $("#pixelEditorCanvas").position();
        var x = evt.pageX - 1 - pos.left + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollLeft;
        var y = evt.pageY - 1 - pos.top + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollTop;

        x = Math.floor(x / pixelEditor.zoomFactor);
        y = Math.floor(y / pixelEditor.zoomFactor);

        if (x >= 0 && x < pixelEditor.currentSprite.width && y >= 0 && y < pixelEditor.currentSprite.height)
        {
            var p = ColorHandling.HexToRgb($("#pixelEditorFieldCurrentColor").val());

            if (pixelEditor.lastX === null || pixelEditor.smoothedActions.indexOf(pixelEditor.currentAction) == -1)
                PixelEditorActions["Action" + pixelEditor.currentAction](pixelEditor.currentButton, x, y, { r: p.r, g: p.g, b: p.b, a: 255 });
            else
            {
                var a = x - pixelEditor.lastX;
                var b = y - pixelEditor.lastY;
                var l = Math.ceil(Math.sqrt(a * a + b * b));
                if (l == 0)
                    PixelEditorActions["Action" + pixelEditor.currentAction](pixelEditor.currentButton, x, y, { r: p.r, g: p.g, b: p.b, a: 255 });
                else for (var i = 0; i <= l; i++)
                {
                    var xa = Math.round(pixelEditor.lastX + a * i / l);
                    var ya = Math.round(pixelEditor.lastY + b * i / l);
                    PixelEditorActions["Action" + pixelEditor.currentAction](pixelEditor.currentButton, xa, ya, { r: p.r, g: p.g, b: p.b, a: 255 });
                }
            }
            pixelEditor.lastX = x;
            pixelEditor.lastY = y;
            PixelEditor.RepaintCanvas();
        }
        else if (pixelEditor.smoothedActions.indexOf(pixelEditor.currentAction) != -1)
        {
            pixelEditor.lastX = null;
            pixelEditor.lastY = null;
        }
        return false;
    }

    static PixelCompare(p1: Pixel, p2: Pixel): boolean
    {
        if (p1.a == 0 && p2.a == 0)
            return true;
        if (p1.r == p2.r && p1.g == p2.g && p1.b == p2.b && p1.a == p2.a)
            return true;
        return false;
    }

    static ClearSelection()
    {
        if (pixelEditor.inPanel)
            return;
        pixelEditor.selection = [];
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            pixelEditor.selection[x] = [];
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
                pixelEditor.selection[x][y] = false;
        }
        pixelEditor.selectionActive = false;

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;
    }

    static SetPixel(x: number, y: number, p: Pixel)
    {
        if (x >= 0 && x < pixelEditor.currentSprite.width && y >= 0 && y < pixelEditor.currentSprite.height)
        {
            if (!pixelEditor.selectionActive || pixelEditor.selection[x][y] !== false)
                pixelEditor.currentLayer.pixels[x][y] = { r: p.r, g: p.g, b: p.b, a: p.a };
        }
    }

    static ErasePixel(x: number, y: number, p: Pixel)
    {
        if (x >= 0 && x < pixelEditor.currentSprite.width && y >= 0 && y < pixelEditor.currentSprite.height)
        {
            if (!pixelEditor.selectionActive || pixelEditor.selection[x][y] !== false)
                pixelEditor.currentLayer.pixels[x][y] = { r: p.r, g: p.g, b: p.b, a: 0 };
        }
    }

    static CanvasMouseUp(evt: MouseEvent)
    {
        if (pixelEditor.inPanel)
            return;
        if (pixelEditor.noActionSteps.indexOf(pixelEditor.currentAction) == -1)
            PixelEditor.StoreAfterActionStep();

        $(window.document).unbind("mousemove", PixelEditor.CanvasMouseMove);
        $(window.document).unbind("mouseup", PixelEditor.CanvasMouseUp);

        var pos = $("#pixelEditorCanvas").position();
        var x = evt.pageX - 1 - pos.left + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollLeft;
        var y = evt.pageY - 1 - pos.top + (<HTMLDivElement>$("#pixelEditorCanvasContainer").first()).scrollTop;

        x = Math.floor(x / pixelEditor.zoomFactor);
        y = Math.floor(y / pixelEditor.zoomFactor);

        if (x >= 0 && x < pixelEditor.currentSprite.width && y >= 0 && y < pixelEditor.currentSprite.height)
        {
            if (PixelEditorActions["Stop" + pixelEditor.currentAction])
                PixelEditorActions["Stop" + pixelEditor.currentAction](pixelEditor.currentButton, x, y);
        }
        return false;
    }

    static Zoom(factor: number)
    {
        pixelEditor.zoomFactor += factor * Math.max(1, Math.ceil(Math.log(pixelEditor.zoomFactor)));
        if (pixelEditor.zoomFactor < 1)
            pixelEditor.zoomFactor = 1;
        if (pixelEditor.zoomFactor > 29)
            pixelEditor.zoomFactor = 29;
        $("#pixelEditorCurrentZoom").html("" + pixelEditor.zoomFactor + "x");
        framework.Preferences['PixelEditorZoom'] = pixelEditor.zoomFactor;
        Framework.SavePreferences();
        PixelEditor.ResizeCanvas();
    }

    static BrushSize(factor: number)
    {
        pixelEditor.brushSize += factor;
        if (pixelEditor.brushSize < 1)
            pixelEditor.brushSize = 1;
        if (pixelEditor.brushSize > 30)
            pixelEditor.brushSize = 30;
        $("#pixelEditorCurrentBrushSize").html("" + pixelEditor.brushSize);
        framework.Preferences['PixelEditorBrushSize'] = pixelEditor.brushSize;
        Framework.SavePreferences();
        PixelEditor.ResizeCanvas();
    }

    static UpdateSprites()
    {
        if (!pixelEditor.currentSprite)
        {
            $("#pixelEditorSpriteList").html("");
            return;
        }

        var html = "";
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            html += "<div" + (pixelEditor.currentImage.sprites[i] == pixelEditor.currentSprite ? " class='selectedPixelEditorLayer'" : "") + " id='sprite_" + i + "' onclick='PixelEditor.SelectSprite(" + i + ")' unselectable='on' onselectstart='return false;'>";
            html += "<canvas id='canvas_sprite_" + i + "' width='64' height='64'></canvas></div>";
        }
        if (pixelEditor.currentImage.type == "tiles" || pixelEditor.currentImage.type == "mapobject")
        {
            html += "<div class='pixelEditorNewSprite' onclick='PixelEditor.NewSprite()'>+</div>";
        }
        $("#pixelEditorSpriteList").html(html);
        PixelEditor.UpdateAllSpritePreview();
    }

    static CurrentSpriteId()
    {
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            if (pixelEditor.currentImage.sprites[i] == pixelEditor.currentSprite)
                return i;
        return -1;
    }

    static StoreBeforeActionStep()
    {
        pixelEditor.redoSteps = [];
        pixelEditor.actionSteps.push({
            layerId: PixelEditorLayers.CurrentLayerId(),
            spriteId: PixelEditor.CurrentSpriteId(),
            after: null,
            before: PixelEditor.ImageFromDataUrl(PixelEditor.BuildImageFromLayer(pixelEditor.currentLayer, pixelEditor.currentSprite.width, pixelEditor.currentSprite.height))
        });
        pixelEditor.lastStep = pixelEditor.actionSteps[pixelEditor.actionSteps.length - 1];
    }

    static StoreAfterActionStep()
    {
        if (pixelEditor.lastStep == pixelEditor.actionSteps[pixelEditor.actionSteps.length - 1])
            pixelEditor.actionSteps[pixelEditor.actionSteps.length - 1].after = PixelEditor.ImageFromDataUrl(PixelEditor.BuildImageFromLayer(pixelEditor.currentLayer, pixelEditor.currentSprite.width, pixelEditor.currentSprite.height));
    }

    static ClearActionSteps()
    {
        pixelEditor.actionSteps = [];
        pixelEditor.redoSteps = [];
    }

    static SelectSprite(id: number)
    {
        if (pixelEditor.inPanel)
            return;

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;

        pixelEditor.currentSprite = pixelEditor.currentImage.sprites[id];
        pixelEditor.currentLayer = pixelEditor.currentSprite.layers[0];
        PixelEditor.ResizeCanvas();
        PixelEditorLayers.UpdateLayers();

        $("#pixelEditorSpriteList > div").removeClass("selectedPixelEditorLayer");
        $("#sprite_" + id).addClass("selectedPixelEditorLayer");
    }

    static NewSprite()
    {
        if (pixelEditor.inPanel)
            return;
        if (!pixelEditor.currentImage)
            return;
        if (pixelEditor.currentImage.type == "tiles")
        {
            PixelEditor.ClearActionSteps();
            var mx = 0;
            var my = 0;

            for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            {
                my = Math.max(pixelEditor.currentImage.sprites[i].y, my);
            }

            for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            {
                if (pixelEditor.currentImage.sprites[i].y == my)
                    mx = Math.max(pixelEditor.currentImage.sprites[i].x, mx);
            }

            mx += world.art.background.width

            if (mx >= world.art.background.nbColumns * world.art.background.width)
            {
                my += world.art.background.height;
                mx = 0;
            }


            var sprite: ImageSprite = {
                width: world.art.background.width,
                height: world.art.background.height,
                x: mx,
                y: my,
                layers: [PixelEditor.InitLayer(world.art.background.width, world.art.background.height)]
            };
            pixelEditor.currentImage.sprites.push(sprite);
            PixelEditor.UpdateSprites();
            PixelEditor.SelectSprite(pixelEditor.currentImage.sprites.length - 1);
        }
        else if (pixelEditor.currentImage.type == "mapobject")
        {
            PixelEditor.NewMapObject();
        }
    }

    static NewMapObject(proposedName: string = null)
    {
        if (!proposedName)
        {
            var nextId = 1;
            while (world.art.objects["object_" + nextId])
                nextId++;
            proposedName = "object_" + nextId;
        }
        Framework.Prompt("Name of the map object to add", proposedName, (newName) =>
        {
            if (newName.match(databaseNameRule) || !newName || newName.length < 1 || world.art.objects[newName])
            {
                Framework.Alert("This name is not valid or is already used.", () =>
                {
                    PixelEditor.NewMapObject(newName);
                });
                return;
            }

            PixelEditor.ClearActionSteps();
            world.art.objects[newName] = {
                x: 0,
                y: 100000,
                width: world.art.background.width,
                height: world.art.background.height,
                file: pixelEditor.currentImage.file,
                groundX: Math.floor(world.art.background.width / 2),
                groundY: Math.floor(world.art.background.height / 2)
            };
            var sprite: ImageSprite = {
                width: world.art.background.width,
                height: world.art.background.height,
                x: 0,
                y: 100000,
                layers: [PixelEditor.InitLayer(world.art.background.width, world.art.background.height)]
            };
            pixelEditor.currentImage.sprites.push(sprite);
            var oldImage = PixelEditor.BuildSaveData(pixelEditor.currentImage);
            PixelEditor.UpdateSprites();
            PixelEditor.SelectSprite(pixelEditor.currentImage.sprites.length - 1);
            PixelEditorActions.RepackMapObjects(oldImage);
            SearchPanel.Update();
        });
    }

    static BuildWorkData(source: GameImage, callbackWhenLoaded: () => void): GameImage
    {
        var result: GameImage = JSON.parse(JSON.stringify(source));

        var nbToDo = 0;
        for (var i = 0; i < result.sprites.length; i++)
        {
            for (var j = 0; j < result.sprites[i].layers.length; j++)
            {
                if (!result.sprites[i].layers[j].png)
                    continue;
                nbToDo++;
            }
        }

        var a = () =>
        {
            nbToDo--;
            if (nbToDo <= 0)
                callbackWhenLoaded();
        }

        for (var i = 0; i < result.sprites.length; i++)
        {
            for (var j = 0; j < result.sprites[i].layers.length; j++)
            {
                if (!result.sprites[i].layers[j].png)
                    continue;
                result.sprites[i].layers[j].pixels = PixelEditor.BuildPixelsFromImage(result.sprites[i].layers[j].png, a);
                delete result.sprites[i].layers[j].png;
            }
        }
        return result;
    }

    static BuildSaveData(source: GameImage): GameImage
    {
        var result: GameImage = JSON.parse(JSON.stringify(source));
        for (var i = 0; i < result.sprites.length; i++)
        {
            for (var j = 0; j < result.sprites[i].layers.length; j++)
            {
                if (!result.sprites[i].layers[j].pixels)
                    continue;
                result.sprites[i].layers[j].png = PixelEditor.BuildImageFromLayer(result.sprites[i].layers[j], result.sprites[i].width, result.sprites[i].height);
                delete result.sprites[i].layers[j].pixels;
            }
        }
        return result;
    }

    static Filename(source: string, forceCut: boolean = false): string
    {
        if (Main.CheckNW() && forceCut !== true)
            return source.split('?')[0];
        else
            return source.match(/[^\\\/]*$/)[0].split('?')[0];
    }

    static SameImageAs()
    {
        $("#fileSaveDialog").unbind("change", PixelEditor.SameImageAs);
        pixelEditor.currentImage.file = $("#fileSaveDialog").val();
        $("#fileSaveDialog").val("");
        PixelEditor.Save();
    }

    static Save()
    {
        if (Main.CheckNW())
        {
            var fs = require('fs');
            var filename = pixelEditor.currentImage.file.split('?')[0];
            if (filename.substr(0, 5) == "/art/" || (filename.indexOf("/") == -1 && filename.lastIndexOf("\\") == -1))
            {
                $("#fileSaveDialog").prop("accept", ".png");
                $("#fileSaveDialog").unbind("change");
                $("#fileSaveDialog").prop("nwsaveas", PixelEditor.Filename(filename, true));
                $("#fileSaveDialog").val("").bind("change", PixelEditor.SameImageAs).first().click();
                return;
            }
            else
            {
                fs.writeFileSync(filename, Main.Base64decode(PixelEditor.BuildImage().split(',')[1]));
                fs.writeFileSync(filename + ".work", JSON.stringify(PixelEditor.BuildSaveData(pixelEditor.currentImage)));
                filename += "?v=" + Math.round((new Date()).getTime() / 1000);
                PixelEditor.FinishSave(PixelEditor.Filename(filename, true), filename);
            }
        }
        else
        {
            pixelEditor.currentImage.file = PixelEditor.Filename(pixelEditor.currentImage.file);

            $.ajax({
                type: 'POST',
                url: '/upload/SavePixelArt',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    file: pixelEditor.currentImage.file,
                    data: PixelEditor.BuildImage(),
                    workData: JSON.stringify(PixelEditor.BuildSaveData(pixelEditor.currentImage))
                },
                success: (msg) =>
                {
                    var data = TryParse(msg);
                    if (data.file)
                    {
                        var filename = PixelEditor.Filename(data.file);
                        var newName = data.file + "?v=" + Math.round((new Date()).getTime() / 1000);
                        PixelEditor.FinishSave(PixelEditor.Filename(filename, true), newName);
                    }
                    else
                        Framework.ShowMessage("Error while saving...");
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    if (data.error)
                        Framework.ShowMessage("Error: " + data.error);
                    else
                        Framework.ShowMessage("Error: " + msg);
                }
            });
        }
    }

    static FinishSave(filename: string, newName: string)
    {
        switch (pixelEditor.currentImage.type)
        {
            case "inventory":
                for (var i = 0; i < world.InventoryObjects.length; i++)
                {
                    if (PixelEditor.Filename(world.InventoryObjects[i].Image, true) == filename)
                        world.InventoryObjects[i].Image = newName;
                }
                break;
            case "skill":
                for (var i = 0; i < world.Skills.length; i++)
                {
                    if (PixelEditor.Filename(world.Skills[i].Code.CodeVariables["icon"].value, true) == filename)
                        world.Skills[i].Code.CodeVariables["icon"].value = newName;
                }
                break;
            case "character":
                for (var item in world.art.characters)
                    if (PixelEditor.Filename(world.art.characters[item].file, true) == filename)
                        world.art.characters[item].file = newName;
                break;
            case "tiles":
                world.art.background.file = newName;
                var my = 0;
                for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
                    my = Math.max(pixelEditor.currentImage.sprites[i].y + world.art.background.height, my);
                world.art.background.lastTile = Math.floor(my / world.art.background.height) * world.art.background.nbColumns;
                break;
            case "mapobject":
                for (var item in world.art.objects)
                    if (PixelEditor.Filename(world.art.objects[item].file, true) == filename)
                        world.art.objects[item].file = newName;
            default:
                break;
        }
        Framework.SetLocation({
            action: "PixelEditor", file: newName
        }, false);

        Framework.ShowMessage("The image has been saved correctly. World saving now...");
        world.Save();
    }

    static BuildPixelsFromImage(imageData: string, callbackWhenLoaded: () => void): Pixel[][]
    {
        var img = new Image();
        img.src = imageData;
        var result: Pixel[][] = [];
        img.onload = () =>
        {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var imgData = ctx.getImageData(0, 0, img.width, img.height);

            for (var x = 0; x < img.width; x++)
            {
                result[x] = [];
                for (var y = 0; y < img.height; y++)
                {
                    var p = (x + y * img.width) * 4;
                    result[x][y] = {
                        r: imgData.data[p + 0],
                        g: imgData.data[p + 1],
                        b: imgData.data[p + 2],
                        a: imgData.data[p + 3]
                    };
                }
            }
            callbackWhenLoaded();
        }
        return result;
    }

    static ImageFromDataUrl(data: string): HTMLImageElement
    {
        var img = new Image();
        img.src = data;
        return img;
    }

    static BuildImageFromLayer(layer: SpriteLayer, width: number, height: number)
    {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");

        PixelEditorLayers.PaintLayer(ctx, width, height, layer, 1);
        return canvas.toDataURL();
    }

    static BuildLayerFromImage(image: HTMLImageElement): SpriteLayer
    {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        var imgData = ctx.getImageData(0, 0, image.width, image.height);

        var layer = PixelEditor.InitLayer(image.width, image.height);
        for (var x = 0; x < image.width; x++)
        {
            for (var y = 0; y < image.height; y++)
            {
                layer.pixels[x][y] = {
                    r: imgData.data[(x + y * image.width) * 4 + 0],
                    g: imgData.data[(x + y * image.width) * 4 + 1],
                    b: imgData.data[(x + y * image.width) * 4 + 2],
                    a: imgData.data[(x + y * image.width) * 4 + 3]
                }
            }
        }
        return layer;
    }


    static BuildImage()
    {
        var width = 0;
        var height = 0;

        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            width = Math.max(width, pixelEditor.currentImage.sprites[i].x + pixelEditor.currentImage.sprites[i].width);
            height = Math.max(height, pixelEditor.currentImage.sprites[i].y + pixelEditor.currentImage.sprites[i].height);
        }

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");

        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            for (var j = 0; j < pixelEditor.currentImage.sprites[i].layers.length; j++)
                PixelEditorLayers.PaintLayer(ctx, pixelEditor.currentImage.sprites[i].width, pixelEditor.currentImage.sprites[i].height, pixelEditor.currentImage.sprites[i].layers[j], 1, pixelEditor.currentImage.sprites[i].x, pixelEditor.currentImage.sprites[i].y);

        return canvas.toDataURL();
    }

    public static KeyDown(evt: KeyboardEvent)
    {
        if (play.inField)
            return;
        if (pixelEditor.inPanel)
            return;
        //console.log(evt.keyCode);
        pixelEditor.keys[evt.keyCode] = true;

        switch (evt.keyCode)
        {
            case 48:
                PixelEditorColorChooser.ChooseShade(9);
                evt.cancelBubble = true;
                break;
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                PixelEditorColorChooser.ChooseShade(evt.keyCode - 49);
                evt.cancelBubble = true;
                break;
            case 80: // P for paint
                PixelEditorActions.SelectAction('BlockPaint');
                evt.cancelBubble = true;
                break;
            case 90: // Z (Ctrl+Z for undo)
                if (pixelEditor.keys[17] === true)
                {
                    pixelEditor.keys[17] = false;
                    PixelEditorActions.Undo();
                    evt.cancelBubble = true;
                    pixelEditor.keys[17] = true;
                }
                break;
            case 89: // Y (Ctrl+Y for redo)
                if (pixelEditor.keys[17] === true)
                {
                    pixelEditor.keys[17] = false;
                    PixelEditorActions.Redo();
                    evt.cancelBubble = true;
                    pixelEditor.keys[17] = true;
                }
                break;
            case 69: // E for erase
                PixelEditorActions.SelectAction('Eraser');
                evt.cancelBubble = true;
                break;
            case 67: // c for color picker
                PixelEditorActions.SelectAction('Picker');
                evt.cancelBubble = true;
                break;
            case 87: // w for magic wand
                PixelEditorActions.SelectAction('MagicWand');
                evt.cancelBubble = true;
                break;
            // Page up
            case 33:
                var id = PixelEditor.CurrentSpriteId() - 1;
                if (id < 0)
                    id += pixelEditor.currentImage.sprites.length;
                PixelEditor.SelectSprite(id);
                evt.cancelBubble = true;
                break;
            // Page down
            case 34:
                var id = PixelEditor.CurrentSpriteId() + 1;
                if (id >= pixelEditor.currentImage.sprites.length)
                    id -= pixelEditor.currentImage.sprites.length;
                PixelEditor.SelectSprite(id);
                break;
            // Up
            case 38:
                PixelEditor.StoreBeforeActionStep();
                PixelEditorActions.Translate(0, -1);
                PixelEditor.StoreAfterActionStep();
                evt.cancelBubble = true;
                break;
            // Left
            case 37:
                PixelEditor.StoreBeforeActionStep();
                PixelEditorActions.Translate(-1, 0);
                PixelEditor.StoreAfterActionStep();
                evt.cancelBubble = true;
                break;
            // Right
            case 39:
                PixelEditor.StoreBeforeActionStep();
                PixelEditorActions.Translate(1, 0);
                PixelEditor.StoreAfterActionStep();
                evt.cancelBubble = true;
                break;
            // Down
            case 40:
                PixelEditor.StoreBeforeActionStep();
                PixelEditorActions.Translate(0, 1);
                PixelEditor.StoreAfterActionStep();
                evt.cancelBubble = true;
                break;
            case 27:
                PixelEditor.ClearSelection();
                break;
        }

        if (evt.cancelBubble == true)
        {
            if (evt.preventDefault)
                evt.preventDefault();
            return false;
        }
    }

    public static KeyUp(evt: KeyboardEvent)
    {
        if (play.inField)
            return;
        pixelEditor.keys[evt.keyCode] = false;
    }

    static Preview()
    {
        $("#pixelEditorPreview").show();
        (<HTMLImageElement>$("#pixelEditorPreviewImage").first()).src = PixelEditor.BuildImage();
    }

    static Export()
    {
        var data = btoa(JSON.stringify(PixelEditor.BuildSaveData(pixelEditor.currentImage)));

        try
        {
            var ua = navigator.userAgent.toLowerCase();
            var fname = PixelEditor.Filename(pixelEditor.currentImage.file).replace(/\.[a-z]+$/i, "");
            if (ua.indexOf('chrome') != -1)
            {
                var link = <any>document.createElement('a');
                link.download = fname + ".dwmi";
                link.href = "data:application/binary;filename=" + fname + ".dwmi;base64," + btoa(data);
                link.click();
            }
            else
                document.location.href = "data:application/binary;filename=" + fname + ".dwmi;base64," + btoa(data);
        }
        catch (ex)
        {
            Framework.Alert("ERROR: Was not able to produce the export.");
        }
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".dwmi");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", PixelEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
    }

    static ImportFileImage()
    {
        var fs = require('fs');
        var data = fs.readFileSync($("#fileOpenDialog").val(), "utf-8");

        $("#fileOpenDialog").unbind("change", PixelEditor.ImportFileImage).val("");

        pixelEditor.currentImage = PixelEditor.BuildWorkData(JSON.parse(Main.Base64decode(data)), () =>
        {
            pixelEditor.currentImage.file = PixelEditor.Filename(pixelEditor.currentImage.file);
            pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
            pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
            PixelEditor.ResizeCanvas();
            PixelEditorLayers.UpdateLayers();
            PixelEditor.UpdateSprites();
        });

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
        else if (data.file && data.data)
        {
            pixelEditor.currentImage = PixelEditor.BuildWorkData(JSON.parse(atob(data.data)), () =>
            {
                pixelEditor.currentImage.file = PixelEditor.Filename(pixelEditor.currentImage.file);
                pixelEditor.currentSprite = pixelEditor.currentImage.sprites[0];
                pixelEditor.currentLayer = pixelEditor.currentImage.sprites[0].layers[0];
                PixelEditor.ResizeCanvas();
                PixelEditorLayers.UpdateLayers();
                PixelEditor.UpdateSprites();
            });
        }
    }

    static ShowAddImage()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".jpg,.jpeg,.png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", PixelEditor.AddImage).first().click();
        }
        else
            $("#addImageFromFile").show();
    }

    static CancelAddImage()
    {
        $("#addImageFromFile").hide();
    }

    static AddImage()
    {
        var reader = new FileReader();
        reader.onload = function (event: any)
        {
            var canvas = <HTMLCanvasElement>document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.onload = function ()
            {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var data = ctx.getImageData(0, 0, img.width, img.height);

                if (pixelEditor.currentImage.type == "tiles")
                {
                    PixelEditor.ClearActionSteps();
                    var mx = 0;
                    var my = 0;

                    for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
                    {
                        my = Math.max(pixelEditor.currentImage.sprites[i].y, my);
                    }

                    for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
                    {
                        if (pixelEditor.currentImage.sprites[i].y == my)
                            mx = Math.max(pixelEditor.currentImage.sprites[i].x, mx);
                    }

                    mx += world.art.background.width

                    if (mx >= world.art.background.nbColumns * world.art.background.width)
                    {
                        my += world.art.background.height;
                        mx = 0;
                    }


                    var sprite: ImageSprite = {
                        width: world.art.background.width,
                        height: world.art.background.height,
                        x: mx,
                        y: my,
                        layers: [PixelEditor.InitLayer(world.art.background.width, world.art.background.height)]
                    };

                    for (var x = 0; x < sprite.width; x++)
                    {
                        for (var y = 0; y < sprite.height; y++)
                        {
                            sprite.layers[0].pixels[x][y].r = data.data[(x + y * img.width) * 4 + 0];
                            sprite.layers[0].pixels[x][y].g = data.data[(x + y * img.width) * 4 + 1];
                            sprite.layers[0].pixels[x][y].b = data.data[(x + y * img.width) * 4 + 2];
                            sprite.layers[0].pixels[x][y].a = data.data[(x + y * img.width) * 4 + 3];
                        }
                    }

                    pixelEditor.currentImage.sprites.push(sprite);
                    PixelEditor.UpdateSprites();
                    PixelEditor.SelectSprite(pixelEditor.currentImage.sprites.length - 1);
                }
                else if (pixelEditor.currentImage.type == "mapobject")
                {
                    var nextId = 1;
                    while (world.art.objects["object_" + nextId])
                        nextId++;
                    var proposedName = "object_" + nextId;
                    Framework.Prompt("Name of the map object to add", proposedName, (newName) =>
                    {
                        if (newName.match(databaseNameRule) || !newName || newName.length < 1 || world.art.objects[newName])
                        {
                            Framework.Alert("This name is not valid or is already used.");
                            return;
                        }

                        PixelEditor.ClearActionSteps();
                        world.art.objects[newName] = {
                            x: 0,
                            y: 100000,
                            width: img.width,
                            height: img.height,
                            file: pixelEditor.currentImage.file,
                            groundX: Math.floor(img.width / 2),
                            groundY: Math.floor(img.height / 2)
                        };
                        var sprite: ImageSprite = {
                            width: img.width,
                            height: img.height,
                            x: 0,
                            y: 100000,
                            layers: [PixelEditor.InitLayer(img.width, img.height)]
                        };
                        pixelEditor.currentImage.sprites.push(sprite);

                        for (var x = 0; x < sprite.width; x++)
                        {
                            for (var y = 0; y < sprite.height; y++)
                            {
                                sprite.layers[0].pixels[x][y].r = data.data[(x + y * img.width) * 4 + 0];
                                sprite.layers[0].pixels[x][y].g = data.data[(x + y * img.width) * 4 + 1];
                                sprite.layers[0].pixels[x][y].b = data.data[(x + y * img.width) * 4 + 2];
                                sprite.layers[0].pixels[x][y].a = data.data[(x + y * img.width) * 4 + 3];
                            }
                        }

                        var oldImage = PixelEditor.BuildSaveData(pixelEditor.currentImage);
                        PixelEditor.UpdateSprites();
                        PixelEditor.SelectSprite(pixelEditor.currentImage.sprites.length - 1);
                        PixelEditorActions.RepackMapObjects(oldImage);
                    });

                    //PixelEditor.NewMapObject();
                }
                $("#addImageFromFile").hide();
            }
            img.src = event.target.result;
        }
        if (Main.CheckNW())
            reader.readAsDataURL((<any>$("#fileOpenDialog").first()).files[0]);
        else
            reader.readAsDataURL((<any>$("#imageAddLoader").first()).files[0]);
    }
}