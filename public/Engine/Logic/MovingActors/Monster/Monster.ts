///<reference path="../MovingActor.ts" />
class Monster extends MovingActor
{
    private nbStepCount = 0;
    private path: PathPoint[] = null;
    private lastPath = 0;
    private realDirection = 0;
    public MonsterEnv: KnownMonster = null;
    public MonsterId: string;

    public static Create(monsterDef: KnownMonster, worldArea: WorldArea, x: number, y: number): Monster
    {
        var monster = new Monster(worldArea.world);
        monster.CurrentArea = worldArea;
        monster.MonsterId = worldArea.Zone + "," + (x + worldArea.X * world.areaWidth * world.art.background.width) + "," + (y + worldArea.Y * world.areaHeight * world.art.background.height);
        monster.X = x;
        monster.Y = y;
        monster.Speed = (monsterDef.Code.CodeVariables["speed"] ? parseFloat(monsterDef.Code.CodeVariables["speed"].value) : 2);
        monster.Name = monsterDef.Name;
        monster.MonsterEnv = monsterDef;

        for (var i = 0; i < monster.Stats.length; i++)
        {
            if (monsterDef.Code.CodeVariables[monster.Stats[i].Name.toLowerCase()])
                monster.Stats[i].Value = monster.Stats[i].MaxValue = monster.Stats[i].Value = parseFloat(monsterDef.Code.CodeVariables[monster.Stats[i].Name.toLowerCase()].value);
        }
        return monster;
    }

    constructor(world: World)
    {
        super(world);

        for (var i = 0; i < this.World.Stats.length; i++)
        {
            if (!this.World.Stats[i].MonsterStat)
                continue;

            var stat = new Stat();
            stat.Name = this.World.Stats[i].Name;
            stat.BaseStat = this.World.Stats[i];
            stat.Value = this.World.Stats[i].DefaultValue;
            this.Stats.push(stat);
        }
    }

    public CanReachArea(x: number, y: number): boolean
    {
        //return (Math.abs(this.World.Player.CurrentArea.X - x) < 2 && Math.abs(this.World.Player.CurrentArea.Y - y) < 2);
        return (Math.abs(this.World.Player.AX - x) < 2 && Math.abs(this.World.Player.AY - y) < 2);
        //return false;
    }

    public Handle(): void
    {
        if (this.ParticleEffectDuration && this.ParticleEffectDuration.getTime() < new Date().getTime())
        {
            this.ParticleEffect = null;
            this.ParticleEffectDuration = null;
        }

        if (!this.MonsterEnv || !this.World.art.characters[this.MonsterEnv.Art])
        {
            this.Kill();
            return;
        }

        if (!framework.Preferences['token'] && !Main.CheckNW())
        {
            this.RandomWalk();
        }

        // Too far we skip it completly.
        var a = this.X - (((world.Player.AX - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + world.Player.X);
        var b = this.Y - (((world.Player.AY - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + world.Player.Y);
        if (Math.abs(a) > play.renderer.width / 2 || Math.abs(b) > play.renderer.height / 2)
            return;

        if (world.Player.InDialog)
        {
            this.RandomWalk();
        }
        else
        {
            var scriptedHandleResult = this.InvokeFunction("Handle", [new VariableValue(this.Id)]);
            if (scriptedHandleResult !== null && scriptedHandleResult.GetBoolean())
                return;

            // Either no 
            if (world.Player.InDialog)
                this.RandomWalk();
            else
                this.HuntWalk(10);
        }
    }

    public HuntWalk(maxDistance: number)
    {
        if (maxDistance > 20)
            maxDistance = 20;
        if (maxDistance < 5)
            maxDistance = 5;

        var pDist = this.DistanceTo(this.World.Player);
        if (pDist < this.World.art.background.width)
        {
            return;
        }
        if (pDist < (maxDistance * this.World.art.background.width))
        {
            if (this.lastPath <= 0)
            {
                this.path = this.PathTo(this.World.Player, maxDistance);
                this.lastPath = 10;
            }
            this.lastPath--;
        }
        else
        {
            this.path = null;
            this.lastPath = 0;
        }

        if (!this.HandlePath())
        {
            this.RandomWalk();
        }
    }

    public RandomWalk()
    {
        this.path = null;
        this.lastPath = 0;

        var mDef = this.World.art.characters[this.MonsterEnv.Art];

        if (this.nbStepCount <= 0)
        {
            this.realDirection += (Math.random() * 0.6) - 0.3;
            if (this.realDirection < 0)
                this.realDirection += Math.PI * 2;
            if (this.realDirection >= Math.PI * 2)
                this.realDirection -= Math.PI * 2;

            this.nbStepCount = 10;

            var d = Math.round(this.realDirection * (mDef.directions - 1) / (Math.PI * 2));
            this.Direction = (mDef.directionFrames ? mDef.directionFrames[d] : d);
        }
        else
            this.nbStepCount--;

        var nx = this.X + Math.cos(this.realDirection) * this.Speed;
        var ny = this.Y + Math.sin(this.realDirection) * this.Speed;
        if (this.CanWalkOn(nx, ny))
        {
            if (mDef.animationCycle == "simple")
                this.Frame = (this.Frame + 1) % (mDef.frames * mDef.imageFrameDivider);
            else
                this.Frame = (this.Frame + 1) % ((mDef.frames + 1) * mDef.imageFrameDivider);
            this.X = nx;
            this.Y = ny;

            this.UpdatePosition();
        }
        // Let's try to turn 180°
        else
        {
            this.realDirection += Math.PI;
            if (this.realDirection < 0)
                this.realDirection += Math.PI * 2;
            if (this.realDirection >= Math.PI * 2)
                this.realDirection -= Math.PI * 2;
        }
    }

    public HandlePath(): boolean
    {
        if (!this.path || this.path.length == 0)
            return false;
        var updateFrame = false;

        var nx = this.X;
        var ny = this.Y;

        if (this.path && this.path.length > 0)
        {
            var p = this.path[0];
            var sx = Math.abs(p.x - this.X);
            var sy = Math.abs(p.y - this.Y);
            if (sx <= this.Speed && sy <= this.Speed)
            {
                nx = p.x;
                ny = p.y;
                this.path.shift();
            }
            else
            {
                if (p.x > nx && sx > this.Speed)
                {
                    nx += this.Speed;
                    this.Direction = 2;
                    updateFrame = true;
                }
                else if (p.x < nx && sx > this.Speed)
                {
                    nx -= this.Speed;
                    this.Direction = 1;
                    updateFrame = true;
                }
                if (p.y > ny && sy > this.Speed)
                {
                    ny += this.Speed;
                    this.Direction = 0;
                    updateFrame = true;
                }
                else if (p.y < ny && sy > this.Speed)
                {
                    ny -= this.Speed;
                    this.Direction = 3;
                    updateFrame = true;
                }
            }
        }

        if (this.CanWalkOn(nx, ny))
        {
            this.X = nx;
            this.Y = ny;

            var ax = this.CurrentArea.X;
            var ay = this.CurrentArea.Y;

            if (updateFrame)
                this.Frame = (this.Frame + 1) % ((world.art.characters[this.MonsterEnv.Art].frames + 1) * world.art.characters[this.MonsterEnv.Art].imageFrameDivider);

            this.UpdatePosition();

            // Update path after crossing the border
            if (this.path && this.path.length > 0)
            {
                var tileWidth = world.art.background.width;
                var tileHeight = world.art.background.height;

                var needToRepath = false;
                if (ax > world.Player.CurrentArea.X)
                {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].x += (world.areaWidth - 0) * tileWidth;
                    needToRepath = true;
                }
                if (ax < world.Player.CurrentArea.X)
                {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].x -= (world.areaWidth - 0) * tileWidth;
                    needToRepath = true;
                }

                if (ay > world.Player.CurrentArea.Y)
                {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].y += (world.areaHeight - 0) * tileHeight;
                    needToRepath = true;
                }
                if (ay < world.Player.CurrentArea.Y)
                {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].y -= (world.areaHeight - 0) * tileHeight;
                    needToRepath = true;
                }
                this.lastPath = 0;
            }
            return true;
        }
        else
        {
            this.path = null;
            return false;
        }
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var img = renderEngine.GetActorImage(this.MonsterEnv.Art);
        if (!img || !img.width)
            return;
        var actorArtInfo = renderEngine.world.art.characters[this.MonsterEnv.Art];
        var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
        var w = Math.floor(img.width / actorArtInfo.frames);
        var h = Math.floor(img.height / actorArtInfo.directions);
        var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
        var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
        var fz = 1;
        var d = this.Direction;

        switch (this.ActionAnimation)
        {
            case ACTION_ANIMATION.ATTACK:

                var ox = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].x;
                var oy = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].y;
                switch (this.Direction)
                {
                    case 0: // Down
                        iy -= ox;
                        break;
                    case 1: // Left
                        ix += ox;
                        iy -= oy;
                        break;
                    case 2: // Right
                        ix -= ox;
                        iy -= oy;
                        break;
                    case 3: // Up
                        iy += ox;
                        break;
                    default:
                        break;
                }
                f += Math.floor(this.ActionAnimationStep / actorArtInfo.imageFrameDivider);

                this.ActionAnimationStep++;
                if (this.ActionAnimationStep >= 40)
                {
                    this.ActionAnimation = ACTION_ANIMATION.NONE;
                    this.ActionAnimationStep = 0;
                    if (this.ActionAnimationDone)
                        this.ActionAnimationDone();
                    this.ActionAnimationDone = null;
                }
                break;
            case ACTION_ANIMATION.DAMAGED:
                iy += Math.round(Math.sin(this.ActionAnimationStep * Math.PI / 6) * 6);
                fz = Math.cos(this.ActionAnimationStep * Math.PI / 6) / 4 + 0.75;


                this.ActionAnimationStep++;
                if (this.ActionAnimationStep >= 6)
                {
                    this.ActionAnimation = ACTION_ANIMATION.NONE;
                    this.ActionAnimationStep = 0;
                    if (this.ActionAnimationDone)
                        this.ActionAnimationDone();
                    this.ActionAnimationDone = null;
                }
                break;
            default:
                break;
        }
        if (actorArtInfo.animationCycle != "simple")
        {
            f = f % (actorArtInfo.frames + 1);
            if (f == actorArtInfo.frames)
                f = Math.floor(f / 2);
        }
        else
            f = f % actorArtInfo.frames;

        ctx.drawImage(img, Math.floor(w * f), Math.floor(h * d), w, h, Math.floor(ix + (1 - fz) * w / 2), Math.floor(iy + (1 - fz) * h / 2), w * fz, h * fz);

        var maxValue = this.GetStatMaxValue('life');
        if (maxValue)
        {
            ctx.fillStyle = "#000000";
            ctx.fillRect(ix, iy + h + 2, w, 5);

            ctx.fillStyle = "#FF0000";
            ctx.fillRect(ix + 1, iy + h + 3, Math.round(this.GetStat('life') * (w - 2) / maxValue), 3);
        }

        if (this.ParticleEffect)
        {
            ctx.save();
            ctx.translate(x, y);
            this.ParticleEffect.Draw(ctx);
            ctx.restore();
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
        //world.Player.InvokeSkillFunction("Attack", "Action", [new VariableValue(this.Id)]);
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        return false;
    }

    public InvokeFunction(action, variableValues: VariableValue[]): VariableValue
    {
        if (!this.MonsterEnv.HasFunction(action))
        {
            if (!this.MonsterEnv.DefaultMonster.HasFunction(action))
                return null;
            this.MonsterEnv.DefaultMonster.Code.ParentCode = this.MonsterEnv.Code;
            return this.MonsterEnv.DefaultMonster.InvokeFunction(action, variableValues);
        }
        return this.MonsterEnv.InvokeFunction(action, variableValues);
    }
}