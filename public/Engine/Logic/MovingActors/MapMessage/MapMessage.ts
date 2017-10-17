///<reference path="../MovingActor.ts" />
class MapMessage extends MovingActor
{
    public message: string;
    public life = 0;
    public color: string;

    public static Create(message: string, color: string, worldArea: WorldArea, x: number, y: number): MapMessage
    {
        var result = new MapMessage(world);
        result.CurrentArea = worldArea;
        result.X = x;
        result.Y = y;
        result.message = message;
        result.color = color;
        return result;
    }

    constructor(world: World)
    {
        super(world);
    }

    public CanReachArea(x: number, y: number): boolean
    {
        return true;
    }

    public Handle(): void
    {
        this.Y -= 0.4;
        this.life++;
        if (this.life > 100)
            this.Kill();
        else
            this.UpdatePosition();
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var width = ctx.measureText(this.message).width;

        if (this.life < 50)
            ctx.globalAlpha = 1;
        else
        {
            var a = (50 - (this.life - 50)) / 50;
            if (a < 0)
                return;
            ctx.globalAlpha = a;
        }

        var cx = x + Math.sin(this.life / 10) * 5;

        ctx.font = "13px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(this.message, Math.floor(cx) + 0.5, y + 0.5);
        ctx.fillStyle = this.color;
        ctx.fillText(this.message, Math.floor(cx) + 0.5, y + 0.5);
        ctx.globalAlpha = 1;
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        return false;
    }
}