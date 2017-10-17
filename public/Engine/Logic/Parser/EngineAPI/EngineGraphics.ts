/// <reference path="../CodeEnvironement.ts" />

var engineGraphics = new (class
{
    currentContext: CanvasRenderingContext2D
    currentCanvas: string = null;
    imageCache: ImageCache = {};
});

@ApiClass
class EngineGraphics
{
    @ApiMethod([{ name: "canvasId", description: "The id of the canvas to recover the context from." }], "Set the current drawing context.")
    Canvas(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext = (<HTMLCanvasElement>$("#" + values[0].GetString()).first()).getContext("2d");
        engineGraphics.currentCanvas = values[0].GetString();
        return null;
    }

    @ApiMethod([{ name: "color", description: "The color to set." }], "Set the color for the further draw functions.")
    Color(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext.strokeStyle = values[0].GetString();
        engineGraphics.currentContext.fillStyle = values[0].GetString();
        return null;
    }

    @ApiMethod([{ name: "width", description: "The width to set." }], "Set the line width.")
    LineWidth(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext.lineWidth = values[0].GetNumber();
        return null;
    }

    @ApiMethod([{ name: "x1", description: "First X coordinate." }, { name: "y1", description: "First Y coordinate." }, { name: "x2", description: "Second X coordinate." }, { name: "y2", description: "Second Y coordinate." }], "Draw a line.")
    Line(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext.beginPath();
        engineGraphics.currentContext.moveTo(Math.round(values[0].GetNumber()) + 0.5, Math.round(values[1].GetNumber()) + 0.5);
        engineGraphics.currentContext.lineTo(Math.round(values[2].GetNumber()) + 0.5, Math.round(values[3].GetNumber()) + 0.5);
        engineGraphics.currentContext.stroke();
        return null;
    }

    @ApiMethod([{ name: "text", description: "The text to draw." }, { name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "size", description: "(optional) Font size. By default 12px." }], "Draw a line.")
    Text(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[3])
            engineGraphics.currentContext.font = "" + values[3].GetNumber() + "px sans-serif";
        else
            engineGraphics.currentContext.font = "12px sans-serif";
        engineGraphics.currentContext.fillText(values[0].GetString(), Math.round(values[1].GetNumber()) + 0.5, Math.round(values[2].GetNumber()) + 0.5);
        return null;
    }

    @ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Rectangle width." }, { name: "height", description: "Rectangle height" }], "Draw the contour of a rectangle.")
    Rectangle(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext.strokeRect(Math.round(values[0].GetNumber()) + 0.5, Math.round(values[1].GetNumber()) + 0.5, Math.round(values[2].GetNumber()), Math.round(values[3].GetNumber()));
        return null;
    }

    @ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Rectangle width." }, { name: "height", description: "Rectangle height" }], "Fill a rectangle.")
    FillRectangle(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        engineGraphics.currentContext.fillRect(Math.round(values[0].GetNumber()), Math.round(values[1].GetNumber()), Math.round(values[2].GetNumber()), Math.round(values[3].GetNumber()));
        return null;
    }

    @ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Ellipse width." }, { name: "height", description: "Ellipse height" }], "Draw the contour of an ellipse.")
    Ellipse(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var centerX = Math.round(values[0].GetNumber());
        var centerY = Math.round(values[1].GetNumber());
        var height = Math.round(values[3].GetNumber());
        var width = Math.round(values[2].GetNumber());

        engineGraphics.currentContext.beginPath();

        engineGraphics.currentContext.moveTo(centerX, centerY - height / 2); // A1

        engineGraphics.currentContext.bezierCurveTo(
            centerX + width / 2, centerY - height / 2, // C1
            centerX + width / 2, centerY + height / 2, // C2
            centerX, centerY + height / 2); // A2

        engineGraphics.currentContext.bezierCurveTo(
            centerX - width / 2, centerY + height / 2, // C3
            centerX - width / 2, centerY - height / 2, // C4
            centerX, centerY - height / 2); // A1

        engineGraphics.currentContext.stroke();
        engineGraphics.currentContext.closePath();
        return null;
    }

    @ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Ellipse width." }, { name: "height", description: "Ellipse height" }], "Fill an ellipse.")
    FillEllipse(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var centerX = Math.round(values[0].GetNumber());
        var centerY = Math.round(values[1].GetNumber());
        var height = Math.round(values[3].GetNumber());
        var width = Math.round(values[2].GetNumber());

        engineGraphics.currentContext.beginPath();

        engineGraphics.currentContext.moveTo(centerX, centerY - height / 2); // A1

        engineGraphics.currentContext.bezierCurveTo(
            centerX + width / 2, centerY - height / 2, // C1
            centerX + width / 2, centerY + height / 2, // C2
            centerX, centerY + height / 2); // A2

        engineGraphics.currentContext.bezierCurveTo(
            centerX - width / 2, centerY + height / 2, // C3
            centerX - width / 2, centerY - height / 2, // C4
            centerX, centerY - height / 2); // A1

        engineGraphics.currentContext.fill();
        engineGraphics.currentContext.closePath();
        return null;
    }

    private static CacheImage(imageId: string, callback: () => void = null): void
    {
        if (engineGraphics.imageCache[imageId])
        {
            if (callback)
                callback();
            return;
        }
        var type = imageId.split(":")[0];
        var name = imageId.split(":")[1];
        switch (type)
        {
            case "object":
                var obj = world.art.objects[name];
                var img = <any>new Image();
                img.src = obj.file;
                img.startX = obj.x;
                img.startY = obj.y;
                img.objWidth = obj.width;
                img.objHeight = obj.height;
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = () =>
                {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
            case "item":
                var inventObject = world.GetInventoryObject(name);;
                var img = <any>new Image();
                img.src = inventObject.Image;
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = () =>
                {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
            case "character":
                var char = world.art.characters[name];
                var img = <any>new Image();
                img.src = char.file;
                img.startX = 0;
                img.startY = 0;
                img.objWidth = Math.floor(char.width / char.frames);
                img.objHeight = Math.floor(char.height / char.directions);
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = () =>
                {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
        }
    }

    @ApiMethod([{ name: "image", description: "Image to draw." }], "Draw an image on the coordinate specified.")
    LoadImage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var imageId = values[0].GetString().toLowerCase();
        env.StoreStack(() =>
        {
            EngineGraphics.CacheImage(imageId, () =>
            {
                if (engineGraphics.currentCanvas)
                    engineGraphics.currentContext = (<HTMLCanvasElement>$("#" + engineGraphics.currentCanvas).first()).getContext("2d");
                env.RebuildStack();
            });
        });
        return null;
    }

    @ApiMethod([{ name: "image", description: "Image to draw." }, { name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }], "Draw an image on the coordinate specified.")
    DrawImage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var imageId = values[0].GetString().toLowerCase();
        var x = values[1].GetNumber();
        var y = values[2].GetNumber();

        if (!engineGraphics.imageCache[imageId])
        {
            EngineGraphics.CacheImage(imageId);
            return null;
        }
        var img = (<any>engineGraphics.imageCache[imageId]);
        if (!img.loaded)
            return null;
        if (img.objWidth)
            engineGraphics.currentContext.drawImage(img, img.startX, img.startY, img.objWidth, img.objHeight, x, y, img.objWidth, img.objHeight);
        else
            engineGraphics.currentContext.drawImage(img, 0, 0, img.width, img.height, x, y, img.width, img.height);
        return null;
    }
}
