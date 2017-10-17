/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class PlaySound extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Sound");
        var sounds = [];
        for (var item in world.art.sounds)
            sounds.push(item);
        sounds.sort();
        html += this.OptionList(id, 0, sounds, values[0], updateFunction);
        html += this.Label("Volume");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "0.6"), updateFunction);
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!env)
            env = new CodeEnvironement();

        if (!values[0])
            throw "The action 'Play Sound' requires a sound name.";

        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Play Sound' for the volume is invalid.";
        }

        Sounds.Play(values[0], val);
    }
}