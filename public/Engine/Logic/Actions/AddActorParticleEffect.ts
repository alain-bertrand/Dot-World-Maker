/// <reference path="../Dialogs/DialogAction.ts" />

var lastMapMessageTimeout = null;

@DialogActionClass
class AddActorParticleEffect extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Particle Effect");
        var effects = world.ParticleEffects.map((c) => { return c.Name; }).sort();
        if (!values[0] && effects.length > 0)
            values[0] = effects[0]
        html += this.OptionList(id, 0, effects, values[0], updateFunction);
        html += this.Label("Last (in sec.)");
        if (!values[1])
            values[1] = "5";
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!values[0])
            throw "The action 'Add Actor Particle Effect' requires a particle name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The action 'Add Actor Particle Effect' requires number of second the particle effect will last.";
        world.Player.ParticleEffect = world.GetParticleSystem(values[0]);
        if (world.Player.ParticleEffect)
        {
            var now = new Date();
            var ends = new Date(now.getTime() + parseInt(values[1]) * 1000);
            /*console.log("now: " + now.toString());
            console.log("ends: " + ends.toString());*/
            world.Player.ParticleEffectDuration =ends;
        }
        return null;
    }
}