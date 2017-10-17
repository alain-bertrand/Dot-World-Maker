/// <reference path="ParticleSystem.ts" />

@ParticleEmitterClass
class ParticleEmitterPoint extends ParticleEmitter
{
    public Emit(system: ParticleSystem)
    {
        var p = new Particle(system);
        p.X = this.OffsetX + Math.random() * this.JitterX * 2 - this.JitterX;
        p.Y = this.OffsetY + Math.random() * this.JitterY * 2 - this.JitterY;
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
        ctx.lineWidth = 1;

        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.OffsetX - this.JitterX, this.OffsetY - this.JitterY, this.JitterX * 2, this.JitterY * 2);

        ctx.beginPath();
        ctx.moveTo(this.OffsetX + 0.5, this.OffsetY - 20);
        ctx.lineTo(this.OffsetX + 0.5, this.OffsetY + 20);
        ctx.moveTo(this.OffsetX - 20, this.OffsetY + 0.5);
        ctx.lineTo(this.OffsetX + 20, this.OffsetY + 0.5);
        ctx.stroke();
    }
}