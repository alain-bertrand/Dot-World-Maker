var questEditor = new (class
{
    selectedQuest: KnownQuest = null;
    selector: ListSelector;
});


class QuestEditor
{
    public static Dispose()
    {
        questEditor.selector.Dispose();
        questEditor.selector = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#questList").css("top", "5px");
            $("#questDetails").css("top", "5px");
            $("#questJournalEntries").css("top", "210px");
        }

        questEditor.selector = new ListSelector("questList", world.Quests, "Name");
        questEditor.selector.OnSelect = ((rowId: number) =>
        {
            Framework.SetLocation({
                action: "QuestEditor", id: rowId === null ? null : world.Quests[rowId].Name
            });
            if (rowId === null)
                questEditor.selectedQuest = null;
            else
                questEditor.selectedQuest = world.Quests[rowId];
            QuestEditor.Display();
        });

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Quests.length; i++)
            {
                if (world.Quests[i].Name == framework.CurrentUrl.id)
                {
                    questEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "QuestEditor"
                });
                questEditor.selector.Select(null);
                return;
            }
        }
        else
            questEditor.selector.Select(null);
    }

    static Display()
    {
        $("#questName").css("backgroundColor", "");
        if (questEditor.selectedQuest === null)
        {
            $("#questName").val("").prop("disabled", true);
            $("#questDescription").val("").prop("disabled", true);
            $("#questJournalEntries").html("");
            return;
        }

        $("#questName").val(questEditor.selectedQuest.Name).prop("disabled", false).focus();
        $("#questDescription").val(questEditor.selectedQuest.Description).prop("disabled", false);

        QuestEditor.UpdateJournalEntries();
    }

    static UpdateJournalEntries()
    {
        var html = "";
        if (questEditor.selectedQuest !== null)
        {
            for (var i = 0; i < questEditor.selectedQuest.JournalEntries.length; i++)
            {
                html += "<div class='button' onclick='QuestEditor.DeleteJournalEntry(" + i + ")'>Remove</div> ";
                html += "<b>Entry #" + questEditor.selectedQuest.JournalEntries[i].Id + "</b><br>";
                html += "<textarea id='entry_" + i + "' onkeyup='QuestEditor.ChangeJournalEntry(" + i + ");'>" + ("" + questEditor.selectedQuest.JournalEntries[i].Entry).htmlEntities() + "</textarea><br>";
            }
        }
        $("#questJournalEntries").html(html);
    }

    static DeleteJournalEntry(id: number)
    {
        questEditor.selectedQuest.JournalEntries.splice(id, 1);
        QuestEditor.UpdateJournalEntries();
    }

    static ChangeJournalEntry(id: number)
    {
        questEditor.selectedQuest.JournalEntries[id].Entry = $("#entry_" + id).val();
    }

    static AddQuest()
    {
        var nextId = 1;
        while (world.GetQuest("quest_" + nextId))
            nextId++;
        var quest = new KnownQuest();
        quest.Name = "quest_" + nextId;
        quest.Description = "This quest doesn't have any description. How sad...";
        quest.JournalEntries = [];
        world.Quests.push(quest);
        questEditor.selector.UpdateList();
        questEditor.selector.Select(world.Quests.length - 1);
        SearchPanel.Update();
    }

    static CloneQuest()
    {
        if (questEditor.selectedQuest === null)
            return;

        var nextId = 1;
        while (world.GetQuest("quest_" + nextId))
            nextId++;
        var quest = JSON.parse(JSON.stringify(questEditor.selectedQuest));
        quest.Name = "quest_" + nextId;
        world.Quests.push(quest);
        questEditor.selector.UpdateList();
        questEditor.selector.Select(world.Quests.length - 1);
        SearchPanel.Update();
    }

    static DeleteQuest()
    {
        if (questEditor.selectedQuest === null)
            return;
        Framework.Confirm("Are you sure you want to delete this quest?", () =>
        {
            for (var i = 0; i < world.Quests.length; i++)
            {
                if (world.Quests[i].Name == questEditor.selectedQuest.Name)
                {
                    world.Quests.splice(i, 1);
                    questEditor.selector.UpdateList();
                    questEditor.selector.Select(null);
                    SearchPanel.Update();
                    return;
                }
            }
        });
    }

    static ChangeName()
    {
        var newName = $("#questName").val();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetQuest(newName) && world.GetQuest(newName) != questEditor.selectedQuest))
        {
            $("#questName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#questName").css('backgroundColor', '');
        questEditor.selectedQuest.Name = newName;
        questEditor.selector.UpdateList();
        SearchPanel.Update();
    }

    static ChangeDescription()
    {
        questEditor.selectedQuest.Description = $("#questDescription").val();
    }

    static AddJournalEntry()
    {
        if (questEditor.selectedQuest === null)
            return;

        var journalEntry = new JournalEntry();
        var nextId = 1;
        for (var i = 0; i < questEditor.selectedQuest.JournalEntries.length; i++)
            nextId = Math.max(questEditor.selectedQuest.JournalEntries[i].Id + 1, nextId);

        journalEntry.Entry = "Entry...";
        journalEntry.Id = nextId;

        questEditor.selectedQuest.JournalEntries.push(journalEntry);
        QuestEditor.UpdateJournalEntries();
    }
}