var npcEditor = new (class
{
    public currentNPC: NPC;
    public selectedDialog: Dialog;
    public selectedAnswer: Answer;
    public listNPC: ListSelector;
});

class NPCEditor
{
    public static Dispose()
    {
        npcEditor.currentNPC = null;

        if (npcEditor.listNPC)
            npcEditor.listNPC.Dispose();
        npcEditor.listNPC = null;
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
            $("#listNPC").css("top", "5px");
            $("#npcDialogSection").css("top", "5px");
            $("#npcShopSection").css("top", "5px");
        }

        dialogCondition.currentEditor = "NPCEditor";
        dialogAction.currentEditor = "NPCEditor";

        npcEditor.listNPC = new ListSelector("listNPC", world.NPCs, "Name");
        npcEditor.listNPC.OnSelect = (rowId: number) =>
        {
            Framework.SetLocation({
                action: "NPCEditor", id: rowId === null || !world.NPCs[rowId] ? null : world.NPCs[rowId].Name
            });

            if (rowId >= world.NPCs.length)
            {
                npcEditor.currentNPC = null;
                npcEditor.selectedDialog = null;
                npcEditor.selectedAnswer = null;
            }
            else
            {
                npcEditor.currentNPC = world.NPCs[rowId];
                npcEditor.selectedDialog = npcEditor.currentNPC.Dialogs[0];
                npcEditor.selectedAnswer = null;
            }
            NPCEditor.Update();
            NPCShopEditor.UpdateShop();
        }

        var options = "";
        var names: string[] = [];
        for (var n in world.art.characters)
        {
            names.push(n);
        }
        names.sort();
        for (var i = 0; i < names.length; i++)
            options += "<option value='" + names[i] + "'>" + names[i] + "</option>";
        $("#npcLook").find('option').remove().end().append(options).val('');

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.NPCs.length; i++)
            {
                if (world.NPCs[i].Name == framework.CurrentUrl.id)
                {
                    npcEditor.listNPC.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "GenericCodeEditor"
                });
                npcEditor.listNPC.Select(0);
                return;
            }
        }
        else
            npcEditor.listNPC.Select(0);
        $("#npcShopSection").hide();

        if (framework.Preferences["NPCEditor"] == "shop")
            NPCShopEditor.ShowEditor();
    }

    static Update()
    {
        if (npcEditor.currentNPC)
        {
            $("#npcName").val(npcEditor.currentNPC.Name).css('backgroundColor', '').prop("disabled", false);
            $("#npcLook").val(npcEditor.currentNPC.Look).prop("disabled", false);
            npcEditor.currentNPC.Look = $("#npcLook").val();
        }
        else
        {
            $("#npcName").val("").css('backgroundColor', '').prop("disabled", true);
            $("#npcLook").prop("disabled", true)
        }

        if (npcEditor.selectedAnswer)
        {
            $("#dialog").prop("disabled", false).addClass("dialogAnswer");
            $("#dialogJumpTo").show();
            $("#actionsAndConditions").show();
            $("#dialog").val((npcEditor.selectedAnswer.Text ? npcEditor.selectedAnswer.Text : ""));

            var html = "";
            html += NPCEditor.ShowActions() + "<br><br>";
            html += NPCEditor.ShowConditions();
            NPCEditor.UpdateListLinkTo();
            $("#actionsAndConditions").html(html);
        }
        else if (npcEditor.selectedDialog)
        {
            $("#dialog").prop("disabled", false).removeClass("dialogAnswer");
            $("#dialogJumpTo").hide();
            $("#actionsAndConditions").hide();
            $("#dialog").val((npcEditor.selectedDialog.Text ? npcEditor.selectedDialog.Text : ""));
        }
        else
        {
            $("#dialog").prop("disabled", true).removeClass("dialogAnswer");
            $("#dialogJumpTo").hide();
            $("#actionsAndConditions").hide();
            $("#dialog").val("No NPC selected");
        }

        NPCEditor.UpdateDialogList();
        NPCEditor.UpdateAnswerList();
    }

    static UpdateListLinkTo()
    {
        var html = "";
        html += "<select onchange='NPCEditor.ChangeLinkTo()' id='jumpTo'>";
        html += "<option value='-1'" + (npcEditor.selectedAnswer.JumpTo == null || npcEditor.selectedAnswer.JumpTo == -1 ? " selected" : "") + ">-- Close Dialog --</option>";
        for (var i = 0; i < npcEditor.currentNPC.Dialogs.length; i++)
            html += "<option value='" + i + "'" + (npcEditor.selectedAnswer.JumpTo == i ? " selected" : "") + ">" + (npcEditor.currentNPC.Dialogs[i].Text ? npcEditor.currentNPC.Dialogs[i].Text : "").substr(0, 60).replace(/[\n\r]/g, "") + "</option>";
        html += "</select>";
        $("#jumpToContainer").html(html);
    }

    static ChangeLinkTo()
    {
        npcEditor.selectedAnswer.JumpTo = parseInt($("#jumpTo").val());
    }

    static ShowActions(): string
    {
        var html = "";
        html += "<b>Actions:</b><br>";

        for (var j = 0; j < npcEditor.selectedAnswer.Actions.length; j++)
        {
            var act: DialogAction = npcEditor.selectedAnswer.Actions[j];
            html += "<span class='dialogBlock'><b>" + act.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='NPCEditor.DeleteAction(" + j + ")'>X</span><br>";
            html += dialogAction.code[act.Name].Display(j, act.Values);
            html += "</span>";
        }

        html += "<select id='addAction' onchange='NPCEditor.AddAction()'>";
        html += "<option value=''>-- Add new action --</option>";
        var actions: string[] = [];
        for (var item in dialogAction.code)
            actions.push(item);
        actions.sort();
        for (var i = 0; i < actions.length; i++)
            html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
        html += "<select>";
        return html;
    }

    static DeleteAction(id: number)
    {
        npcEditor.selectedAnswer.Actions.splice(id, 1);
        NPCEditor.Update();
    }

    static DeleteCondition(id: number)
    {
        npcEditor.selectedAnswer.Conditions.splice(id, 1);
        NPCEditor.Update();
    }

    static ShowConditions(): string
    {
        var html = "";
        html += "<b>Conditions:</b><br>";

        for (var j = 0; j < npcEditor.selectedAnswer.Conditions.length; j++)
        {
            var cond: DialogCondition = npcEditor.selectedAnswer.Conditions[j];
            html += "<span class='dialogBlock'><b>" + cond.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='NPCEditor.DeleteCondition(" + j + ")'>X</span><br>";
            html += dialogCondition.code[cond.Name].Display(j, cond.Values);
            html += "</span>";
        }

        html += "<select id='addCondition' onchange='NPCEditor.AddCondition()'>";
        html += "<option value=''>-- Add new condition --</option>";
        var conditions: string[] = [];
        for (var item in dialogCondition.code)
            conditions.push(item);
        conditions.sort();
        for (var i = 0; i < conditions.length; i++)
            html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
        html += "<select>";
        return html;
    }

    static ChangeLook()
    {
        npcEditor.currentNPC.Look = $("#npcLook").val();
    }

    static ChangeAction(id: number, pos: number)
    {
        npcEditor.selectedAnswer.Actions[id].Values[pos] = $("#action_" + id + "_" + pos).val();
    }

    static ChangeCondition(id: number, pos: number)
    {
        npcEditor.selectedAnswer.Conditions[id].Values[pos] = $("#condition_" + id + "_" + pos).val();
    }

    static OnMap()
    {
        if (npcEditor.currentNPC)
            Framework.SetLocation({
                action: "MapEditor", npc: npcEditor.currentNPC.Name
            }, false);
    }

    static AddAction()
    {
        var action = new DialogAction();
        action.Name = $("#addAction").val();
        npcEditor.selectedAnswer.Actions.push(action);
        $("#addAction").val("");
        NPCEditor.Update();
    }

    static AddCondition()
    {
        var condition = new DialogCondition();
        condition.Name = $("#addCondition").val();
        npcEditor.selectedAnswer.Conditions.push(condition);
        $("#addCondition").val("");
        NPCEditor.Update();
    }

    static UpdateDialogList()
    {
        var html = "";
        if (npcEditor.currentNPC) for (var i = 0; i < npcEditor.currentNPC.Dialogs.length; i++)
        {
            html += "<div" + (npcEditor.selectedDialog == npcEditor.currentNPC.Dialogs[i] ? " class='listSelectorSelectedRow'" : "");
            html += " onclick='NPCEditor.SelectDialog(" + i + ");'>";
            html += (npcEditor.currentNPC.Dialogs[i].Text && npcEditor.currentNPC.Dialogs[i].Text.trim() != "" ? npcEditor.currentNPC.Dialogs[i].Text : "- EMPTY -");
            html += "</div>";
        }
        $("#listDialogs").html(html);
    }

    static SelectDialog(rowId: number)
    {
        npcEditor.selectedAnswer = null;
        npcEditor.selectedDialog = npcEditor.currentNPC.Dialogs[rowId];
        NPCEditor.Update();
    }

    static UpdateAnswerList()
    {
        var html = "";
        if (npcEditor.selectedDialog) for (var i = 0; i < npcEditor.selectedDialog.Answers.length; i++)
        {
            html += "<div" + (npcEditor.selectedAnswer == npcEditor.selectedDialog.Answers[i] ? " class='listSelectorSelectedRow'" : "");
            html += " onclick='NPCEditor.SelectAnswer(" + i + ");'>";
            html += (npcEditor.selectedDialog.Answers[i].Text && npcEditor.selectedDialog.Answers[i].Text.trim() != "" ? npcEditor.selectedDialog.Answers[i].Text : "- EMPTY -");
            html += "</div>";
        }
        $("#listAnswers").html(html);
    }

    static SelectAnswer(rowId: number)
    {
        npcEditor.selectedAnswer = npcEditor.selectedDialog.Answers[rowId];
        NPCEditor.Update();
    }

    static DialogChanged()
    {
        if (npcEditor.selectedAnswer)
        {
            npcEditor.selectedAnswer.Text = $("#dialog").val();
            NPCEditor.UpdateAnswerList();
        }
        else
        {
            npcEditor.selectedDialog.Text = $("#dialog").val();
            NPCEditor.UpdateDialogList();
        }
    }

    static GenerateName()
    {
        if (!npcEditor.currentNPC)
            return;
        npcEditor.currentNPC.Name = NPC.GenerateName();
        $("#npcName").val(npcEditor.currentNPC.Name);
        NPCEditor.NameChanged();
    }

    static NameChanged()
    {
        var oldName = npcEditor.currentNPC.Name;
        var newName = $("#npcName").val();
        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetNPC(newName) && world.GetNPC(newName) != npcEditor.currentNPC))
        {
            $("#npcName").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#npcName").css('backgroundColor', '');
        npcEditor.currentNPC.Name = newName;
        npcEditor.listNPC.UpdateList();
        MapUtilities.Modify("npc", oldName, newName);
        SearchPanel.Update();
    }

    static AddDialog()
    {
        npcEditor.selectedAnswer = null;
        npcEditor.selectedDialog = new Dialog();
        npcEditor.selectedDialog.Text = "Yes...";
        var answer = new Answer();
        answer.Text = "Ok";
        npcEditor.selectedDialog.Answers = [answer];
        npcEditor.currentNPC.Dialogs.push(npcEditor.selectedDialog);
        NPCEditor.SelectDialog(npcEditor.currentNPC.Dialogs.length - 1);
    }

    static RemoveDialog()
    {
        if (npcEditor.currentNPC.Dialogs.length <= 1)
            return;
        for (var i = 0; i < npcEditor.currentNPC.Dialogs.length; i++)
        {
            if (npcEditor.currentNPC.Dialogs[i] == npcEditor.selectedDialog)
            {
                npcEditor.currentNPC.Dialogs.splice(i, 1);
                npcEditor.selectedDialog = npcEditor.currentNPC.Dialogs[0];
                NPCEditor.Update();
                return;
            }
        }
    }

    static AddAnswer()
    {
        npcEditor.selectedAnswer = new Answer();
        npcEditor.selectedDialog.Answers.push(npcEditor.selectedAnswer);
        npcEditor.selectedAnswer.Text = "Ok";
        NPCEditor.SelectAnswer(npcEditor.selectedDialog.Answers.length - 1);
    }

    static DeleteAnswer()
    {
        for (var i = 0; i < npcEditor.selectedDialog.Answers.length; i++)
        {
            if (npcEditor.selectedDialog.Answers[i] == npcEditor.selectedAnswer)
            {
                npcEditor.selectedDialog.Answers.splice(i, 1);
                return;
            }
        }

    }

    static RemoveAnswer()
    {
        if (npcEditor.selectedDialog.Answers.length <= 1)
            return;
        NPCEditor.DeleteAnswer();
        npcEditor.selectedAnswer = null;
        NPCEditor.Update();
    }

    static ToTopAnswer()
    {
        NPCEditor.DeleteAnswer();
        npcEditor.selectedDialog.Answers.unshift(npcEditor.selectedAnswer);
        NPCEditor.Update();
    }

    static ToBottomAnswer()
    {
        NPCEditor.DeleteAnswer();
        npcEditor.selectedDialog.Answers.push(npcEditor.selectedAnswer);
        NPCEditor.Update();
    }

    static NewNPC()
    {
        npcEditor.currentNPC = NPC.Generate();
        world.NPCs.push(npcEditor.currentNPC);
        (<HTMLSelectElement>$("#npcLook").first()).selectedIndex = 0;
        npcEditor.currentNPC.Look = $("#npcLook").val();
        npcEditor.listNPC.UpdateList();
        npcEditor.listNPC.Select(world.NPCs.length - 1);
        SearchPanel.Update();
    }

    static CloneNPC()
    {
        npcEditor.currentNPC = JSON.parse(JSON.stringify(npcEditor.currentNPC));
        npcEditor.currentNPC.Name = NPC.GenerateName();

        world.NPCs.push(npcEditor.currentNPC);
        (<HTMLSelectElement>$("#npcLook").first()).selectedIndex = 0;
        npcEditor.currentNPC.Look = $("#npcLook").val();
        npcEditor.listNPC.UpdateList();
        npcEditor.listNPC.Select(world.NPCs.length - 1);
        SearchPanel.Update();
    }

    static DeleteNPC()
    {
        var oldName = npcEditor.currentNPC.Name;
        for (var i = 0; i < world.NPCs.length; i++)
        {
            if (world.NPCs[i] == npcEditor.currentNPC)
            {
                world.NPCs.splice(i, 1);
                break;
            }
        }
        npcEditor.listNPC.UpdateList();
        npcEditor.listNPC.Select(0);
        MapUtilities.Modify("npc", oldName, null);
        SearchPanel.Update();
    }

    static ShowEditor()
    {
        $("#npcDialogSection").show();
        $("#npcShopSection").hide();
        framework.Preferences["NPCEditor"] = "dialog";
        Framework.SavePreferences();
    }

}