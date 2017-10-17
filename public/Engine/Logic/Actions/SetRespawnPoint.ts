/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class SetRespawnPoint extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Position X");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "0"), updateFunction);
        html += this.Label("Position Y");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "0"), updateFunction);
        html += this.Label("Zone");
        html += this.OptionList(id, 2, world.Zones.map((c) => (c.Name)).sort(), values[2], updateFunction);
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

        if (!values[2])
            throw "The action 'Set Respawn Point' requires a zone name.";

        if (!env)
            env = new CodeEnvironement();

        var x = 0;
        var y = 0;
        try
        {
            x = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Set Respawn Point' for the x position is invalid.";
        }

        try
        {
            y = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Set Respawn Point' for the y position is invalid.";
        }
        world.Player.RespawnPoint = { X: x, Y: y, Zone: values[2] };
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
    }
}