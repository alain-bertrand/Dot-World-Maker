interface ParticleEffect
{
    Handle(p: Particle): void;
    Draw(ctx: CanvasRenderingContext2D): void;
}

var knownParticleEffectors: string[] = [];
var knownParticleEffectorsNullableProperties: string[] = [];
var knownParticleEffectorsNumberProperties: string[] = [];

var knownParticleEmitters: string[] = [];

function ParticleEffectorClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEffectors.push(className);
    knownParticleEffectors.sort();
}

function ParticleEffectorPropertyNullable(target: any, key: string)
{
    var tName = "" + target.constructor;
    var className = tName.match(/function ([^\(]+)\(/)[1];

    knownParticleEffectorsNullableProperties.push(key + "@" + className);
}

function ParticleEffectorPropertyNumber(target: any, key: string)
{
    var tName = "" + target.constructor;
    var className = tName.match(/function ([^\(]+)\(/)[1];

    knownParticleEffectorsNumberProperties.push(key + "@" + className);
}

function ParticleEmitterClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEmitters.push(className);
    knownParticleEmitters.sort();
}

var particleSystemParameters: string[] = ["Name",
    "InitialParticles",
    "ParticleType",
    "MaxParticles",
    "MaxAge",
    "MaxSpeed",
];

class ParticleSystem
{
    public Name: string = "particles_1";
    public ParticleType: number = 1;
    public Emitter: ParticleEmitter = new ParticleEmitterPoint();
    public InitialParticles: number = 0;
    public MaxParticles: number = 1000;
    public MaxAge: number = 1000;
    public MaxSpeed: number = 10;
    public Effectors: ParticleEffect[] = [];
    public particles: Particle[] = null;
    public Age: number = 0;
    public RandomId: number = Math.round(Math.random() * 10000000);

    protected spawnCount: number = 0;

    public Draw(ctx: CanvasRenderingContext2D): void
    {
        if ((world.Edition == EditorEdition.Demo || Main.CheckTouch()) && !Main.CheckNW())
            return;

        this.Handle();

        for (var i = 0; i < this.particles.length; i++)
            this.particles[i].Draw(ctx);
    }

    public Reset()
    {
        this.particles = null;
        this.Age = 0;
        this.RandomId = Math.round(Math.random() * 10000000);
    }

    private Handle()
    {
        if (!this.particles)
        {
            this.particles = [];
            for (var i = 0; i < this.InitialParticles && this.particles.length < this.MaxParticles; i++)
                this.Emitter.Emit(this);
            //this.particles.push(new Particle(this));
        }

        // Handle and kill the hold
        for (var i = 0; i < this.particles.length;)
        {
            // Time to kill it
            if (this.particles[i].Handle() === false)
                this.particles.splice(i, 1);
            else
                i++;
        }

        if (this.Emitter.StopEmittingAfter === null || this.Age < this.Emitter.StopEmittingAfter)
        {
            this.spawnCount += this.Emitter.SpawnRate;
            // Create the new one
            var i = 0;
            for (; i < this.spawnCount && this.particles.length < Math.min(Math.max(this.MaxParticles, 10), 5000); i++)
                this.Emitter.Emit(this);

            this.spawnCount -= i;
            if (this.spawnCount > 1)
                this.spawnCount = 1;

            this.Emitter.SystemStep();
        }
        this.Age++;
    }

    private static SerializeItem(sourceItem: Object): any
    {
        var result = {};
        for (var item in sourceItem)
        {
            if (typeof sourceItem[item] == "function" || item.charAt(0) == "_")
                continue;
            result[item] = sourceItem[item];
        }
        result['__type'] = ("" + sourceItem.constructor).match(/function ([^\(]+)\(/)[1]
        return result;
    }

    private static CreateFromSerialize(sourceItem: Object): any
    {
        var result = new (<any>window[sourceItem['__type']])();
        for (var item in sourceItem)
        {
            if (typeof sourceItem[item] == "function" || item.charAt(0) == "_")
                continue;
            result[item] = sourceItem[item];
        }
        return result;
    }

    public Serialize(): ParticleSystemSerialized
    {
        var data = {};
        for (var i = 0; i < particleSystemParameters.length; i++)
            data[particleSystemParameters[i]] = this[particleSystemParameters[i]];
        data['Emitter'] = ParticleSystem.SerializeItem(this.Emitter);
        var effects: any[] = [];
        for (var i = 0; i < this.Effectors.length; i++)
            effects.push(ParticleSystem.SerializeItem(this.Effectors[i]));
        data['Effectors'] = effects;
        return <ParticleSystemSerialized>data;
    }

    public static Rebuild(data: ParticleSystemSerialized): ParticleSystem
    {
        var result = new ParticleSystem();
        for (var i = 0; i < particleSystemParameters.length; i++)
            result[particleSystemParameters[i]] = data[particleSystemParameters[i]];
        result.Emitter = ParticleSystem.CreateFromSerialize(data['Emitter']);
        var effects: ParticleEffect[] = [];
        for (var i = 0; i < data['Effectors'].length; i++)
            effects.push(ParticleSystem.CreateFromSerialize(data['Effectors'][i]));
        result.Effectors = effects;
        return result;
    }
}