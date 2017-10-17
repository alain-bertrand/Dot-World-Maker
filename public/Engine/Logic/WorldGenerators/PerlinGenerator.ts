/// <reference path="WorldGenerator.ts" />

var perlinGenerator = new (class
{
    perlin: Perlin = null;
});

interface PerlinData
{
    zoomFactor: number;
    levels: TilesetLevels[];
}

@WorldGeneratorClass
class PerlinGenerator extends WorldGenerator
{
    constructor(world: World, seed: string, zoneInfo: WorldZone)
    {
        super(world, seed, zoneInfo);
    }

    public Generate(x: number, y: number, zone: string): WorldArea
    {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.world = this.world;
        worldArea.Zone = zone;
        worldArea.backgroundTiles = [];
        worldArea.objects = [];

        var levels = (<PerlinData>this.zoneInfo.GeneratorParameters).levels.slice();
        levels.sort((a, b) => { return a.maxLevel - b.maxLevel; });

        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++)
        {
            for (var b = 0; b < this.world.areaHeight; b++)
            {
                var type = this.world.art.background.types[PerlinGenerator.GetTypeOfTile(this.world.art, this.GetBaseBackgroundTile(a, b, x, y))];
                //var type = this.world.tileSetDefinition.background.types[this.zoneInfo.BaseTileType];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }

        // Smooth the tiles
        if (levels)
        {
            var knownTransitions = {};
            for (var i = 0; i < this.world.art.background.transitions.length; i++)
                knownTransitions[this.world.art.background.transitions[i].to] = true;

            // Make a copy of the tiles such that we use the original as source
            for (var a = 0; a < this.world.areaWidth; a++)
            {
                for (var b = 0; b < this.world.areaHeight; b++)
                {
                    var t = PerlinGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[a + b * this.world.areaWidth]);
                    if (knownTransitions[t] === true)
                    {
                        var ct = this.ChangeTransition(a, b, x, y, zone);
                        if (ct != null)
                            worldArea.backgroundTiles[a + b * this.world.areaWidth] = ct;
                    }
                }
            }
        }

        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();

        return worldArea;
    }

    public GetBaseBackgroundTile(x: number, y: number, areaX: number, areaY: number): number
    {
        if (!perlinGenerator.perlin)
        {
            var rnd = new SeededRandom();
            rnd.Seed(this.world.seed);
            perlinGenerator.perlin = new Perlin(rnd);
        }

        var mainType = this.zoneInfo.BaseTileType;
        var levels = (<PerlinData>this.zoneInfo.GeneratorParameters).levels;

        // Fill the world with the background
        var type: number[];
        if (levels)
        {
            var nx = x + areaX * this.world.areaWidth;
            var ny = y + areaY * this.world.areaHeight;

            var l = (perlinGenerator.perlin.Noise(nx / (<PerlinData>this.zoneInfo.GeneratorParameters).zoomFactor, ny / (<PerlinData>this.zoneInfo.GeneratorParameters).zoomFactor) / 2) + 0.5;
            var t = mainType;
            for (var j = levels.length - 1; j >= 0; j--)
            {
                if (levels[j].maxLevel != null && levels[j].maxLevel != undefined && levels[j].maxLevel < l)
                    break;
                t = levels[j].type;
            }

            type = this.world.art.background.types[t];
        }
        else
            type = world.art.background.types[mainType];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    }

    public static DefaultParameters(): PerlinData
    {
        var knownTypes = Keys(world.art.background.types);
        if (knownTypes.length < 3)
        {
            return {
                zoomFactor: 60,
                levels: <TilesetLevels[]>[{ "type": knownTypes[0], "maxLevel": 1.0 }]
            };
        }

        if (world.art.background.types['water'] && world.art.background.types['grass'] && world.art.background.types['dark_grass'])
            return {
                zoomFactor: 60,
                levels: <TilesetLevels[]>[{ "type": 'water', "maxLevel": 0.3 },
                    { "type": 'grass', "maxLevel": 0.9 },
                    { "type": 'dark_grass', "maxLevel": 1.0 }]
            };

        return {
            zoomFactor: 60,
            levels: <TilesetLevels[]>[{ "type": knownTypes[0], "maxLevel": 0.3 }, { "type": knownTypes[1], "maxLevel": 0.9 }, { "type": knownTypes[2], "maxLevel": 1.0 }]
        };
    }

    public static DisplayParameters(generatorParameters: PerlinData): string
    {
        var html = "";
        var levels = generatorParameters.levels;
        levels.sort((a, b) => { return a.maxLevel - b.maxLevel; });
        html += "<tr><td>Zoom Factor:</td>";
        html += "<td><input type='text' value='" + generatorParameters.zoomFactor + "' onkeyup='PerlinGenerator.ChangeZoom()' id='zoneZoom'></td></tr>";
        html += "<tr><td colspan='2'>Terrain levels:</td></tr>";
        for (var i = 0; i < levels.length; i++)
        {
            html += "<tr><td>";
            html += "<select onchange='PerlinGenerator.ChangeLevelType(" + i + ")' id='zoneLevelType_" + i + "' style='width: 150px;'>";
            for (var j in world.art.background.types)
            {
                html += "<option value='" + j + "'" + (levels[i].type == j ? " selected" : "") + ">" + j + "</option>";
            }
            html += "</select></td>";
            html += "<td><input type='text' onkeyup='PerlinGenerator.ChangeLevelValue(" + i + ")' value='" + levels[i].maxLevel + "' id='zoneLevelValue_" + i + "'></td>";
            html += "<td><div class='button' onclick='PerlinGenerator.RemoveLevel(" + i + ")'>Remove</div></td>";
            html += "</tr>";
        }
        html += "<tr><td colspan='2'><div class='button' onclick='PerlinGenerator.AddLevel()'>Add Level</div></td></tr>";
        return html;
    }

    static RemoveLevel(level: number)
    {
        if ((<PerlinData>zoneEditor.selectedZone.GeneratorParameters).levels.length < 2)
            return;
        (<PerlinData>zoneEditor.selectedZone.GeneratorParameters).levels.splice(level, 1);
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].Render();
        window['ZoneEditor'].MakeZonePreview();
    }

    static AddLevel()
    {
        var firstItem = "";
        for (var item in world.art.background.types)
        {
            firstItem = item;
            break;
        }

        (<PerlinData>zoneEditor.selectedZone.GeneratorParameters).levels.push({ type: firstItem, maxLevel: 1.0 });
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].Render();
        window['ZoneEditor'].MakeZonePreview();
    }

    static ChangeZoom()
    {
        (<PerlinData>zoneEditor.selectedZone.GeneratorParameters).zoomFactor = parseFloat($("#zoneZoom").val());
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    }

    static ChangeLevelType(level: number)
    {
        (<PerlinData>zoneEditor.selectedZone.GeneratorParameters).levels[level].type = $("#zoneLevelType_" + level).val();
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    }

    static ChangeLevelValue(level: number)
    {
        (<PerlinData>zoneEditor.selectedZone.GeneratorParameters).levels[level].maxLevel = parseFloat($("#zoneLevelValue_" + level).val());
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    }

    public RenameTileType(oldName: string, newName: string)
    {
        var perlinData = <PerlinData>this.zoneInfo.GeneratorParameters;
        for (var i = 0; i < perlinData.levels.length; i++)
            if (perlinData.levels[i].type == oldName)
                perlinData.levels[i].type = newName;
    }
}