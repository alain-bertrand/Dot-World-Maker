/// <reference path="../World/WorldArea.ts" />
/// <reference path="TemporaryWorldObject.ts" />

class TemporaryParticleEffect extends TemporaryWorldObject
{
    private particleSystem: ParticleSystem;

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        if (!this.particleSystem)
            return;

        ctx.save();
        ctx.translate(x, y);
        this.particleSystem.Draw(ctx);
        ctx.restore();
    }

    constructor(name: string, x: number, y: number, currentArea: WorldArea, end:Date)
    {
        super(name, x, y, currentArea);
        this.EndOfLife = end;
        this.particleSystem = world.GetParticleSystem(name);
    }
}