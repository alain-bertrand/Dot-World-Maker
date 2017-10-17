/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckJournalEntryNotReceived extends ConditionClass
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

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Journal Entry Not Received' requires an quest name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The condition 'Check Journal Entry Not Received' requires the id of the journal entry (as number).";

        return !world.Player.HaveQuestJournalEntry(values[0], parseInt(values[1]));
    }
}