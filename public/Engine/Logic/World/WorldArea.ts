///<reference path="../../Libs/NumberCompression.ts" />


interface WorldNamePosition
{
    Name: string;
    X: number;
    Y: number;
}

interface MonsterInformation extends WorldNamePosition
{
    RespawnTime?: number;
}

interface WorldRenderObject extends WorldNamePosition
{
    Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number);
    PlayerInteract(ax: number, ay: number);
    PlayerMouseInteract(ax: number, ay: number): boolean;
    Type?: string;
}

class WorldArea
{
    public backgroundTiles: number[];
    public X: number;
    public Y: number;
    public Zone: string;
    public objects: WorldObject[] = [];
    public actors: MovingActor[] = [];
    public houses: WorldHouse[] = [];
    public tempObjects: TemporaryWorldObject[] = [];
    public world: World;
    public storedMonsters: MonsterInformation[] = [];
    public storedNPC: WorldNamePosition[] = [];
    public storedMap: boolean = false;
    public mapActions: MapAction[] = [];
    public otherPlayers: OtherPlayer[];
    private currentFragment: AreaFragment;

    public edited: boolean = false;
    private cacheWorldObject: WorldRenderObject[][];

    public GetTile(x: number, y: number, zone: string): number
    {
        var ax = this.X;
        var ay = this.Y;
        if (x < 0)
        {
            x += this.world.areaWidth;
            ax--;
        }
        if (y < 0)
        {
            y += this.world.areaHeight;
            ay--;
        }
        if (x >= this.world.areaWidth)
        {
            x -= this.world.areaWidth;
            ax++;
        }
        if (y >= this.world.areaHeight)
        {
            y -= this.world.areaHeight;
            ay++;
        }
        var a = <WorldArea>this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return null;

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.backgroundTiles && this.currentFragment.backgroundTiles[x + y * this.world.areaWidth] !== null && this.currentFragment.backgroundTiles[x + y * this.world.areaWidth] !== undefined)
            return this.currentFragment.backgroundTiles[x + y * this.world.areaWidth];
        return a.backgroundTiles[x + y * this.world.areaWidth];
    }

    public HitHouse(x: number, y: number, zone: string): WorldHouse[]
    {
        var result: WorldHouse[] = [];
        for (var i = 0; i < this.houses.length; i++)
        {
            var obj = this.houses[i];
            var house = world.GetHouse(obj.Name);
            if (x >= obj.X - (house.collisionX + house.collisionWidth / 2) && x <= obj.X + house.collisionWidth / 2 &&
                y >= obj.Y - (house.collisionY + house.collisionHeight / 2) && y <= obj.Y + house.collisionHeight / 2)
                result.push(obj);
        }

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.houses)
        {
            for (var i = 0; i < this.currentFragment.houses.length; i++)
            {
                var obj = this.currentFragment.houses[i];
                var house = world.GetHouse(obj.Name);
                if (x >= obj.X - (house.collisionX + house.collisionWidth / 2) && x <= obj.X + house.collisionWidth / 2 &&
                    y >= obj.Y - (house.collisionY + house.collisionHeight / 2) && y <= obj.Y + house.collisionHeight / 2)
                    result.push(obj);
            }
        }

        result.sort((a, b) => { return a.Y - b.Y; });
        return result;
    }

    public HitNpc(x: number, y: number, zone: string): WorldNamePosition[]
    {
        var result: WorldNamePosition[] = [];
        for (var i = 0; i < this.storedNPC.length; i++)
        {
            var obj = this.storedNPC[i];
            var npc = world.GetNPC(obj.Name);
            if (!npc)
            {
                this.storedNPC.splice(i, 1);
                this.edited = true;
                i--;
                continue;
            }
            var objInfo = world.art.characters[npc.Look];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }


        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.actors)
        {
            for (var i = 0; i < this.currentFragment.actors.length; i++)
            {
                var obj = <WorldNamePosition>(<any>this.currentFragment.actors[i]);
                var npc = world.GetNPC(obj.Name);
                if (!npc)
                {
                    this.storedNPC.splice(i, 1);
                    this.edited = true;
                    i--;
                    continue;
                }
                var objInfo = world.art.characters[npc.Look];
                if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                    y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                    result.push(obj);
            }
        }
        result.sort((a, b) => { return a.Y - b.Y; });
        return result;
    }

    public HitMonster(x: number, y: number, zone: string): MonsterInformation[]
    {
        var result: MonsterInformation[] = [];
        for (var i = 0; i < this.storedMonsters.length; i++)
        {
            var obj = this.storedMonsters[i];
            var monster = world.GetMonster(obj.Name);
            var objInfo = world.art.characters[monster.Art];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width / objInfo.frames - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height / objInfo.directions - objInfo.groundY)
                result.push(obj);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        for (var i = 0; i < this.currentFragment.monsters.length; i++)
        {
            var obj = this.currentFragment.monsters[i];
            var monster = world.GetMonster(obj.Name);
            var objInfo = world.art.characters[monster.Art];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width / objInfo.frames - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height / objInfo.directions - objInfo.groundY)
                result.push(obj);
        }

        result.sort((a, b) => { return a.Y - b.Y; });
        return result;
    }


    public HitObjects(x: number, y: number, zone?: string): WorldRenderObject[]
    {
        var result: WorldRenderObject[] = [];
        for (var i = 0; i < this.objects.length; i++)
        {
            var objInfo = world.art.objects[this.objects[i].Name];
            if (!objInfo)
                continue;
            var obj: WorldRenderObject = this.objects[i];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }

        for (var i = 0; i < this.tempObjects.length; i++)
        {
            var objInfo = world.art.objects[this.tempObjects[i].Name];
            if (!objInfo)
                continue;
            var obj: WorldRenderObject = this.tempObjects[i];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.objects)
        {
            for (var i = 0; i < this.currentFragment.objects.length; i++)
            {
                var objInfo = world.art.objects[this.currentFragment.objects[i].Name];
                if (!objInfo)
                    continue;
                var obj: WorldRenderObject = this.currentFragment.objects[i];
                if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                    y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                    result.push(obj);
            }
        }

        result.sort((a, b) => { return a.Y - b.Y; });
        return result;
    }

    public GetObjects(x: number, y: number, zone: string, compensate: boolean = false, includeOtherPlayers: boolean = true): WorldRenderObject[]
    {
        var ax = this.X;
        var ay = this.Y;

        var cx = 0;
        var cy = 0;

        if (x < 0)
        {
            x += this.world.areaWidth;
            cx = -this.world.areaWidth;
            ax--;
        }
        if (y < 0)
        {
            y += this.world.areaHeight;
            cy = -this.world.areaHeight;
            ay--;
        }
        if (x >= this.world.areaWidth)
        {
            x -= this.world.areaWidth;
            cx = this.world.areaWidth;
            ax++;
        }
        if (y >= this.world.areaHeight)
        {
            y -= this.world.areaHeight;
            cy = this.world.areaHeight;
            ay++;
        }
        var a = <WorldArea>this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return [];

        // We don't have the grid cache of the objects, let's create it
        if (!a.cacheWorldObject)
            a.RebuildCache();

        var result = a.cacheWorldObject[x + y * this.world.areaWidth].slice();
        var w = world.art.background.width;
        var h = world.art.background.height;
        if (this.otherPlayers) for (var i = 0; i < this.otherPlayers.length; i++)
            if (Math.floor(this.otherPlayers[i].X / w) == x && Math.floor(this.otherPlayers[i].Y / h) == y)
                result.push(this.otherPlayers[i]);

        if (compensate && (cx != 0 || cy != 0))
        {
            var compensatedResult: WorldRenderObject[] = [];
            for (var i = 0; i < result.length; i++)
            {
                if (!result[i]['__type'])
                    result[i]['__type'] = ("" + result[i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];

                var n: WorldRenderObject = {
                    Name: result[i].Name,
                    Draw: result[i].Draw,
                    PlayerInteract: result[i].PlayerInteract,
                    PlayerMouseInteract: result[i].PlayerMouseInteract,
                    X: result[i].X + cx * w,
                    Y: result[i].Y + cy * h,
                    Type: result[i]['__type']
                };

                n['__type'] = n['Type'];

                // Crap workaround to pass the right information. We should find a better implementation
                switch (n.Type)
                {
                    case "Monster":
                        n.Name = (<Monster>result[i]).MonsterEnv.Art;
                        break;
                    case "NPCActor":
                        n.Name = (<NPCActor>result[i]).baseNpc.Look;
                        break;
                    default:
                        break;
                }

                compensatedResult.push(n);
            }
            return compensatedResult;
        }
        return result;
    }

    public GetActions(x: number, y: number, zone: string, roundPosition: boolean = false): MapAction
    {
        var ax = this.X;
        var ay = this.Y;

        if (x < 0)
        {
            x += this.world.areaWidth * world.art.background.width;
            ax--;
        }
        if (y < 0)
        {
            y += this.world.areaHeight * world.art.background.height;
            ay--;
        }
        if (x >= this.world.areaWidth * world.art.background.width)
        {
            x -= this.world.areaWidth * world.art.background.width;
            ax++;
        }
        if (y >= this.world.areaHeight * world.art.background.height)
        {
            y -= this.world.areaHeight * world.art.background.height;
            ay++;
        }
        var a = <WorldArea>this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return null;

        if (roundPosition)
        {
            x = Math.floor(x / world.art.background.width);
            y = Math.floor(y / world.art.background.height);
        }

        var sizes: number[] = [0.5, 1, 2];

        for (var i = 0; i < a.mapActions.length; i++)
        {
            var collisionSize = world.art.background.width * sizes[a.mapActions[i].Size === null || a.mapActions[i].Size === undefined ? 1 : a.mapActions[i].Size];

            if (roundPosition)
            {
                var tx = Math.floor(a.mapActions[i].X / world.art.background.width);
                var ty = Math.floor(a.mapActions[i].Y / world.art.background.height);

                if (tx == x && ty == y)
                    return a.mapActions[i];
            }
            else
            {
                if (x > a.mapActions[i].X - collisionSize
                    && x < a.mapActions[i].X + collisionSize
                    && y > a.mapActions[i].Y - collisionSize
                    && y < a.mapActions[i].Y + collisionSize)
                    return a.mapActions[i];
            }
        }
        return null;
    }

    static SortActors(oa: WorldObject, ob: WorldObject): number
    {
        if ((oa.Y - ob.Y) > 0)
            return 1;
        if ((oa.Y - ob.Y) < 0)
            return -1;
        return 0;
    }

    public RemoveVisitedObjects()
    {
        if (!(this.world && this.world.Player && this.world.Player.HasVisitedMapObject))
            return;
        for (var i = 0; i < this.objects.length;)
        {
            var objInfo = world.art.objects[this.objects[i].Name];
            if (!objInfo)
            {
                i++;
                continue;
            }

            var mustBeRemoved = false;

            if (objInfo.disappearOnClick === true && this.world.Player.HasVisitedMapObject("click," + this.objects[i].GetId(this.X, this.Y, this.world.Player.Zone)))
                mustBeRemoved = true;
            else if (objInfo.disappearOnWalk === true && this.world.Player.HasVisitedMapObject("walk," + this.objects[i].GetId(this.X, this.Y, this.world.Player.Zone)))
                mustBeRemoved = true;

            if (mustBeRemoved)
                this.objects.splice(i, 1);
            else
                i++;
        }
        this.CleanObjectCache();
    }

    public RebuildCache()
    {
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;

        this.cacheWorldObject = [];
        // Prepares the empty cache
        var totCells = this.world.areaWidth * this.world.areaHeight;
        for (var i = 0; i < totCells; i++)
            this.cacheWorldObject[i] = [];

        var toPlace = ["objects", "actors", "houses", "tempObjects"];
        for (var j = 0; j < toPlace.length; j++)
        {
            for (var i = 0; i < this[toPlace[j]].length; i++)
            {
                if (!this[toPlace[j]][i]['__type'])
                    this[toPlace[j]][i]['__type'] = ("" + this[toPlace[j]][i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];

                var a = Math.min(Math.floor(this[toPlace[j]][i].X / tileWidth), this.world.areaWidth - 1);
                var b = Math.min(Math.floor(this[toPlace[j]][i].Y / tileHeight), this.world.areaHeight - 1);

                this.cacheWorldObject[a + b * this.world.areaWidth].push(this[toPlace[j]][i]);
            }
        }

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.objects)
        {
            var toPlace = ["objects", "actors", "houses"];
            for (var j = 0; j < toPlace.length; j++)
            {
                for (var i = 0; i < this.currentFragment[toPlace[j]].length; i++)
                {
                    if (!this.currentFragment[toPlace[j]][i]['__type'])
                        this.currentFragment[toPlace[j]][i]['__type'] = ("" + this.currentFragment[toPlace[j]][i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];

                    var a = Math.min(Math.floor(this.currentFragment[toPlace[j]][i].X / tileWidth), this.world.areaWidth - 1);
                    var b = Math.min(Math.floor(this.currentFragment[toPlace[j]][i].Y / tileHeight), this.world.areaHeight - 1);

                    this.cacheWorldObject[a + b * this.world.areaWidth].push(this.currentFragment[toPlace[j]][i]);
                }
            }
        }

        // Resort each grid cell based on Y
        for (var i = 0; i < totCells; i++)
            this.cacheWorldObject[i].sort(WorldArea.SortActors);
    }

    public CleanObjectCache()
    {
        this.cacheWorldObject = null;
    }

    public RemoveFromCache(actor: WorldNamePosition, x: number, y: number): void
    {
        if (!this.cacheWorldObject)
            return;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var pos = Math.min(Math.floor(x / tileWidth), this.world.areaWidth - 1) + Math.min(Math.floor(y / tileHeight), this.world.areaHeight - 1) * this.world.areaWidth;
        if (pos < 0 || pos >= this.cacheWorldObject.length)
        {
            this.CleanObjectCache();
            return;
        }

        for (var i = 0; i < this.cacheWorldObject[pos].length; i++)
        {
            if (this.cacheWorldObject[pos][i] == actor)
            {
                this.cacheWorldObject[pos].splice(i, 1);
                return;
            }
        }
    }

    public AddToCache(actor: WorldRenderObject): void
    {
        if (!this.cacheWorldObject)
            return;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var pos = Math.min(Math.floor(actor.X / tileWidth), this.world.areaWidth - 1) + Math.min(Math.floor(actor.Y / tileHeight), this.world.areaHeight - 1) * this.world.areaWidth;

        this.cacheWorldObject[pos].push(actor);
        this.cacheWorldObject[pos].sort(WorldArea.SortActors);
    }

    public HandleActors()
    {
        var actorList = this.actors.slice();
        for (var i = 0; i < actorList.length; i++)
            actorList[i].Handle();
        if (this.otherPlayers) for (var i = 0; i < this.otherPlayers.length; i++)
            this.otherPlayers[i].Handle();
        var tempObjects = this.tempObjects.slice();
        for (var i = 0; i < this.tempObjects.length; i++)
            tempObjects[i].Handle();
    }

    static Parse(data: string): WorldArea
    {
        var r = JSON.parse(data);
        var result = new WorldArea();
        result.storedMap = true;
        result.backgroundTiles = NumberCompression.StringToArray(r.Background);
        result.objects = [];
        for (var i in r.Objects)
            for (var j = 0, s = r.Objects[i]; j < s.length; j += 6)
                result.objects.push(new WorldObject(i, NumberCompression.StringToNumber(s, j, 3), NumberCompression.StringToNumber(s, j + 3, 3)));
        if (r.Chests)
        {
            var chests = (<any[]>r.Chests).map((m) => { return Object.cast(m, WorldChest); });
            for (var j = 0; j < chests.length; j++)
                result.objects.push(chests[j]);
        }

        result.storedNPC = r.StoredNPC;
        result.storedMonsters = r.StoredMonsters;
        if (r.Houses) for (var j = 0; j < r.Houses.length; j++)
            result.houses.push(new WorldHouse(r.Houses[j].Name, r.Houses[j].X, r.Houses[j].Y));
        if (r.MapActions) for (var j = 0; j < r.MapActions.length; j++)
            result.mapActions.push(MapAction.Restore(r.MapActions[j], result));
        result.storedMap = true;

        return result;
    }

    public Stringify(): string
    {
        var objects = {};
        var chests = [];
        for (var i = 0; i < this.objects.length; i++)
        {
            if (!world.art.objects[this.objects[i].Name])
                continue;
            if (this.objects[i] instanceof WorldChest)
            {
                chests.push(this.objects[i]);
                continue;
            }
            if (!objects[this.objects[i].Name])
                objects[this.objects[i].Name] = "";
            objects[this.objects[i].Name] += NumberCompression.NumberToString(this.objects[i].X, 3) + NumberCompression.NumberToString(this.objects[i].Y, 3);
        }

        var r = { Background: NumberCompression.ArrayToString(this.backgroundTiles), Objects: objects, StoredMonsters: this.storedMonsters, StoredNPC: this.storedNPC, Houses: this.houses, MapActions: this.mapActions.map((c) => { return c.Store(); }), Chests: chests };
        return JSON.stringify(r);
    }

    public ActorAt(x: number, y: number, allowsCharacters: boolean): MovingActor[]
    {
        var result: MovingActor[] = [];
        for (var i = 0; i < this.actors.length; i++)
        {
            var obj: TilesetCharacterDetails = null;
            var w = 0;
            var h = 0;
            if (this.actors[i] instanceof Monster)
                obj = this.world.art.characters[(<Monster>this.actors[i]).MonsterEnv.Art];
            else if (this.actors[i] instanceof NPCActor)
                obj = this.world.art.characters[(<NPCActor>this.actors[i]).baseNpc.Look];
            else
            {
                if (!allowsCharacters)
                    continue;
                obj = this.world.art.characters[this.actors[i].Name];
            }
            if (obj && obj.width && obj.frames)
                w = obj.width / obj.frames;
            if (obj && obj.height && obj.directions)
                h = obj.height / obj.directions;
            var a = x + (obj && obj.groundX ? obj.groundX : 0);
            var b = y + (obj && obj.groundY ? obj.groundY : 0);
            if (a >= this.actors[i].X && a <= this.actors[i].X + w && b >= this.actors[i].Y && b <= this.actors[i].Y + h)
                result.push(this.actors[i]);
        }

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.actors)
        {
            for (var i = 0; i < this.currentFragment.actors.length; i++)
            {
                var obj: TilesetCharacterDetails = null;
                var w = 0;
                var h = 0;
                var obj = this.world.art.characters[(<NPCActor>this.currentFragment.actors[i]).baseNpc.Look];
                if (obj && obj.width && obj.frames)
                    w = obj.width / obj.frames;
                if (obj && obj.height && obj.directions)
                    h = obj.height / obj.directions;
                var a = x + (obj && obj.groundX ? obj.groundX : 0);
                var b = y + (obj && obj.groundY ? obj.groundY : 0);
                if (a >= this.currentFragment.actors[i].X && a <= this.currentFragment.actors[i].X + w && b >= this.currentFragment.actors[i].Y && b <= this.currentFragment.actors[i].Y + h)
                    result.push(this.currentFragment.actors[i]);
            }
        }

        result.sort((a, b) => { return a.Y - b.Y; });
        return result;
    }

    public GenerateMonsters()
    {
        if (!this.world.GetZone)
            return;

        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.width;

        var rnd = new SeededRandom();
        rnd.Seed("Monsters_" + this.X + "_" + this.Y);
        var zone = this.world.GetZone(this.Zone);

        // Place the monsters
        if (zone.Monsters && zone.Monsters.length > 0)
        {
            for (var i = 0; i < (this.world.areaWidth - 1) * (this.world.areaHeight - 1); i++)
            {
                for (var j = 0; j < zone.Monsters.length; j++)
                {
                    var monsterDef = this.world.GetMonster(zone.Monsters[j].Name);
                    if (!monsterDef)
                        continue;
                    if (monsterDef.Name.toLowerCase() == "defaultmonster")
                        continue;
                    var dice = rnd.Next() * 100;
                    if (zone.Monsters[j].Frequency && dice <= zone.Monsters[j].Frequency)
                    {
                        var tx = i % this.world.areaWidth;
                        var ty = Math.floor(i / this.world.areaWidth);

                        var monster = Monster.Create(monsterDef, this, tx * tileWidth + rnd.Next(tileWidth), ty * tileHeight + rnd.Next(tileHeight));
                        if (monster.CanWalkOn(monster.X, monster.Y) && world.Player.CanRespawn(monster.MonsterId, null))
                            this.actors.push(monster);
                        break;
                    }
                }
            }
        }
    }

    public OnlyDefinedActors()
    {
        this.actors = [];
        if (world.Player.CurrentArea == this)
            this.actors.push(world.Player);
        // We should transform random monsters in editable monsters
        if (!this.storedMap && !this.edited && (!this.storedMonsters || !this.storedMonsters.length))
        {
            this.RecoverMonsters();
            this.GenerateMonsters();
            this.storedMonsters = [];
            for (var i = 0; i < this.actors.length; i++)
            {
                if (this.actors[i] instanceof Monster)
                {
                    this.storedMonsters.push({
                        Name: this.actors[i].Name,
                        X: this.actors[i].X,
                        Y: this.actors[i].Y
                    });
                }
            }
        }
        this.RecoverMonsters();
        this.RecoverNPCs();
        this.CleanObjectCache();
    }

    public RecoverActors()
    {
        if (!world || !world.Player)
            return;
        this.actors = [];
        if (world.Player.CurrentArea == this)
            this.actors.push(world.Player);

        if (!this.storedMap && !this.edited)
            this.GenerateMonsters();
        else
        {
            this.RecoverMonsters();
            this.RecoverNPCs();
        }
        this.CleanObjectCache();
    }

    private RecoverMonsters()
    {
        if (!this.storedMonsters)
            return;
        for (var i = 0; i < this.storedMonsters.length; i++)
        {
            var m = this.storedMonsters[i];
            var monster: Monster = null;
            try
            {
                monster = Monster.Create(this.world.GetMonster(m.Name), this, m.X, m.Y);
            }
            catch (ex)
            {
                continue;
            }
            if (monster && world.Player.CanRespawn(monster.MonsterId, this.storedMonsters[i].RespawnTime))
                this.actors.push(monster);
        }

        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        for (var i = 0; i < this.currentFragment.monsters.length; i++)
        {
            var m = this.currentFragment.monsters[i];
            var monster = Monster.Create(this.world.GetMonster(m.Name), this, m.X, m.Y);
            monster['fragId'] = m['fragIg'];
            if (world.Player.CanRespawn(monster.MonsterId, this.currentFragment.monsters[i].RespawnTime))
                this.actors.push(monster);
        }
    }

    private RecoverNPCs()
    {
        if (!this.storedNPC)
            return;
        for (var i = 0; i < this.storedNPC.length; i++)
        {
            var n = this.storedNPC[i]
            var npc = this.world.GetNPC(n.Name);
            if (!npc)
                continue;
            this.actors.push(NPCActor.Create(npc, this, n.X, n.Y));
        }
    }

    public AddPlayer(x: number, y: number, name: string, look: string, emote: number, emoteTimer: number, direction: number)
    {
        var otherPlayer = OtherPlayer.FindPlayer(name);
        if (otherPlayer)
        {
            if (otherPlayer.CurrentArea != this)
            {
                for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++)
                {
                    if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer)
                    {
                        otherPlayer.CurrentArea.otherPlayers.splice(i, 1);
                        break;
                    }
                }
                if (!this.otherPlayers)
                    this.otherPlayers = [];
                this.otherPlayers.push(otherPlayer);
                otherPlayer.X = x;
                otherPlayer.Y = y;
                otherPlayer.DX = x;
                otherPlayer.DY = y;
                otherPlayer.VX = null;
                otherPlayer.VY = null;
                otherPlayer.CurrentArea = this;
                otherPlayer.InterpolationStep = null;
                otherPlayer.Name = look;
                otherPlayer.CurrentEmote = emote;
                otherPlayer.EmoteTimer = emoteTimer;
                otherPlayer.Direction = direction;
            }
            else
            {
                if (Math.abs(x - otherPlayer.X) > 5)
                {
                    otherPlayer.DX = x;
                    otherPlayer.VX = (x - otherPlayer.X) / 30;
                }
                else
                {
                    otherPlayer.X = x;
                    otherPlayer.DX = x;
                    otherPlayer.VX = 0;
                }
                if (Math.abs(y - otherPlayer.Y) > 5)
                {
                    otherPlayer.DY = y;
                    otherPlayer.VY = (y - otherPlayer.Y) / 30;
                }
                else
                {
                    otherPlayer.Y = y;
                    otherPlayer.DY = y;
                    otherPlayer.VY = 0;
                }

                otherPlayer.InterpolationStep = 0;
                otherPlayer.Name = look;
                otherPlayer.CurrentEmote = emote;
                otherPlayer.EmoteTimer = emoteTimer;
                otherPlayer.Direction = direction;
            }
        }
        else
        {
            otherPlayer = new OtherPlayer(this.world);
            otherPlayer.CurrentArea = this;
            otherPlayer.X = x;
            otherPlayer.Y = y;
            otherPlayer.Username = name;
            otherPlayer.Name = look;
            otherPlayer.CurrentEmote = emote;
            otherPlayer.EmoteTimer = emoteTimer;
            otherPlayer.Direction = direction;

            if (!this.otherPlayers)
                this.otherPlayers = [];
            this.otherPlayers.push(otherPlayer);
        }
    }

    public ResetFragments()
    {
        this.currentFragment = null;
        this.CleanObjectCache();
    }
}
