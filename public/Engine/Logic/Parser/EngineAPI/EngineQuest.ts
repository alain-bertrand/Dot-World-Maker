/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineQuest
{
    @ApiMethod([{ name: "questName", description: "The name of the quest to start." }], "Starts a player quest.")
    public Start(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Quest'] && this['Quest'].Start && !this['Quest'].Start.caller) || (this.Start && !this.Start.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var questName = values[0].GetString();
        world.Player.StartQuest(questName);
        return null;
    }

    Verify_Start(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "questName", description: "The name of the quest to check." }], "Returns true if the player started this quest.")
    public CheckStarted(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var questName = values[0].GetString();
        return new VariableValue(world.Player.IsQuestStarted(questName));
    }

    Verify_CheckStarted(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "questName", description: "The name of the quest to check." }], "Returns true if the player completed this quest.")
    public CheckCompleted(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var questName = values[0].GetString();
        return new VariableValue(world.Player.IsQuestCompleted(questName));
    }

    Verify_CheckCompleted(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "questName", description: "The name of the quest to complete." }], "Completes a player quest.")
    public Complete(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Quest'] && this['Quest'].Complete && !this['Quest'].Complete.caller) || (this.Complete && !this.Complete.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var questName = values[0].GetString();
        world.Player.CompleteQuest(questName);
        return null;
    }

    Verify_Complete(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "questName", description: "The name of the quest." }, { name: "journalEntryId", description: "The id of the journal entry to add." }], "Adds a quest journal entry.")
    public AddJournalEntry(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Quest'] && this['Quest'].AddJournalEntry && !this['Quest'].AddJournalEntry.caller) || (this.AddJournalEntry && !this.AddJournalEntry.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var questName = values[0].GetString();
        var entryId = values[1].GetNumber();
        world.Player.AddQuestJournalEntry(questName, entryId);
        return null;
    }

    Verify_AddJournalEntry(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        var quest = world.GetQuest(values[0]);
        if (!quest)
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "number")
            return;
        var id = values[1];
        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++)
        {
            if (quest.JournalEntries[i].Id == id)
            {
                found = true;
                break;
            }
        }
        if (!quest)
            throw "The quest '" + values[0] + "' doesn't contain a journal entry with the id '" + id + "' at " + line + ":" + column;
    }

    @ApiMethod([{ name: "questName", description: "The name of the quest." }, { name: "journalEntryId", description: "The id of the journal entry to check." }], "Returns true if the player received this journal entry.")
    public JournalEntryReceived(values: VariableValue[], env: CodeEnvironement): VariableValue
    {

        var questName = values[0].GetString();
        var entryId = values[1].GetNumber();
        return new VariableValue(world.Player.HaveQuestJournalEntry(questName, entryId));
    }

    Verify_JournalEntryReceived(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        var quest = world.GetQuest(values[0]);
        if (!quest)
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "number")
            return;
        var id = values[1];
        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++)
        {
            if (quest.JournalEntries[i].Id == id)
            {
                found = true;
                break;
            }
        }
        if (!quest)
            throw "The quest '" + values[0] + "' doesn't contain a journal entry with the id '" + id + "' at " + line + ":" + column;
    }
}