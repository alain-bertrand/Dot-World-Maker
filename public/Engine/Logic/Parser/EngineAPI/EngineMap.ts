/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineMap
{
    @ApiMethod([{ name: "x", description: "Position x on the map." },
        { name: "y", description: "Position y on the map." },
        { name: "name", description: "Name of the object to place." },
        { name: "timeToLive", description: "(optional) Time to live expressed in seconds." }], "Creates a new temporaty object on the map.")
    public SpawnMapObject(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Map'] && this['Map'].SpawnMapObject && !this['Map'].SpawnMapObject.caller) || (this.SpawnMapObject && !this.SpawnMapObject.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var x = values[0].GetNumber();
        var y = values[1].GetNumber();
        var zone = world.Player.Zone;
        var name = values[2].GetString();

        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;

        var area = world.GetArea(ax, ay, zone);
        area.tempObjects.push(new TemporaryWorldObject(name, mx, my, area));

        if (values[3])
            area.tempObjects[area.tempObjects.length - 1].EndOfLife = new Date(new Date().getTime() + values[3].GetNumber() * 1000);

        area.CleanObjectCache();
        return null;
    }

    Verify_SpawnMapObject(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.art.objects[values[2]])
            throw "The map object '" + values[2] + "' is unknown at " + line + ":" + column;
    }
}
