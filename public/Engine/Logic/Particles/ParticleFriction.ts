/// <reference path="ParticleSystem.ts" />

@ParticleEffectorClass
class ParticleFriction implements ParticleEffect
{
    @ParticleEffectorPropertyNumber
    public EnergyConservation: number = 1;

    public Handle(p: Particle)
    {
        p.VY *= this.EnergyConservation;
        p.VX *= this.EnergyConservation;
    }

    public Draw(ctx: CanvasRenderingContext2D)
    {
    }

}