/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckUserStat extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(c => c.Name).sort(), values[0], updateFunction);
        html += this.Label("Compaison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Compare To");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check User Stat' requires a stat name.";

        var stat = world.Player.GetStat(values[0]);
        if (stat == null)
            stat = 0;

        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Check User Stat' for the value is invalid.";
        }

        //var val = parseFloat(values[2]);
        switch (values[1])
        {
            case "=":
                return (stat == val);
            case "<":
                return (stat < val);
            case ">":
                return (stat > val);
            case "<=":
                return (stat <= val);
            case ">=":
                return (stat >= val);
            case "<>":
                return (stat != val);
        }
        return true;
    }
}