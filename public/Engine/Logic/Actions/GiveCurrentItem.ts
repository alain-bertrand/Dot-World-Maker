/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class GiveCurrentItem extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quantity");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "1"), updateFunction);
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
            throw "The action 'Give Current Item' requires a quantity.";

        if (!env || !env.HasVariable('currentItem'))
            return;
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
            //val = CodeParser.ParseStatement(values[0]).Execute(env).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Give Current Item' for the quantity is invalid.";
        }

        world.Player.AddItem(env.GetVariable('currentItem').GetString(), val);
    }
}