///<reference path="../../../Common/Libs/MiniQuery.ts" />

var statEditor = new (class
{
    selectedStat: KnownStat = null;
    selector: ListSelector = null;
    editor: CodeGraphEditor = null;
    FixedParams: string[] = ["name", "displayname", "playervisible", "defaultvalue", "monsterstat"];
});


class StatEditor
{
    public static Dispose()
    {
        statEditor.editor = null;
        statEditor.selector.Dispose();
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
            $("#statList").css("top", "5px");
            $("#statParameters").css("top", "5px");
        }

        if (!statEditor.editor)
        {
            statEditor.editor = new CodeGraphEditor("baseCode");
            statEditor.editor.OnChange = StatEditor.ChangeCode;
        }

        statEditor.selector = new ListSelector("statList", world.Stats, "Name");
        statEditor.selector.OnSelect = (rowId) =>
        {
            Framework.SetLocation({
                action: "StatEditor", id: rowId === null ? null : world.Stats[rowId].Name
            });
            if (rowId === null)
                statEditor.selectedStat = world.Stats[0];
            else
                statEditor.selectedStat = world.Stats[rowId];
            StatEditor.Render();
        };
        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Stats.length; i++)
            {
                if (world.Stats[i].Name == framework.CurrentUrl.id)
                {
                    statEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "StatEditor"
                });
                statEditor.selector.Select(null);
                return;
            }
        }
        else
            statEditor.selector.Select(null);
    }

    static Render()
    {
        $("#baseCode").val(statEditor.selectedStat.SourceCode.trim());
        statEditor.editor.SetCode(statEditor.selectedStat.SourceCode.trim());

        if (statEditor.selectedStat.CodeVariable("PlayerVisible") === null)
            statEditor.selectedStat.Code.CodeVariables["playervisible"] = { name: "PlayerVisible", type: "boolean", value: "true" };

        var html = "";
        html += "<h1>" + statEditor.selectedStat.Name + "</h1>";
        html += "<table>";
        for (var i in statEditor.selectedStat.Code.CodeVariables)
        {
            html += "<tr><td>";
            if (statEditor.FixedParams.indexOf(statEditor.selectedStat.Code.CodeVariables[i].name.toLowerCase()) == -1)
                html += "<div class='dialogBlockDelete' onclick='StatEditor.DeleteParam(\"" + i + "\")'>X</div>";
            html += statEditor.selectedStat.Code.CodeVariables[i].name.title() + ":</td><td>";
            var val = statEditor.selectedStat.Code.CodeVariables[i].value;
            if (statEditor.selectedStat.Code.CodeVariables[i].name == "Name" && (val == "Life" || val == "Energy" || val == "Experience" || val == "Level" || val == "Money"))
                html += val;
            else switch (statEditor.selectedStat.Code.CodeVariables[i].type)
            {
                case "boolean":
                    html += "<select id='var_" + i + "' onchange='StatEditor.ChangeVariable(\"" + i + "\")'><option" + (val.trim().toLowerCase() == "true" ? " selected" : "") + ">true</option><option" + (val.trim().toLowerCase() == "true" ? "" : " selected") + ">false</option></select>";
                    break;
                default:
                    html += "<input type='text' value='" + val.htmlEntities() + "' id='var_" + i + "' onkeyup='StatEditor.ChangeVariable(\"" + i + "\")'>";
            }
            html += "</td></tr>";
        }
        html += "</table>";
        $("#statParameters").html(html);
    }

    static ChangeVariable(name: string)
    {
        var val = $("#var_" + name).val().trim();

        if (name == 'name')
        {
            var newName = val;

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetStat(newName) && world.GetStat(newName) != statEditor.selectedStat))
            {
                $("#var_" + name).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#var_" + name).css('backgroundColor', '');
        }

        statEditor.selectedStat.Code.CodeVariables[name].value = val;
        statEditor.selectedStat.UpdateCodeVariables();

        if (name == "name" && val != "")
        {
            statEditor.selectedStat.Name = val;
            $("#skillParameters > h1").html(val);
            statEditor.selector.UpdateList();
            SearchPanel.Update();
        }
    }

    static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this stat?", () =>
        {
            for (var i = 0; i < world.Stats.length; i++)
            {
                if (world.Stats[i] == statEditor.selectedStat)
                {
                    world.Stats.splice(i, 1);
                    break;
                }
            }

            statEditor.selector.UpdateList();
            statEditor.selector.Select(0);
            SearchPanel.Update();
        });
    }

    static Add()
    {
        var nextId = world.Skills.length;
        while (world.GetStat("stat_" + nextId))
            nextId++;
        var code = "/// Name: stat_" + nextId + ",string\n";
        code += "/// DisplayName: stat_" + nextId + ",string\n";
        code += "/// PlayerVisible: true,boolean\n";
        code += "/// DefaultValue: 10,number\n";
        code += "/// MonsterStat: true,boolean\n";
        code += "// Runs when the value of the stat has been modified.\n\
// currentActor receives the actor id.\n\
// newValue is the value which will be set taking in account the MaxValue.\n\
// wishedValue is the value requested without taking in account the MaxValue limit.\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
}\n\
\n\
// Should return the maximum current value for the given stat.\n\
function MaxValue()\n\
{\n\
    return @DefaultValue@;\n\
}\n\
\n\
// Runs to check if a stat can be upgraded by the player from the stat panel. If it returns false then it cannot currently be upgraded.\n\
function CanUpgrade()\n\
{\n\
    return false;\n\
}\n\
";
        statEditor.selectedStat = KnownStat.Rebuild(code);
        world.Stats.push(statEditor.selectedStat);
        statEditor.selector.UpdateList();
        statEditor.selector.Select(world.Stats.length - 1);
        SearchPanel.Update();
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

            statEditor.selectedStat.Code.CodeVariables[newValue.toLowerCase()] = { name: newValue, type: "string", value: "" };
            statEditor.selectedStat.UpdateCodeVariables();
            StatEditor.Render();
        });
    }

    static DeleteParam(name: string)
    {
        delete statEditor.selectedStat.Code.CodeVariables[name];
        statEditor.selectedStat.UpdateCodeVariables();
        StatEditor.Render();
    }

    static Clone()
    {
        var nextId = world.Skills.length;
        while (world.GetSkill("skill_" + nextId))
            nextId++;

        var code = statEditor.selectedStat.FullCode();
        code = code.replace(/^\/\/\/\s*name:\s.*$/gim, "/// Name: skill_" + nextId + ",string\n");

        statEditor.selectedStat = KnownStat.Rebuild(code);
        world.Stats.push(statEditor.selectedStat);
        statEditor.selector.UpdateList();
        statEditor.selector.Select(world.Skills.length - 1);
        SearchPanel.Update();
    }

    static ChangeCode()
    {
        $(".elementCodeWarning").hide();
        //$(".CodeMirror-lines .CodeMirror-line").removeClass("line-error");
        var code = statEditor.editor.GetCode();
        try
        {
            statEditor.selectedStat.Parse(code + "\n" + statEditor.selectedStat.CodeVariables());
        }
        catch (ex)
        {
        }
    }
}