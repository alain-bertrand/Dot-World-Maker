var profileMenu = new (class
{
    public profileDisplayed: boolean = false;
});

class ProfileMenu
{
    public static AdditionalCSS(): string
    {
        return "#profileIcon\n\
{\n\
    position: absolute;\n\
    left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 165px;\n\
}\n\
#profileIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    }

    static Init(position: number): number
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW())|| (world && world.ShowStats === false)))
        {
            $("#profileIcon").hide();
            return position;
        }

        $("#profileIcon").css("top", position + "px");
        if (game)
            $("#profileIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/profile_icon.png'><div>+</div>");
        else
            $("#profileIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/profile_icon.png'><div>+</div>");
        if (!ProfileMenu.HasToUpgrade())
            $("#profileIcon div.gamePanelContentNoHeader > div").hide();
        return position + 64 + world.art.panelStyle.topBorder;
    }

    static Toggle()
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowStats === false)))
            return;

        inventoryMenu.inventoryDisplayed = false;
        $("#inventoryIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;

        if (profileMenu.profileDisplayed)
        {
            $("#gameMenuPanel").hide();
            $("#profileIcon").removeClass("openPanelIcon");
            profileMenu.profileDisplayed = false;
        }
        else
        {
            profileMenu.profileDisplayed = true;
            $("#gameMenuPanel").show();
            $("#profileIcon").addClass("openPanelIcon");
            ProfileMenu.Update();
        }
    }

    public static HasToUpgrade()
    {
        for (var i = 0; i < world.Player.Stats.length; i++)
        {
            if (world.Player.Stats[i].BaseStat.CodeVariable('PlayerVisible') === "false")
                continue;
            var res = world.Player.Stats[i].BaseStat.InvokeFunction("CanUpgrade", []);
            if (res && res.GetBoolean() == true)
                return true;
        }
        return false;
    }

    public static Update()
    {
        if (ProfileMenu.HasToUpgrade())
            $("#profileIcon div.gamePanelContentNoHeader > div").show();
        else
            $("#profileIcon div.gamePanelContentNoHeader > div").hide();

        if (!profileMenu.profileDisplayed)
            return;

        var html = "";
        html = "<h1>Profile<h1>";

        html += "<h2>Stats</h2>";
        html += "<table class='profileList'>";
        html += "<thead><tr><td>Name:</td><td>Value:</td><td>Max:</td><td>&nbsp;</td></tr></thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Stats.length; i++)
        {
            if (world.Player.Stats[i].BaseStat.CodeVariable('PlayerVisible') === "false")
                continue;
            html += "<tr>";
            html += "<td>" + (world.Player.Stats[i].BaseStat.CodeVariable('DisplayName') ? world.Player.Stats[i].BaseStat.CodeVariable('DisplayName') : world.Player.Stats[i].Name).htmlEntities() + "</td>";
            html += "<td>" + world.Player.Stats[i].Value + "</td>";
            html += "<td>" + (world.Player.GetStatMaxValue(world.Player.Stats[i].Name) ? world.Player.GetStatMaxValue(world.Player.Stats[i].Name) : "&nbsp;") + "</td>";
            var res = world.Player.Stats[i].BaseStat.InvokeFunction("CanUpgrade", []);
            if (res && res.GetBoolean() == true)
                html += "<td><div class='gameButton' onclick='ProfileMenu.UpgradeStat(\"" + world.Player.Stats[i].Name + "\")')>+</div></td>";
            else
                html += "<td>&nbsp;</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";

        html += "<h2>Skills</h2>";
        html += "<table class='profileList'>";
        html += "<thead><tr><td>Name:</td><td>Level:</td><td>&nbsp;</td></tr></thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Skills.length; i++)
        {
            html += "<tr>";
            html += "<td>" + (world.Player.Skills[i].BaseSkill.CodeVariable('DisplayName') ? world.Player.Skills[i].BaseSkill.CodeVariable('DisplayName') : world.Player.Skills[i].Name).htmlEntities() + "</td><td>" + (world.Player.Skills[i].Level ? ("" + world.Player.Skills[i].Level).htmlEntities() : "&nbsp;") + "</td>";
            html += "<td>";
            if (world.Player.Skills[i].BaseSkill.CodeVariable("Quickslot") == "true" && world.Player.Skills[i].BaseSkill.CodeVariable("QuickslotEditable") !== "false")
                html += "<div class='gameButton' onclick='ProfileMenu.Quickslot(\"" + world.Player.Skills[i].Name.htmlEntities() + "\");'>Quickslot</div>";
            else
                html += "&nbsp;";
            html += "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        html += "<br><br>";
        html += "<center><div class='gameButton' onclick='ProfileMenu.ResetPlayer();'>Reset your player</div></center>";
        $("#gameMenuPanelContent").html(html);
    }

    public static DoResetPlayer()
    {
        if (Main.CheckNW())
        {
            var saves = {};
            if (framework.Preferences['gameSaves'])
                saves = JSON.parse(framework.Preferences['gameSaves']);
            delete saves["S" + world.Id];
            framework.Preferences['gameSaves'] = JSON.stringify(saves);
            Framework.SavePreferences();

            world.Init();
            Main.GenerateGameStyle();
            world.ResetAreas();
            world.ResetGenerator();
            Framework.Rerun();
            return;
        }

        if (!framework.Preferences['token'] || framework.Preferences['token'] == "demo")
        {
            document.location.reload();
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/ResetPlayer',
            data: {
                game: world.Id,
                token: framework.Preferences['token']
            },
            success: (msg) =>
            {
                document.location.reload();
            },
            error: function (msg, textStatus)
            {
                if (msg.d && msg.d.error)
                    Framework.ShowMessage(msg.d.error);
                else
                    Framework.ShowMessage(msg);
            }
        });
    }

    public static ResetPlayer()
    {
        Framework.Confirm("Are you sure you want to reset your player? You lose all the stats, items, and quests and start as a fresh new player.", ProfileMenu.DoResetPlayer);
    }

    public static UpgradeStat(statName: string)
    {
        var res = world.Player.FindStat(statName).BaseStat.InvokeFunction("CanUpgrade", []);
        if (!res || res.GetBoolean() !== true)
            return;
        world.Player.SetStat(statName, world.Player.GetStat(statName) + 1);
        //world.Player.FindStat(statName).Value++;
        ProfileMenu.Update();
    }

    public static Quickslot(skillName: string)
    {
        profileMenu.profileDisplayed = false;
        var html = "<h1>Quickslot</h1>";
        for (var i = 0; i < 10; i++)
        {
            var q = world.Player.QuickSlot[i];
            var skill: KnownSkill = null;
            if (!q)
                q = "-- Empty --";
            else if (q.substring(0, 2) == "S/")
            {
                var skill = world.GetSkill(q.substring(2));
                q = "Skill " + q.substring(2).title().htmlEntities();
            }
            else
                q = "Item " + q.substring(2).title().htmlEntities();

            if (skill && skill.CodeVariable("QuickslotEditable") === "false")
            {
                html += "Slot " + (i + 1) + " " + q + "<br>";
            }
            else
                html += "<div class='gameButton' onclick='ProfileMenu.SetQuickslot(\"" + skillName.htmlEntities() + "\"," + i + ");'>Slot " + (i + 1) + "</div>" + q + "<br>";
        }
        html += "<center><div class='gameButton' onclick='ProfileMenu.Show();'>Cancel</div></center>";
        $("#gameMenuPanelContent").html(html);
    }

    public static Show()
    {
        profileMenu.profileDisplayed = true;
        ProfileMenu.Update();
    }

    public static SetQuickslot(skillName: string, slotId: number)
    {
        for (var i = 0; i < 10; i++)
            if (world.Player.QuickSlot[i] == "S/" + skillName)
                world.Player.QuickSlot[i] = null;

        world.Player.QuickSlot[slotId] = "S/" + skillName;
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        ProfileMenu.Show();
    }
}