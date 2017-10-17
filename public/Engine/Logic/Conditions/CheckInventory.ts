/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckInventory extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Item");
        html += this.OptionList(id, 0, world.InventoryObjects.map(c => c.Name).sort(), values[0], updateFunction);
        html += this.Label("Comparison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Inventory' requires an item name.";

        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try
        {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Check Inventory' for the quantity is invalid.";
        }

        var qt = world.Player.GetInventoryQuantity(values[0]);
        if (qt == null)
            qt = 0;
        switch (values[1])
        {
            case "=":
                return (qt == val);
            case "<":
                return (qt < val);
            case ">":
                return (qt > val);
            case "<=":
                return (qt <= val);
            case ">=":
                return (qt >= val);
            case "<>":
                return (qt != val);
        }
        return true;
    }
}