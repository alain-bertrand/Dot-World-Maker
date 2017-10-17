/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class DecreaseStat extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(c => c.Name).sort(), values[0], updateFunction);
        html += this.Label("Quantity");
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
            throw "The action 'Decrease Stat' requires a stat name.";
        if (!values[1])
            throw "The action 'Decrease Stat' requires a quantity expressed either as number or a valid expression.";

        if (!env)
            env = new CodeEnvironement();
        var val: number = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[1]).GetNumber();
            //val = CodeParser.ParseStatement(values[1]).Execute(env).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Decrease Stat' for the quantity is invalid.";
        }

        world.Player.SetStat(values[0], world.Player.GetStat(values[0]) - val);
    }
}