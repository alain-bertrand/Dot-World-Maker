/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleOpacity implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public ParticleStartOpacity: number = 1;
    @ParticleEffectorPropertyNumber
    @ParticleEffectorPropertyNullable
    public ParticleStartAgeOpacityChange: number = 500;
    @ParticleEffectorPropertyNumber
    @ParticleEffectorPropertyNullable
    public ParticleEndOpacity: number = 0;

    public Handle(p: Particle)
    {
        if (this.ParticleStartAgeOpacityChange === null || this.ParticleEndOpacity === null)
        {
            p.Opacity = this.ParticleStartOpacity;
            return;
        }

        if (p.Age <= this.ParticleStartAgeOpacityChange)
            p.Opacity = this.ParticleStartOpacity;
        else
        {
            var a = p.Age - this.ParticleStartAgeOpacityChange;
            var ma = p.System.MaxAge - this.ParticleStartAgeOpacityChange;
            a = a / ma;
            a = (a * this.ParticleEndOpacity) + (1 - a) * this.ParticleStartOpacity;
            p.Opacity = Math.max(Math.min(a, 1), 0);
        }
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }
}
