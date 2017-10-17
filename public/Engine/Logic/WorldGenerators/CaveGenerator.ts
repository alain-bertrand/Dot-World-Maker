/// <reference path="WorldGenerator.ts" />

interface CaveData
{
    caveWidth: number;
    caveHeight: number;
    pathSize: number;
    seed: number;
    walkTile: string;
}

@WorldGeneratorClass
class CaveGenerator extends WorldGenerator
{
    private maze: boolean[][];

    constructor(world: World, seed: string, zoneInfo: WorldZone)
    {
        super(world, seed, zoneInfo);
    }

    public Generate(x: number, y: number, zone: string): WorldArea
    {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.Zone = zone;
        worldArea.world = this.world;

        worldArea.backgroundTiles = [];
        worldArea.objects = [];

        var caveData = <CaveData>this.zoneInfo.GeneratorParameters;

        if (!this.maze)
            //this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, Math.floor(caveData.caveWidth / 2), Math.floor(caveData.caveHeight / 2), caveData.pathSize);
            this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, 2, 2, caveData.pathSize);

        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++)
        {
            for (var b = 0; b < this.world.areaHeight; b++)
            {
                var type: number[];
                var tx = (x * this.world.areaWidth + a);
                var ty = (y * this.world.areaHeight + b);
                if (tx < 0 || ty < 0 || tx >= caveData.caveWidth * caveData.pathSize || ty >= caveData.caveHeight * caveData.pathSize || this.maze[tx][ty] == false)
                    type = this.world.art.background.types[this.zoneInfo.BaseTileType];
                else
                    type = this.world.art.background.types[caveData.walkTile];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }

        var knownTransitions = {};
        for (var i = 0; i < this.world.art.background.transitions.length; i++)
            knownTransitions[this.world.art.background.transitions[i].to] = true;
        // Make a copy of the tiles such that we use the original as source
        for (var a = 0; a < this.world.areaWidth; a++)
        {
            for (var b = 0; b < this.world.areaHeight; b++)
            {
                var t = WorldGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[a + b * this.world.areaWidth]);
                if (knownTransitions[t] === true)
                {
                    var ct = this.ChangeTransition(a, b, x, y, zone);
                    if (ct != null)
                        worldArea.backgroundTiles[a + b * this.world.areaWidth] = ct;
                }
            }
        }

        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    }

    public GetBaseBackgroundTile(x: number, y: number, areaX: number, areaY: number): number
    {
        var caveData = <CaveData>this.zoneInfo.GeneratorParameters;


        if (!this.maze)
            //this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, Math.floor(caveData.caveWidth / 2), Math.floor(caveData.caveHeight / 2), caveData.pathSize);
            this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, 2, 2, caveData.pathSize);
        var tx = (areaX * this.world.areaWidth + x);
        var ty = (areaY * this.world.areaHeight + y);

        var type: number[];
        if (tx < 0 || ty < 0 || tx >= caveData.caveWidth * caveData.pathSize || ty >= caveData.caveHeight * caveData.pathSize || this.maze[tx][ty] == false)
            type = this.world.art.background.types[this.zoneInfo.BaseTileType];
        else
            type = this.world.art.background.types[caveData.walkTile];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    }

    static CreateCave(seed: string, w: number, h: number, cx: number, cy: number, pathSize: number): boolean[][]
    {
        if (!w || !h)
            return [];
        var smallMap = CaveGenerator.CreateBaseCave(seed, w, h, cx, cy);
        var map: boolean[][] = [];
        for (var x = 0; x < w * pathSize; x++)
        {
            map[x] = [];
            for (var y = 0; y < h * pathSize; y++)
                map[x][y] = smallMap[Math.floor(x / pathSize)][Math.floor(y / pathSize)];
        }

        var origMap = JSON.parse(JSON.stringify(map));

        // Fixes errors
        for (var x = 1; x < w * pathSize - 1; x++)
        {
            for (var y = 1; y < h * pathSize - 1; y++)
            {
                // Diagonal
                if (map[x - 1][y - 1] == true && map[x][y] == true && map[x][y - 1] == false && map[x - 1][y] == false)
                {
                    for (var a = -1; a < 2; a++)
                        for (var b = -1; b < 2; b++)
                            map[x + a][y + b] = false;
                }

                // Diagonal
                if (map[x + 1][y - 1] == true && map[x][y] == true && map[x][y - 1] == false && map[x + 1][y] == false)
                {
                    for (var a = -1; a < 2; a++)
                        for (var b = -1; b < 2; b++)
                            map[x + a][y + b] = false;
                }

                // Corner
                if (MazeGenerator.CountNeighbour(origMap, x, y) == 3 && origMap[x][y] == true)
                    map[x][y] = false;

                var n = MazeGenerator.CountNeighbour(map, x, y, "horizontal");
                if (n == 2 && map[x][y] == false)
                {
                    map[x - 1][y] = true;
                    map[x + 1][y] = true;
                }

                var n = MazeGenerator.CountNeighbour(map, x, y, "vertical");
                if (n == 2 && map[x][y] == false)
                {
                    map[x][y - 1] = true;
                    map[x][y + 1] = true;
                }

                var n = MazeGenerator.CountNeighbour(map, x, y);
                if (n >= 5 && map[x][y] == false)
                {
                    map[x][y] = true;
                }
            }
        }

        return map;
    }

    static CountNeighbour(map: boolean[][], x: number, y: number, directions: string = "all")
    {
        var w: number = map.length;
        var h: number = map[0].length;

        switch (directions)
        {
            case "vertical":
                var n = 0;
                for (var b = -1; b < 2; b++)
                {
                    if (b == 0)
                        continue;
                    if (b + y < 0 || b + y >= h)
                        continue;
                    if (map[x][b + y] == true)
                        n++;
                }
                break;
            case "horizontal":
                var n = 0;
                for (var a = -1; a < 2; a++)
                {
                    if (a == 0)
                        continue;
                    if (a + x < 0 || a + x >= w)
                        continue;
                    if (map[a + x][y] == true)
                        n++;
                }
                break;
            default:
                var n = 0;
                for (var a = -1; a < 2; a++)
                {
                    for (var b = -1; b < 2; b++)
                    {
                        if (a == 0 && b == 0)
                            continue;
                        if (a + x < 0 || b + y < 0 || a + x >= w || b + y >= h)
                            continue;
                        if (map[a + x][b + y] == true)
                            n++;
                    }
                }
                break;
        }
        return n;
    }

    private static CreateBaseCave(seed: string, w: number, h: number, cx: number, cy: number, coverage?: number): boolean[][]
    {
        var rnd = new SeededRandom();
        rnd.Seed("" + seed);


        if (coverage == null || coverage == undefined)
            coverage = Math.floor((w * h) / 6);

        var minCoverage = Math.floor((w * h) / 20);

        // Build the array
        var map: boolean[][] = null;
        var done: MapPoint[] = [];
        for (var genNb = 0; ; genNb++)
        {
            map = [];

            for (var i = 0; i < h; i++)
                map[i] = [];

            // Fill all
            for (var i = 0; i < w; i++)
                for (var j = 0; j < h; j++)
                    map[i][j] = false;

            var todo: MapPoint[] = [];
            todo[todo.length] = { x: cx, y: cy };
            done = [];


            while (todo.length > 0)
            {
                var step = todo[0];
                todo.splice(0, 1);

                var x = step.x;
                var y = step.y;

                map[x][y] = true;
                done[done.length] = step;
                var d = Math.round(rnd.Next() * 3);
                var nbDir = Math.round(rnd.Next() * 2.7);
                for (var k = 0; k < 1 + nbDir; k++)
                {
                    switch (d)
                    {
                        case 0:
                            if (CaveGenerator.MazeAroundIsFilled(map, x - 1, y, w, h))
                                todo[todo.length] = { x: x - 1, y: y };
                            break;
                        case 1:
                            if (CaveGenerator.MazeAroundIsFilled(map, x, y - 1, w, h))
                                todo[todo.length] = { x: x, y: y - 1 };
                            break;
                        case 2:
                            if (CaveGenerator.MazeAroundIsFilled(map, x + 1, y, w, h))
                                todo[todo.length] = { x: x + 1, y: y };
                            break;
                        case 3:
                            if (CaveGenerator.MazeAroundIsFilled(map, x, y + 1, w, h))
                                todo[todo.length] = { x: x, y: y + 1 };
                            break;
                    }
                    d = (d + 1) % 4;
                }
            }

            var nb = 0;
            for (var i = 0; i < w; i++)
                for (var j = 0; j < h; j++)
                    if (map[i][j])
                        nb++;
            //if (nb >= coverage || (genNb > 20 && nb > minCoverage))
            if (nb >= coverage || genNb > 200)
                break;
        }

        return map;
    }

    private static MazeAroundIsFilled(map: boolean[][], x: number, y: number, w: number, h: number): boolean
    {
        if (!(x > 0 && x < w - 1 && y > 0 && y < h - 1))
            return false;
        var n = 0;
        if (map[x][y] == true)
            n += 5;
        if (map[x - 1][y] == true)
            n++;
        if (map[x + 1][y] == true)
            n++;
        if (map[x][y - 1] == true)
            n++;
        if (map[x][y + 1] == true)
            n++;

        if (n < 2)
            return true;
        return false;
    }


    public static DefaultParameters(): CaveData
    {
        var knownTypes = Keys(world.art.background.types);
        return { caveWidth: 50, caveHeight: 50, pathSize: 5, walkTile: (knownTypes.length > 1 ? knownTypes[1] : knownTypes[0]), seed: Math.round(Math.random() * 1000000) };
    }

    public static DisplayParameters(generatorParameters: CaveData): string
    {
        var html = "";
        html += "<tr><td>Walkable Tile:</td>";
        html += "<td><select onchange='MazeGenerator.ChangeParameter(\"walkTile\")' id='walkTile'>";
        for (var j in world.art.background.types)
            html += "<option value='" + j + "'" + (generatorParameters.walkTile == j ? " selected" : "") + ">" + j + "</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Seed:</td>";
        html += "<td><input type='text' value='" + generatorParameters.seed + "' onkeyup='MazeGenerator.ChangeParameter(\"seed\")' id='seed'></td></tr>";
        html += "<tr><td>Path Size:</td>";
        html += "<td><input type='text' value='" + generatorParameters.pathSize + "' onkeyup='MazeGenerator.ChangeParameter(\"pathSize\")' id='pathSize'></td></tr>";
        html += "<tr><td>Maze Width:</td>";
        html += "<td><input type='text' value='" + generatorParameters.caveWidth + "' onkeyup='MazeGenerator.ChangeParameter(\"caveWidth\")' id='caveWidth'></td></tr>";
        html += "<tr><td>Maze Height:</td>";
        html += "<td><input type='text' value='" + generatorParameters.caveHeight + "' onkeyup='MazeGenerator.ChangeParameter(\"caveHeight\")' id='caveHeight'></td></tr>";
        return html;
    }

    static ChangeParameter(paramName: string)
    {
        if (typeof (<CaveData>zoneEditor.selectedZone.GeneratorParameters)[paramName] == "number")
        {
            var n = parseInt($("#" + paramName).val());
            if (!isNaN(n))
                (<CaveData>zoneEditor.selectedZone.GeneratorParameters)[paramName] = n;
        }
        else
            (<CaveData>zoneEditor.selectedZone.GeneratorParameters)[paramName] = $("#" + paramName).val();

        switch (paramName)
        {
            case "pathSize":
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).pathSize < 1)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).pathSize = 1;
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).pathSize > 10)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).pathSize = 10;
                break;
            case "caveWidth":
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveWidth < 5)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveWidth = 5;
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveWidth > 200)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveWidth = 200;
                break;
            case "caveHeight":
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveHeight < 5)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveHeight = 5;
                if ((<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveHeight > 200)
                    (<CaveData>zoneEditor.selectedZone.GeneratorParameters).caveHeight = 200;
                break;
            default:
                break;
        }

        window['ZoneEditor'].MakeZonePreview();
    }

    public RenameTileType(oldName: string, newName: string)
    {
        var caveData = <CaveData>this.zoneInfo.GeneratorParameters;
        if (caveData.walkTile == oldName)
            caveData.walkTile = newName;
    }
}