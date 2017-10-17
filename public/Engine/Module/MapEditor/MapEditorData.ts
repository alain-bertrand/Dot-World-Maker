interface MapTile
{
    ax: number;
    ay: number;
    x: number;
    y: number;
    tile: number;
}

var mapEditor = new (class
{
    public renderer: WorldRender;
    public refresher: number;
    public keyboardChecker: number;
    public currentCellTile: number = 0;
    public currentCellType: string = "water";
    public currentObject: string = "flower_1";
    public currentOperation: string = "SmartTile";
    public keys: boolean[] = [];
    public currentZone: string = "Base";
    public currentPosition: Monster;
    public currentMapAction: MapAction;
    public currentChest: WorldChest;
    public mouseDown: boolean = false;
    public mouseButton: number = 0;
    public mousePosition: Point;
    public emptyTiles: boolean[];
    public showCoordinates: boolean = true;
    public modified: boolean = false;
    public currentMonster: MonsterInformation = null;
    public previousBackgroundTiles: MapTile[] = null;
    public currentFragment: string = "Root";
    public minimap: boolean = true;
    public gridSnap: boolean = false;
    public objectSnap: boolean = false;
    public objectSpray: boolean = false;
    public objectSprayRadius: number = 32;
    public renderRectrangle: Rectangle = null;
    public repeatTimer: number = 0;
});