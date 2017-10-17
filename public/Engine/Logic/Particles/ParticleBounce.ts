/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleBounce implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public BouncePlane: number = 30;
    @ParticleEffectorPropertyNumber
    public BounceEnergy: number = 0.8;

    public Handle(p: Particle)
    {
        if (this.BouncePlane !== null && p.Y > this.BouncePlane)
        {
            p.Y = this.BouncePlane - (p.Y - this.BouncePlane);
            p.VY = -p.VY * this.BounceEnergy;
            p.VX *= this.BounceEnergy;
        }
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10000, this.BouncePlane + 0.5);
        ctx.lineTo(10000, this.BouncePlane + 0.5);
        ctx.stroke();

        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(-10000, this.BouncePlane + 0.5, 20000, 20000);
    }
}