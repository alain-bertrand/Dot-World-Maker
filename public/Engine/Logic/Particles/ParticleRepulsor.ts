/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleRepulsor implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public X: number = 0;
    @ParticleEffectorPropertyNumber
    public Y: number = 0;
    @ParticleEffectorPropertyNumber
    public Strength: number = 0.01;
    @ParticleEffectorPropertyNumber
    public EffectDistance: number = 100;

    public Handle(p: Particle)
    {
        var dx = p.X - this.X;
        var dy = p.Y - this.Y;
        var d = Math.sqrt(dx * dx + dy * dy);

        if (d > this.EffectDistance)
            return;
        var s = this.Strength * d / this.EffectDistance;

        var ed = EngineMath.CalculateAngle(dx, dy);

        p.VX += Math.cos(ed) * s;
        p.VY += Math.sin(ed) * s;
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.EffectDistance, 0, Math.PI * 2);

        ctx.moveTo(this.X - 10, this.Y + 0.5);
        ctx.lineTo(this.X + 10, this.Y + 0.5);
        ctx.moveTo(this.X + 0.5, this.Y - 10);
        ctx.lineTo(this.X + 0.5, this.Y + 10);
        ctx.stroke();
    }
}