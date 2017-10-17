/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleWave implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public Strength: number = 0.005;
    @ParticleEffectorPropertyNumber
    public FrequencyAlphaX: number = 20;
    @ParticleEffectorPropertyNumber
    public FrequencyAlphaY: number = 20;
    @ParticleEffectorPropertyNumber
    public FrequencyBetaX: number = 10;
    @ParticleEffectorPropertyNumber
    public FrequencyBetaY: number = 10;
    @ParticleEffectorPropertyNumber
    public AgeFactor: number = 0.5;

    public Handle(p: Particle)
    {
        var age = (p.System.Age + p.System.RandomId) * this.AgeFactor;
        var ax = p.X + age;
        var ay = p.Y + age;
        var bx = p.X - age;
        var by = p.Y - age;
        var a = Math.sin(ax / this.FrequencyAlphaX) + Math.sin(bx / this.FrequencyBetaX) * 0.5 + Math.cos(ay / this.FrequencyAlphaY) + Math.cos(by / this.FrequencyBetaY) * 0.5;
        p.VX += this.Strength * Math.cos(a);
        p.VY += this.Strength * Math.sin(a);

        /*p.VX += Math.cos(ed) * s;
        p.VY += Math.sin(ed) * s;*/
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }
}