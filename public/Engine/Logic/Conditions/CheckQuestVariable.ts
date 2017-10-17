/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckQuestVariable extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quest Variable");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Compaison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Compare To");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Quest Variable' requires a quest varibale name.";

        var variable = world.Player.GetQuestVariable(values[0]);
        if (variable == null)
            variable = 0;

        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Check Quest Variable' for the value is invalid.";
        }

        switch (values[1])
        {
            case "=":
                return (variable == val);
            case "<":
                return (variable < val);
            case ">":
                return (variable > val);
            case "<=":
                return (variable <= val);
            case ">=":
                return (variable >= val);
            case "<>":
                return (variable != val);
        }
        return true;
    }
}