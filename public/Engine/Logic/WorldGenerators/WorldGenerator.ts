var knownGenerators: string[] = [];

// Class decorator which will put all the API inside the api variable.
function WorldGeneratorClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownGenerators.push(className.substr(0, className.length - 9));
    knownGenerators.sort();
}

abstract class WorldGenerator
{
    protected world: World;
    protected rnd: SeededRandom;
    protected seed: string;
    protected zoneInfo: WorldZone;

    constructor(world: World, seed: string, zoneInfo: WorldZone)
    {
        this.zoneInfo = zoneInfo;
        this.seed = seed;
        this.world = world;
        this.rnd = new SeededRandom();
        this.rnd.Seed(seed);
    }

    public abstract Generate(x: number, y: number, zone: string): WorldArea;

    public static GetTypeOfTile(tileSetDefinition: TilesetInformation, t: number, withTransition?: boolean): string
    {
        var types = tileSetDefinition.background.types;
        for (var i in types)
        {
            if ((<number[]>types[i]).contains(t))
                return i;
        }

        if (withTransition)
        {
            var transitions = tileSetDefinition.background.transitions;
            for (var j = 0; j < transitions.length; j++)
            {
                if (transitions[j].transition.contains(t))
                    return transitions[j].to;
            }
        }
        return null;
    }

    public static IsTransition(world: World, t: number): boolean
    {
        for (var i = 0; i < world.art.background.transitions.length; i++)
        {
            if (world.art.background.transitions[i].transition.contains(t))
                return true;
        }
        return false;
    }

    public GetTile(x: number, y: number, areaX: number, areaY: number, zone: string): number
    {
        while (x < 0)
        {
            x += this.world.areaWidth;
            areaX--;
        }
        while (x >= this.world.areaWidth)
        {
            x -= this.world.areaWidth;
            areaX++;
        }
        while (y < 0)
        {
            y += this.world.areaHeight;
            areaY--;
        }
        while (y >= this.world.areaHeight)
        {
            y -= this.world.areaHeight;
            areaY++;
        }
        var area: WorldArea;
        if (this.world.GetArea)
            area = this.world.GetArea(areaX, areaY, zone);
        if (area)
            return area.backgroundTiles[x + y * this.world.areaWidth];
        return this.GetBaseBackgroundTile(x, y, areaX, areaY, zone);
    }

    public abstract GetBaseBackgroundTile(x: number, y: number, areaX: number, areaY: number, zone: string): number;

    public ChangeTransition(x: number, y: number, areaX: number, areaY: number, zone: string): number
    {
        var cells: string[][] = [];
        var base = WorldGenerator.GetTypeOfTile(this.world.art, this.GetTile(x, y, areaX, areaY, zone), true);

        for (var a = -1; a < 2; a++)
        {
            cells[a] = [];
            for (var b = -1; b < 2; b++)
            {
                cells[a][b] = WorldGenerator.GetTypeOfTile(this.world.art, this.GetTile(a + x, b + y, areaX, areaY, zone));
                if (cells[a][b] == null)
                    cells[a][b] = base;
            }
        }


        // Small Corners
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][-1], cells[1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, -1, -1))
            return transition.transition[4];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][-1], cells[-1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, 1, -1))
            return transition.transition[5];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][1], cells[1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, -1, 1))
            return transition.transition[6];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][1], cells[-1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, 1, 1))
            return transition.transition[7];

        // Corners
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][-1], cells[1][1]);
        if (transition && transition.size != 4 && cells[-1][0] == transition.from && cells[0][-1] == transition.from && cells[0][0] == transition.to)
            return transition.transition[0];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][-1], cells[-1][1]);
        if (transition && transition.size != 4 && cells[0][-1] == transition.from && cells[1][0] == transition.from && cells[0][0] == transition.to)
            return transition.transition[1];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][1], cells[1][-1]);
        if (transition && transition.size != 4 && cells[-1][0] == transition.from && cells[0][1] == transition.from && cells[0][0] == transition.to)
            return transition.transition[2];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][1], cells[-1][-1]);
        if (transition && transition.size != 4 && cells[0][1] == transition.from && cells[1][0] == transition.from && cells[0][0] == transition.to)
            return transition.transition[3];

        // Sides
        var transition = WorldGenerator.GetTransition(this.world.art, cells[0][-1], cells[0][1]);
        if (transition && ((transition.size == 4 && cells[0][0] == transition.from && cells[0][1] == transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 8 : 0];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][0], cells[1][0]);
        if (transition && ((transition.size == 4 && cells[0][-1] != transition.to && cells[0][1] != transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 9 : 1];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][0], cells[-1][0]);
        if (transition && ((transition.size == 4 && cells[0][-1] != transition.to && cells[0][1] != transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 10 : 2];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[0][1], cells[0][-1]);
        if (transition && ((transition.size == 4 && cells[0][0] == transition.from && cells[0][-1] == transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 11 : 3];

        // Nothing found
        return null;
    }

    public static AllBut(cells: string[][], x: number, y: number): boolean
    {
        var toCheck = cells[x][y];
        var other = cells[-x][-y];
        if (other == toCheck)
            return false;
        for (var i = -1; i < 2; i++)
        {
            for (var j = -1; j < 2; j++)
            {
                if (i == x && j == y)
                    continue;
                if (cells[i][j] != other && cells[i][j] != null)
                    return false;
            }
        }
        return true;
    }

    public static GetTransition(tileSetDefinition: TilesetInformation, fromType: string, toType: string): TilesetTransition
    {
        if (fromType == toType)
            return null;
        var transitions = tileSetDefinition.background.transitions;
        if (!transitions)
            return null;
        for (var j = 0; j < transitions.length; j++)
        {
            if (transitions[j].from == fromType && transitions[j].to == toType)
                return transitions[j];
        }
        return null;
    }

    protected GenerateObjects(worldArea: WorldArea)
    {
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.width;

        this.rnd.Seed(this.seed + "_" + worldArea.X + "_" + worldArea.Y);

        // Place the objects
        if (this.zoneInfo.Objects)
        {
            //for (var i = 0; i < (this.world.areaWidth - 1) * (this.world.areaHeight - 1); i++)
            for (var i = 0; i < (this.world.areaWidth) * (this.world.areaHeight); i++)
            {
                for (var j = 0; j < this.zoneInfo.Objects.length; j++)
                {
                    var item = this.zoneInfo.Objects[j].Name;

                    var dice = this.rnd.Next() * 100;
                    if (this.zoneInfo.Objects[j].Frequency && dice <= this.zoneInfo.Objects[j].Frequency)
                    {
                        var tx = i % this.world.areaWidth;
                        var ty = Math.floor(i / this.world.areaWidth);
                        var obj = new WorldObject(item, 0, 0);

                        // Check if this object can be placed on this position
                        if (this.zoneInfo.Objects[j].PlaceOn)
                        {
                            var ttype = WorldGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[tx + ty * this.world.areaWidth]);
                            if (!this.zoneInfo.Objects[j].PlaceOn.contains(ttype))
                                continue;
                        }

                        obj.X = tx * tileWidth + this.rnd.Next(tileWidth);
                        obj.Y = ty * tileHeight + this.rnd.Next(tileHeight);
                        worldArea.objects.push(obj);
                        break;
                    }
                }
            }
        }
    }

    public abstract RenameTileType(oldName: string, newName: string);
}