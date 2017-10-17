///<reference path="../../../Common/Libs/MiniQuery.ts" />

var temporaryEffectEditor = new (class
{
    selectedEffect: TemporaryEffect = null;
    selector: ListSelector = null;
});


class TemporaryEffectEditor
{
    public static Dispose()
    {
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
            $("#effectList").css("top", "5px");
            $("#effectParameters").css("top", "5px");
        }

        dialogCondition.currentEditor = "TemporaryEffectEditor";
        dialogAction.currentEditor = "TemporaryEffectEditor";


        temporaryEffectEditor.selectedEffect = null;

        temporaryEffectEditor.selector = new ListSelector("effectList", world.TemporaryEffects, "Name");
        temporaryEffectEditor.selector.OnSelect = (rowId) =>
        {
            Framework.SetLocation({
                action: "TemporaryEffectEditor", id: rowId === null ? null : world.TemporaryEffects[rowId].Name
            });
            if (rowId === null)
                temporaryEffectEditor.selectedEffect = null;
            else
                temporaryEffectEditor.selectedEffect = world.TemporaryEffects[rowId];
            TemporaryEffectEditor.Render();
        };

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.TemporaryEffects.length; i++)
            {
                if (world.TemporaryEffects[i].Name == framework.CurrentUrl.id)
                {
                    temporaryEffectEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "TemporaryEffectEditor"
                });
                temporaryEffectEditor.selector.Select(null);
                return;
            }
        }
        else
            temporaryEffectEditor.selector.Select(null);
    }

    static Render()
    {
        if (!temporaryEffectEditor.selectedEffect)
        {
            $("#effectParameters").html("");
            return;
        }

        var html = "";

        var actions = [];
        for (var item in dialogAction.code)
            actions.push(item);
        actions.sort();

        if (temporaryEffectEditor.selectedEffect.MultipleInstance === null || temporaryEffectEditor.selectedEffect.MultipleInstance === undefined)
            temporaryEffectEditor.selectedEffect.MultipleInstance = true;

        html = "<h1>" + temporaryEffectEditor.selectedEffect.Name + "</h1>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='obj_Name' value='" + temporaryEffectEditor.selectedEffect.Name.htmlEntities() + "' onkeyup='TemporaryEffectEditor.Change(\"Name\")'></td></tr>";
        html += "<tr><td>Multiple instances:</td><td><select id='obj_MultipleInstance' onchange='TemporaryEffectEditor.Change(\"MultipleInstance\")'>";
        html += "<option value='yes'" + (temporaryEffectEditor.selectedEffect.MultipleInstance !== false ? " selected" : "") + ">Yes</option>";
        html += "<option value='no'" + (temporaryEffectEditor.selectedEffect.MultipleInstance === false ? " selected" : "") + ">No</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Time (in sec.):</td><td><input type='text' id='obj_Timer' value='" + ("" + temporaryEffectEditor.selectedEffect.Timer).htmlEntities() + "' onkeyup='TemporaryEffectEditor.Change(\"Timer\")'></td></tr>";


        html += "<tr><td>Start Action:</td><td>&nbsp;</td>";
        for (var i = 0; i < temporaryEffectEditor.selectedEffect.StartActions.length; i++)
        {
            var action: DialogAction = temporaryEffectEditor.selectedEffect.StartActions[i];
            html += "<tr><td>" + action.Name.title() + ": <span class='dialogBlockDelete' onclick='TemporaryEffectEditor.DeleteStartAction(" + i + ")'>X</span></td>";
            html += "<td>" + dialogAction.code[action.Name].Display(i, action.Values, "ChangeStartAction") + "</td></tr>";

        }
        html += "<tr><td colspan='2'><select id='add_start_action' onchange='TemporaryEffectEditor.AddStartAction()'>";
        html += "<option value=''>- Add new action --</option>";
        for (var i = 0; i < actions.length; i++)
            html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
        html += "</select></td></tr>";

        html += "<tr><td>Recurring Time (in sec.):</td><td><input type='text' id='obj_RecurringTimer' value='" + ("" + temporaryEffectEditor.selectedEffect.RecurringTimer).htmlEntities() + "' onkeyup='TemporaryEffectEditor.Change(\"RecurringTimer\")'></td></tr>";

        html += "<tr><td>Recurring Action:</td><td>&nbsp;</td>";
        for (var i = 0; i < temporaryEffectEditor.selectedEffect.RecurringActions.length; i++)
        {
            var action: DialogAction = temporaryEffectEditor.selectedEffect.RecurringActions[i];
            html += "<tr><td>" + action.Name.title() + ": <span class='dialogBlockDelete' onclick='TemporaryEffectEditor.DeleteRecuringAction(" + i + ")'>X</span></td>";
            html += "<td>" + dialogAction.code[action.Name].Display(i, action.Values, "ChangeRecuringAction") + "</td></tr>";

        }
        html += "<tr><td colspan='2'><select id='add_recuring_action' onchange='TemporaryEffectEditor.AddRecuringAction()'>";
        html += "<option value=''>- Add new action --</option>";
        for (var i = 0; i < actions.length; i++)
            html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
        html += "</select></td></tr>";

        html += "<tr><td>End Action:</td><td>&nbsp;</td>";
        for (var i = 0; i < temporaryEffectEditor.selectedEffect.EndActions.length; i++)
        {
            var action: DialogAction = temporaryEffectEditor.selectedEffect.EndActions[i];

            html += "<tr><td>" + action.Name.title() + ": <span class='dialogBlockDelete' onclick='TemporaryEffectEditor.DeleteEndAction(" + i + ")'>X</span></td>";
            html += "<td>" + dialogAction.code[action.Name].Display(i, action.Values, "ChangeEndAction") + "</td></tr>";

        }
        html += "<tr><td colspan='2'><select id='add_end_action' onchange='TemporaryEffectEditor.AddEndAction()'>";
        html += "<option value=''>- Add new action --</option>";
        for (var i = 0; i < actions.length; i++)
            html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
        html += "</select></td></tr>";

        html += "</table>";
        $("#effectParameters").html(html);
    }

    static ChangeStartAction(id: number, pos: number)
    {
        temporaryEffectEditor.selectedEffect.StartActions[id].Values[pos] = $("#ChangeStartAction_" + id + "_" + pos).val();
    }

    static DeleteStartAction(rowId)
    {
        temporaryEffectEditor.selectedEffect.StartActions.splice(rowId, 1);
        TemporaryEffectEditor.Render();
    }

    static AddStartAction()
    {
        var action = $("#add_start_action").val();
        (<HTMLSelectElement>$("#add_start_action").first()).selectedIndex = 0;
        temporaryEffectEditor.selectedEffect.StartActions.push({ Name: action, Values: [] });
        TemporaryEffectEditor.Render();
    }

    static ChangeEndAction(id: number, pos: number)
    {
        temporaryEffectEditor.selectedEffect.EndActions[id].Values[pos] = $("#ChangeEndAction_" + id + "_" + pos).val();
    }

    static DeleteEndAction(rowId)
    {
        temporaryEffectEditor.selectedEffect.EndActions.splice(rowId, 1);
        TemporaryEffectEditor.Render();
    }

    static AddEndAction()
    {
        var action = $("#add_end_action").val();
        (<HTMLSelectElement>$("#add_end_action").first()).selectedIndex = 0;
        temporaryEffectEditor.selectedEffect.EndActions.push({ Name: action, Values: [] });
        TemporaryEffectEditor.Render();
    }

    static ChangeRecuringAction(id: number, pos: number)
    {
        temporaryEffectEditor.selectedEffect.RecurringActions[id].Values[pos] = $("#ChangeRecuringAction_" + id + "_" + pos).val();
    }

    static DeleteRecuringAction(rowId)
    {
        temporaryEffectEditor.selectedEffect.RecurringActions.splice(rowId, 1);
        TemporaryEffectEditor.Render();
    }

    static AddRecuringAction()
    {
        var action = $("#add_recuring_action").val();
        (<HTMLSelectElement>$("#add_recuring_action").first()).selectedIndex = 0;
        temporaryEffectEditor.selectedEffect.RecurringActions.push({ Name: action, Values: [] });
        TemporaryEffectEditor.Render();
    }

    static Change(name: string)
    {
        var val = $("#obj_" + name).val().trim();

        if (name == 'Name')
        {
            var newName = val;

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetTemporaryEffect(newName) && world.GetTemporaryEffect(newName) != temporaryEffectEditor.selectedEffect))
            {
                $("#obj_" + name).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#obj_" + name).css('backgroundColor', '');
        }

        if (typeof temporaryEffectEditor.selectedEffect[name] == 'number')
            temporaryEffectEditor.selectedEffect[name] = parseInt($("#obj_" + name).val());
        else if (typeof temporaryEffectEditor.selectedEffect[name] == 'boolean')
            temporaryEffectEditor.selectedEffect[name] = (val == "yes");
        else
            temporaryEffectEditor.selectedEffect[name] = val;

        if (name == "Name" && val != "")
        {
            $("#effectParameters > h1").html(val);
            temporaryEffectEditor.selector.UpdateList();
            SearchPanel.Update();
        }
    }

    static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this temporary effect?", () =>
        {
            for (var i = 0; i < world.TemporaryEffects.length; i++)
            {
                if (world.TemporaryEffects[i] == temporaryEffectEditor.selectedEffect)
                {
                    world.TemporaryEffects.splice(i, 1);
                    break;
                }
            }

            temporaryEffectEditor.selector.UpdateList();
            temporaryEffectEditor.selector.Select(0);
            SearchPanel.Update();
        });
    }

    static Add()
    {
        var nextId = world.Skills.length;
        while (world.GetTemporaryEffect("effect_" + nextId))
            nextId++;
        var effect = new TemporaryEffect();
        effect.Name = "effect_" + nextId;
        world.TemporaryEffects.push(effect);
        temporaryEffectEditor.selector.UpdateList();
        temporaryEffectEditor.selector.Select(world.TemporaryEffects.length - 1);
        SearchPanel.Update();
    }

    static Clone()
    {
        if (!temporaryEffectEditor.selectedEffect)
            return;
        var nextId = world.Skills.length;
        while (world.GetTemporaryEffect("effect_" + nextId))
            nextId++;
        var effect = JSON.parse(JSON.stringify(temporaryEffectEditor.selectedEffect));
        effect.Name = "effect_" + nextId;

        world.TemporaryEffects.push(effect);
        temporaryEffectEditor.selector.UpdateList();
        temporaryEffectEditor.selector.Select(world.TemporaryEffects.length - 1);
        SearchPanel.Update();
    }
}