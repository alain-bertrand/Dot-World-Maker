/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class StartTemporaryEffect extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        if (!values[0])
            values[0] = world.TemporaryEffects.map(c => c.Name).sort()[0];

        var html = "";
        html += this.Label("Effect");
        html += this.OptionList(id, 0, world.TemporaryEffects.map(c => c.Name).sort(), values[0], updateFunction);
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
            throw "The action 'Start Temporary Effect' requires an effect name.";

        world.Player.StartTemporaryEffect(values[0]);
    }
}