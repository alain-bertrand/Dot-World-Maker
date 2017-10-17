/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class SetLook extends ActionClass
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

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!this.Execute.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        if (!values[0])
            throw "The action 'Set Look' requires a look name.";

        world.Player.Name = values[0];
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
    }
}