interface SearchGameItem
{
    object: any;
    title: string;
    action: string;
    map?: (o: any) => any;
    store?: (o: any) => any;
}

var searchPanel = new (class
{
    links: string[] = [];
});

class SearchPanel
{
    static InitFunction()
    {
        if (!$("#searchPanel").first())
            return;
        if (Main.CheckNW())
        {
            $("#searchPanel").css("top", "0px");
        }
        $("#game_Search").bind("click", SearchPanel.ShowHide);
        $("#generalSearch").bind("keyup", SearchPanel.KeyUp);

        // Control Q => quick search
        $(document).bind('keydown', function (e)
        {
            if (e.ctrlKey && (e.which == 81))
            {
                e.preventDefault();
                SearchPanel.ShowHide();
                return false;
            }
        });
    }

    static ShowHide()
    {
        if ($("#searchPanel").is(":visible"))
        {
            $("#searchPanel").hide();
        }
        else
        {
            $("#searchPanel").show();
            $("#generalSearch").focus();
            SearchPanel.RenderResult();
        }
    }

    static KeyUp(evt: KeyboardEvent)
    {
        switch (evt.keyCode)
        {
            case 27:
                $("#generalSearch").blur();
                $("#searchPanel").hide();
                break;
            case 13:
                if (searchPanel.links && searchPanel.links.length > 0)
                    document.location.assign(searchPanel.links[0]);
                break;
        }
        SearchPanel.RenderResult();
    }

    static Update()
    {
        SearchPanel.RenderResult();
    }

    static RenderResult()
    {
        if (!$("#searchPanel").is(":visible"))
            return;
        var toSearch = $("#generalSearch").val().toLowerCase();
        searchPanel.links = [];

        var html = "";

        var itemsToSearch: SearchGameItem[] = [
            { object: world.art.characters, title: "Characters", action: "ArtCharacterEditor" },
            { object: world.art.houses, title: "Houses", action: "HouseEditor" },
            { object: world.art.house_parts, title: "House parts", action: "HousePart" },
            { object: world.art.objects, title: "Map Objects", action: "ArtObjectEditor" },
            { object: world.art.sounds, title: "Sounds &amp; Musics", action: "ArtSoundEditor" },
            { object: world.Codes, title: "Generic Code", action: "GenericCodeEditor" },
            { object: world.InventorySlots, title: "Inventory Slots", action: "InventorySlotEditor" },
            { object: world.Monsters, title: "Monsters", action: "MonsterEditor" },
            { object: world.NPCs, title: "NPCs", action: "NPCEditor" },
            { object: world.InventoryObjects, title: "Objects", action: "ObjectEditor" },
            { object: world.InventoryObjectTypes, title: "Object Types", action: "ObjectTypeEditor" },
            { object: world.ParticleEffects, title: "Particles Effects", action: "ParticleEditor" },
            { object: world.Quests, title: "Quests", action: "QuestEditor" },
            { object: world.Skills, title: "Skills", action: "SkillEditor" },
            { object: world.Stats, title: "Stats", action: "StatEditor" },
            { object: world.TemporaryEffects, title: "Temporary Effects", action: "TemporaryEffectEditor" },
            { object: world.Zones, title: "Zones", action: "ZoneEditor" },
            { object: world.ChatBots, title: "Chat Bots", action: "ChatBotEditor" },
        ];

        itemsToSearch.sort((a, b) =>
        {
            if (a.title > b.title)
                return 1;
            if (a.title < b.title)
                return -1;
            return 0;
        });

        for (var j = 0; j < itemsToSearch.length; j++)
        {
            var items: string[] = [];
            if (itemsToSearch[j].object.length)
            {
                for (var i = 0; i < itemsToSearch[j].object.length; i++)
                {
                    if (itemsToSearch[j].object[i].Name.toLowerCase().indexOf(toSearch) == -1)
                        continue;
                    items.push(itemsToSearch[j].object[i].Name);
                }
            }
            else
            {
                for (var item in itemsToSearch[j].object)
                {
                    if (item == "contains")
                        continue;
                    if (item.toLowerCase().indexOf(toSearch) == -1)
                        continue;
                    items.push(item);
                }
            }
            if (items.length > 0)
            {
                html += "<span>" + itemsToSearch[j].title + ":</span>";
                html += "<div>";
                items.sort();
                for (var i = 0; i < items.length; i++)
                {
                    var link = "#action=" + itemsToSearch[j].action + "&id=" + encodeURIComponent(items[i]);
                    searchPanel.links.push(link);
                    html += "<a href='" + link + "'>" + items[i] + "</a>";
                }
                html += "</div>";
            }
        }

        $("#generalSearchResult").html(html);
    }
}