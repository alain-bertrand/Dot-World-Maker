/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class AddJournalEntry extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(c => c.Name).sort(), values[0], updateFunction);
        html += this.Label("Journal Entry");
        html += this.Input(id, 1, values[1], updateFunction);
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
            throw "The action 'Add Journal Entry' requires a quest name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The action 'Add Journal Entry' requires the id of the journal entry (as number).";


        world.Player.AddQuestJournalEntry(values[0], parseInt(values[1]));
    }
}