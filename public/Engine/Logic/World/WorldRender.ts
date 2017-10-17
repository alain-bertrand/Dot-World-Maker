///<reference path="World.ts" />
///<reference path="WorldArea.ts" />

interface RenderScreenCoordinate
{
    TileX: number;
    TileY: number;
    AreaX: number;
    AreaY: number;
    RelativeX: number;
    RelativeY: number;
    OffsetX: number;
    OffsetY: number;
}

interface ImageCache
{
    [s: string]: HTMLImageElement;
}

interface ObjectMinimap
{
    w: number;
    h: number;
    color: string;
}

interface ObjectMinimapCache
{
    [s: string]: ObjectMinimap;
}

class WorldRender
{
    public world: World;
    private backgroundTiles: HTMLImageElement;
    private objectSprites: ImageCache = {};
    private objectImages: ImageCache = {};
    private houseImages: ImageCache = {};
    private houseSprites: ImageCache = {};
    private canvasElement: string;
    private zoomLevel: number;

    public OnRender: (ctx: CanvasRenderingContext2D) => void;
    public minimap: boolean = false;
    public miniMapColor: string[] = null;
    public knownObjectMinimap: ObjectMinimapCache = {};

    public width: number;
    public height: number;
    public areaX: number = 0;
    public areaY: number = 0;
    public offsetX: number = 0;
    public offsetY: number = 0;

    public oldOffsetX: number = 0;
    public oldOffsetY: number = 0;

    public showGrid: boolean = false;
    public showMapActions: boolean = false;
    public zone: string = "Base";
    public mapEffect: MapEffect = null;

    public toLoad: number = 0;
    public loaded: number = 0;

    constructor(world: World, canvasElement: string = "gameCanvas", zoomLevel: number = 1)
    {
        this.canvasElement = canvasElement;
        this.zoomLevel = zoomLevel;

        $(window).bind("resize", () => { this.Resize() });
        this.world = world;
        this.Resize();

        this.backgroundTiles = new Image();
        this.backgroundTiles.addEventListener("load", () =>
        {
            this.loaded++;
        });
        this.backgroundTiles.onerror = this.backgroundTiles.onload;
        this.backgroundTiles.src = world.art.background.file;
        this.toLoad++;
    }

    public Dispose()
    {
        $(window).unbind("resize");
        this.objectImages = {};
        this.objectSprites = {};
    }

    public Render()
    {
        if (!this.world.art || !this.world.art.background || !this.world.art.background.width)
            return;

        var ctx = (<HTMLCanvasElement>document.getElementById(this.canvasElement)).getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);

        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = this.backgroundTiles.width / tileWidth;

        var orx = Math.round(Math.abs(this.offsetX) % tileWidth * (this.offsetX < 0 ? -1 : 1));
        var ory = Math.round(Math.abs(this.offsetY) % tileHeight * (this.offsetY < 0 ? -1 : 1));

        // Render the background
        for (var y = -1; y <= Math.ceil(this.height / this.world.art.background.height); y++)
        {
            if (y >= this.world.areaHeight)
                break;
            for (var x = -1; x <= Math.ceil(this.width / this.world.art.background.width); x++)
            {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;

                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight

                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;

                // Draw the background tile
                //var t = area.backgroundTiles[tx + ty * this.world.areaWidth];
                var t = area.GetTile(tx, ty, this.zone);
                var ox = (t % nbTilesPerLine);
                var oy = Math.floor(t / nbTilesPerLine)
                ctx.drawImage(this.backgroundTiles, ox * tileWidth, oy * tileHeight, tileWidth, tileHeight, x * tileWidth - orx, y * tileHeight - ory, tileWidth, tileHeight);
            }
        }
        // Render the objects
        for (var y = -20; y <= Math.ceil(this.height / this.world.art.background.height) + 20; y++)
        {
            if (y >= this.world.areaHeight)
                break;
            for (var x = -20; x <= Math.ceil(this.width / this.world.art.background.width) + 20; x++)
            {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;

                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight

                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;

                // Draw the object
                var objs = area.GetObjects(tx, ty, this.zone);
                for (var i = 0; i < objs.length; i++)
                {
                    var objx = (x * tileWidth - orx) + (objs[i].X - tx * tileWidth);
                    var objy = (y * tileHeight - ory) + (objs[i].Y - ty * tileHeight);

                    objs[i].Draw(this, ctx, objx, objy);
                }
            }
        }

        if (this.showMapActions)
        {
            ctx.fillStyle = "#E00000";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;

            var actionMade: string[] = [];

            for (var y = -20; y <= Math.ceil(this.height / this.world.art.background.height) + 20; y++)
            {
                if (y >= this.world.areaHeight)
                    break;
                for (var x = -20; x <= Math.ceil(this.width / this.world.art.background.width) + 20; x++)
                {
                    if (x >= this.world.areaWidth)
                        break;
                    var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                    var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;

                    var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                    var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                    if (tx < 0)
                        tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                    else
                        tx %= this.world.areaWidth;
                    if (ty < 0)
                        ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                    else
                        ty %= this.world.areaHeight

                    var area = this.world.GetArea(cx, cy, this.zone);
                    if (!area)
                        continue;

                    // Draw the object
                    var action = area.GetActions(tx * tileWidth, ty * tileHeight, this.zone, true);
                    if (action && actionMade.indexOf("" + action.X + "," + action.Y) == -1)
                    {
                        actionMade.push("" + action.X + "," + action.Y);

                        var objx = (x * tileWidth - orx) + (action.X - tx * tileWidth);
                        var objy = (y * tileHeight - ory) + (action.Y - ty * tileHeight);

                        ctx.beginPath();
                        var sizes = [0.5, 1, 2];
                        ctx.arc(objx, objy, tileWidth * sizes[action.Size === null || action.Size === undefined ? 1 : action.Size], 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
        }

        // Render the map effect if set
        if (this.mapEffect)
            this.mapEffect.Render(ctx, this.width, this.height);

        // Used for the map editor, allows to show a tile grid over the current rendered map
        if (this.showGrid)
        {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.strokeStyle = "#303030";
            for (var y = -1; y <= Math.ceil(this.height / this.world.art.background.height); y++)
            {
                if (y >= this.world.areaHeight)
                    break;
                ctx.moveTo(0, Math.round(y * tileHeight) + 0.5 - Math.round(ory));
                ctx.lineTo(this.width, Math.round(y * tileHeight) + 0.5 - Math.round(ory));
            }
            for (var x = -1; x <= Math.ceil(this.width / this.world.art.background.width); x++)
            {
                if (x >= this.world.areaWidth)
                    break;
                ctx.moveTo(Math.round(x * tileWidth) + 0.5 - Math.round(orx), 0);
                ctx.lineTo(Math.round(x * tileWidth) + 0.5 - Math.round(orx), this.height);
            }
            ctx.stroke();
        }
        if (this.OnRender)
            this.OnRender(ctx);
        if (this.minimap)
            this.RenderMiniMap(ctx);
    }

    private RenderMiniMap(ctx: CanvasRenderingContext2D, startX: number = null, startY: number = null)
    {
        if (startX === null)
            startX = Math.floor(this.width - 210);
        if (startY === null)
            startY = 10;

        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = this.backgroundTiles.width / tileWidth;

        var h = Math.ceil(this.height / this.world.art.background.height);
        var w = Math.ceil(this.width / this.world.art.background.width);

        if (!this.miniMapColor)
            this.miniMapColor = this.CalculateBackgroundMinimap();
        if (!this.miniMapColor)
            return;

        // Render the minimap
        for (var y = 0; y < 100; y++)
        {
            if (y >= this.world.areaHeight)
                break;
            for (var x = 0; x < 100; x++)
            {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x - Math.floor(50 - w / 2);
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y - Math.floor(50 - h / 2);

                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight

                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;

                // Draw the background tile
                var t = area.GetTile(tx, ty, this.zone);
                ctx.fillStyle = this.miniMapColor[t];
                ctx.fillRect(x * 2 + startX, y * 2 + startY, 2, 2);

                // Draw the object
                var objs = area.GetObjects(tx, ty, this.zone);
                for (var i = 0; i < objs.length; i++)
                {
                    var m = this.GetObjectMinimap(objs[i]);
                    if (m)
                    {
                        ctx.fillStyle = m.color;
                        ctx.fillRect(Math.floor(x * 2 + startX - m.w / 2), Math.floor(y * 2 + startY - m.h / 2), m.w, m.h);
                    }
                }
            }
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#303030";
        ctx.strokeRect(startX + 100.5 - w, startY + 100.5 - h, w * 2, h * 2);

        ctx.strokeStyle = "#000000";
        ctx.strokeRect(startX + 0.5, startY - 0.5, 201, 201);
    }

    public GetObjectMinimap(obj: WorldRenderObject): ObjectMinimap
    {
        if (!this.IsAllLoaded())
            return null;
        if (this.knownObjectMinimap[obj.Name] === undefined)
        {
            if (obj.Type == "WorldObject" || obj['__type'] == "WorldObject")
            {
                var img = this.GetObjectImage(obj.Name);
                if (!img)
                    return;
                var artInfo = this.world.art.objects[obj.Name];
                if (artInfo.width < this.world.art.background.width / 2 || artInfo.height < this.world.art.background.height / 2)
                    this.knownObjectMinimap[obj.Name] = null;
                else
                {
                    var canvas = <HTMLCanvasElement>document.createElement("canvas");
                    canvas.width = 1;
                    canvas.height = 1;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, 0, 0, 1, 1);
                    var data = ctx.getImageData(0, 0, 1, 1);
                    var artInfo = this.world.art.objects[obj.Name];
                    this.knownObjectMinimap[obj.Name] = {
                        w: Math.round(artInfo.width * 2 / this.world.art.background.width),
                        h: Math.round(artInfo.height * 2 / this.world.art.background.height),
                        color: ColorHandling.RgbToHex(data.data[0], data.data[1], data.data[2])
                    };
                }
            }
            else if (obj.Type == "WorldHouse" || obj['__type'] == "WorldHouse")
            {
                var house = world.GetHouse(obj.Name);
                this.knownObjectMinimap[obj.Name] = {
                    w: Math.round(house.collisionWidth * 2 / this.world.art.background.width),
                    h: Math.round(house.collisionHeight * 2 / this.world.art.background.width),
                    color: "#C0C0C0"
                };
            }
            else
                this.knownObjectMinimap[obj.Name] = null;
        }
        return this.knownObjectMinimap[obj.Name];
    }

    public CalculateBackgroundMinimap(): string[]
    {
        if (!this.IsAllLoaded())
            return null;

        var res = [];
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = Math.floor(this.backgroundTiles.width / tileWidth);

        var canvas = <HTMLCanvasElement>document.createElement("canvas");
        canvas.width = nbTilesPerLine;
        canvas.height = Math.floor(this.backgroundTiles.height / tileHeight);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.backgroundTiles, 0, 0, this.backgroundTiles.width, this.backgroundTiles.height, 0, 0, canvas.width, canvas.height);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width; x++)
            for (var y = 0; y < canvas.height; y++)
                res[x + y * canvas.width] = ColorHandling.RgbToHex(data.data[(x + y * canvas.width) * 4 + 0], data.data[(x + y * canvas.width) * 4 + 1], data.data[(x + y * canvas.width) * 4 + 2]);

        return res;
    }

    public MapTileToScreen(x: number, y: number): Point
    {
        return this.MapToScreen(x * this.world.art.background.width, y * this.world.art.background.height);
    }

    public MapToScreen(x: number, y: number): Point
    {
        return { X: x - this.offsetX, Y: y - this.offsetY };
    }

    public ScreenToMap(x: number, y: number): RenderScreenCoordinate
    {
        var pos = $("#" + this.canvasElement).position();

        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;

        var orx = Math.abs(this.offsetX) % tileWidth * (this.offsetX < 0 ? -1 : 1);
        var ory = Math.abs(this.offsetY) % tileHeight * (this.offsetY < 0 ? -1 : 1);

        var x = (x - pos.left) + this.offsetX;
        var y = (y - pos.top) + this.offsetY;

        var ox = Math.abs(x) % tileWidth;
        var oy = Math.abs(y) % tileHeight;
        if (x < 0)
            ox = tileWidth - ox;
        if (y < 0)
            oy = tileHeight - oy;

        x = Math.floor(x / tileWidth);
        y = Math.floor(y / tileHeight);

        var cx = this.areaX + Math.floor(x / this.world.areaWidth);
        var cy = this.areaY + Math.floor(y / this.world.areaHeight);

        var tx = x;
        var ty = y;
        if (tx < 0)
            tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
        else
            tx %= this.world.areaWidth;
        if (ty < 0)
            ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
        else
            ty %= this.world.areaHeight

        var rx = tx + (cx - this.areaX) * (this.world.areaWidth - ((cx - this.areaX) < 0 ? 1 : 0));
        var ry = ty + (cy - this.areaY) * (this.world.areaHeight - ((cy - this.areaY) < 0 ? 1 : 0));

        return { TileX: tx, TileY: ty, AreaX: cx, AreaY: cy, RelativeX: rx, RelativeY: ry, OffsetX: ox, OffsetY: oy };
    }

    // Handles the risize of the canvas
    public Resize()
    {
        var canvas = <HTMLCanvasElement>document.getElementById(this.canvasElement);
        if (!canvas)
            return;

        this.width = document.getElementById(this.canvasElement).clientWidth * this.zoomLevel;
        this.height = document.getElementById(this.canvasElement).clientHeight * this.zoomLevel;

        canvas.width = this.width;
        canvas.height = this.height;

        if (this.backgroundTiles)
            this.Render();
    }

    public IsAllLoaded(): boolean
    {
        return (this.loaded >= this.toLoad);
    }

    public GetActorSpriteSheet(name: string): HTMLImageElement
    {
        if (!this.objectImages[name])
        {
            this.objectImages[name] = new Image();
            this.objectImages[name].addEventListener("load", () =>
            {
                this.loaded++;
            });
            this.objectImages[name].onerror = this.objectImages[name].onload;
            this.objectImages[name].src = name;
            this.toLoad++;
        }
        return this.objectImages[name];
    }

    public GetActorImage(name: string): HTMLImageElement
    {
        var fname = null;
        if (this.world.art.characters[name])
            fname = this.world.art.characters[name].file;
        if (!fname)
            return null;

        if (!this.objectImages[fname])
        {
            this.objectImages[fname] = new Image();
            this.objectImages[fname].addEventListener("load", () =>
            {
                this.loaded++;
            });
            this.objectImages[fname].onerror = this.objectImages[fname].onload;
            this.objectImages[fname].src = fname;

            this.toLoad++;
        }
        return this.objectImages[fname];
    }

    public GetObjectSpriteSheet(name: string)
    {
        if (!this.objectImages[name])
        {
            this.objectImages[name] = new Image();
            this.objectImages[name].addEventListener("load", () =>
            {
                this.loaded++;
            });
            this.objectImages[name].onerror = this.objectImages[name].onload;
            this.objectImages[name].src = name;

            this.toLoad++;
        }
        return this.objectImages[name];
    }

    // Handles the cache of the images
    public GetObjectImage(name: string): HTMLImageElement
    {
        if (!this.objectSprites[name])
        {
            if (!this.world.art.objects[name])
                return null;
            if (!this.objectImages[this.world.art.objects[name].file])
            {
                this.objectImages[this.world.art.objects[name].file] = new Image();
                this.objectImages[this.world.art.objects[name].file].addEventListener("load", () =>
                {
                    this.loaded++;
                });
                this.objectImages[this.world.art.objects[name].file].onerror = this.objectImages[this.world.art.objects[name].file].onload;
                this.objectImages[this.world.art.objects[name].file].src = this.world.art.objects[name].file;

                this.toLoad++;
            }
            this.objectSprites[name] = this.objectImages[this.world.art.objects[name].file];
        }
        return this.objectSprites[name];
    }

    public GetHouseImage(name: string): HTMLImageElement
    {
        if (!this.houseSprites[name])
        {
            if (!this.world.art.house_parts[name])
                return null;
            if (!this.houseImages[this.world.art.house_parts[name].file])
            {
                this.houseImages[this.world.art.house_parts[name].file] = new Image();
                this.houseImages[this.world.art.house_parts[name].file].addEventListener("load", () =>
                {
                    this.loaded++;
                });
                this.houseImages[this.world.art.house_parts[name].file].onerror = this.houseImages[this.world.art.house_parts[name].file].onload;
                this.houseImages[this.world.art.house_parts[name].file].src = this.world.art.house_parts[name].file;

                this.toLoad++;
            }
            this.houseSprites[name] = this.houseImages[this.world.art.house_parts[name].file];
        }

        return this.houseSprites[name];
    }

    public GetTileSheet(): HTMLImageElement
    {
        return this.backgroundTiles;
    }
}