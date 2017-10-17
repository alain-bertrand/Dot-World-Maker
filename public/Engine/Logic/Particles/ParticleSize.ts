/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleSize implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public ParticleStartSize: number = 2;
    @ParticleEffectorPropertyNumber
    @ParticleEffectorPropertyNullable
    public ParticleStartAgeSizeChange: number = 500;
    @ParticleEffectorPropertyNumber
    @ParticleEffectorPropertyNullable
    public ParticleEndSize: number = 6;

    public Handle(p: Particle)
    {
        if (this.ParticleStartAgeSizeChange === null || this.ParticleEndSize === null)
        {
            p.Size = this.ParticleStartSize;
            return;
        }

        if (p.Age <= this.ParticleStartAgeSizeChange)
            p.Size = this.ParticleStartSize;
        else
        {
            var a = p.Age - this.ParticleStartAgeSizeChange;
            var ma = p.System.MaxAge - this.ParticleStartAgeSizeChange;
            a = a / ma;
            a = (a * this.ParticleEndSize) + (1 - a) * this.ParticleStartSize;
            p.Size = Math.round(Math.max(Math.min(a, 100), 1));
        }
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }
}
