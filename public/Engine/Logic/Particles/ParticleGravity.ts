/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleGravity implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public Gravity: number = 0.01;
    @ParticleEffectorPropertyNumber
    public GravityDirection: number = 90;

    public Handle(p: Particle)
    {
        if (this.Gravity > 0)
        {
            var a = this.GravityDirection * Math.PI / 180;
            p.VX += Math.cos(a) * this.Gravity;
            p.VY += Math.sin(a) * this.Gravity;
        }
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }

}