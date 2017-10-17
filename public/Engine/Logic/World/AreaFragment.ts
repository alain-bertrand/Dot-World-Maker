var areaFragment = new (class
{
    canRunFragment: (fragment: MapFragment) => boolean;
});

class AreaFragment
{
    public backgroundTiles: number[] = [];
    public objects: WorldObject[] = [];
    public monsters: MonsterInformation[] = [];
    public actors: NPCActor[] = [];
    public houses: WorldHouse[] = [];
    public storedMonsters: MonsterInformation[] = [];

    public static CreateFragment(world: World, area: WorldArea, areaX: number, areaY: number, zoneName: string): AreaFragment
    {
        var result = new AreaFragment();
        var zone = world.GetZone(zoneName);

        var check = (areaFragment.canRunFragment ? areaFragment.canRunFragment : AreaFragment.DefaultCanRunFragment);
        if (zone.MapFragments) for (var i = 0; i < zone.MapFragments.length; i++)
        {
            var fragment = zone.MapFragments[i];
            if ((check && !check(fragment)) || (!check && !AreaFragment.DefaultCanRunFragment(fragment)))
                continue;

            for (var j = 0; j < fragment.Modifications.length; j++)
            {
                var modification = fragment.Modifications[j];
                if (modification.AX != areaX || modification.AY != areaY)
                    continue;
                switch (fragment.Modifications[j].Action)
                {
                    case "tile":
                        result.backgroundTiles[modification.X + modification.Y * world.areaWidth] = modification.Value;
                        break;
                    case "object":
                        result.objects.push(new WorldObject(modification.Value, modification.X, modification.Y));
                        break;
                    case "monster":
                        var m = { Name: modification.Value.Name, X: modification.X, Y: modification.Y, RespawnTime: modification.Value.RespawnTime };
                        m['fragId'] = fragment.Name + "_" + j;
                        result.monsters.push(m);
                        break;
                    case "npc":
                        result.actors.push(NPCActor.Create(world.GetNPC(modification.Value), area, modification.X, modification.Y));
                        break;
                    case "house":
                        result.houses.push(new WorldHouse(modification.Value, modification.X, modification.Y));
                        break;
                    default:
                        break;
                }
            }
        }

        return result;
    }

    private static DefaultCanRunFragment(fragment: MapFragment): boolean
    {
        for (var i = 0; i < fragment.Conditions.length; i++)
            if (!dialogCondition.code[fragment.Conditions[i].Name].Check(fragment.Conditions[i].Values))
                return false;
        return true;
    }

    public static AllCurrentFragments(zoneName: string): string
    {
        var fragments: string[] = [];
        var zone = world.GetZone(zoneName);
        if (!zone.MapFragments)
            return "";
        for (var i = 0; i < zone.MapFragments.length; i++)
        {
            for (var i = 0; i < zone.MapFragments.length; i++)
                if ((areaFragment.canRunFragment && areaFragment.canRunFragment(zone.MapFragments[i])) || (!areaFragment.canRunFragment && AreaFragment.DefaultCanRunFragment(zone.MapFragments[i])))
                    fragments.push(zone.MapFragments[i].Name);
        }
        fragments.sort();
        return fragments.join(",");
    }
}