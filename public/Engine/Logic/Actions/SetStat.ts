/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class SetStat extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(c => c.Name).sort(), values[0], updateFunction);
        html += this.Label("Value");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!this.Execute.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        if (!values[0])
            throw "The action 'Set Stat' requires a stat name.";

        if (!env)
            env = new CodeEnvironement();
        var val = 0;

        try
        {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Set Stat' for the value is invalid.";
        }

        world.Player.SetStat(values[0], val);
    }
}