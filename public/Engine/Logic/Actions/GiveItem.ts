/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class GiveItem extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Item");
        html += this.OptionList(id, 0, world.InventoryObjects.map(c => c.Name).sort(), values[0], updateFunction);
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
            throw "The action 'Give Item' requires a name.";

        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Give Item' for the quantity is invalid.";
        }

        world.Player.AddItem(values[0], val);
    }
}