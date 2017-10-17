class Particle
{
    public X: number;
    public Y: number;
    public VX: number;
    public VY: number;
    public Age: number;
    public Color: string = "#000000";
    public Opacity: number = 1;
    public Size: number = 2;
    public System: ParticleSystem;

    public constructor(system: ParticleSystem)
    {
        this.System = system;

        this.Age = 0;
    }

    public Handle(): boolean
    {
        this.Age++;
        if (this.Age >= this.System.MaxAge)
            return false;

        var bounce = null;
        var friction = null;
        for (var i = 0; i < this.System.Effectors.length; i++)
        {
            if (this.System.Effectors[i] instanceof ParticleBounce)
            {
                bounce = this.System.Effectors[i];
                continue;
            }
            if (this.System.Effectors[i] instanceof ParticleFriction)
            {
                friction = this.System.Effectors[i];
                continue;
            }
            this.System.Effectors[i].Handle(this);
        }

        if (this.System.MaxSpeed !== null)
        {
            var s = Math.sqrt(this.VX * this.VX + this.VY * this.VY)
            if (s > this.System.MaxSpeed)
            {
                var a = EngineMath.CalculateAngle(this.VX, this.VY);
                this.VX = Math.cos(a) * this.System.MaxSpeed;
                this.VY = Math.sin(a) * this.System.MaxSpeed;
            }
        }

        if (friction)
            friction.Handle(this);

        this.X += this.VX;
        this.Y += this.VY;

        if (bounce)
            bounce.Handle(this);

        return true;
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
        var x = Math.floor(this.X - this.Size / 2);
        var y = Math.floor(this.Y - this.Size / 2);

        ctx.globalAlpha = this.Opacity;
        switch (this.System.ParticleType)
        {
            case 1:
                ctx.drawImage(ParticleBlob.GetBlob(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            case 2:
                ctx.drawImage(ParticleSparkle.GetSparkle(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            case 3:
                ctx.drawImage(ParticleDisk.GetDisk(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            default:
                ctx.fillStyle = this.Color;
                ctx.fillRect(x, y, this.Size, this.Size);
        }

        //ParticleBlob.CreateBlob(20, 20, 255, 0, 0);
    }
}