///<reference path="../World/WorldArea.ts" />

class WorldObject implements WorldRenderObject
{
    public Name: string;
    public X: number;
    public Y: number;
    public particleSystem: ParticleSystem;
    public currentFrame: number = 0;

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        if (artInfo.nbAnimationFrames && artInfo.nbAnimationFrames > 0 && artInfo.frameOffset && artInfo.frameOffset > 0)
        {
            var s = IfIsNull(artInfo.animationSpeed, 10);
            ctx.drawImage(img, artInfo.x + (artInfo.frameOffset * Math.floor(this.currentFrame / s)), artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
            this.currentFrame++;
            if (this.currentFrame >= artInfo.nbAnimationFrames * s)
                this.currentFrame = 0;
        }
        // Single frame
        else
            ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);

        if (artInfo.particleEffect)
        {
            if (!this.particleSystem)
                this.particleSystem = world.GetParticleSystem(artInfo.particleEffect);
            if (this.particleSystem)
            {
                ctx.save();
                ctx.translate(x, y);
                this.particleSystem.Draw(ctx);
                ctx.restore();
            }
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
        var objInfo = world.art.objects[this.Name];

        if (!objInfo.walkActions || objInfo.walkActions.length == 0)
            return;

        var objId = "walk," + this.GetId(ax, ay, world.Player.Zone);
        if (world.Player.HasVisitedMapObject(objId))
            return;

        var canRun = true;
        if (objInfo.walkConditions) for (var j = 0; j < objInfo.walkConditions.length; j++)
        {
            var cond = objInfo.walkConditions[j];
            if (dialogCondition.code[cond.Name].Check(cond.Values) === false)
            {
                canRun = false;
                break;
            }
        }
        if (canRun)
        {
            for (var j = 0; j < objInfo.walkActions.length; j++)
            {
                var act = objInfo.walkActions[j];
                dialogAction.code[act.Name].Execute(act.Values);
            }

            if (objInfo.disappearOnWalk === true)
            {
                for (var j = 0; j < world.Player.CurrentArea.objects.length; j++)
                {
                    if (world.Player.CurrentArea.objects[j].X == this.X && world.Player.CurrentArea.objects[j].Y == this.Y && world.Player.CurrentArea.objects[j].Name == this.Name)
                    {
                        world.Player.CurrentArea.objects.splice(j, 1);
                        break;
                    }
                }
                world.Player.CurrentArea.CleanObjectCache();
            }
            world.Player.VisitMapObject(objId);
        }
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        var objInfo = world.art.objects[this.Name];
        if (!objInfo)
            return false;
        if (!objInfo.clickActions || objInfo.clickActions.length == 0)
            return false;

        if (objInfo.clickOnce !== false)
        {
            var objId = "click," + this.GetId(ax, ay, world.Player.Zone);
            if (world.Player.HasVisitedMapObject(objId))
                return false;
        }

        if (objInfo.clickConditions)
            for (var i = 0; i < objInfo.clickConditions.length; i++)
            {
                var cond: DialogCondition = objInfo.clickConditions[i];
                if (!dialogCondition.code[cond.Name].Check(cond.Values))
                    return false;
            }

        var px = (world.Player.AX * world.areaWidth * world.art.background.width + world.Player.X);
        var py = (world.Player.AY * world.areaHeight * world.art.background.height + world.Player.Y);
        var cx = (ax * world.areaWidth * world.art.background.width + this.X);
        var cy = (ay * world.areaHeight * world.art.background.height + this.Y);
        var a = px - cx;
        var b = py - cy;
        var d = Math.sqrt(a * a + b * b);
        if (d > 160)
        {
            Framework.ShowMessage("You are too far, move nearer.");
            return false;
        }

        for (var i = 0; i < objInfo.clickActions.length; i++)
        {
            var act: DialogAction = objInfo.clickActions[i];
            dialogAction.code[act.Name].Execute(act.Values);
        }

        if (objInfo.disappearOnWalk === true)
        {
            var area = world.GetArea(ax, ay, world.Player.Zone);
            if (area)
            {
                for (var i = 0; i < area.objects.length; i++)
                {
                    if (area.objects[i].X == this.X && area.objects[i].Y == this.Y && area.objects[i].Name == this.Name)
                    {
                        area.objects.splice(i, 1);
                        break;
                    }
                }
                area.CleanObjectCache();
            }
        }

        world.Player.VisitMapObject(objId);
        return true;
    }

    public GetId(ax: number, ay: number, zone: string): string
    {
        var cx = (ax * world.areaWidth * world.art.background.width + this.X);
        var cy = (ay * world.areaHeight * world.art.background.height + this.Y);
        return this.Name + "," + cx + "," + cy + "," + zone;
    }

    constructor(name: string, x: number, y: number)
    {
        this.Name = name;
        this.X = x;
        this.Y = y;
    }
}