/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineSkill
{
    @ApiMethod([{ name: "parameterName", description: "Skill parameter to read." }], "Returns the value of the current skill parameter.")
    RetreiveSetting(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var name = values[0].GetString().toLowerCase();
        var skill = world.GetSkill(world.Player.CurrentSkill);
        if (skill.CodeVariable(name))
            return new VariableValue(skill.CodeVariable(name));
        else if (skill.BaseSkill)
            return new VariableValue(skill.BaseSkill.CodeVariable(name));
        else
            return new VariableValue(0);
    }

    @ApiMethod([{ name: "skillName", description: "Skill to given to the player." }], "Adds a skill to the player.")
    GiveSkill(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Skill'] && this['Skill'].GiveSkill && !this['Skill'].GiveSkill.caller) || (this.GiveSkill && !this.GiveSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var name = values[0].GetString().toLowerCase();
        world.Player.GiveSkill(name);
        return null;
    }

    Verify_GiveSkill(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "skillName", description: "Skill to check." }], "Checks if the player has the skill.")
    HasSkill(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Skill'] && this['Skill'].HasSkill && !this['Skill'].HasSkill.caller) || (this.HasSkill && !this.HasSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var name = values[0].GetString().toLowerCase();

        for (var i = 0; i < world.Player.Skills.length; i++)
            if (world.Player.Skills[i].Name.toLowerCase() == name)
                return new VariableValue(true);
        return new VariableValue(false);
    }

    Verify_HasSkill(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "skillName", description: "Skill to activate." }], "Activate a player skill.")
    ActivateSkill(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Skill'] && this['Skill'].ActivateSkill && !this['Skill'].ActivateSkill.caller) || (this.ActivateSkill && !this.ActivateSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var oldSkill = world.Player.CurrentSkill;
        var selectedSkill = values[0].GetString();
        world.Player.CurrentSkill = selectedSkill;

        var skill = world.GetSkill(selectedSkill);
        var res = skill.InvokeFunction("Activate", []);
        // Prevent selection
        if (res !== null && res.GetBoolean() === false)
        {
            world.Player.CurrentSkill = oldSkill;
        }

        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        return null;
    }

    Verify_ActivateSkill(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    }
}