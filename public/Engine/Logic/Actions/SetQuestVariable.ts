/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class SetQuestVariable extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quest Variable");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Value");
        html += this.Input(id, 1, values[1], updateFunction);
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
            throw "The action 'Set Quest Variable' requires a quest variable name.";

        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Remove Current Item' for the quantity is invalid.";
        }

        world.Player.SetQuestVariable(values[0], val);
    }
}