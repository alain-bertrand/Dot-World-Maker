class WorldZone implements WorldZoneInterface
{
    public Name: string;
    public MapEffect: string;
    public BaseTileType: string;
    public Generator: string;
    public GeneratorParameters: any = null;
    public Objects: WorldZoneObject[] = [];
    public Monsters: WorldZoneObject[] = [];
    public MapMusic: string;
    public MapFragments: MapFragment[] = [];
}
