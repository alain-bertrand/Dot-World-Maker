/// <reference path="../World/WorldArea.ts" />
///<reference path="PathSolver.ts" />

var movingActor = new (class
{
    public lastId: number = 1;
});

enum ACTION_ANIMATION
{
    NONE,
    ATTACK,
    DAMAGED
}

var sideAttack = [{ x: 0, y: 0 },
    { x: 5, y: 5 },
    { x: 11, y: 8 },
    { x: 16, y: 7 },
    { x: 18, y: 4 },
    { x: 20, y: 0 }];


abstract class MovingActor implements WorldRenderObject
{
    public World: World;
    public CurrentArea: WorldArea;
    public X: number = 0;
    public Y: number = 0;
    public Speed: number = 4;
    //public Actor: WorldActor = null;
    public Name: string;
    public Direction: number = 0;
    public Frame: number = 0;

    public ActorName: string;
    public Id: number;
    public Stats: Stat[] = [];
    public Skills: Skill[] = [];
    public Timers: ActorTimer[] = [];
    public ParticleEffect: ParticleSystem = null;
    public ParticleEffectDuration: Date = null;

    //public ActionAnimation: ACTION_ANIMATION = ACTION_ANIMATION.ATTACK;
    public ActionAnimation: ACTION_ANIMATION = ACTION_ANIMATION.NONE;
    public ActionAnimationStep: number = 0;
    public ActionAnimationDone: () => void = null;

    public Killed: boolean = false;
    private oldX: number = null;
    private oldY: number = null;

    private variables: VariableContainer = {};

    constructor(world: World)
    {
        this.World = world;
        this.Id = movingActor.lastId++;
    }

    public abstract CanReachArea(x: number, y: number): boolean;

    public abstract Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number): void;

    public abstract PlayerInteract(ax: number, ay: number): void;

    public abstract PlayerMouseInteract(ax: number, ay: number): boolean

    public UpdatePosition(addToMap: boolean = true)
    {
        if (this.Killed)
            return;
        var ax = this.CurrentArea.X;
        var ay = this.CurrentArea.Y;

        var tileWidth = this.World.art.background.width;
        var tileHeight = this.World.art.background.height;

        if (this.X < 0)
        {
            if (!addToMap || this.CanReachArea(ax - 1, ay))
            {
                this.X += this.World.areaWidth * tileWidth;
                ax--;
            }
            else
                this.X = 0;
        }
        if (this.X > this.World.areaWidth * tileWidth)
        {
            if (!addToMap || this.CanReachArea(ax + 1, ay))
            {
                this.X -= this.World.areaWidth * tileWidth;
                ax++;
            }
            else
                this.X = this.World.areaWidth * tileWidth;
        }
        if (this.Y < 0)
        {
            if (!addToMap || this.CanReachArea(ax, ay - 1))
            {
                this.Y += this.World.areaHeight * tileHeight;
                ay--;
            }
            else
                this.Y = 0;
        }
        if (this.Y > this.World.areaHeight * tileHeight)
        {
            if (!addToMap || this.CanReachArea(ax, ay + 1))
            {
                this.Y -= this.World.areaHeight * tileHeight;
                ay++;
            }
            else
                this.Y = this.World.areaHeight * tileHeight;
        }

        var changedArea = false;
        if (ax != this.CurrentArea.X || ay != this.CurrentArea.Y)
        {
            changedArea = true;
            if (addToMap)
            {
                if (this.Id == world.Player.Id)
                    this.World.VisibleCenter(ax, ay, world.Player.Zone);
                var area = this.World.GetArea(this.CurrentArea.X, this.CurrentArea.Y, this.CurrentArea.Zone);
                if (!area)
                    return;
                for (var i = 0; i < area.actors.length; i++)
                {
                    if (area.actors[i] == this)
                    {
                        area.actors.splice(i, 1);
                        //this.CurrentArea.RemoveFromCache(this, this.oldX, this.oldY);
                        if (addToMap)
                            this.CurrentArea.CleanObjectCache();

                        this.CurrentArea = this.World.GetArea(ax, ay, this.CurrentArea.Zone);
                        if (!this.CurrentArea)
                            return;
                        this.CurrentArea.actors.push(this);
                        break;
                    }
                }
            }
            else
                this.CurrentArea = this.World.GetArea(ax, ay, this.CurrentArea.Zone);
        }

        if (addToMap && this.oldX !== null && !changedArea)
            this.CurrentArea.RemoveFromCache(this, this.oldX, this.oldY);

        this.oldX = this.X;
        this.oldY = this.Y;
        if (addToMap)
            this.CurrentArea.AddToCache(this);
        //this.CurrentArea.CleanObjectCache();
    }

    public CanWalkOn(x: number, y: number): boolean
    {
        var t = this.CurrentArea.GetTile(Math.floor(x / this.World.art.background.width), Math.floor(y / this.World.art.background.height), this.CurrentArea.Zone);
        if (world.art.background.nonWalkable.contains(t))
            return false;

        var t = this.CurrentArea.GetTile(Math.round(x / this.World.art.background.width), Math.round(y / this.World.art.background.height), this.CurrentArea.Zone);
        if (world.art.background.nonWalkable.contains(t))
            return false;
        if (this.CollideWithObject(x, y))
            return false;

        return true;
    }

    public CollideObject(x: number, y: number): WorldRenderObject
    {
        var tx = Math.floor(x / world.art.background.width);
        var ty = Math.floor(y / world.art.background.height);

        for (var a = -5; a <= 5; a++)
        {
            for (var b = -5; b <= 5; b++)
            {
                var objs = this.CurrentArea.GetObjects(a + tx, b + ty, this.CurrentArea.Zone, true, false);
                //if (objs && objs.length) console.log(objs);

                if (objs && objs.length) for (var i = 0; i < objs.length; i++)
                {
                    if (objs[i] == this)
                        continue;

                    switch (objs[i]['__type'])
                    //switch (objs[i].Type ? objs[i].Type : objs[i]['__type'])
                    {
                        case "Player":
                            continue
                        case "Monster":
                            var objMon = this.World.art.characters[objs[i].Type ? objs[i].Name : (<Monster>objs[i]).MonsterEnv.Art];
                            if (objMon && objMon.collision && objMon.collision.radius)
                            {
                                var aa = objs[i].X - x;
                                var bb = objs[i].Y - y;
                                if (Math.sqrt(aa * aa + bb * bb) < objMon.collision.radius)
                                    return objs[i];
                            }
                            break;
                        case "NPCActor":
                            let objActor = this.World.art.characters[objs[i].Type ? objs[i].Name : (<NPCActor>objs[i]).baseNpc.Look];
                            if (objActor && objActor.collision && objActor.collision.radius)
                            {
                                var aa = objs[i].X - x;
                                var bb = objs[i].Y - y;
                                if (Math.sqrt(aa * aa + bb * bb) < objActor.collision.radius)
                                    return objs[i];
                            }
                            break;
                        case "WorldHouse":
                            //console.log(objs[i]);
                            let objHouse = world.GetHouse(objs[i].Name);
                            var aa = Math.abs(objs[i].X - x);
                            var bb = Math.abs(objs[i].Y - y);
                            var w = objHouse.collisionWidth / 2;
                            var h = objHouse.collisionHeight / 2;
                            if (objHouse && aa <= w && bb <= h)
                                return objs[i];
                            break;
                        default:
                            let obj = this.World.art.objects[objs[i].Name];
                            if (obj && obj.collision && obj.collision.radius)
                            {
                                var aa = objs[i].X - x;
                                var bb = objs[i].Y - y;
                                if (Math.sqrt(aa * aa + bb * bb) < obj.collision.radius)
                                    return objs[i];
                            }
                    }
                }
            }
        }
        return null;
    }

    private CollideWithObject(x: number, y: number)
    {
        if (this.CollideObject(x, y))
            return true;
        return false;
    }

    public PathTo(goalX: number, goalY: number, maxDistance?: number): PathPoint[]

    public PathTo(goal: MovingActor, maxDistance?: number): PathPoint[]

    public PathTo(a: any, b?: any, c?: any): PathPoint[]
    {
        var goalX: number = 0;
        var goalY: number = 0;
        var maxDistance: number = 50;
        if (a instanceof MovingActor)
        {
            var coords = this.RelativeCoord(a);
            goalX = coords.x;
            goalY = coords.y;
            if (b)
                maxDistance = b;
        }
        else
        {
            goalX = a;
            goalY = b;
            if (c)
                maxDistance = c;
        }

        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;

        var tx = Math.floor(this.X / tileWidth);
        var ty = Math.floor(this.Y / tileHeight);

        var gx = Math.floor(goalX / tileWidth);
        var gy = Math.floor(goalY / tileWidth);

        var ox = (Math.abs(goalX) % tileWidth);
        var oy = (Math.abs(goalY) % tileWidth);

        var path = PathSolver.Solve(tx, ty, gx, gy, maxDistance, (a: number, b: number) =>
        {
            return this.CanWalkOn(a * world.art.background.width, b * world.art.background.height);
        });
        if (path && path.length > 0)
        {
            path.shift();
            var sx = this.X % tileWidth;
            var sy = this.Y % tileHeight;
            for (var i = 0; i < path.length; i++)
            {
                /*var f = i / (path.length - 1);
                path[i].x = Math.round(path[i].x * tileWidth + (sx * (1 - f) + coord.OffsetX * f));
                path[i].y = Math.round(path[i].y * tileHeight + (sy * (1 - f) + coord.OffsetY * f));*/
                path[i].x = Math.round(path[i].x * tileWidth);
                path[i].y = Math.round(path[i].y * tileHeight);
            }

            path[path.length - 1].x += ox;
            path[path.length - 1].y += oy;
        }
        return path;
    }

    public DistanceTo(actor: MovingActor): number
    {
        if (!actor.CurrentArea)
            return Number.MAX_VALUE;

        var a = this.X - (((actor.CurrentArea.X - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + actor.X);
        var b = this.Y - (((actor.CurrentArea.Y - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + actor.Y);
        return Math.sqrt(a * a + b * b);
    }

    public RelativeCoord(actor: MovingActor): PathPoint
    {
        var a = ((actor.CurrentArea.X - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + actor.X;
        var b = ((actor.CurrentArea.Y - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + actor.Y;
        return { x: a, y: b };
    }

    public abstract Handle(): void;

    public Kill()
    {
        this.Killed = true;
        //this.CurrentArea.RemoveFromCache(this, this.X, this.Y);
        for (var i = 0; i < this.CurrentArea.actors.length; i++)
        {
            if (this.CurrentArea.actors[i] == this)
            {
                this.CurrentArea.actors.splice(i, 1);
                break;
            }
        }
        this.CurrentArea.CleanObjectCache();

        // Checks if it's a monster, if yes prepares the monster drop
        if (this instanceof Monster && this.Name)
        {
            var monsterId = (<Monster>(<any>this)).MonsterId;
            world.Player.RecordKill(monsterId, this.Name);

            var monster = world.GetMonster(this.Name);
            if (monster)
            {
                // We have some drops, then let's calculate what
                if ((monster.ItemDrop && monster.ItemDrop.length) || (monster.StatDrop && monster.StatDrop.length))
                {
                    var small_bag_name = (world.art.objects[world.SmallBagObject] ? world.SmallBagObject : FirstItem(world.art.objects));
                    var bag = new TemporaryWorldObject(small_bag_name, this.X, this.Y, this.CurrentArea);
                    var linkedData: BagData = {
                        Items: [],
                        Stats: []
                    };
                    if (monster.ItemDrop && monster.ItemDrop.length) for (var i = 0; i < monster.ItemDrop.length; i++)
                    {
                        if ((Math.random() * 100) > monster.ItemDrop[i].Probability)
                            continue;
                        linkedData.Items.push({
                            Name: monster.ItemDrop[i].Name,
                            Quantity: monster.ItemDrop[i].Quantity,
                            Probability: 100
                        });
                    }

                    if (monster.StatDrop && monster.StatDrop.length) for (var i = 0; i < monster.StatDrop.length; i++)
                    {
                        if ((Math.random() * 100) > monster.StatDrop[i].Probability)
                            continue;
                        linkedData.Stats.push({
                            Name: monster.StatDrop[i].Name,
                            Quantity: monster.StatDrop[i].Quantity,
                            Probability: 100
                        });
                    }

                    // No luck? Then don't add it on the map
                    if (linkedData.Items.length > 0 || linkedData.Stats.length > 0)
                    {
                        bag.LinkedData = linkedData;
                        bag.MouseCallback = MapBag.ShowBag;
                        this.CurrentArea.tempObjects.push(bag);
                        this.CurrentArea.CleanObjectCache();
                    }
                }
            }
        }
    }

    static FindActorById(id: number): MovingActor
    {
        for (var i = 0; i < world.areas.length; i++)
            for (var j = 0; j < world.areas[i].actors.length; j++)
                if (world.areas[i].actors[j].Id == id)
                    return world.areas[i].actors[j];
        return null;
    }

    public FindStat(name: string): Stat
    {
        if (!this.FindStat.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var lname = name.toLowerCase();
        for (var i = 0; i < this.Stats.length; i++)
            if (this.Stats[i].Name.toLowerCase() == lname)
                return this.Stats[i];
        return null;
    }

    public GetStat(name: string): number
    {
        if (!this.GetStat.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var stat = this.FindStat(name);
        if (stat)
            return stat.Value;
        return null;
    }

    public GetStatMaxValue(name: string): number
    {
        var stat = this.FindStat(name);
        if (stat && stat.MaxValue)
            return stat.MaxValue;
        if (stat)
        {
            var val = stat.BaseStat.InvokeFunction("maxvalue", [new VariableValue(this.Id)]);
            return (val ? val.GetNumber() : null);
        }
        return null;
    }

    public SetStat(name: string, value: number): void
    {
        if (!this.SetStat.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var stat = this.FindStat(name);

        if (isNaN(value))
        {
            Main.AddErrorMessage("Stat " + name + " error. Cannot set NaN to it");
            return;
        }

        //console.log("Set " + this.Name + " stat " + name + " " + value);

        if (stat)
        {
            var wishedValue = value;
            var maxVal = this.GetStatMaxValue(name);
            if (maxVal !== null && value > maxVal)
                value = maxVal;
            var oldValue = stat.Value;
            stat.Value = value;
            stat.BaseStat.InvokeFunction("ValueChange", [new VariableValue(this.Id), new VariableValue(value), new VariableValue(wishedValue), new VariableValue(oldValue)]);
            if (this.Id == world.Player.Id)
            {
                world.Player.StoredCompare = world.Player.JSON();
                world.Player.Save();
            }
        }
    }

    public GetTimer(name: string): ActorTimer
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Timers.length; i++)
            if (this.Timers[i].Name.toLowerCase() == lname)
                return this.Timers[i];
        return null;
    }

    public SetTimer(name: string, length: number): void
    {
        if (!this.SetTimer.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var lname = name.toLowerCase();

        for (var i = 0; i < this.Timers.length; i++)
        {
            if (this.Timers[i].Name.toLowerCase() == lname)
            {
                if (length <= 0)
                    this.Timers.splice(i, 1);
                else
                    this.Timers[i].Reset(length);
                return;
            }
        }
        if (length > 0)
            this.Timers.push(new ActorTimer(lname, length));
    }

    public ResetVariables()
    {
        this.variables = {};
    }

    public SetVariable(name: string, value: VariableValue)
    {
        if (!this.SetVariable.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        this.variables[name.toLowerCase()] = value;
    }

    public GetVariable(name: string): VariableValue
    {
        if (this.variables[name.toLowerCase()] == undefined)
            return new VariableValue(null);
        return this.variables[name.toLowerCase()];
    }
}