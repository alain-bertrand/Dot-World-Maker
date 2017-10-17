///<reference path="../World/WorldArea.ts" />

class WorldHouse implements WorldRenderObject
{
    public Name: string;
    public X: number;
    public Y: number;

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var house = world.GetHouse(this.Name);
        var cx = Math.floor(house.collisionX + house.collisionWidth / 2);
        var cy = Math.floor(house.collisionY + house.collisionHeight / 2);

        for (var i = 0; i < house.parts.length; i++)
        {
            var p = house.parts[i];
            var house_part = world.art.house_parts[p.part];
            if (!house_part)
                continue;
            if (house_part.width < 1 || house_part.height < 1)
                continue;
            var img = renderEngine.GetHouseImage(p.part);
            if (!img)
                continue;
            ctx.drawImage(img, house_part.x, house_part.y, house_part.width, house_part.height, x + p.x - cx, y + p.y - cy, house_part.width, house_part.height);
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        return false;
    }

    constructor(name: string, x: number, y: number)
    {
        this.Name = name;
        this.X = x;
        this.Y = y;
    }

    public static HouseSize(name: string): Rectangle
    {
        var house = world.GetHouse(name);
        if (!house)
            return null;
        var cx = Math.floor(house.collisionX + house.collisionWidth / 2);
        var cy = Math.floor(house.collisionY + house.collisionHeight / 2);

        var minX = 0;
        var minY = 0;
        var maxX = 0;
        var maxY = 0;

        for (var i = 0; i < house.parts.length; i++)
        {
            var p = house.parts[i];
            minX = Math.min(p.x - cx, minX);
            minY = Math.min(p.y - cy, minY);

            var house_part = world.art.house_parts[p.part];

            maxX = Math.max(p.x - cx + house_part.width, maxX);
            maxY = Math.max(p.y - cy + house_part.height, maxY);
        }

        return {
            X: minX,
            Y: minY,
            Width: maxX - minX,
            Height: maxY - minY
        };
    }
}