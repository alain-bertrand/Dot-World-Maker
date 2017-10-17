/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckLookIsNot extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Look");
        var names = [];
        for (var item in world.art.characters)
            names.push(item);
        names.sort();
        html += this.OptionList(id, 0, names, values[0], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Look Is Not' requires an look name.";

        return world.Player.Name != values[0];
    }
}