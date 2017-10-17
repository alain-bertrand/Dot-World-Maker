/// <reference path="../../public/Engine/Libs/NumberCompression.ts" />

interface MapAreaInterface
{
    Background: number[];
    Objects: WorldNamePosition[];
    StoredMonsters: WorldNamePosition[];
    StoredNPC: WorldNamePosition[];
    Houses: WorldNamePosition[];
    MapActions: any[];
    Chests: WorldNamePosition[]
}

interface WorldNamePosition
{
    Name: string;
    X: number;
    Y: number;
}

class MapSerializer
{
    public static Parse(data: string): MapAreaInterface
    {
        var result: MapAreaInterface = JSON.parse(data);

        result.Background = NumberCompression.StringToArray(<any>result.Background);
        var objects = <any>result.Objects;
        result.Objects = [];

        for (var i in objects)
            for (var j = 0, s = objects[i]; j < s.length; j += 6)
                result.Objects.push({ Name: i, X: NumberCompression.StringToNumber(s, j, 3), Y: NumberCompression.StringToNumber(s, j + 3, 3) });

        return result;
    }

    public static Stringify(data: MapAreaInterface): string
    {
        var objects = {};
        for (var i = 0; i < data.Objects.length; i++)
        {
            if (!objects[data.Objects[i].Name])
                objects[data.Objects[i].Name] = "";
            objects[data.Objects[i].Name] += NumberCompression.NumberToString(data.Objects[i].X, 3) + NumberCompression.NumberToString(data.Objects[i].Y, 3);
        }
        data.Background = <any>NumberCompression.ArrayToString(data.Background);
        data.Objects = <any>objects;
        return JSON.stringify(data);
    }

}