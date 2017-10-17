/// <reference path="WorldGenerator.ts" />

@WorldGeneratorClass
class ConstantGenerator extends WorldGenerator
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
        worldArea.Zone = zone;
        worldArea.world = this.world;

        worldArea.backgroundTiles = [];
        worldArea.objects = [];

        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++)
        {
            for (var b = 0; b < this.world.areaHeight; b++)
            {
                var type = this.world.art.background.types[PerlinGenerator.GetTypeOfTile(this.world.art, this.GetBaseBackgroundTile(a, b, x, y, zone))];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }

        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    }

    public GetBaseBackgroundTile(x: number, y: number, areaX: number, areaY: number, zone: string): number
    {
        try
        {
            if (!this.world.art.background.types[this.zoneInfo.BaseTileType])
                this.world.art.background.types[FirstItem(this.world.art.background.types)][0];
            return this.world.art.background.types[this.zoneInfo.BaseTileType][0];
        }
        catch (ex)
        {
            return 0;
        }
    }

    public static DefaultParameters(): any
    {
        return null;
    }

    public static DisplayParameters(generatorParameters: PerlinData): string
    {
        return "";
    }

    public RenameTileType(oldName: string, newName: string)
    {
    }
}