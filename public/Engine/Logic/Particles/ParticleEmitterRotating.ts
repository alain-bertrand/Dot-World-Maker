/// <reference path="ParticleSystem.ts" />

@ParticleEmitterClass
class ParticleEmitterRotating extends ParticleEmitter
{
    public Radius: number = 30;
    @ParticleEffectorPropertyNullable
    public Height: number = null;
    public RotationSpeed: number = 1;

    private _currentAngle: number = 0;
    public SystemStep()
    {
        this._currentAngle += this.RotationSpeed * Math.PI / 180;
    }

    public Emit(system: ParticleSystem)
    {
        var p = new Particle(system);
        p.X = this.OffsetX + Math.cos(this._currentAngle) * this.Radius + Math.random() * this.JitterX * 2 - this.JitterX;
        p.Y = this.OffsetY + Math.sin(this._currentAngle) * (this.Height === null ? this.Radius : this.Height) + Math.random() * this.JitterY * 2 - this.JitterY;
        var a = (this.Direction + ((Math.random() * 2 - 1) * this.JitterDirection)) * Math.PI / 180;
        var jv = (Math.random() * 2 - 1) * this.JitterVelocity;
        p.VX = Math.cos(a) * (this.Velocity + jv);
        p.VY = Math.sin(a) * (this.Velocity + jv);

        system.particles.push(p);
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = Math.max(this.JitterX * 2, this.JitterY * 2);

        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        for (var i = 0; i < 60; i++)
        {
            var x = Math.round(Math.cos(i * Math.PI / 30) * this.Radius);
            var y = Math.round(Math.sin(i * Math.PI / 30) * (this.Height === null ? this.Radius : this.Height));
            if (i == 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }
        ctx.closePath();
        //ctx.arc(this.OffsetX, this.OffsetY, this.Radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}