/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleColor implements ParticleEffect
{
    public StartColor: string = "#FF0000";
    @ParticleEffectorPropertyNullable
    public EndColor: string = "#00FF00";

    public Handle(p: Particle)
    {
        if (!this.EndColor)
        {
            if (this.StartColor.indexOf(",") !== -1)
            {
                if (p.Age == 1)
                {
                    var cols = this.StartColor.split(",");
                    p.Color = cols[Math.round((cols.length - 1) * Math.random())].trim();
                }
            }
            else
                p.Color = this.StartColor;
            return;
        }

        var sr = parseInt(this.StartColor.substr(1, 2), 16);
        var sg = parseInt(this.StartColor.substr(3, 2), 16);
        var sb = parseInt(this.StartColor.substr(5, 2), 16);

        var er = parseInt(this.EndColor.substr(1, 2), 16);
        var eg = parseInt(this.EndColor.substr(3, 2), 16);
        var eb = parseInt(this.EndColor.substr(5, 2), 16);

        var rr = Math.floor((er - sr) * p.Age / p.System.MaxAge + sr);
        var rg = Math.floor((eg - sg) * p.Age / p.System.MaxAge + sg);
        var rb = Math.floor((eb - sb) * p.Age / p.System.MaxAge + sb);

        p.Color = "#" + ("" + rr.toString(16)).padLeft("0", 2) + ("" + rg.toString(16)).padLeft("0", 2) + ("" + rb.toString(16)).padLeft("0", 2);
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }
}