///<reference path="../MovingActor.ts" />

class OtherPlayer extends MovingActor
{
    public DX: number;
    public DY: number;
    public VX: number;
    public VY: number;
    public InterpolationStep: number;
    public CurrentEmote: EmotesArt = null;
    public EmoteTimer: number = 0;
    public Username: string;

    static FindPlayer(username: string): OtherPlayer
    {
        if (world && world.areas) for (var i = 0; i < world.areas.length; i++)
            if (world.areas[i] && world.areas[i].otherPlayers) for (var j = 0; j < world.areas[i].otherPlayers.length; j++)
                if (world.areas[i].otherPlayers[j].Username == username)
                    return world.areas[i].otherPlayers[j];

        return null;
    }

    public CanReachArea(x: number, y: number): boolean
    {
        return true;
    }

    public Handle(): void
    {
        if ((this.VX || this.VY) && this.InterpolationStep < 30)
        {
            this.Frame = (this.Frame + 1) % ((world.art.characters[world.Player.Name].frames + 1) * world.art.characters[world.Player.Name].imageFrameDivider);
            this.X += this.VX;
            this.Y += this.VY;

            if (this.VY < 0)
                this.Direction = 3;
            if (this.VX < 0)
                this.Direction = 1;
            if (this.VX > 0)
                this.Direction = 2;
            if (this.VY > 0)
                this.Direction = 0;
            this.InterpolationStep++;
        }
        else if (this.InterpolationStep >= 30)
        {
            this.X = this.DX;
            this.Y = this.DY;
        }
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        var img = renderEngine.GetActorImage(this.Name);
        if (!img)
            return;
        if (img.width)
        {
            var actorArtInfo = renderEngine.world.art.characters[this.Name];
            var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
            if (f == actorArtInfo.frames)
                f = Math.floor(f / 2);
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            /*var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);*/
            //var ix = x;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            //var iy = y - h;
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            ctx.drawImage(img, Math.floor(w * f), Math.floor(h * this.Direction), w, h, Math.floor(ix), Math.floor(iy), w, h);

            if (this.CurrentEmote != null)
            {
                if (this.EmoteTimer > 160)
                    ctx.globalAlpha = (180 - this.EmoteTimer) / 20;
                ctx.drawImage(playerEffects.emotes, this.CurrentEmote * 24, 0, 24, 24, ix + w / 2, iy + (Math.sin(this.EmoteTimer / 10) * 5) - 28, 24, 24);
                ctx.globalAlpha = 1;
                this.EmoteTimer++;
                if (this.EmoteTimer > 180)
                {
                    this.EmoteTimer = 0;
                    this.CurrentEmote = null;
                }
            }

            ctx.font = "10px sans-serif";
            var tw = ctx.measureText(this.Username).width;
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText(this.Username, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
            ctx.fillStyle = "#A0A0FF";
            ctx.lineWidth = 1;
            ctx.fillText(this.Username, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        return false;
    }
}