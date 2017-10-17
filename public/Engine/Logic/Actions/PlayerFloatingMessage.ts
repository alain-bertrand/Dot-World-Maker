/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class PlayerFloatingMessage extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Text");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Color");
        html += this.Input(id, 1, values[1] ? values[1] : "#FFFFFF", updateFunction);
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

        if (!env)
            env = new CodeEnvironement();

        if (!values[0])
            throw "The action 'Player Floating Message' requires a text.";

        var val: string;
        try
        {
            val = CodeParser.ExecuteStatement(values[0], env.variables).GetString();
        }
        catch (ex)
        {
            val = values[0];
        }


        var ax = world.Player.AX;
        var ay = world.Player.AY;
        var mx = world.Player.X;
        var my = world.Player.Y;

        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area)
        {
            area.actors.push(MapMessage.Create(val, values[1] ? values[1] : "#FFFFFF", area, mx, my));
        }

    }
}