var game = null;

// Web Worker thread
var workerGenerator: Worker[] = null;
onmessage = (message: any) =>
{
    if (!message || !message.data || !message.data.action || message.data.action != "generate")
        return;

    var zoneInfo: WorldZone = message.data.zoneInfo;
    var gameId: number = message.data.gameId;
    var x: number = message.data.x;
    var y: number = message.data.y;
    var zone: string = message.data.zone;

    var world = World.Rebuild(message.data.world);
    self['world'] = world;

    var generator = new (self[zoneInfo.Generator + "Generator"])(world, "Game_" + gameId, zoneInfo);
    var area: WorldArea = generator.Generate(x, y, zone);
    self['post' + 'Message']({ x: x, y: y, zone: zone, area: area.Stringify() });
}

enum EditorEdition
{
    Demo,
    Standard
}

class World
{
    public art: TilesetInformation;
    public areaWidth: number = 100;
    public areaHeight: number = 100;
    public editMode: boolean = false;

    public Player: Player;
    public Id: number;
    public Name: string;
    public Description: string;
    public ShowFPS: boolean = false;
    public ChatEnabled: boolean = true;
    public ChatSmilies: boolean = true;
    public ChatLink: boolean = true;

    public PublicView: boolean = false;
    public Skills: KnownSkill[] = null;
    public Stats: KnownStat[] = null;
    public Monsters: KnownMonster[] = null;
    public NPCs: NPC[] = [];
    public Houses: TilesetHouse = null;
    public Zones: WorldZone[] = null;
    public InventorySlots: InventorySlot[] = null;
    public InventoryObjects: KnownObject[] = null;
    public InventoryObjectTypes: ObjectType[] = null;
    public InitializeSteps: DialogAction[] = null;
    public StartLook: string = "male_1";
    public SmallBagObject: string = "small_bag";
    public Edition: EditorEdition = EditorEdition.Demo;
    public TemporaryEffects: TemporaryEffect[] = [];
    public Quests: KnownQuest[] = [];
    public ParticleEffects: ParticleSystemSerialized[];
    public Codes: KnownCode[] = [];
    public ChatBots: ChatBot[] = [];

    public SimplifiedObjectLogic: boolean = true;
    public ShowInventory: boolean = true;
    public ShowStats: boolean = true;
    public ShowJournal: boolean = true;
    public ShowMessage: boolean = true;
    public ReadyToSave: boolean = true;

    private SaveId: string;

    public SpawnPoint: ZonedPoint = null;

    private generator: WorldGenerator;
    private previousZone: string;

    public areas: WorldArea[];
    public seed: string = "ThisIsMyFirstSeed";
    private initDone: boolean = false;

    static SetGame(data)
    {
        game = data;
    }

    public Init()
    {
        if (!this.art)
            this.art = defaultTilesets['tileset2'];
        if (!this.art.panelStyle)
            this.art.panelStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].panelStyle));
        if (!this.art.quickslotStyle)
            this.art.quickslotStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].quickslotStyle));
        if (!this.art.statBarStyle)
            this.art.statBarStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].statBarStyle));
        if (!this.art.background.paths)
            this.art.background.paths = {};
        if (!this.Houses)
            this.Houses = this.art.houses;
        if (!this.StartLook)
            this.StartLook = "male_1";
        if (!this.SmallBagObject)
            this.SmallBagObject = "small_bag";
        if (!this.art.sounds)
            this.art.sounds = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].sounds));
        if (!this.ParticleEffects)
            this.ParticleEffects = defaultParticleSystems;
        if (this.PublicView !== true)
            this.PublicView = false;

        this.areas = [];

        if (!this.InventoryObjects)
            this.InventoryObjects = KnownObject.DefaultObjects();
        if (!this.InventoryObjectTypes)
            this.InventoryObjectTypes = ObjectType.DefaultObjectType();
        if (!this.InventorySlots)
            this.InventorySlots = InventorySlot.DefaultSlots();
        if (!this.Skills)
            DefaultSkills.Generate(this);
        if (!this.Stats)
            DefaultStats.Generate(this);
        if (!this.Monsters)
            DefaultMonsters.Generate(this);
        if (!this.SpawnPoint)
            this.SpawnPoint = { X: 0, Y: 0, Zone: "Base" };
        if (!this.NPCs)
        {
            this.NPCs = [];
            this.NPCs.push(NPC.Generate());
        }
        if (!this.Zones || this.Zones.length == 0)
        {
            this.Zones = [];
            var zone = new WorldZone();
            zone.Name = "Base";
            zone.BaseTileType = this.art.background.mainType;
            zone.Generator = "Perlin";
            zone.GeneratorParameters = PerlinGenerator.DefaultParameters();
            zone.Monsters = [];
            zone.Monsters.push({ Name: "Rat", PlaceOn: ["grass"], Frequency: 0.2 });
            zone.Monsters.push({ Name: "Brown bear", PlaceOn: ["grass"], Frequency: 0.05 });
            zone.Objects = [];
            zone.Objects.push({ Name: "smallGrass_1", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "mediumGrass_1", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "mediumGrass_2", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "flower_1", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "flower_2", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "flower_3", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_1", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_2", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_3", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_4", PlaceOn: ["grass"], Frequency: 0.1 });
            this.Zones.push(zone);
        }

        $("#mapLoadingPage").show();
        this.Player = new Player(this);
        this.Player.Name = this.StartLook;
        this.Player.Username = framework.Preferences['user'];
        this.Player.Initialize(() =>
        {
            this.VisibleCenter(this.Player.AX, this.Player.AY, this.Player.Zone);
            this.Player.CurrentArea = this.GetArea(this.Player.AX, this.Player.AY, this.Player.Zone);
            if (this.Player.CurrentArea)
                this.Player.CurrentArea.actors.push(this.Player);

            this.initDone = true;
            if (!this.IsLoading())
            {
                $("#mapLoadingPage").hide();
                this.totAreaToLoad = 0;
            }
        });

        //if(
    }

    public GetMonster(name: string): KnownMonster
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Monsters.length; i++)
            if (this.Monsters[i].Name.toLowerCase() == lname)
                return this.Monsters[i];
        return null;
    }

    public GetCode(name: string): KnownCode
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Codes.length; i++)
            if (this.Codes[i].Name.toLowerCase() == lname)
                return this.Codes[i];
        return null;
    }

    public GetSkill(name: string): KnownSkill
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Skills.length; i++)
            if (this.Skills[i].Name.toLowerCase() == lname)
                return this.Skills[i];
        return null;
    }

    public GetStat(name: string): KnownStat
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Stats.length; i++)
            if (this.Stats[i].Name.toLowerCase() == lname)
                return this.Stats[i];
        return null;
    }

    public GetNPC(name: string): NPC
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.NPCs.length; i++)
            if (this.NPCs[i].Name.toLowerCase() == lname)
                return this.NPCs[i];
        return null;
    }

    public GetHouse(name: string): TilesetHouseDetails
    {
        var lname = name.toLowerCase();
        return this.Houses[lname];
    }

    public GetZone(name: string): WorldZone
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Zones.length; i++)
            if (this.Zones[i].Name.toLowerCase() == lname)
                return this.Zones[i];
        return null;
    }

    public GetTemporaryEffect(name: string): TemporaryEffect
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.TemporaryEffects.length; i++)
            if (this.TemporaryEffects[i].Name.toLowerCase() == lname)
                return this.TemporaryEffects[i];
        return null;
    }

    public GetInventoryObject(name: string): KnownObject
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventoryObjects.length; i++)
            if (this.InventoryObjects[i].Name.toLowerCase() == lname)
                return this.InventoryObjects[i];
        return null;
    }

    public GetInventoryObjectType(name: string): ObjectType
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventoryObjectTypes.length; i++)
            if (this.InventoryObjectTypes[i].Name.toLowerCase() == lname)
                return this.InventoryObjectTypes[i];
        return null;
    }

    public GetInventorySlot(name: string): InventorySlot
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventorySlots.length; i++)
            if (this.InventorySlots[i].Name.toLowerCase() == lname)
                return this.InventorySlots[i];
        return null;
    }

    public GetQuest(name: string): KnownQuest
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return this.Quests[i];
        return null;
    }

    public GetParticleSystem(name: string): ParticleSystem
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.ParticleEffects.length; i++)
            if (this.ParticleEffects[i].Name.toLowerCase() == lname)
                return ParticleSystem.Rebuild(this.ParticleEffects[i]);
        return null;
    }

    public CountActors(): number
    {
        var nb = 0;
        for (var i = 0; i < this.areas.length; i++)
            nb += this.areas[i].actors.length;
        return nb;
    }

    public HasArea(x: number, y: number, zone: string): boolean
    {
        for (var i = 0; i < this.areas.length; i++)
            if (this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone)
                return true;
        return false;
    }

    private lastRequest: ZonedPoint = null;
    private lastArea: WorldArea = null;
    private currentCenter: ZonedPoint = null;

    public VisibleCenter(x: number, y: number, zone: string, force: boolean = false)
    {
        if (!force && this.currentCenter && this.currentCenter.Zone == zone && this.currentCenter.X == x && this.currentCenter.Y == y)
            return;

        this.currentCenter = { X: x, Y: y, Zone: zone };

        // Let's cleanup those which are out of range...
        for (var i = 0; i < this.areas.length;)
        {
            if ((Math.abs(this.areas[i].X - x) > 1 || Math.abs(this.areas[i].Y - y) > 1 || this.areas[i].Zone != zone) && this.areas[i].edited == false)
                this.areas.splice(i, 1);
            else
                i++;
        }

        // Now let's add the missing one
        for (var a = -1; a < 2; a++)
            for (var b = -1; b < 2; b++)
                if (!this.HasArea(a + x, b + y, zone))
                    this.LoadArea(a + x, b + y, zone);
    }

    public ResetFragments()
    {
        for (var i = 0; i < this.areas.length; i++)
            this.areas[i].ResetFragments();
    }

    public GetArea(x: number, y: number, zone: string): WorldArea
    {
        if (!this.areas)
            return null;
        if (this.lastRequest && this.lastRequest.X == x && this.lastRequest.Y == y && this.lastRequest.Zone == zone)
            return this.lastArea;

        for (var i = 0; i < this.areas.length; i++)
        {
            if (this.areas[i] && this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone)
            {
                this.lastRequest = { X: x, Y: y, Zone: zone };
                this.lastArea = this.areas[i];
                return this.areas[i];
            }
        }
        return null;
    }

    private areasToLoad: ZonedPoint[] = [];
    private currentLoading: number = 0;
    private totAreaToLoad: number = 0;

    public CountAreaToLoad(): number
    {
        return this.areasToLoad.length;
    }

    public IsLoading(): boolean
    {
        if (play.renderer)
        {
            if (this.areasToLoad.length > 0 || this.currentLoading > 0 || this.ActiveWorkers() > 0)
            {
                var v = (this.totAreaToLoad - this.areasToLoad.length) * 100 / this.totAreaToLoad;
                $("#mapLoadingPage").html("<div>Loading maps... " + Math.round(v) + "%</div>");
            }
            else
            {
                var v = play.renderer.loaded * 100 / play.renderer.toLoad;
                $("#mapLoadingPage").html("<div>Loading art... " + Math.round(v) + "%</div>");
            }
        }

        if (workerGenerator)
        {
            //if ((this.areasToLoad && this.areasToLoad.length > 5) || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()) || this.ActiveWorkers() > 3)
            if ((this.areasToLoad && this.areasToLoad.length > 0) || this.currentLoading > 0 || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()) || this.ActiveWorkers() > 0)
                return true;
        }
        else
        {
            if ((this.areasToLoad && this.areasToLoad.length) || this.currentLoading != 0 || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()))
                return true;
        }
        return false;
    }

    public LoadArea(x: number, y: number, zone: string)
    {
        // It's a temp world, we should not check on the server
        //if (this.Id == -1 && !Main.CheckNW())
        if (this.Id == -1)
        {
            this.SetArea(x, y, zone, this.GetGenerator(zone).Generate(x, y, zone));
            return;
        }

        // Skip multiple loads
        for (var i = 0; i < this.areasToLoad.length; i++)
            if (this.areasToLoad[i].X == x && this.areasToLoad[i].Y == y && this.areasToLoad[i].Zone == zone)
                return;
        this.totAreaToLoad++;
        this.areasToLoad.push({ X: x, Y: y, Zone: zone });
        if (this.areasToLoad.length > 6 || this.ActiveWorkers() > 3 || this.currentLoading > 3)
        {
            $("#mapLoadingPage").show();
        }
        if (this.currentLoading < Main.NbCores())
            this.DoLoad();
    }

    public ActiveWorkers()
    {
        if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW()))
        {
            var nb = 0;
            if (!workerGenerator)
                return Main.NbCores();
            for (var i = 0; i < Main.NbCores(); i++)
                if ((<any>workerGenerator[i]).isRunning)
                    nb++;
            return nb;
        }
        return 0;
    }

    public ResetAreas()
    {
        this.areas = [];
        this.lastRequest = null;
        this.lastArea = null;
        if (this.currentCenter)
            this.VisibleCenter(this.currentCenter.X, this.currentCenter.Y, this.currentCenter.Zone, true);

        this.Player.CurrentArea = this.GetArea(this.Player.AX, this.Player.AY, this.Player.Zone);
        if (this.Player.CurrentArea)
            this.Player.CurrentArea.actors.push(this.Player);
    }

    public ResetGenerator()
    {
        this.generator = null;
        this.previousZone = null;
    }

    public GetGenerator(zoneName: string): WorldGenerator
    {
        if (!this.generator || this.previousZone != zoneName)
        {
            var zoneInfo = this.GetZone(zoneName);
            this.generator = new (window[zoneInfo.Generator + "Generator"])(this, "Game_" + this.Id, zoneInfo);
            this.previousZone = zoneName;
        }
        return this.generator;
    }

    public PreloadArt(area: WorldArea)
    {
        if (!play.renderer)
            return;

        for (var i = 0; i < area.objects.length; i++)
            play.renderer.GetObjectImage(area.objects[i].Name);
        for (var i = 0; i < area.actors.length; i++)
            if (area.actors[i].Name)
                play.renderer.GetActorImage(area.actors[i].Name);
    }

    public DoLoad()
    {
        if (this.areasToLoad.length == 0)
        {
            if (!this.IsLoading() && this.ActiveWorkers() < 1 && this.currentLoading < 1)
            {
                $("#mapLoadingPage").hide();
                this.totAreaToLoad = 0;
            }
            else
                setTimeout(() =>
                {
                    this.DoLoad();
                }, 100);
            return;
        }
        var p = this.areasToLoad.shift();
        var x = p.X;
        var y = p.Y;
        var zone = p.Zone;

        if (game)
        {
            var data = null;
            for (var i = 0; i < game.maps.length; i++)
            {
                if (game.maps[i].x == x && game.maps[i].y == y && game.maps[i].zone == zone)
                {
                    data = JSON.stringify(game.maps[i].data);
                    break;
                }
            }
            if (Main.CheckNW() || isHtmlStandalone)
            {
                this.currentLoading++;
                setTimeout(() =>
                {
                    this.currentLoading--;
                    this.PostLoad(x, y, zone, data);
                }, 10);
            }
            else
                this.PostLoad(x, y, zone, data);
            return;
        }
        if (Main.CheckNW())
        {
            //this.SetArea(x, y, zone, this.GetGenerator(zone).Generate(x, y, zone));
            this.currentLoading++;
            setTimeout(() =>
            {
                this.currentLoading--;
                this.PostLoad(x, y, zone, data);
            }, 10);
            //this.PostLoad(x, y, zone, null);
            return;
        }

        this.currentLoading++;
        $.ajax({
            type: 'POST',
            url: '/backend/GetMap',
            data: {
                game: this.Id,
                x: x,
                y: y,
                zone: zone
            },
            success: (msg) =>
            {
                this.currentLoading--;
                var data = TryParse(msg);
                this.PostLoad(x, y, zone, data);
            },
            error: function (msg, textStatus)
            {
                this.currentLoading--;
            }
        });
    }

    private PostLoad(x: number, y: number, zone: string, data: string)
    {
        var area: WorldArea;
        if (data)
        {
            area = WorldArea.Parse(data);
            area.world = this;
            area.X = x;
            area.Y = y;
            area.Zone = zone;
            area.OnlyDefinedActors();
            area.RemoveVisitedObjects();
            this.SetArea(x, y, zone, area);
            this.PreloadArt(area);
            this.DoLoad();
        }
        else
        {
            // Browser supports the web worker
            if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW()))
            {
                if (!workerGenerator)
                {
                    workerGenerator = [];
                    for (var i = 0; i < Main.NbCores(); i++)
                    {
                        if (isHtmlStandalone)
                            workerGenerator[i] = new Worker("engine.js");
                        else
                            workerGenerator[i] = new Worker("/runtime.js");
                        workerGenerator[i].onmessage = (result: any) =>
                        {
                            result.target.isRunning = false;
                            var area = WorldArea.Parse(result.data.area);
                            area.world = this;
                            area.storedMap = false;
                            area.X = result.data.x;
                            area.Y = result.data.y;
                            area.Zone = result.data.zone;
                            area.RecoverActors();
                            area.RemoveVisitedObjects();
                            world.SetArea(result.data.x, result.data.y, result.data.zone, area);

                            world.PreloadArt(area);
                            world.DoLoad();
                        };
                        (<any>workerGenerator[i]).isRunning = false;
                    }
                }
                var zoneInfo = this.GetZone(zone);
                for (var i = 0; i < Main.NbCores(); i++)
                {
                    if ((<any>workerGenerator[i]).isRunning)
                        continue;
                    (<any>workerGenerator[i]).isRunning = true;
                    workerGenerator[i].postMessage({
                        world: this.Stringify(),
                        action: 'generate',
                        zoneInfo: zoneInfo,
                        x: x,
                        y: y,
                        zone: zone
                    });
                    break;
                }
            }
            else
            {
                area = this.GetGenerator(zone).Generate(x, y, zone);
                area.RemoveVisitedObjects();
                this.SetArea(x, y, zone, area);
                this.PreloadArt(area);
                this.DoLoad();
            }
        }
    }

    private SetArea(x: number, y: number, zone: string, area: WorldArea)
    {
        var replaced = false;
        for (var i = 0; i < this.areas.length; i++)
        {
            if (this.areas[i] && this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone)
            {
                this.areas[i] = area
                this.areas[i].world = this;
                this.areas[i].X = x;
                this.areas[i].Y = y;
                this.areas[i].Zone = zone;

                if (!this.Player.CurrentArea)
                {
                    if (x == this.Player.AX && y == this.Player.AY && zone == this.Player.Zone)
                    {
                        this.Player.CurrentArea = area;
                        this.areas[i].actors.push(this.Player);
                        this.Player.CurrentArea = this.areas[i];
                    }
                }
                else if (this.Player.CurrentArea.X == x && this.Player.CurrentArea.Y == y && this.Player.Zone == zone)
                {
                    this.areas[i].actors.push(this.Player);
                    this.Player.CurrentArea = this.areas[i];
                }

                if (!this.lastArea || this.lastArea.X === undefined || (this.lastArea.X == x && this.lastArea.Y == y))
                    this.lastArea = this.areas[i];
                replaced = true;
                break;
            }
        }
        if (!replaced)
            this.areas.push(area);
    }

    public NWMapChanges()
    {
        if (!game)
            game = { maps: [], data: null };

        for (var i = 0; i < this.areas.length; i++)
        {
            if (this.areas[i].edited !== true)
                continue;
            var data = JSON.parse(this.areas[i].Stringify());
            var found = false;
            for (var j = 0; j < game.maps.length; j++)
            {
                if (game.maps[j].x == this.areas[i].X && game.maps[j].y == this.areas[i].Y && game.maps[j].zone == this.areas[i].Zone)
                {
                    found = true;
                    game.maps[j].data = data;
                    break;
                }
            }
            if (!found)
            {
                game.maps.push({
                    x: this.areas[i].X,
                    y: this.areas[i].Y,
                    zone: this.areas[i].Zone,
                    data: data
                });
            }
        }
    }

    public SaveMapChanges()
    {
        if (Main.CheckNW())
        {
            this.NWMapChanges();
            game.data = this.Stringify();
            StandaloneMaker.SaveProject();
            return;
        }
        this.ReadyToSave = false;

        for (var i = 0; i < this.areas.length; i++)
        {
            if (this.areas[i].edited !== true)
                continue;
            $.ajax({
                type: 'POST',
                url: '/backend/SaveMap',
                data: {
                    game: this.Id,
                    token: framework.Preferences['token'],
                    x: this.areas[i].X,
                    y: this.areas[i].Y,
                    zone: this.areas[i].Zone,
                    data: this.areas[i].Stringify()
                },
                success: (msg) =>
                {
                    this.areas[i].edited = false;
                    this.SaveMapChanges();
                },
                error: function (msg, textStatus)
                {
                    Framework.ShowMessage("Error while saving...");
                }
            });
            return;
        }

        this.Save();
        Framework.ShowMessage("Map saved.");
    }

    public ToMapEditorAreas()
    {
        for (var i = 0; i < this.areas.length; i++)
        {
            this.areas[i].OnlyDefinedActors();
        }
    }

    public ToPlayAreas()
    {
        for (var i = 0; i < this.areas.length; i++)
        {
            /*if (this.areas[i].edited)
                i++;
            else
                this.areas.splice(i, 1);*/
            this.areas[i].RecoverActors();
        }

        //this.GetArea(this.Player.X, this.Player.Y, true);
    }

    public Stringify(): string
    {
        var data = <SerializedWorld>{
            Tileset: this.art,
            Name: this.Name,
            Description: this.Description,
            Skills: this.Skills.map(c => c.Store()),
            Stats: this.Stats.map(c => c.Store()),
            Monsters: this.Monsters.map(c => c.Store()),
            NPCs: this.NPCs,
            Houses: this.Houses,
            Zones: this.Zones,
            ShowFPS: this.ShowFPS,
            InventoryObjects: this.InventoryObjects,
            InventoryObjectTypes: this.InventoryObjectTypes,
            InventorySlots: this.InventorySlots,
            SpawnPoint: this.SpawnPoint,
            InitializeSteps: this.InitializeSteps,
            ChatEnabled: this.ChatEnabled,
            ChatLink: this.ChatLink,
            ChatSmilies: this.ChatSmilies,
            StartLook: this.StartLook,
            SmallBagObject: this.SmallBagObject,
            SimplifiedObjectLogic: this.SimplifiedObjectLogic,
            PublicView: this.PublicView,
            TemporaryEffects: this.TemporaryEffects,
            Quests: this.Quests,
            ShowInventory: this.ShowInventory,
            ShowStats: this.ShowStats,
            ShowJournal: this.ShowJournal,
            ShowMessage: this.ShowMessage,
            ParticleEffects: this.ParticleEffects,
            SaveId: this.SaveId,
            Codes: this.Codes.map(c => c.Store()),
            ChatBots: this.ChatBots.map(c => c.Store()),
        };
        if (Main.CheckNW())
            data['Id'] = this.Id;
        return JSON.stringify(data);
    }

    public static Rebuild(source: string, alertWhileParsing: boolean = true): World
    {
        var serialized = <SerializedWorld>JSON.parse(source);
        var result = new World();
        result.PublicView = (serialized.PublicView === true);
        result.Name = serialized.Name;
        result.SaveId = serialized.SaveId;
        result.Description = serialized.Description;
        result.ShowFPS = (serialized.ShowFPS === true ? true : false);
        result.ShowInventory = (serialized.ShowInventory === false ? false : true);
        result.ShowStats = (serialized.ShowStats === false ? false : true);
        result.ShowJournal = (serialized.ShowJournal === false ? false : true);
        result.ShowMessage = (serialized.ShowMessage === false ? false : true);
        result.Stats = serialized.Stats.map(c => KnownStat.Rebuild(c, alertWhileParsing));
        result.Skills = serialized.Skills.map(c => KnownSkill.Rebuild(c, alertWhileParsing));
        result.Monsters = serialized.Monsters.map(c => KnownMonster.Rebuild(c, alertWhileParsing));
        result.NPCs = serialized.NPCs;
        result.Houses = (serialized.Houses ? serialized.Houses : null);
        result.Zones = (<any>(serialized.Zones ? serialized.Zones : null));
        result.art = (serialized.Tileset ? serialized.Tileset : defaultTilesets['tileset2']);
        result.InventoryObjects = (serialized.InventoryObjects ? serialized.InventoryObjects : KnownObject.DefaultObjects()).map((m) => { return Object.cast(m, KnownObject); });;
        result.InventoryObjectTypes = (serialized.InventoryObjectTypes ? serialized.InventoryObjectTypes : ObjectType.DefaultObjectType()).map((m) => { return Object.cast(m, ObjectType); });
        result.InventorySlots = (serialized.InventorySlots ? serialized.InventorySlots : InventorySlot.DefaultSlots()).map((m) => { return Object.cast(m, InventorySlot); });
        result.SpawnPoint = (serialized.SpawnPoint ? serialized.SpawnPoint : <ZonedPoint>{ X: 0, Y: 0, Zone: "Base" });
        result.InitializeSteps = (serialized.InitializeSteps ? serialized.InitializeSteps : []);
        result.Codes = (serialized.Codes ? serialized.Codes.map((m) => { return Object.cast(m, KnownCode); }) : []);
        result.ChatBots = (serialized.ChatBots ? serialized.ChatBots : []).map((m) => { return ChatBot.Rebuild(m); });

        result.Quests = (serialized.Quests ? serialized.Quests : []);

        if (!result.art.panelStyle)
            result.art.panelStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].panelStyle));
        if (!result.art.quickslotStyle)
            result.art.quickslotStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].quickslotStyle));
        if (!result.art.statBarStyle)
            result.art.statBarStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].statBarStyle));
        if (!result.art.background.paths)
            result.art.background.paths = {};

        if (!result.art.panelStyle.contentHeaderBackgroundColor)
            result.art.panelStyle.contentHeaderBackgroundColor = result.art.panelStyle.contentColor;
        if (!result.art.panelStyle.contentHeaderColor)
            result.art.panelStyle.contentHeaderColor = result.art.panelStyle.buttonBorder;
        if (!result.art.panelStyle.contentSelectedColor)
            result.art.panelStyle.contentSelectedColor = result.art.panelStyle.buttonBackground;
        if (!result.art.panelStyle.buttonBackgroundHover)
            result.art.panelStyle.buttonBackgroundHover = result.art.panelStyle.buttonBorder;
        if (!result.art.quickslotStyle.selectedSkillColor)
            result.art.quickslotStyle.selectedSkillColor = result.art.panelStyle.contentColor;

        result.ChatEnabled = !(serialized.ChatEnabled === false);
        result.ChatLink = !(serialized.ChatLink === false);
        result.ChatSmilies = !(serialized.ChatSmilies === false);
        result.StartLook = (serialized.StartLook ? serialized.StartLook : "male_1");
        result.SmallBagObject = (serialized.SmallBagObject ? serialized.SmallBagObject : "small_bag");
        result.SimplifiedObjectLogic = (serialized.SimplifiedObjectLogic === true ? true : false);
        result.ParticleEffects = (serialized.ParticleEffects ? serialized.ParticleEffects : defaultParticleSystems);
        if (!result.art.sounds)
            result.art.sounds = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].sounds));
        result.TemporaryEffects = serialized.TemporaryEffects ? serialized.TemporaryEffects : [];

        var defMonster = result.GetMonster("DefaultMonster");
        if (defMonster)
            for (var i = 0; i < result.Monsters.length; i++)
                if (result.Monsters[i].Name.toLowerCase() != "defaultmonster")
                    result.Monsters[i].DefaultMonster = defMonster;

        var baseSkill = result.GetSkill("Attack");
        if (baseSkill)
            for (var i = 0; i < result.Skills.length; i++)
                if (result.Skills[i].Name.toLowerCase() != "attack")
                    result.Skills[i].BaseSkill = baseSkill;

        if (Main.CheckNW())
            result.Id = serialized['Id'];

        return result;
    }

    /**
     * Verify all the script code used by the world.
     */
    public Verify()
    {
        for (var i = 0; i < this.Skills.length; i++)
            this.Skills[i].Verify();
        for (var i = 0; i < this.Stats.length; i++)
            this.Stats[i].Verify();
        for (var i = 0; i < this.Monsters.length; i++)
            this.Monsters[i].Verify();
    }

    public Save()
    {
        if (Main.CheckNW())
        {
            if (!game)
                game = { maps: [], data: null };
            game.data = this.Stringify();
            StandaloneMaker.SaveProject();
            this.ReadyToSave = true;
            return;
        }

        if (this.Id == undefined || this.Id == null || this.Id == -1)
        {
            Framework.Alert("No associated ID. Can't save.");
            this.ReadyToSave = true;
            return;
        }

        try
        {
            this.Verify();
            var w = World.Rebuild(this.Stringify(), false);
            this.DoSave();
        }
        catch (ex)
        {
            this.ReadyToSave = true;
            Framework.Confirm("The world definition contains some error. Are you sure you want to save it as is?", () => { this.DoSave(); });
        }
    }

    private DoSave()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/SaveWorld',
            data: {
                game: this.Id,
                token: framework.Preferences['token'],
                data: this.Stringify()
            },
            success: (msg) =>
            {
                this.ReadyToSave = true;
                this.SaveId = TryParse(msg);
                Framework.ShowMessage("World definition saved.");
            },
            error: function (msg, textStatus)
            {
                this.ReadyToSave = true;
                Framework.ShowMessage("ERROR! World is not yet saved.");
            }
        });
    }
}