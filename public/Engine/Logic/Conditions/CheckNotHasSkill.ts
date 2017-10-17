/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckNotHasSkill extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        if (!values[0])
            values[0] = world.Skills.map(c => c.Name).sort()[0];

        var html = "";
        html += this.Label("Skill");
        html += this.OptionList(id, 0, world.Skills.map(c => c.Name).sort(), values[0], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Not Has Skill' requires a skill name.";

        for (var i = 0; i < world.Player.Skills.length; i++)
            if (world.Player.Skills[i].Name.toLowerCase() == values[0].toLowerCase())
                return false;
        return true;
    }
}