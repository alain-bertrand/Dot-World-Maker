class PixelEditorLayers
{
    static PaintLayer(ctx: CanvasRenderingContext2D, width: number, height: number, layer: SpriteLayer, zoomFactor: number, offsetX: number = 0, offsetY: number = 0)
    {
        for (var x = 0; x < width; x++)
        {
            for (var y = 0; y < height; y++)
            {
                var p = layer.pixels[x][y];
                if (p.a == 0)
                    continue;
                ctx.globalAlpha = p.a / 255;
                ctx.fillStyle = ColorHandling.RgbToHex(p.r, p.g, p.b);
                ctx.fillRect(x * zoomFactor + offsetX, y * zoomFactor + offsetY, zoomFactor, zoomFactor);
            }
        }
    }

    static CurrentLayerId()
    {
        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
            if (pixelEditor.currentLayer == pixelEditor.currentSprite.layers[i])
                return i;
        return -1;
    }

    static UpdateLayers()
    {
        if (!pixelEditor.currentSprite)
        {
            $("#pixelEditorLayers").html("");
            return;
        }

        var html = "";
        for (var i = pixelEditor.currentSprite.layers.length - 1; i >= 0; i--)
        {
            html += "<div" + (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer ? " class='selectedPixelEditorLayer'" : "") + " id='layer_" + i + "' onclick='PixelEditorLayers.SelectLayer(" + i + ")' unselectable='on' onselectstart='return false;'>";
            html += "<canvas id='canvas_layer_" + i + "' width='100' height='100'></canvas>";
            html += "<span>" + pixelEditor.currentSprite.layers[i].name;
            if (pixelEditor.currentSprite.layers[i].hide === true)
                html += "<div class='button' onclick='PixelEditorLayers.ShowHide(" + i + ")'>Show</div></span></div>";
            else
                html += "<div class='button' onclick='PixelEditorLayers.ShowHide(" + i + ")'>Hide</div></span></div>";
        }
        $("#pixelEditorLayers").html(html);
        PixelEditor.RepaintCanvas(true);
    }

    static ShowHide(id: number)
    {
        if (pixelEditor.inPanel)
            return;
        pixelEditor.redoSteps = [];
        pixelEditor.actionSteps.push({
            specialAction: PixelEditorLayers.UndoShowHide,
            specialActionData: (pixelEditor.currentSprite.layers[id].hide === true),
            layerId: PixelEditorLayers.CurrentLayerId(),
            spriteId: PixelEditor.CurrentSpriteId()
        });

        if (pixelEditor.currentSprite.layers[id].hide === true)
            delete pixelEditor.currentSprite.layers[id].hide;
        else
            pixelEditor.currentSprite.layers[id].hide = true;
        PixelEditorLayers.UpdateLayers();

    }

    static UndoShowHide(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            if (step.specialActionData !== true)
                pixelEditor.currentImage.sprites[step.spriteId].layers[step.layerId].hide = true;
            else
                delete pixelEditor.currentImage.sprites[step.spriteId].layers[step.layerId].hide;
        }
        else
        {
            if (step.specialActionData === true)
                pixelEditor.currentImage.sprites[step.spriteId].layers[step.layerId].hide = true;
            else
                delete pixelEditor.currentImage.sprites[step.spriteId].layers[step.layerId].hide;
        }
        PixelEditorLayers.UpdateLayers();
    }

    static SelectLayer(id: number)
    {
        if (pixelEditor.inPanel)
            return;
        pixelEditor.currentLayerOriginal = null;
        pixelEditor.currentLayerSelection = null;

        // Ctrl + Click
        if (pixelEditor.keys[17] === true)
        {
            PixelEditor.ClearSelection();
            for (var x = 0; x < pixelEditor.currentSprite.width; x++)
            {
                for (var y = 0; y < pixelEditor.currentSprite.height; y++)
                {
                    pixelEditor.selection[x][y] = (pixelEditor.currentSprite.layers[id].pixels[x][y].a != 0);
                    if (pixelEditor.selection[x][y])
                        pixelEditor.selectionActive = true;
                }
            }
            PixelEditor.RepaintCanvas();
            return;
        }


        pixelEditor.currentLayer = pixelEditor.currentSprite.layers[id];
        $("#pixelEditorLayers > div").removeClass("selectedPixelEditorLayer");
        $("#layer_" + id).addClass("selectedPixelEditorLayer");
    }

    static NewLayer()
    {
        if (pixelEditor.inPanel)
            return;
        var oldLayer = PixelEditorLayers.CurrentLayerId();

        pixelEditor.currentSprite.layers.push(PixelEditor.InitLayer(pixelEditor.currentSprite.width, pixelEditor.currentSprite.height));
        PixelEditorLayers.SelectLayer(pixelEditor.currentSprite.layers.length - 1);
        PixelEditorLayers.UpdateLayers();

        pixelEditor.redoSteps = [];
        pixelEditor.actionSteps.push({
            specialAction: PixelEditorLayers.UndoNewLayer,
            specialActionData: oldLayer,
            layerId: PixelEditorLayers.CurrentLayerId(),
            spriteId: PixelEditor.CurrentSpriteId()
        });
    }

    static UndoNewLayer(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            PixelEditor.SelectSprite(step.spriteId);
            pixelEditor.currentSprite.layers.push(PixelEditor.InitLayer(pixelEditor.currentSprite.width, pixelEditor.currentSprite.height));
            PixelEditorLayers.SelectLayer(pixelEditor.currentSprite.layers.length - 1);
            PixelEditorLayers.UpdateLayers();
        }
        else
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.specialActionData);
            pixelEditor.currentSprite.layers.pop();
            PixelEditorLayers.UpdateLayers();
        }
    }

    static DeleteLayer()
    {
        if (pixelEditor.inPanel)
            return;
        if (pixelEditor.currentSprite.layers.length < 2)
            return;
        Framework.Confirm("Are you sure you want to delete this layer?", () =>
        {
            for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
            {
                if (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer)
                {
                    pixelEditor.redoSteps = [];
                    pixelEditor.actionSteps.push({
                        specialAction: PixelEditorLayers.UndoDeleteLayer,
                        specialActionData: JSON.parse(JSON.stringify(pixelEditor.currentLayer)),
                        layerId: PixelEditorLayers.CurrentLayerId(),
                        spriteId: PixelEditor.CurrentSpriteId()
                    });

                    pixelEditor.currentSprite.layers.splice(i, 1);
                    PixelEditorLayers.SelectLayer(Math.max(i - 1, 0));
                    PixelEditorLayers.UpdateLayers();
                    return;
                }
            }
        });
    }

    static UndoDeleteLayer(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId);
            pixelEditor.currentSprite.layers.splice(step.layerId, 1);
            PixelEditorLayers.SelectLayer(Math.max(step.layerId - 1, 0));
            PixelEditorLayers.UpdateLayers();
        }
        else
        {
            PixelEditor.SelectSprite(step.spriteId);
            pixelEditor.currentSprite.layers.splice(step.layerId, 0, step.specialActionData);
            PixelEditorLayers.SelectLayer(Math.max(step.layerId - 1, 0));
            PixelEditorLayers.UpdateLayers();
            PixelEditorLayers.SelectLayer(step.layerId);
        }
    }

    static LayerUp()
    {
        if (pixelEditor.inPanel)
            return;
        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
        {
            if (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer)
            {
                if (i == pixelEditor.currentSprite.layers.length - 1)
                    return;
                pixelEditor.redoSteps = [];
                pixelEditor.actionSteps.push({
                    specialAction: PixelEditorLayers.UndoLayerUp,
                    layerId: PixelEditorLayers.CurrentLayerId(),
                    spriteId: PixelEditor.CurrentSpriteId()
                });

                pixelEditor.currentSprite.layers.splice(i, 1);
                pixelEditor.currentSprite.layers.splice(i + 1, 0, pixelEditor.currentLayer);
                PixelEditorLayers.UpdateLayers();
                return;
            }
        }
    }

    static UndoLayerUp(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId);
            pixelEditor.currentSprite.layers.splice(step.layerId, 1);
            pixelEditor.currentSprite.layers.splice(step.layerId + 1, 0, pixelEditor.currentLayer);
            PixelEditorLayers.UpdateLayers();
        }
        else
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId + 1);
            pixelEditor.currentSprite.layers.splice(step.layerId + 1, 1);
            pixelEditor.currentSprite.layers.splice(step.layerId, 0, pixelEditor.currentLayer);
            PixelEditorLayers.UpdateLayers();
        }
    }

    static LayerDown()
    {
        if (pixelEditor.inPanel)
            return;
        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
        {
            if (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer)
            {
                if (i == 0)
                    return;
                pixelEditor.redoSteps = [];
                pixelEditor.actionSteps.push({
                    specialAction: PixelEditorLayers.UndoLayerDown,
                    layerId: PixelEditorLayers.CurrentLayerId(),
                    spriteId: PixelEditor.CurrentSpriteId()
                });

                pixelEditor.currentSprite.layers.splice(i, 1);
                pixelEditor.currentSprite.layers.splice(i - 1, 0, pixelEditor.currentLayer);
                PixelEditorLayers.UpdateLayers();
                return;
            }
        }
    }

    static UndoLayerDown(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId);
            pixelEditor.currentSprite.layers.splice(step.layerId, 1);
            pixelEditor.currentSprite.layers.splice(step.layerId - 1, 0, pixelEditor.currentLayer);
            PixelEditorLayers.UpdateLayers();
        }
        else
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId - 1);
            pixelEditor.currentSprite.layers.splice(step.layerId - 1, 1);
            pixelEditor.currentSprite.layers.splice(step.layerId, 0, pixelEditor.currentLayer);
            PixelEditorLayers.UpdateLayers();
        }
    }

    static MergeDown()
    {
        if (pixelEditor.inPanel)
            return;
        if (pixelEditor.currentSprite.layers.length < 2)
            return;

        for (var i = 0; i < pixelEditor.currentSprite.layers.length; i++)
        {
            if (pixelEditor.currentSprite.layers[i] == pixelEditor.currentLayer)
            {
                if (i == 0)
                    return;

                var old: SpriteLayer = JSON.parse(JSON.stringify(pixelEditor.currentLayer));
                pixelEditor.redoSteps = [];
                pixelEditor.actionSteps.push({
                    specialAction: PixelEditorLayers.UndoMergeDown,
                    specialActionData: {
                        l1: old, l2: JSON.parse(JSON.stringify(pixelEditor.currentSprite.layers[i - 1]))
                    },
                    layerId: i,
                    spriteId: PixelEditor.CurrentSpriteId()
                });


                pixelEditor.currentSprite.layers.splice(i, 1);
                PixelEditorLayers.SelectLayer(Math.max(i - 1, 0));

                for (var x = 0; x < pixelEditor.currentSprite.width; x++)
                {
                    for (var y = 0; y < pixelEditor.currentSprite.height; y++)
                    {
                        if (old.pixels[x][y].a == 0)
                            continue;
                        pixelEditor.currentLayer.pixels[x][y] = {
                            r: old.pixels[x][y].r, g: old.pixels[x][y].g, b: old.pixels[x][y].b, a: old.pixels[x][y].a
                        };
                    }
                }

                PixelEditor.RepaintCanvas();
                PixelEditorLayers.UpdateLayers();
                return;
            }
        }
    }

    static UndoMergeDown(step: PixelEditorStep, redo: boolean)
    {
        if (redo)
        {
            PixelEditor.SelectSprite(step.spriteId);
            PixelEditorLayers.SelectLayer(step.layerId);
            var old = pixelEditor.currentSprite.layers.splice(step.layerId, 1)[0];
            PixelEditorLayers.SelectLayer(Math.max(step.layerId - 1, 0));
            for (var x = 0; x < pixelEditor.currentSprite.width; x++)
            {
                for (var y = 0; y < pixelEditor.currentSprite.height; y++)
                {
                    if (old.pixels[x][y].a == 0)
                        continue;
                    pixelEditor.currentLayer.pixels[x][y] = {
                        r: old.pixels[x][y].r, g: old.pixels[x][y].g, b: old.pixels[x][y].b, a: old.pixels[x][y].a
                    };
                }
            }
            PixelEditor.RepaintCanvas();
            PixelEditorLayers.UpdateLayers();
        }
        else
        {
            PixelEditor.SelectSprite(step.spriteId);
            pixelEditor.currentSprite.layers.splice(step.layerId, 0, JSON.parse(JSON.stringify(step.specialActionData.l1)));
            pixelEditor.currentSprite.layers[step.layerId - 1] = JSON.parse(JSON.stringify(step.specialActionData.l2));
            PixelEditorLayers.SelectLayer(step.layerId);
            PixelEditorLayers.UpdateLayers();
            PixelEditorLayers.SelectLayer(step.layerId);
        }
    }
}