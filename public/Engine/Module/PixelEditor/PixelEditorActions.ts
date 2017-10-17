class PixelEditorActions
{
    static SelectAction(action: string)
    {
        if (pixelEditor.inPanel)
            return;
        $("#pixelEditorPalette > span").removeClass("selectedButton");
        $("#" + action).addClass("selectedButton");
        pixelEditor.currentAction = action;
        if (PixelEditorActions["SelectAction" + action])
            PixelEditorActions["SelectAction" + action]();
    }

    static ActionBlockPaint(mouseButton: number, x: number, y: number, color: Pixel)
    {
        // Right click color pick
        if (mouseButton == 2)
        {
            PixelEditorActions.ActionPicker(1, x, y, color);
            pixelEditor.actionSteps.pop();
            return;
        }

        // Alt + Click => Magic Wand
        if (pixelEditor.keys[18] === true)
        {
            pixelEditor.actionSteps.pop();
            PixelEditorActions.ActionMagicWand(1, x, y, color);
            return;
        }

        // Ctrl + Click => fill
        if (pixelEditor.keys[17] === true)
        {
            $(window.document).unbind("mousemove", PixelEditor.CanvasMouseMove);
            $(window.document).unbind("mouseup", PixelEditor.CanvasMouseUp);

            var layer = pixelEditor.currentLayer.pixels;
            var startColor = layer[x][y];
            var todo: { x: number, y: number }[] = [{ x: x, y: y }];
            var visited: { x: number, y: number }[] = [];

            var canVisit = (a: number, b: number) =>
            {
                for (var i = 0; i < todo.length; i++)
                    if (todo[i].x == a && todo[i].y == b)
                        return false;

                for (var i = 0; i < visited.length; i++)
                    if (visited[i].x == a && visited[i].y == b)
                        return false;

                return true;
            };

            var nb = 0;
            while (todo.length > 0 && nb < 10000)
            {
                nb++;
                var p = todo.pop();
                visited.push(p);

                PixelEditor.SetPixel(p.x, p.y, color);

                if (p.x > 0 && PixelEditor.PixelCompare(layer[p.x - 1][p.y], startColor) && canVisit(p.x - 1, p.y) && (!pixelEditor.selectionActive || pixelEditor.selection[p.x - 1][p.y] !== false))
                    todo.push({ x: p.x - 1, y: p.y });
                if (p.x < pixelEditor.currentSprite.width - 1 && PixelEditor.PixelCompare(layer[p.x + 1][p.y], startColor) && canVisit(p.x + 1, p.y) && (!pixelEditor.selectionActive || pixelEditor.selection[p.x + 1][p.y] !== false))
                    todo.push({ x: p.x + 1, y: p.y });
                if (p.y > 0 && PixelEditor.PixelCompare(layer[p.x][p.y - 1], startColor) && canVisit(p.x, p.y - 1) && (!pixelEditor.selectionActive || pixelEditor.selection[p.x][p.y - 1] !== false))
                    todo.push({ x: p.x, y: p.y - 1 });
                if (p.y < pixelEditor.currentSprite.height - 1 && PixelEditor.PixelCompare(layer[p.x][p.y + 1], startColor) && canVisit(p.x, p.y + 1) && (!pixelEditor.selectionActive || pixelEditor.selection[p.x][p.y + 1] !== false))
                    todo.push({ x: p.x, y: p.y + 1 });
            }
        }
        else
        {
            for (var a = -Math.floor(pixelEditor.brushSize / 2); a < Math.ceil(pixelEditor.brushSize / 2); a++)
                for (var b = -Math.floor(pixelEditor.brushSize / 2); b < Math.ceil(pixelEditor.brushSize / 2); b++)
                    PixelEditor.SetPixel(x + a, y + b, color);
        }
    }

    static ActionEraser(mouseButton: number, x: number, y: number, p: Pixel)
    {
        for (var a = -Math.floor(pixelEditor.brushSize / 2); a < Math.ceil(pixelEditor.brushSize / 2); a++)
            for (var b = -Math.floor(pixelEditor.brushSize / 2); b < Math.ceil(pixelEditor.brushSize / 2); b++)
                PixelEditor.ErasePixel(x + a, y + b, p);
    }

    static ActionPicker(mouseButton: number, x: number, y: number, currentColor: Pixel)
    {
        if (!(x >= 0 && x < pixelEditor.currentSprite.width && y >= 0 && y < pixelEditor.currentSprite.height))
            return;

        var result: Pixel = { r: 0, g: 0, b: 0, a: 0 };
        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
        {
            var p = pixelEditor.currentSprite.layers[i].pixels[x][y];
            if (p.a == 0)
                continue;
            if (p.a == 255)
                result = p;
        }
        $("#pixelEditorFieldCurrentColor").val(ColorHandling.RgbToHex(result.r, result.g, result.b));
        PixelEditorColorChooser.ChangeColorField();
    }

    static SelectActionMagicWand()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.ClearSelection();
        PixelEditor.RepaintCanvas();
    }

    static ActionMagicWand(mouseButton: number, x: number, y: number, currentColor: Pixel)
    {
        if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === true)
        {
            PixelEditor.StoreBeforeActionStep();
            PixelEditorActions.SelectAction("Translate");
            return;
        }

        $(window.document).unbind("mousemove", PixelEditor.CanvasMouseMove);
        $(window.document).unbind("mouseup", PixelEditor.CanvasMouseUp);

        var layer = pixelEditor.currentLayer.pixels;
        var startColor = layer[x][y];
        PixelEditor.ClearSelection();

        // Ctrl + Click
        if (pixelEditor.keys[17] === true)
        {
            for (var a = 0; a < pixelEditor.currentSprite.width; a++)
                for (var b = 0; b < pixelEditor.currentSprite.height; b++)
                    if (PixelEditor.PixelCompare(layer[a][b], startColor))
                        pixelEditor.selection[a][b] = true;
        }
        else
        {

            var todo: { x: number, y: number }[] = [{ x: x, y: y }];
            var visited: { x: number, y: number }[] = [];

            var canVisit = (a: number, b: number) =>
            {
                for (var i = 0; i < todo.length; i++)
                    if (todo[i].x == a && todo[i].y == b)
                        return false;

                for (var i = 0; i < visited.length; i++)
                    if (visited[i].x == a && visited[i].y == b)
                        return false;

                return true;
            };

            var nb = 0;
            while (todo.length > 0 && nb < 10000)
            {
                nb++;
                var p = todo.pop();
                //console.log("" + p.x + ", " + p.y);
                visited.push(p);
                pixelEditor.selection[p.x][p.y] = true;
                if (p.x > 0 && PixelEditor.PixelCompare(layer[p.x - 1][p.y], startColor) && canVisit(p.x - 1, p.y))
                    todo.push({ x: p.x - 1, y: p.y });
                if (p.x < pixelEditor.currentSprite.width - 1 && PixelEditor.PixelCompare(layer[p.x + 1][p.y], startColor) && canVisit(p.x + 1, p.y))
                    todo.push({ x: p.x + 1, y: p.y });
                if (p.y > 0 && PixelEditor.PixelCompare(layer[p.x][p.y - 1], startColor) && canVisit(p.x, p.y - 1))
                    todo.push({ x: p.x, y: p.y - 1 });
                if (p.y < pixelEditor.currentSprite.height - 1 && PixelEditor.PixelCompare(layer[p.x][p.y + 1], startColor) && canVisit(p.x, p.y + 1))
                    todo.push({ x: p.x, y: p.y + 1 });
            }
        }
        pixelEditor.selectionActive = true;
        PixelEditor.RepaintCanvas();
    }

    static ActionTranslate(mouseButton: number, x: number, y: number, currentColor: Pixel)
    {
        if (pixelEditor.lastX === null || pixelEditor.lastX === undefined)
            return;

        var a = x - pixelEditor.lastX;
        var b = y - pixelEditor.lastY;

        PixelEditorActions.Translate(a, b);
    }

    static Translate(x: number, y: number)
    {
        if (pixelEditor.inPanel)
            return;
        if (!pixelEditor.currentLayer)
            return;

        if (!pixelEditor.currentLayerOriginal || !pixelEditor.currentLayerSelection)
        {
            pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
            pixelEditor.currentLayerSelection = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

            for (var a = 0; a < pixelEditor.currentSprite.width; a++)
            {
                for (var b = 0; b < pixelEditor.currentSprite.height; b++)
                {
                    if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                        pixelEditor.currentLayerOriginal.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                    else
                        pixelEditor.currentLayerSelection.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                }
            }
        }

        var newLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayerSelection));
        var oldSelection = null;
        if (pixelEditor.selectionActive)
            oldSelection = JSON.parse(JSON.stringify(pixelEditor.selection));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                var dx = a + x;
                var dy = b + y;

                if (dx < 0)
                    dx += pixelEditor.currentSprite.width;
                if (dx >= pixelEditor.currentSprite.width)
                    dx -= pixelEditor.currentSprite.width;
                if (dy < 0)
                    dy += pixelEditor.currentSprite.height;
                if (dy >= pixelEditor.currentSprite.height)
                    dy -= pixelEditor.currentSprite.height;

                newLayer.pixels[dx][dy] = pixelEditor.currentLayerSelection.pixels[a][b];
                if (oldSelection)
                    pixelEditor.selection[dx][dy] = oldSelection[a][b];
            }
        }
        pixelEditor.currentLayerSelection = newLayer;


        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerOriginal.pixels[a][b];
                if (pixelEditor.currentLayerSelection.pixels[a][b].a == 0)
                    continue;
                else if (pixelEditor.currentLayerSelection.pixels[a][b].a == 255)
                    pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerSelection.pixels[a][b];
            }
        }
        PixelEditor.RepaintCanvas();
    }

    static FlipHorizontal(storeStep: boolean = true)
    {
        if (pixelEditor.inPanel)
            return;
        if (storeStep)
            PixelEditor.StoreBeforeActionStep();

        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
        pixelEditor.currentLayerSelection = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                    pixelEditor.currentLayerOriginal.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                else
                    pixelEditor.currentLayerSelection.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
            }
        }

        var origLayer: SpriteLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayerSelection));
        var oldSelection = null;
        if (pixelEditor.selectionActive)
            oldSelection = JSON.parse(JSON.stringify(pixelEditor.selection));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayerSelection.pixels[(pixelEditor.currentSprite.width - 1) - a][b] = origLayer.pixels[a][b];
                if (oldSelection)
                    pixelEditor.selection[(pixelEditor.currentSprite.width - 1) - a][b] = oldSelection[a][b];
            }
        }

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerOriginal.pixels[a][b];
                if (pixelEditor.currentLayerSelection.pixels[a][b].a == 0)
                    continue;
                else if (pixelEditor.currentLayerSelection.pixels[a][b].a == 255)
                    pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerSelection.pixels[a][b];
            }
        }

        if (storeStep)
            PixelEditor.StoreAfterActionStep();
        PixelEditor.RepaintCanvas();

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;
    }

    static FlipVertical(storeStep: boolean = true)
    {
        if (pixelEditor.inPanel)
            return;
        if (storeStep)
            PixelEditor.StoreBeforeActionStep();
        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
        pixelEditor.currentLayerSelection = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                    pixelEditor.currentLayerOriginal.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                else
                    pixelEditor.currentLayerSelection.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
            }
        }

        var origLayer: SpriteLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayerSelection));
        var oldSelection = null;
        if (pixelEditor.selectionActive)
            oldSelection = JSON.parse(JSON.stringify(pixelEditor.selection));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayerSelection.pixels[a][(pixelEditor.currentSprite.height - 1) - b] = origLayer.pixels[a][b];
                if (oldSelection)
                    pixelEditor.selection[a][(pixelEditor.currentSprite.height - 1) - b] = oldSelection[a][b];
            }
        }

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerOriginal.pixels[a][b];
                if (pixelEditor.currentLayerSelection.pixels[a][b].a == 0)
                    continue;
                else if (pixelEditor.currentLayerSelection.pixels[a][b].a == 255)
                    pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerSelection.pixels[a][b];
            }
        }
        if (storeStep)
            PixelEditor.StoreAfterActionStep();
        PixelEditor.RepaintCanvas();

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;
    }

    static RotateClockwise()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.StoreBeforeActionStep();
        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
        pixelEditor.currentLayerSelection = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                    pixelEditor.currentLayerOriginal.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                else
                    pixelEditor.currentLayerSelection.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
            }
        }

        var origLayer: SpriteLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayerSelection));
        var oldSelection = null;
        if (pixelEditor.selectionActive)
            oldSelection = JSON.parse(JSON.stringify(pixelEditor.selection));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                var ar = b;
                var br = a;
                if (ar >= pixelEditor.currentSprite.width)
                    ar -= pixelEditor.currentSprite.width;
                if (br >= pixelEditor.currentSprite.height)
                    br -= pixelEditor.currentSprite.height;
                pixelEditor.currentLayerSelection.pixels[ar][br] = origLayer.pixels[a][b];
                if (oldSelection)
                    pixelEditor.selection[ar][br] = oldSelection[a][b];
            }
        }

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerOriginal.pixels[a][b];
                if (pixelEditor.currentLayerSelection.pixels[a][b].a == 0)
                    continue;
                else if (pixelEditor.currentLayerSelection.pixels[a][b].a == 255)
                    pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerSelection.pixels[a][b];
            }
        }

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;
        PixelEditorActions.FlipHorizontal(false);
        PixelEditor.StoreAfterActionStep();
    }

    static RotateCounterClockwise()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.StoreBeforeActionStep();
        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
        pixelEditor.currentLayerSelection = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                    pixelEditor.currentLayerOriginal.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
                else
                    pixelEditor.currentLayerSelection.pixels[a][b] = { r: 0, g: 0, b: 0, a: 0 };
            }
        }

        var origLayer: SpriteLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayerSelection));
        var oldSelection = null;
        if (pixelEditor.selectionActive)
            oldSelection = JSON.parse(JSON.stringify(pixelEditor.selection));

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                var ar = b;
                var br = a;
                if (ar >= pixelEditor.currentSprite.width)
                    ar -= pixelEditor.currentSprite.width;
                if (br >= pixelEditor.currentSprite.height)
                    br -= pixelEditor.currentSprite.height;
                pixelEditor.currentLayerSelection.pixels[ar][br] = origLayer.pixels[a][b];
                if (oldSelection)
                    pixelEditor.selection[ar][br] = oldSelection[a][b];
            }
        }

        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerOriginal.pixels[a][b];
                if (pixelEditor.currentLayerSelection.pixels[a][b].a == 0)
                    continue;
                else if (pixelEditor.currentLayerSelection.pixels[a][b].a == 255)
                    pixelEditor.currentLayer.pixels[a][b] = pixelEditor.currentLayerSelection.pixels[a][b];
            }
        }

        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;
        PixelEditorActions.FlipVertical(false);
        PixelEditor.StoreAfterActionStep();
    }

    static Fill()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.StoreBeforeActionStep();
        var p = ColorHandling.HexToRgb($("#pixelEditorFieldCurrentColor").val());
        for (var a = 0; a < pixelEditor.currentSprite.width; a++)
        {
            for (var b = 0; b < pixelEditor.currentSprite.height; b++)
            {
                if (!pixelEditor.selectionActive || pixelEditor.selection[a][b] !== false)
                    pixelEditor.currentLayer.pixels[a][b] = { r: p.r, g: p.g, b: p.b, a: 255 };
            }
        }
        PixelEditor.StoreAfterActionStep();
        PixelEditor.RepaintCanvas();
    }

    static ChangeSize()
    {
        var html = "";

        html += "<table>";
        html += "<tr><td>New width:</td><td><input type='text' id='newWidth' value='" + ("" + pixelEditor.currentSprite.width).htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "<tr><td>New height:</td><td><input type='text' id='newHeight' value='" + ("" + pixelEditor.currentSprite.height).htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "</table>";

        html += "<div class='button' onclick='PixelEditorActions.DoChangeSize()'>Ok</div>";
        html += "<div class='button' onclick='PixelEditorActions.ClosePanel()'>Cancel</div>";
        pixelEditor.inPanel = true;
        $("#pixelEditorSpriteList").html(html).css("overflow-x", "hidden");
    }

    static DoChangeSize()
    {
        PixelEditor.ClearActionSteps();

        var width = parseInt($("#newWidth").val());
        var height = parseInt($("#newHeight").val());

        if (isNaN(width) || isNaN(height) || width < 1 || height < 1)
        {
            Framework.Alert("Values are not valid");
            return;
        }

        if (pixelEditor.currentImage.type == "character")
        {
            var nbCols = pixelEditor.currentImage.sprites.length / 4;
            for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            {
                PixelEditorActions.ResizeSprite(pixelEditor.currentImage.sprites[i], width, height);
                var x = i % nbCols;
                var y = Math.floor(i / nbCols);
                pixelEditor.currentImage.sprites[i].x = x * width;
                pixelEditor.currentImage.sprites[i].y = y * height;
            }
        }
        else if (pixelEditor.currentImage.type == "mapobject")
        {
            var oldWidth = pixelEditor.currentSprite.width;
            var oldHeight = pixelEditor.currentSprite.height;
            var oldImage = PixelEditor.BuildSaveData(pixelEditor.currentImage);
            PixelEditorActions.ResizeSprite(pixelEditor.currentSprite, width, height);

            // Repack the sprites
            if (oldWidth < width || oldHeight < height)
            {
                PixelEditorActions.RepackMapObjects(oldImage);
            }
            // We just need to change the map object info
            else
            {
                var name = PixelEditorActions.FindMapObject(pixelEditor.currentSprite.x, pixelEditor.currentSprite.y);
                if (name)
                {
                    world.art.objects[name].width = pixelEditor.currentSprite.width;
                    world.art.objects[name].height = pixelEditor.currentSprite.height;
                }
            }
        }

        PixelEditor.ResizeCanvas();
        PixelEditor.UpdateSprites();
        PixelEditor.RepaintCanvas(true);
        PixelEditorActions.ClosePanel();
    }

    static RepackMapObjects(oldImage: GameImage)
    {
        // Verify all sprites
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            var name = PixelEditorActions.FindMapObject(oldImage.sprites[i].x, oldImage.sprites[i].y);
            if (name && world.art.objects[name].width == oldImage.sprites[i].width && world.art.objects[name].height == oldImage.sprites[i].height)
                pixelEditor.currentImage.sprites[i]['__name'] = name;
            else
                console.log("Lost a sprite...");
        }

        PixelEditorActions.PackSprites();

        // Replace all the map objects to their right position
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            var name = <string>pixelEditor.currentImage.sprites[i]['__name'];
            if (name)
            {
                delete pixelEditor.currentImage.sprites[i]['__name'];
                world.art.objects[name].x = pixelEditor.currentImage.sprites[i].x;
                world.art.objects[name].y = pixelEditor.currentImage.sprites[i].y;
                world.art.objects[name].width = pixelEditor.currentImage.sprites[i].width;
                world.art.objects[name].height = pixelEditor.currentImage.sprites[i].height;
            }
            else
                console.log("Lost a sprite...");
        }
    }

    static FindMapObject(x: number, y: number): string
    {
        var filename = PixelEditor.Filename(pixelEditor.currentImage.file);
        for (var item in world.art.objects)
        {
            var objInfo = world.art.objects[item];
            if (PixelEditor.Filename(objInfo.file) == filename && objInfo.x == x && objInfo.y == y)
                return item;
        }
        return null;
    }

    static PackSprites()
    {
        var todo: number[] = [];
        // Store the old index
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
            todo.push(i);
        todo.sort((a, b) =>
        {
            return pixelEditor.currentImage.sprites[a].height - pixelEditor.currentImage.sprites[b].height;
        });

        // Virtual size
        var maxX = 0;
        var maxY = 0;
        // Next placement
        var nextY = 0;
        var nextX = 0;

        // Move away to avoid to be calculated in the collisions.
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            pixelEditor.currentImage.sprites[i].x = -100 - pixelEditor.currentImage.sprites[i].width;
            pixelEditor.currentImage.sprites[i].y = -100 - pixelEditor.currentImage.sprites[i].height;
        }

        while (todo.length > 0)
        {
            var sprite = pixelEditor.currentImage.sprites[todo.pop()];
            if (maxX == 0)
            {
                sprite.x = 0;
                sprite.y = 0;
                nextX += sprite.width + pixelEditor.packingSpace;
            }
            else
            {
                // if we can place the item, we move to the next row
                if (!PixelEditorActions.PlaceSprite(sprite, maxX, maxY))
                {
                    // Can't fit on the current row, let's move to the next
                    if (nextX + sprite.width > maxY)
                    {
                        nextY = maxY;
                        nextX = 0;
                    }
                    sprite.x = nextX;
                    sprite.y = nextY;
                    nextX += sprite.width + pixelEditor.packingSpace;
                }
            }

            maxX = Math.max(maxX, sprite.x + sprite.width + pixelEditor.packingSpace);
            maxY = Math.max(maxY, sprite.y + sprite.height + pixelEditor.packingSpace);
        }
    }

    // Try to find an empty space where to place the sprite
    static PlaceSprite(sprite: ImageSprite, maxX: number, maxY: number): boolean
    {
        for (var x = 0; x < maxX; x += pixelEditor.packingSpace)
        {
            for (var y = 0; y < maxX; y += pixelEditor.packingSpace)
            {
                if (!PixelEditorActions.SpriteCollide(sprite, x, y))
                {
                    sprite.x = x;
                    sprite.y = y;
                    return true;
                }
            }
        }
        return false;
    }

    // Check if the sprite is colliding with another sprite
    static SpriteCollide(sprite: ImageSprite, x: number, y: number): boolean
    {
        for (var i = 0; i < pixelEditor.currentImage.sprites.length; i++)
        {
            var s2 = pixelEditor.currentImage.sprites[i];
            if (s2 == sprite)
                continue;
            if (!(s2.x + s2.width + pixelEditor.packingSpace < x || s2.x > x + sprite.width + pixelEditor.packingSpace || s2.y + s2.height + pixelEditor.packingSpace < y || s2.y > y + sprite.height + pixelEditor.packingSpace))
                return true;
        }
        return false;
    }

    static ResizeSprite(sprite: ImageSprite, width: number, height: number)
    {
        var orig: ImageSprite = JSON.parse(JSON.stringify(sprite));

        sprite.width = width;
        sprite.height = height;
        for (var i = 0; i < sprite.layers.length; i++)
        {
            sprite.layers[i].pixels = [];
            for (var x = 0; x < width; x++)
            {
                sprite.layers[i].pixels[x] = [];
                for (var y = 0; y < height; y++)
                {
                    if (x < orig.width && y < orig.height)
                        sprite.layers[i].pixels[x][y] = orig.layers[i].pixels[x][y];
                    else
                        sprite.layers[i].pixels[x][y] = { r: 0, g: 0, b: 0, a: 0 };
                }
            }
        }
    }

    static ClosePanel()
    {
        pixelEditor.inPanel = false;
        $("#pixelEditorSpriteList").css("overflow-x", "scroll");
        PixelEditor.UpdateSprites();
    }

    static Undo()
    {
        if (pixelEditor.inPanel)
            return;
        if (!pixelEditor.actionSteps || pixelEditor.actionSteps.length < 1)
            return;
        var action = pixelEditor.actionSteps.pop();
        if (action.specialAction)
            action.specialAction(action, false);
        else
        {
            PixelEditor.SelectSprite(action.spriteId);
            PixelEditorLayers.SelectLayer(action.layerId);
            var layer = PixelEditor.BuildLayerFromImage(action.before);
            pixelEditor.currentImage.sprites[action.spriteId].layers[action.layerId].pixels = layer.pixels;
        }
        PixelEditor.UpdateAllSpritePreview();
        PixelEditor.RepaintCanvas(true);
        pixelEditor.redoSteps.push(action);
    }

    static Redo()
    {
        if (pixelEditor.inPanel)
            return;
        if (!pixelEditor.redoSteps || pixelEditor.redoSteps.length < 1)
            return;
        var action = pixelEditor.redoSteps.pop();
        if (action.specialAction)
            action.specialAction(action, true)
        else
        {
            PixelEditor.SelectSprite(action.spriteId);
            PixelEditorLayers.SelectLayer(action.layerId);
            var layer = PixelEditor.BuildLayerFromImage(action.after);
            pixelEditor.currentImage.sprites[action.spriteId].layers[action.layerId].pixels = layer.pixels;
        }
        PixelEditor.UpdateAllSpritePreview();
        PixelEditor.RepaintCanvas(true);
        pixelEditor.actionSteps.push(action);
    }

    static HueSaturation()
    {
        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        var html = "";
        html += "<table>";
        html += "<tr><td>Hue (-180 / +180):</td><td><input type='text' id='newHue' value='0' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='PixelEditorActions.HandleHueChange()'><span class='button' onclick='PixelEditorActions.HueTweak(-10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&lt;</span><span class='button' onclick='PixelEditorActions.HueTweak(10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&gt;</span></td></tr>";
        html += "<tr><td>Saturation (-100 / +100):</td><td><input type='text' id='newSaturation' value='0' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='PixelEditorActions.HandleHueChange()'><span class='button' onclick='PixelEditorActions.SaturationTweak(-10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&lt;</span><span class='button' onclick='PixelEditorActions.SaturationTweak(10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&gt;</span></td></tr>";
        html += "</table>";

        html += "<div class='button' onclick='PixelEditorActions.OkHue()'>Ok</div>";
        html += "<div class='button' onclick='PixelEditorActions.CancelHue()'>Cancel</div>";
        pixelEditor.inPanel = true;
        $("#pixelEditorSpriteList").html(html).css("overflow-x", "hidden");
    }

    static HueTweak(value: number)
    {
        var val = parseInt($("#newHue").val());
        if (isNaN(val))
            return;
        val += value;
        if (val < -180)
            val += 360;
        if (val > 180)
            val -= 360;
        $("#newHue").val("" + val);
        PixelEditorActions.HandleHueChange();
    }

    static SaturationTweak(value: number)
    {
        var val = parseInt($("#newSaturation").val());
        if (isNaN(val))
            return;
        val = Math.min(100, Math.max(-100, val + value));
        $("#newSaturation").val("" + val);
        PixelEditorActions.HandleHueChange();
    }

    static HandleHueChange()
    {
        if (!pixelEditor.currentLayerOriginal)
            pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        var hue = parseInt($("#newHue").val());
        if (isNaN(hue))
            return;
        hue = Math.max(-180, Math.min(hue, 180));
        var saturation = parseInt($("#newSaturation").val());
        if (isNaN(saturation))
            return;
        saturation = Math.max(-1, Math.min(1, saturation / 100));
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;

                var hsv = ColorHandling.RGBtoHSV(pixelEditor.currentLayerOriginal.pixels[x][y].r / 255, pixelEditor.currentLayerOriginal.pixels[x][y].g / 255, pixelEditor.currentLayerOriginal.pixels[x][y].b / 255);
                hsv.h += hue;
                if (hsv.h < 0)
                    hsv.h += 360;
                if (hsv.h > 360)
                    hsv.h -= 360;
                hsv.s = Math.max(0, Math.min(1, hsv.s + saturation));

                var rgb = ColorHandling.HSVtoRGB(hsv.h, hsv.s, hsv.v);
                pixelEditor.currentLayer.pixels[x][y] = { r: Math.floor(rgb.Red * 255), g: Math.floor(rgb.Green * 255), b: Math.floor(rgb.Blue * 255), a: pixelEditor.currentLayerOriginal.pixels[x][y].a };
            }
        }
        PixelEditor.RepaintCanvas();
    }

    static CancelHue()
    {
        pixelEditor.currentLayer.pixels = JSON.parse(JSON.stringify(pixelEditor.currentLayerOriginal.pixels));
        PixelEditor.RepaintCanvas();
        PixelEditorActions.ClosePanel();
    }

    static OkHue()
    {
        pixelEditor.currentLayer.pixels = JSON.parse(JSON.stringify(pixelEditor.currentLayerOriginal.pixels));
        PixelEditor.StoreBeforeActionStep();
        PixelEditorActions.HandleHueChange();
        PixelEditor.StoreAfterActionStep();
        PixelEditor.RepaintCanvas();
        PixelEditorActions.ClosePanel();
    }

    static BrightnessContrast()
    {
        pixelEditor.currentLayerOriginal = JSON.parse(JSON.stringify(pixelEditor.currentLayer));

        var html = "";
        html += "<table>";
        html += "<tr><td>Brightness (-100 / +100):</td><td><input type='text' id='newBrightness' value='0' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='PixelEditorActions.HandleContrastChange()'><span class='button' onclick='PixelEditorActions.BrightnessTweak(-10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&lt;</span><span class='button' onclick='PixelEditorActions.BrightnessTweak(10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&gt;</span></td></tr>";
        html += "<tr><td>Contrast (-100 / +100):</td><td><input type='text' id='newContrast' value='0' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='PixelEditorActions.HandleContrastChange()'><span class='button' onclick='PixelEditorActions.ContrastTweak(-10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&lt;</span><span class='button' onclick='PixelEditorActions.ContrastTweak(10);' ondblclick='return false;' unselectable='on' onselectstart='return false;'>&gt;</span></td></tr>";
        html += "</table>";

        html += "<div class='button' onclick='PixelEditorActions.OkContrast()'>Ok</div>";
        html += "<div class='button' onclick='PixelEditorActions.CancelHue()'>Cancel</div>";
        $("#pixelEditorSpriteList").html(html).css("overflow-x", "hidden");
    }

    static HandleContrastChange()
    {
        var contrast = parseInt($("#newContrast").val());
        if (isNaN(contrast))
            return;
        contrast = ((contrast / 100) * 255);
        var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        var brightness = parseInt($("#newBrightness").val());
        if (isNaN(brightness))
            return;
        brightness = ((brightness / 100) * 255);
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;
                var r = Math.max(0, Math.min(255, (factor * (pixelEditor.currentLayerOriginal.pixels[x][y].r - 128) + 128) + brightness));
                var g = Math.max(0, Math.min(255, (factor * (pixelEditor.currentLayerOriginal.pixels[x][y].g - 128) + 128) + brightness));
                var b = Math.max(0, Math.min(255, (factor * (pixelEditor.currentLayerOriginal.pixels[x][y].b - 128) + 128) + brightness));
                pixelEditor.currentLayer.pixels[x][y] = { r: r, g: g, b: b, a: pixelEditor.currentLayerOriginal.pixels[x][y].a };
            }
        }
    }

    static BrightnessTweak(value: number)
    {
        var val = parseInt($("#newBrightness").val());
        if (isNaN(val))
            return;
        val = Math.min(100, Math.max(-100, val + value));
        $("#newBrightness").val("" + val);
        PixelEditorActions.HandleContrastChange();
    }

    static ContrastTweak(value: number)
    {
        var val = parseInt($("#newContrast").val());
        if (isNaN(val))
            return;
        val = Math.min(100, Math.max(-100, val + value));
        $("#newContrast").val("" + val);
        PixelEditorActions.HandleContrastChange();
    }

    static OkContrast()
    {
        pixelEditor.currentLayer.pixels = JSON.parse(JSON.stringify(pixelEditor.currentLayerOriginal.pixels));
        PixelEditor.StoreBeforeActionStep();
        PixelEditorActions.HandleContrastChange();
        PixelEditor.StoreAfterActionStep();
        PixelEditor.RepaintCanvas();
        PixelEditorActions.ClosePanel();
    }

    static Copy()
    {
        pixelEditor.clipboard = PixelEditor.InitLayer(pixelEditor.currentSprite.width, pixelEditor.currentSprite.height);
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;
                pixelEditor.clipboard.pixels[x][y] = JSON.parse(JSON.stringify(pixelEditor.currentLayer.pixels[x][y]));
            }
        }
    }

    static Cut()
    {
        PixelEditor.StoreBeforeActionStep();
        pixelEditor.clipboard = PixelEditor.InitLayer(pixelEditor.currentSprite.width, pixelEditor.currentSprite.height);
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;
                pixelEditor.clipboard.pixels[x][y] = JSON.parse(JSON.stringify(pixelEditor.currentLayer.pixels[x][y]));
                pixelEditor.currentLayer.pixels[x][y] = { r: 0, g: 0, b: 0, a: 0 };
            }
        }
        PixelEditor.StoreAfterActionStep();
    }

    static Paste()
    {
        if (pixelEditor.inPanel)
            return;
        if (!pixelEditor.clipboard)
            return;
        PixelEditor.StoreBeforeActionStep();
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (!pixelEditor.clipboard.pixels[x] || !pixelEditor.clipboard.pixels[x][y] || pixelEditor.clipboard.pixels[x][y].a == 0)
                    continue;
                pixelEditor.currentLayer.pixels[x][y] = JSON.parse(JSON.stringify(pixelEditor.clipboard.pixels[x][y]));
            }
        }
        PixelEditor.RepaintCanvas();
        PixelEditor.StoreAfterActionStep();
    }

    static SelectSelection()
    {
        if (pixelEditor.inPanel)
            return;
        pixelEditor.startSelection = null;
    }

    static ActionSelection(mouseButton: number, x: number, y: number, currentColor: Pixel)
    {
        if (!pixelEditor.startSelection)
        {
            if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === true)
            {
                PixelEditor.StoreBeforeActionStep();
                PixelEditorActions.SelectAction("Translate");
                return;
            }
            pixelEditor.startSelection = { X: x, Y: y };
            return;
        }

        var sx = Math.min(x, pixelEditor.startSelection.X);
        var ex = Math.max(x, pixelEditor.startSelection.X);
        var sy = Math.min(y, pixelEditor.startSelection.Y);
        var ey = Math.max(y, pixelEditor.startSelection.Y);

        PixelEditor.ClearSelection();
        if (ex - sx <= 0 || ey - sy <= 0)
            return;
        pixelEditor.selectionActive = true;
        for (var x = sx; x <= ex; x++)
            for (var y = sy; y <= ey; y++)
                pixelEditor.selection[x][y] = true;
        PixelEditor.RepaintCanvas();
    }

    static StopSelection(mouseButton: number, x: number, y: number)
    {
        pixelEditor.startSelection = null;
    }

    static MirrorHorizontal()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.StoreBeforeActionStep();
        for (var x = 0; x < pixelEditor.currentSprite.width / 2; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;
                pixelEditor.currentLayer.pixels[(pixelEditor.currentSprite.width - 1) - x][y] = JSON.parse(JSON.stringify(pixelEditor.currentLayer.pixels[x][y]));
            }
        }
        PixelEditor.RepaintCanvas();
        PixelEditor.StoreAfterActionStep();
    }

    static MirrorVertical()
    {
        if (pixelEditor.inPanel)
            return;
        PixelEditor.StoreBeforeActionStep();
        for (var x = 0; x < pixelEditor.currentSprite.width; x++)
        {
            for (var y = 0; y < pixelEditor.currentSprite.height / 2; y++)
            {
                if (pixelEditor.selectionActive && pixelEditor.selection[x][y] === false)
                    continue;
                pixelEditor.currentLayer.pixels[x][(pixelEditor.currentSprite.height - 1) - y] = JSON.parse(JSON.stringify(pixelEditor.currentLayer.pixels[x][y]));
            }
        }
        PixelEditor.RepaintCanvas();
        PixelEditor.StoreAfterActionStep();
    }
}