var journalMenu = new (class
{
    public journalDisplayed: boolean = false;
});

class JournalMenu
{
    public static AdditionalCSS(): string
    {
        return "#journalIcon\n\
{\n\
    position: absolute;\n\
    left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 245px;\n\
}\n\
#journalIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    }

    static Init(position: number): number
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowJournal === false)))
        {
            $("#journalIcon").hide();
            return position;
        }

        $("#journalIcon").css("top", position + "px");
        if (game)
            $("#journalIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/journal_icon.png'>");
        else
            $("#journalIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/journal_icon.png'>");
        return position + 64 + world.art.panelStyle.topBorder;
    }

    static Toggle()
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowJournal === false)))
            return;

        inventoryMenu.inventoryDisplayed = false;
        $("#inventoryIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#profileIcon").removeClass("openPanelIcon");

        if (journalMenu.journalDisplayed)
        {
            $("#gameMenuPanel").hide();
            $("#journalIcon").removeClass("openPanelIcon");
            journalMenu.journalDisplayed = false;
        }
        else
        {
            journalMenu.journalDisplayed = true;
            $("#gameMenuPanel").show();
            $("#journalIcon").addClass("openPanelIcon");
            JournalMenu.Update();
        }
    }

    static Update()
    {
        if (!journalMenu.journalDisplayed)
            return;

        world.Player.Quests.sort(JournalMenu.SortQuests);
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();

        var html = "<h1>Quest Journal</h1>";
        if (world.Player.Quests.length > 0)
        {
            var showCompleted = false;
            if (!world.Player.Quests[0].Completed)
                html += "<h2>Open quests</h2>";
            for (var i = 0; i < world.Player.Quests.length; i++)
            {
                var quest = world.GetQuest(world.Player.Quests[i].Name);
                if (!quest)
                    continue;

                if (!showCompleted && world.Player.Quests[i].Completed)
                {
                    showCompleted = true;
                    html += "<h2>Completed quests</h2>";
                }
                html += "<b>" + quest.Name.htmlEntities() + "</b><br>";
                html += Main.TextTransform(quest.Description, true) + "<br>";
                for (var j = 0; j < world.Player.Quests[i].JournalEntries.length; j++)
                {
                    var entry = JournalMenu.GetJournal(quest, world.Player.Quests[i].JournalEntries[j].EntryId);
                    if (!entry)
                        continue;
                    html += Main.TextTransform(entry) + "<br>";
                }
            }
        }
        $("#gameMenuPanelContent").html(html);
    }

    static GetJournal(quest: KnownQuest, id: number): string
    {
        for (var i = 0; i < quest.JournalEntries.length; i++)
            if (quest.JournalEntries[i].Id == id)
                return quest.JournalEntries[i].Entry;
        return null;
    }

    public static SortQuests(a: Quest, b: Quest): number 
    {
        if (a.Completed && b.Completed)
        {
            if (a.Completed > b.Completed)
                return -1;
            if (a.Completed < b.Completed)
                return 1;
            return 0;
        }
        if (a.Completed && !b.Completed)
            return 1;
        if (!a.Completed && b.Completed)
            return -1;

        if (a.JournalEntries && a.JournalEntries.length > 0 && b.JournalEntries && b.JournalEntries.length > 0)
        {
            if (a.JournalEntries[a.JournalEntries.length - 1] > b.JournalEntries[b.JournalEntries.length - 1])
                return 1;
            if (a.JournalEntries[a.JournalEntries.length - 1] < b.JournalEntries[b.JournalEntries.length - 1])
                return -1;
            return 0;
        }
        if (a.JournalEntries && a.JournalEntries.length > 0 && (!b.JournalEntries || b.JournalEntries.length == 0))
            return 1;
        if ((!a.JournalEntries || a.JournalEntries.length == 0) && b.JournalEntries && b.JournalEntries.length > 0)
            return -1;
        if (a.Started > b.Started)
            return 1;
        if (a.Started < b.Started)
            return -1;
        return 0;
    }
}