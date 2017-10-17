/// <reference path="ParticleSystem.ts" />

abstract class ParticleEmitter
{
    public OffsetX: number = 0;
    public OffsetY: number = 0;
    public SpawnRate: number = 0.5;
    public Velocity: number = 1;
    public Direction: number = -90;
    public JitterDirection: number = 10;
    public JitterVelocity: number = 0.1;
    public JitterX: number = 5;
    public JitterY: number = 5;
    @ParticleEffectorPropertyNullable
    public StopEmittingAfter: number = null;

    public abstract Emit(system: ParticleSystem);

    public abstract Draw(ctx: CanvasRenderingContext2D);

    public SystemStep()
    {
    }
}