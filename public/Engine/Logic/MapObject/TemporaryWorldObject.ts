///<reference path="../World/WorldArea.ts" />

class TemporaryWorldObject implements WorldRenderObject
{
    public Name: string;
    public X: number;
    public Y: number;
    public EndOfLife: Date;
    public MouseCallback: (obj: TemporaryWorldObject) => boolean = null;
    public LinkedData: any;
    public CurrentArea: WorldArea;

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
    }

    public Handle()
    {
        // Need to be destroyed
        if (this.EndOfLife && (this.EndOfLife.getTime() - (new Date()).getTime()) <= 0)
        {
            for (var i = 0; i < this.CurrentArea.tempObjects.length; i++)
            {
                if (this.CurrentArea.tempObjects[i] == this)
                {
                    this.CurrentArea.tempObjects.splice(i, 1);
                    this.CurrentArea.CleanObjectCache();
                    return;
                }
            }
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        if (this.MouseCallback && this.MouseCallback(this))
            return true;
        return false;
    }

    constructor(name: string, x: number, y: number, currentArea: WorldArea)
    {
        this.Name = name;
        this.X = x;
        this.Y = y;
        this.CurrentArea = currentArea;
    }
}