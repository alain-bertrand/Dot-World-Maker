/// <reference path="../../Libs/codemirror.d.ts" />

var monsterEditor = new (class
{
    selectedMonster: KnownMonster = null;
    selector: ListSelector = null;
    editor: CodeGraphEditor = null;
    FixedParams: string[] = ["Name",
        "Speed",
        "BaseDamage",
        "AttackSpeed",
        "ProximityAttack",
        "Art",
        "Life"];
});


class MonsterEditor
{
    public static Dispose()
    {
        monsterEditor.selector.Dispose();
        monsterEditor.editor = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || ("" + document.location).indexOf("/demo_code_editor.html") != -1 || Main.CheckNW());
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
            $("#monsterList").css("top", "5px");
            $("#monsterParameters").css("top", "5px");
        }

        if (("" + document.location).indexOf("/demo_code_editor.html") != -1)
            monsterEditor.editor = new CodeGraphEditor("baseCode", false, "text");
        else
            monsterEditor.editor = new CodeGraphEditor("baseCode", false);
        monsterEditor.editor.OnChange = MonsterEditor.ChangeCode;

        monsterEditor.selector = new ListSelector("monsterList", world.Monsters, "Name");
        monsterEditor.selector.OnSelect = (rowId) =>
        {
            Framework.SetLocation({
                action: "MonsterEditor", id: rowId === null ? null : world.Monsters[rowId].Name
            });

            monsterEditor.selectedMonster = world.Monsters[rowId];
            MonsterEditor.Render();
        };

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Monsters.length; i++)
            {
                if (world.Monsters[i].Name == framework.CurrentUrl.id)
                {
                    monsterEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "MonsterEditor"
                });
                monsterEditor.selector.Select(0);
                return;
            }
        }
        else
            monsterEditor.selector.Select(0);

        if (("" + document.location).indexOf("/demo_code_editor.html") !== -1)
        {
            $("#monsterParameters").hide();
            $("#monsterList").hide();
            $("#monsterListCommands").hide();
            $("#monsterCommands").hide();
            $("#monsterParamCommands").hide();
            $(".elementCodeWarning").css("left", "5px").css("top", "5px").css("right", "5px").css("width", "auto");
            $("#codeContainer").css("left", "5px").css("top", "25px").css("right", "5px").css("bottom", "5px");
            $("#helpLink").hide();
            $(".CodeMirror").css("height", "100%");
        }
    }

    static Render()
    {
        $("#baseCode").val(monsterEditor.selectedMonster.SourceCode.trim());
        monsterEditor.editor.SetCode(monsterEditor.selectedMonster.SourceCode.trim());
        $(".elementCodeWarning").hide();

        var html = "";
        html += "<h1>" + monsterEditor.selectedMonster.Name + "</h1>";
        html += "<table>";
        for (var item in monsterEditor.selectedMonster.Code.CodeVariables)
        {
            html += "<tr><td>";
            if (monsterEditor.FixedParams.indexOf(monsterEditor.selectedMonster.Code.CodeVariables[item].name) == -1)
                html += "<div class='dialogBlockDelete' onclick='MonsterEditor.DeleteParam(\"" + item + "\")'>X</div>";
            html += monsterEditor.selectedMonster.Code.CodeVariables[item].name.title() + ":";
            html += "</td><td>";
            var val = monsterEditor.selectedMonster.Code.CodeVariables[item].value;
            switch (monsterEditor.selectedMonster.Code.CodeVariables[item].type)
            {
                case "boolean":
                    html += "<select id='var_" + item + "' onkeyup='MonsterEditor.ChangeVariable(\"" + item + "\")'><option" + (val.trim().toLowerCase() == "true" ? " selected" : "") + ">true</option><option" + (val.trim().toLowerCase() == "true" ? "" : " selected") + ">false</option></select>";
                    break;
                case "monster_art":
                    html += "<select id='var_" + item + "' onchange='MonsterEditor.ChangeVariable(\"" + item + "\")'>";
                    var found = false;
                    var names: string[] = [];
                    for (var mName in world.art.characters)
                        names.push(mName);
                    names.sort();
                    for (var i = 0; i < names.length; i++)
                    {
                        html += "<option value='" + names[i].htmlEntities() + "'" + (val == names[i] ? " selected" : "") + ">" + names[i] + "</option>";
                    }
                    if (!found)
                        html += "<option value='" + val.htmlEntities + "' selected>" + val + "</option>";
                    html += "</select>";
                    break;
                default:
                    if (item == "name" && monsterEditor.selectedMonster.Name.toLowerCase() == "defaultmonster")
                        html += val.htmlEntities();
                    else
                        html += "<input type='text' value='" + val.htmlEntities() + "' id='var_" + item + "' onkeyup='MonsterEditor.ChangeVariable(\"" + item + "\")'>";
            }
            html += "</td></tr>";
        }
        html += "</table>";

        if (monsterEditor.selectedMonster.ItemDrop && monsterEditor.selectedMonster.ItemDrop.length)
        {
            html += "<h2>Item drops:</h2>";
            html += "<table>";
            html += "<thead><tr><td>&nbsp;</td><td>Name:</td><td>Quantity:</td><td>Probability:</td></tr></thead>";
            /*monsterEditor.selectedMonster.ItemDrop.sort((a, b) =>
            {
                if (a.Name > b.Name)
                    return 1;
                if (a.Name < b.Name)
                    return -1;
                return 0;
            });*/

            var names: string[] = [];
            for (var i = 0; i < world.InventoryObjects.length; i++)
                names.push(world.InventoryObjects[i].Name);
            names.sort();

            for (var i = 0; i < monsterEditor.selectedMonster.ItemDrop.length; i++)
            {
                html += "<tr>";
                html += "<td><div class='button' onclick='MonsterEditor.RemoveItemDrop(" + i + ")'>Remove</div></td>";
                html += "<td><select id='itemdrop_" + i + "' onchange='MonsterEditor.ChangeItemDrop(" + i + ",\"itemdrop_\",\"Name\")'>";
                for (var j = 0; j < names.length; j++)
                    html += "<option value='" + names[j].htmlEntities() + "'" + (names[j] == monsterEditor.selectedMonster.ItemDrop[i].Name ? " selected" : "") + ">" + names[j] + "</option>";
                html += "</select></td>";
                html += "<td><input type='text' id='itemdrop_qt_" + i + "' value='" + monsterEditor.selectedMonster.ItemDrop[i].Quantity + "' onkeyup='MonsterEditor.ChangeItemDrop(" + i + ",\"itemdrop_qt_\",\"Quantity\")'></td>";
                html += "<td><input type='text' id='itemdrop_prob_" + i + "' value='" + monsterEditor.selectedMonster.ItemDrop[i].Probability + "' onkeyup='MonsterEditor.ChangeItemDrop(" + i + ",\"itemdrop_prob_\",\"Probability\")'></td>";
                html += "</tr>";
            }
            html += "</table>";
        }

        if (monsterEditor.selectedMonster.StatDrop && monsterEditor.selectedMonster.StatDrop.length)
        {
            html += "<h2>Stat drops:</h2>";
            html += "<table>";
            html += "<thead><tr><td>&nbsp;</td><td>Name:</td><td>Quantity:</td><td>Probability:</td></tr></thead>";
            /*monsterEditor.selectedMonster.StatDrop.sort((a, b) =>
            {
                if (a.Name > b.Name)
                    return 1;
                if (a.Name < b.Name)
                    return -1;
                return 0;
            });*/

            names = [];
            for (var i = 0; i < world.Stats.length; i++)
                names.push(world.Stats[i].Name);
            names.sort();

            for (var i = 0; i < monsterEditor.selectedMonster.StatDrop.length; i++)
            {
                html += "<tr>";
                html += "<td><div class='button' onclick='MonsterEditor.RemoveStatDrop(" + i + ")'>Remove</div></td>";
                html += "<td><select id='statdrop_" + i + "' onchange='MonsterEditor.ChangeStatDrop(" + i + ",\"statdrop_\",\"Name\")'>";
                for (var j = 0; j < names.length; j++)
                    html += "<option value='" + names[j].htmlEntities() + "'" + (names[j] == monsterEditor.selectedMonster.StatDrop[i].Name ? " selected" : "") + ">" + names[j] + "</option>";
                html += "</select></td>";
                html += "<td><input type='text' id='statdrop_qt_" + i + "' value='" + monsterEditor.selectedMonster.StatDrop[i].Quantity + "' onkeyup='MonsterEditor.ChangeStatDrop(" + i + ",\"statdrop_qt_\",\"Quantity\")'></td>";
                html += "<td><input type='text' id='statdrop_prob_" + i + "' value='" + monsterEditor.selectedMonster.StatDrop[i].Probability + "' onkeyup='MonsterEditor.ChangeStatDrop(" + i + ",\"statdrop_prob_\",\"Probability\")'></td>";
                html += "</tr>";
            }
            html += "</table>";
        }

        $("#monsterParameters").html(html);
    }

    static RemoveItemDrop(id: number)
    {
        monsterEditor.selectedMonster.ItemDrop.splice(id, 1);
        MonsterEditor.Render();
    }

    static ChangeItemDrop(id: number, field: string, prop: string)
    {
        if (typeof monsterEditor.selectedMonster.ItemDrop[id][prop] == "number")
        {
            var v = parseFloat($("#" + field + id).val());
            if (!isNaN(v))
                monsterEditor.selectedMonster.ItemDrop[id][prop] = v;
        }
        else
            monsterEditor.selectedMonster.ItemDrop[id][prop] = $("#" + field + id).val();
    }

    static RemoveStatDrop(id: number)
    {
        monsterEditor.selectedMonster.StatDrop.splice(id, 1);
        MonsterEditor.Render();
    }

    static ChangeStatDrop(id: number, field: string, prop: string)
    {
        if (typeof monsterEditor.selectedMonster.StatDrop[id][prop] == "number")
        {
            var v = parseFloat($("#" + field + id).val());
            if (!isNaN(v))
                monsterEditor.selectedMonster.StatDrop[id][prop] = v;
        }
        else
            monsterEditor.selectedMonster.StatDrop[id][prop] = $("#" + field + id).val();
    }

    static DeleteParam(name: string)
    {
        delete monsterEditor.selectedMonster.Code.CodeVariables[name];
        monsterEditor.selectedMonster.UpdateCodeVariables();
        MonsterEditor.Render();
    }

    static ChangeVariable(name: string)
    {
        if (monsterEditor.selectedMonster.Name.toLowerCase() == "defaultmonster" && name == "name")
            return;

        var val = $("#var_" + name).val().trim();

        if (name == "name" && val != "")
        {
            if ((val.match(databaseNameRule) || !val || val.length < 1) || (world.GetMonster(val) && world.GetMonster(val) != monsterEditor.selectedMonster))
            {
                $("#var_name").css('backgroundColor', '#FFE0E0');
                return;
            }
            $("#var_name").css('backgroundColor', '');

            var oldName = monsterEditor.selectedMonster.Name;
            var newName = val;

            monsterEditor.selectedMonster.Name = val;
            $("#monsterParameters > h1").html(val);
            monsterEditor.selector.UpdateList();

            for (var i = 0; i < world.Zones.length; i++)
            {
                for (var j = 0; j < world.Zones[i].Monsters.length; j++)
                {
                    if (world.Zones[i].Monsters[j].Name == oldName)
                        world.Zones[i].Monsters[j].Name = newName;
                }
            }

            MapUtilities.Modify("monster", oldName, newName);
            SearchPanel.Update();
        }
        monsterEditor.selectedMonster.Code.CodeVariables[name].value = val;
        monsterEditor.selectedMonster.UpdateCodeVariables();
    }

    static Delete()
    {
        if (monsterEditor.selectedMonster.Name.toLowerCase() == "defaultmonster")
        {
            Framework.Alert("You cannot delete the DefaultMonster.");
            return;
        }
        Framework.Confirm("Are you sure you want to delete this monster?", () =>
        {
            for (var i = 0; i < world.Monsters.length; i++)
            {
                if (world.Monsters[i] == monsterEditor.selectedMonster)
                {
                    world.Monsters.splice(i, 1);
                    break;
                }
            }

            var oldName = monsterEditor.selectedMonster.Name;
            for (var i = 0; i < world.Zones.length; i++)
            {
                for (var j = 0; j < world.Zones[i].Monsters.length;)
                {
                    if (world.Zones[i].Monsters[j].Name == oldName)
                        world.Zones[i].Monsters.splice(j, 1);
                    else
                        j++;
                }
            }

            monsterEditor.selector.UpdateList();
            monsterEditor.selector.Select(0);
            MapUtilities.Modify("monster", oldName, null);
            SearchPanel.Update();
        });
    }

    static Add()
    {
        var nextId = world.Monsters.length;
        while (world.GetMonster("monster_" + nextId))
            nextId++;
        var code = "/// Name: monster_" + nextId + ",string\n";

        var defMonster = world.GetMonster("DefaultMonster");

        // Recover the default code variables
        for (var i in defMonster.Code.CodeVariables)
        {
            if (i == "name")
                continue;
            code += "/// " + defMonster.Code.CodeVariables[i].name + ": " + defMonster.Code.CodeVariables[i].value + "," + defMonster.Code.CodeVariables[i].type + "\n";
        }
        // Find the name of the first art for a monster
        var firstMonster = "";
        for (var i in world.art.characters)
        {
            firstMonster = i;
            break;
        }
        code += "/// Art: " + i + ",monster_art\n";
        // Recover the stats applied to monsters
        for (var j = 0; j < world.Stats.length; j++)
        {
            if (!world.Stats[j].MonsterStat)
                continue;
            code += "/// " + world.Stats[j].Name + ": " + world.Stats[j].DefaultValue + ",number\n";
        }
        monsterEditor.selectedMonster = KnownMonster.Rebuild(code);
        monsterEditor.selectedMonster.DefaultMonster = defMonster;
        world.Monsters.push(monsterEditor.selectedMonster);
        monsterEditor.selector.UpdateList();
        monsterEditor.selector.Select(world.Monsters.length - 1);
        SearchPanel.Update();
    }

    static Clone()
    {
        if (monsterEditor.selectedMonster.Name.toLowerCase() == "defaultmonster")
            return;

        var nextId = world.Monsters.length;
        while (world.GetMonster("monster_" + nextId))
            nextId++;

        var code = monsterEditor.selectedMonster.FullCode();
        code = code.replace(/^\/\/\/\s*name:\s.*$/gim, "/// Name: monster_" + nextId + ",string\n");

        var defMonster = world.GetMonster("DefaultMonster");

        monsterEditor.selectedMonster = KnownMonster.Rebuild(code);
        monsterEditor.selectedMonster.DefaultMonster = defMonster;
        world.Monsters.push(monsterEditor.selectedMonster);
        monsterEditor.selector.UpdateList();
        monsterEditor.selector.Select(world.Monsters.length - 1);
        SearchPanel.Update();
    }

    static ChangeCode()
    {
        $(".elementCodeWarning").hide();

        var code = monsterEditor.editor.GetCode();
        try
        {
            monsterEditor.selectedMonster.Parse(code + "\n" + monsterEditor.selectedMonster.CodeVariables());
        }
        catch (ex)
        {
        }
    }

    static AddParam()
    {
        Framework.Prompt("Enter the new parameter name:", "", (newValue: string) =>
        {
            if (!newValue.match(/^[a-z]+$/i))
            {
                Framework.Alert("Only letters are acceptable as parameter name.");
                return;
            }
            monsterEditor.selectedMonster.Code.CodeVariables[newValue.toLowerCase()] = { name: newValue, type: "string", value: "" };
            monsterEditor.selectedMonster.UpdateCodeVariables();
            MonsterEditor.Render();
        });
    }

    static AddStat()
    {
        if (monsterEditor.selectedMonster.Name == "DefaultMonster")
            return;
        monsterEditor.selectedMonster.StatDrop.push({ Name: world.Stats[0].Name, Quantity: 1, Probability: 100 });
        MonsterEditor.Render();
    }

    static AddItem()
    {
        if (monsterEditor.selectedMonster.Name == "DefaultMonster")
            return;
        monsterEditor.selectedMonster.ItemDrop.push({ Name: world.InventoryObjects[0].Name, Quantity: 1, Probability: 100 });
        MonsterEditor.Render();
    }
}