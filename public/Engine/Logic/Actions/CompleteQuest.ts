/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class CompleteQuest extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(c => c.Name).sort(), values[0], updateFunction);
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
            throw "The action 'Complete Quest' requires a quest name.";

        world.Player.CompleteQuest(values[0]);
    }
}