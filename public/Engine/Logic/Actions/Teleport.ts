/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class Teleport extends ActionClass
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
            throw "The action 'Teleport' requires a zone name.";

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
            throw "The expression used in 'Teleport' for the x position is invalid.";
        }

        try
        {
            y = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex)
        {
            throw "The expression used in 'Teleport' for the y position is invalid.";
        }

        Teleport.Teleport(x, y, values[2]);
    }

    public static Teleport(x: number, y: number, zone: string)
    {
        if (!Teleport.Teleport.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        if (world.Player.CurrentArea) for (var i = 0; i < world.Player.CurrentArea.actors.length; i++)
        {
            if (world.Player.CurrentArea.actors[i] == world.Player)
            {
                world.Player.CurrentArea.actors.splice(i, 1);
                world.Player.CurrentArea.CleanObjectCache();
                break;
            }
        }

        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            //mx = (world.areaWidth - 1) * world.art.background.width - mx;
            mx = (world.areaWidth) * world.art.background.width - mx;
        if (ay < 0)
            //my = (world.areaHeight - 1) * world.art.background.height - my;
            my = (world.areaHeight) * world.art.background.height - my;
        world.VisibleCenter(ax, ay, zone);
        world.Player.AX = ax;
        world.Player.AY = ay;
        world.Player.Zone = zone;
        world.Player.X = mx;
        world.Player.Y = my;
        play.afterTeleport = true;
        world.Player.CurrentArea = world.GetArea(world.Player.AX, world.Player.AY, world.Player.Zone);
        if (world.Player.CurrentArea)
        {
            world.Player.CurrentArea.actors.push(world.Player);
            world.Player.CurrentArea.CleanObjectCache();
        }
        play.path = null;
        world.Player.Save();
    }
}