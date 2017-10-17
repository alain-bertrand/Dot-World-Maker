///<reference path="../../../Common/Libs/MiniQuery.ts" />

var skillEditor = new (class
{
    selectedSkill: KnownSkill = null;
    selector: ListSelector;
    editor: CodeGraphEditor = null;
    FixedParams: string[] = ["name", "displayname", "autoreceive", "quickslot", "quicksloteditable", "icon"];
});

class SkillEditor
{
    public static Dispose()
    {
        skillEditor.selector.Dispose();
        skillEditor.editor = null;
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
            $("#skillList").css("top", "5px");
            $("#skillParameters").css("top", "5px");
        }

        if (!skillEditor.editor)
        {
            skillEditor.editor = new CodeGraphEditor("baseCode");
            skillEditor.editor.OnChange=SkillEditor.ChangeCode;
        }

        skillEditor.selector = new ListSelector("skillList", world.Skills, "Name");
        skillEditor.selector.OnSelect = (rowId) =>
        {
            Framework.SetLocation({
                action: "SkillEditor", id: rowId === null ? null : world.Skills[rowId].Name
            });
            if (rowId === null)
                skillEditor.selectedSkill = world.Skills[0];
            else
                skillEditor.selectedSkill = world.Skills[rowId];
            SkillEditor.Render();
        };
        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Skills.length; i++)
            {
                if (world.Skills[i].Name == framework.CurrentUrl.id)
                {
                    skillEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "SkillEditor"
                });
                skillEditor.selector.Select(null);
                return;
            }
        }
        else
            skillEditor.selector.Select(null);
    }

    static Render()
    {
        $("#baseCode").val(skillEditor.selectedSkill.SourceCode.trim());
        skillEditor.editor.SetCode(skillEditor.selectedSkill.SourceCode.trim());

        var html = "";
        html += "<h1>" + skillEditor.selectedSkill.Name + "</h1>";
        html += "<table>";
        for (var i in skillEditor.selectedSkill.Code.CodeVariables)
        {
            html += "<tr><td>";
            if (skillEditor.FixedParams.indexOf(skillEditor.selectedSkill.Code.CodeVariables[i].name.toLowerCase()) == -1)
                html += "<div class='dialogBlockDelete' onclick='SkillEditor.DeleteParam(\"" + i + "\")'>X</div>";
            html += skillEditor.selectedSkill.Code.CodeVariables[i].name.title() + ":</td><td>";
            // Cannot rename the "attack" skill as it's the base skill.
            if (skillEditor.selectedSkill.Code.CodeVariables[i].name.toLowerCase() == "name" && skillEditor.selectedSkill.Name.toLowerCase() == "attack")
            {
                html += skillEditor.selectedSkill.Code.CodeVariables[i].value;
                html += "</td></tr>";
                continue;
            }
            var val = skillEditor.selectedSkill.Code.CodeVariables[i].value;
            switch (skillEditor.selectedSkill.Code.CodeVariables[i].type)
            {
                case "image_upload":
                    html += "<img src='" + val + "'>";
                    html += "<div class='button' onclick='SkillEditor.ShowUpload()'>" + (Main.CheckNW() ? "Set" : "Upload Icon") + "</div>";
                    html += "<div class='button' onclick='SkillEditor.EditImage()'>Edit Image</div>";
                    break;
                case "boolean":
                    html += "<select id='var_" + i + "' onchange='SkillEditor.ChangeVariable(\"" + i + "\")'><option" + (val.trim().toLowerCase() == "true" ? " selected" : "") + ">true</option><option" + (val.trim().toLowerCase() == "true" ? "" : " selected") + ">false</option></select>";
                    break;
                default:
                    html += "<input type='text' value='" + val.htmlEntities() + "' id='var_" + i + "' onkeyup='SkillEditor.ChangeVariable(\"" + i + "\")'>";
            }
            html += "</td></tr>";
        }
        html += "</table>";
        $("#skillParameters").html(html);
    }


    static ChangeVariable(name: string)
    {
        var val = $("#var_" + name).val().trim();

        if (name == 'name')
        {
            var newName = val;

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetSkill(newName) && world.GetSkill(newName) != skillEditor.selectedSkill))
            {
                $("#var_" + name).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#var_" + name).css('backgroundColor', '');
        }

        skillEditor.selectedSkill.Code.CodeVariables[name].value = val;
        skillEditor.selectedSkill.UpdateCodeVariables();

        if (name == "name" && val != "")
        {
            skillEditor.selectedSkill.Name = val;
            $("#skillParameters > h1").html(val);
            skillEditor.selector.UpdateList();
            SearchPanel.Update();
        }
    }

    static Delete()
    {
        if (skillEditor.selectedSkill.Name.toLowerCase() == "attack")
        {
            Framework.Alert("Cannot delete the base 'Attack' skill");
            return;
        }

        Framework.Confirm("Are you sure you want to delete this skill?", () =>
        {
            for (var i = 0; i < world.Skills.length; i++)
            {
                if (world.Skills[i] == skillEditor.selectedSkill)
                {
                    world.Skills.splice(i, 1);
                    break;
                }
            }

            skillEditor.selector.UpdateList();
            skillEditor.selector.Select(0);
            SearchPanel.Update();
        });
    }

    static Add()
    {
        var nextId = world.Skills.length;
        while (world.GetSkill("skill_" + nextId))
            nextId++;
        var code = "/// Name: skill_" + nextId + ",string\n";
        code += "/// DisplayName: skill_" + nextId + ",string\n";
        code += "/// AutoReceive: false,boolean\n";
        code += "/// Icon: /art/tileset2/fist_icon.png,image_upload\n";
        code += "/// Quickslot: true,boolean\n";
        code += "/// QuickslotEditable: true,boolean\n";

        code += "// Runs when the player activate the skill. Returns false if the skill should not remain selected.\n\
// function Activate()\n\
// {\n\
//     return true;\n\
// }\n\
\n\
// Runs when the player click on an actor on the map.\n\
// If this function is not set, the \"Attack\" skill action code will be used.\n\
// function Action(onActor)\n\
// {\n\
// }\n\
\n\
";

        skillEditor.selectedSkill = KnownSkill.Rebuild(code);
        world.Skills.push(skillEditor.selectedSkill);
        skillEditor.selector.UpdateList();
        skillEditor.selector.Select(world.Skills.length - 1);
        SearchPanel.Update();
    }

    static Clone()
    {
        var nextId = world.Skills.length;
        while (world.GetSkill("skill_" + nextId))
            nextId++;

        var code = skillEditor.selectedSkill.FullCode();
        code = code.replace(/^\/\/\/\s*name:\s.*$/gim, "/// Name: skill_" + nextId + ",string\n");

        skillEditor.selectedSkill = KnownSkill.Rebuild(code);
        world.Skills.push(skillEditor.selectedSkill);
        skillEditor.selector.UpdateList();
        skillEditor.selector.Select(world.Skills.length - 1);
        SearchPanel.Update();
    }

    static ChangeCode()
    {
        $(".elementCodeWarning").hide();
        //$(".CodeMirror-lines .CodeMirror-line").removeClass("line-error");

        var code = skillEditor.editor.GetCode();
        try
        {
            skillEditor.selectedSkill.Parse(code + "\n" + skillEditor.selectedSkill.CodeVariables());
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

            skillEditor.selectedSkill.Code.CodeVariables[newValue.toLowerCase()] = { name: newValue, type: "string", value: "" };
            skillEditor.selectedSkill.UpdateCodeVariables();
            SkillEditor.Render();
        });
    }

    static DeleteParam(name: string)
    {
        delete skillEditor.selectedSkill.Code.CodeVariables[name];
        skillEditor.selectedSkill.UpdateCodeVariables();
        SkillEditor.Render();
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", SkillEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        skillEditor.selectedSkill.Code.CodeVariables["icon"].value = $("#fileOpenDialog").val() + "?v=" + Math.round((new Date()).getTime() / 1000);
        skillBar.SkillIcons = {};
        SkillEditor.Render();
        $("#fileOpenDialog").unbind("change", SkillEditor.ImportFileImage).val("");
    }

    static CloseUpload()
    {
        $("#uploadArtObject").hide();
    }

    static Upload()
    {
        $("#uploadArtObject").hide();
        $("#artObjectUploadForm").submit();
    }

    static Result(result: string)
    {
        var data = JSON.parse(result);
        if (data.error)
        {
            Framework.Alert(data.error);
            return;
        }
        else if (data.new_file)
        {
            skillEditor.selectedSkill.Code.CodeVariables["icon"].value = data.new_file + "?v=" + Math.round((new Date()).getTime() / 1000);
            skillBar.SkillIcons = {};
            SkillEditor.Render();
        }
    }

    static EditImage()
    {
        Framework.SetLocation({
            action: "PixelEditor",
            file: skillEditor.selectedSkill.Code.CodeVariables["icon"].value,
            type: "skill",
            skill: skillEditor.selectedSkill.Name
        }, false);
    }
}