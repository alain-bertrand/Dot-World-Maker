/// <reference path="WorldGenerator.ts" />

interface MazeData
{
    pathSize: number;
    mazeWidth: number;
    mazeHeight: number;
    walkTile: string;
    erosion: number;
    seed: number;
}

interface MapPoint
{
    x: number;
    y: number;
}

@WorldGeneratorClass
class MazeGenerator extends WorldGenerator
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

        var mazeData = <MazeData>this.zoneInfo.GeneratorParameters;
        if (!mazeData.erosion)
            mazeData.erosion = 0;

        if (!this.maze)
            this.maze = MazeGenerator.CreateMaze("" + mazeData.seed, mazeData.mazeWidth, mazeData.mazeHeight, Math.floor(mazeData.mazeWidth / 2), Math.floor(mazeData.mazeHeight / 2), mazeData.pathSize, mazeData.erosion);

        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++)
        {
            for (var b = 0; b < this.world.areaHeight; b++)
            {
                var type: number[];
                var tx = (x * this.world.areaWidth + a);
                var ty = (y * this.world.areaHeight + b);
                if (tx < 0 || ty < 0 || tx >= mazeData.mazeWidth * mazeData.pathSize || ty >= mazeData.mazeHeight * mazeData.pathSize || this.maze[tx][ty] == false)
                    type = this.world.art.background.types[this.zoneInfo.BaseTileType];
                else
                    type = this.world.art.background.types[mazeData.walkTile];
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
        var mazeData = <MazeData>this.zoneInfo.GeneratorParameters;
        if (!mazeData.erosion)
            mazeData.erosion = 0;

        if (!this.maze)
            this.maze = MazeGenerator.CreateMaze("" + mazeData.seed, mazeData.mazeWidth, mazeData.mazeHeight, Math.floor(mazeData.mazeWidth / 2), Math.floor(mazeData.mazeHeight / 2), mazeData.pathSize, mazeData.erosion);
        var tx = (areaX * this.world.areaWidth + x);
        var ty = (areaY * this.world.areaHeight + y);

        var type: number[];
        if (tx < 0 || ty < 0 || tx >= mazeData.mazeWidth * mazeData.pathSize || ty >= mazeData.mazeHeight * mazeData.pathSize || this.maze[tx][ty] == false)
            type = this.world.art.background.types[this.zoneInfo.BaseTileType];
        else
            type = this.world.art.background.types[mazeData.walkTile];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    }

    static CreateMaze(seed: string, w: number, h: number, cx: number, cy: number, pathSize: number, erosion: number): boolean[][]
    {
        if (!w || !h)
            return [];
        var smallMap = MazeGenerator.CreateBaseMaze(seed, w, h, cx, cy);
        var map: boolean[][] = [];
        for (var x = 0; x < w * pathSize; x++)
        {
            map[x] = [];
            for (var y = 0; y < h * pathSize; y++)
                map[x][y] = smallMap[Math.floor(x / pathSize)][Math.floor(y / pathSize)];
        }
        if (erosion)
        {
            var rnd = new SeededRandom();
            rnd.Seed(seed);
            var perlin = new Perlin(rnd);

            for (var i = 0; i < erosion; i++)
                map = MazeGenerator.Erode(map, perlin);
        }
        return map;
    }

    static Erode(map: boolean[][], perlin: Perlin)
    {
        var origMap = JSON.parse(JSON.stringify(map));
        var w: number = map.length;
        var h: number = map[0].length;

        for (var x = 0; x < w; x++)
        {
            for (var y = 0; y < h; y++)
            {
                var p = Math.round(perlin.Noise(x / 15.0, y / 15.0) * 4 + 4);
                var n = MazeGenerator.CountNeighbour(origMap, x, y);
                /*if (p == 0 && n > 0 && origMap[x][y] == false)
                    map[x][y] = true;*/
                if (p >= 7 && n < 8 && origMap[x][y] == true)
                    map[x][y] = false;
                else if (n == 3 && origMap[x][y] == true)
                    map[x][y] = false;
            }
        }

        // Fixes errors
        for (var x = 0; x < w; x++)
        {
            for (var y = 0; y < h; y++)
            {
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

    static CreateBaseMaze(seed: string, w: number, h: number, cx: number, cy: number): boolean[][]
    {
        if (!w || !h)
            return [];
        var rnd = new SeededRandom();
        rnd.Seed("" + seed);

        var visited: boolean[] = [];

        // Build the array
        var map: boolean[][] = [];

        for (var i = 0; i < w; i++)
            map[i] = [];

        var offX = 1 - (cx % 2);
        var offY = 1 - (cy % 2);

        for (var i = 0; i < w; i++)
        {
            for (var j = 0; j < h; j++)
            {
                map[i][j] = false;
                visited[i + j * w] = false;
            }
        }
        // Fill all
        for (var i = 0; i < w - offX; i++)
        {
            for (var j = 0; j < h - offY; j++)
            {
                if (i % 2 == 1 && j % 2 == 1 && i < w - (1 + offX) && j < h - (1 + offY))
                    map[i + offX][j + offY] = true;
                else
                    map[i + offX][j + offY] = false;
            }
        }

        var todo: MapPoint[] = [{ x: 1 + offX, y: 1 + offY }];
        var done: MapPoint[] = [];


        visited[todo[0].x + todo[0].y * w] = true;
        var maxSteps: number = Math.round(w * h / 3);

        while (todo.length > 0 && maxSteps > 0)
        {
            maxSteps--;
            var s = Math.min(Math.round(rnd.Next() * todo.length), todo.length - 1);
            var c = todo[s];
            done[done.length] = c;
            todo.splice(s, 1);

            if (c.x > 1 + offX && visited[(c.x - 2) + c.y * w] == false)
            {
                todo[todo.length] = { x: c.x - 2, y: c.y };
                visited[(c.x - 2) + c.y * w] = true;
                map[(c.x) - 1][c.y] = true;
            }
            if (c.y > 1 + offY && visited[(c.x) + (c.y - 2) * w] == false)
            {
                todo[todo.length] = { x: c.x, y: c.y - 2 };
                visited[(c.x) + (c.y - 2) * w] = true;
                map[c.x][(c.y) - 1] = true;
            }
            if (c.x + 2 < w - 1 && visited[(c.x + 2) + c.y * w] == false)
            {
                todo[todo.length] = { x: c.x + 2, y: c.y };
                visited[(c.x + 2) + c.y * w] = true;
                map[(c.x) + 1][c.y] = true;
            }
            if (c.y + 2 < h - 1 && visited[(c.x) + (c.y + 2) * w] == false)
            {
                todo[todo.length] = { x: c.x, y: c.y + 2 };
                visited[(c.x) + (c.y + 2) * w] = true;
                map[c.x][(c.y) + 1] = true;
            }
        }

        return map;
    }

    public static DefaultParameters(): MazeData
    {
        var knownTypes = Keys(world.art.background.types);
        return { mazeWidth: 50, mazeHeight: 50, pathSize: 5, walkTile: (knownTypes.length > 1 ? knownTypes[1] : knownTypes[0]), seed: Math.round(Math.random() * 1000000), erosion: 0 };
    }

    public static DisplayParameters(generatorParameters: MazeData): string
    {
        if (!generatorParameters.erosion)
            generatorParameters.erosion = 0;
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
        html += "<td><input type='text' value='" + generatorParameters.mazeWidth + "' onkeyup='MazeGenerator.ChangeParameter(\"mazeWidth\")' id='mazeWidth'></td></tr>";
        html += "<tr><td>Maze Height:</td>";
        html += "<td><input type='text' value='" + generatorParameters.mazeHeight + "' onkeyup='MazeGenerator.ChangeParameter(\"mazeHeight\")' id='mazeHeight'></td></tr>";
        html += "<tr><td>Erosion:</td>";
        html += "<td><select id='erosion' onchange='MazeGenerator.ChangeParameter(\"erosion\")'>";
        var errosionTypes: string[] = ["None", "Light", "Medium", "Heavy"];
        for (var i = 0; i < errosionTypes.length; i++)
            html += "<option value='" + i + "'" + (generatorParameters.erosion == i ? " selected" : "") + ">" + errosionTypes[i] + "</option>";
        html += "</select></td></tr>";
        return html;
    }

    static ChangeParameter(paramName: string)
    {
        if (typeof (<MazeData>zoneEditor.selectedZone.GeneratorParameters)[paramName] == "number")
        {
            var n = parseInt($("#" + paramName).val());
            if (!isNaN(n))
                (<MazeData>zoneEditor.selectedZone.GeneratorParameters)[paramName] = n;
        }
        else
            (<MazeData>zoneEditor.selectedZone.GeneratorParameters)[paramName] = $("#" + paramName).val();

        switch (paramName)
        {
            case "pathSize":
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).pathSize < 1)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).pathSize = 1;
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).pathSize > 10)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).pathSize = 10;
                break;
            case "mazeWidth":
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeWidth < 5)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeWidth = 5;
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeWidth > 200)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeWidth = 200;
                break;
            case "mazeHeight":
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeHeight < 5)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeHeight = 5;
                if ((<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeHeight > 200)
                    (<MazeData>zoneEditor.selectedZone.GeneratorParameters).mazeHeight = 200;
                break;
            default:
                break;
        }

        window['ZoneEditor'].MakeZonePreview();
    }

    public RenameTileType(oldName: string, newName: string)
    {
        var mazeData = <MazeData>this.zoneInfo.GeneratorParameters;
        if (mazeData.walkTile == oldName)
            mazeData.walkTile = newName;
    }
}