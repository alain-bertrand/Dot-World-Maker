///<reference path="../../../Common/Libs/MiniQuery.ts" />

var tilesetExplorer = new (class
{
    public tileSetDefinition: TilesetInformation;
    public imagePreview: HTMLImageElement;

});


class TilesetExplorer
{
    public static Dispose()
    {
        tilesetExplorer.imagePreview = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        tilesetExplorer.tileSetDefinition = world.art;
        tilesetExplorer.imagePreview = new Image();
        tilesetExplorer.imagePreview.src = tilesetExplorer.tileSetDefinition.background.file;
        tilesetExplorer.imagePreview.onload = TilesetExplorer.Render;
        TilesetExplorer.Render();
    }

    static Render()
    {
        (<HTMLCanvasElement>document.getElementById("gameCanvas")).width = tilesetExplorer.imagePreview.width;
        (<HTMLCanvasElement>document.getElementById("gameCanvas")).height = tilesetExplorer.imagePreview.height;
        (<HTMLCanvasElement>document.getElementById("gameCanvas")).style.width = tilesetExplorer.imagePreview.width + "px";
        (<HTMLCanvasElement>document.getElementById("gameCanvas")).style.height = tilesetExplorer.imagePreview.height + "px";
        var ctx = (<HTMLCanvasElement>document.getElementById("gameCanvas")).getContext("2d");

        ctx.clearRect(0, 0, tilesetExplorer.imagePreview.width, tilesetExplorer.imagePreview.height);

        var tileWidth = tilesetExplorer.tileSetDefinition.background.width;
        var tileHeight = tilesetExplorer.tileSetDefinition.background.width;

        ctx.drawImage(tilesetExplorer.imagePreview, 0, 0, tilesetExplorer.imagePreview.width, tilesetExplorer.imagePreview.height, 0, 0, tilesetExplorer.imagePreview.width, tilesetExplorer.imagePreview.height);
        ctx.strokeStyle = "#80FF80";
        ctx.beginPath();
        for (var x = tileWidth; x < tilesetExplorer.imagePreview.width; x += tileWidth)
        {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, tilesetExplorer.imagePreview.height);
        }
        for (var y = tileHeight; y < tilesetExplorer.imagePreview.height; y += tileHeight)
        {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(tilesetExplorer.imagePreview.width, y + 0.5);
        }

        ctx.stroke();

        var nbw = Math.floor(tilesetExplorer.imagePreview.width / tileWidth);
        var nbh = Math.floor(tilesetExplorer.imagePreview.height / tileHeight);
        for (var x = 0; x < nbw; x++)
        {
            for (var y = 0; y < nbh; y++)
            {
                ctx.fillStyle = "#000000";
                ctx.fillText("" + (x + y * nbw), x * tileWidth + 5.5, y * tileHeight + 15.5);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText("" + (x + y * nbw), x * tileWidth + 6.5, y * tileHeight + 16.5);
            }
        }
    }
}