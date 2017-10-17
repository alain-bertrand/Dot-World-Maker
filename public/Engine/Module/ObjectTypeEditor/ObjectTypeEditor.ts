var objectTypeEditor = new (class
{
    public listObjectType: ListSelector;
    public selected: number;
    editor: CodeMirror.EditorFromTextArea = null;
});

class ObjectTypeEditor
{
    public static Dispose()
    {
        if (objectTypeEditor.listObjectType)
            objectTypeEditor.listObjectType.Dispose();
        objectTypeEditor.listObjectType = null;
        $(window).unbind("resize", ObjectTypeEditor.Resize);
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
            $("#listObjectType").css("top", "5px");
            $("#objectTypeDetails").css("top", "5px");
        }

        objectTypeEditor.listObjectType = new ListSelector("listObjectType", world.InventoryObjectTypes, "Name");
        objectTypeEditor.listObjectType.OnSelect = ObjectTypeEditor.Select;
        $(window).bind("resize", ObjectTypeEditor.Resize);

        dialogCondition.currentEditor = "ObjectTypeEditor";
        dialogAction.currentEditor = "ObjectTypeEditor";

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.InventoryObjectTypes.length; i++)
            {
                if (world.InventoryObjectTypes[i].Name == framework.CurrentUrl.id)
                {
                    objectTypeEditor.listObjectType.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "ObjectTypeEditor"
                });
                objectTypeEditor.listObjectType.Select(null);
                return;
            }
        }
        else
            objectTypeEditor.listObjectType.Select(null);
    }

    static Resize()
    {
        try
        {
            $("#obj_codecontainer").width($("#objectTypeDetails table tr > td:nth-child(2)").width() - 3);
        }
        catch (ex)
        {
        }
    }

    static Select(rowId: number)
    {
        Framework.SetLocation({
            action: "ObjectTypeEditor", id: rowId === null ? null : world.InventoryObjectTypes[rowId].Name
        });
        if (rowId < 0 || rowId === null)
        {
            objectTypeEditor.selected = null;
            $("#objectTypeDetails").html("");
            return;
        }

        objectTypeEditor.selected = rowId;
        ObjectTypeEditor.Display();
    }

    static Display()
    {
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];

        var html = "";
        html = "<h1>" + objectType.Name + "</h1>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='obj_name' value='" + objectType.Name.htmlEntities() + "' onkeyup='ObjectTypeEditor.Change(\"Name\")'></td></tr>";
        html += "<tr><td>Group:</td><td><input type='text' id='obj_group' value='" + objectType.Group.htmlEntities() + "' onkeyup='ObjectTypeEditor.Change(\"Group\")'></td></tr>";
        for (var i = 0; i < objectType.Parameters.length; i++)
        {
            html += "<tr><td><input id='param_name_" + i + "' type='text' value='" + objectType.Parameters[i].Name + "' onkeyup='ObjectTypeEditor.ChangeParam(" + i + ",\"Name\");'></td>";
            html += "<td><input  id='param_defaultvalue_" + i + "' type='text' value='" + objectType.Parameters[i].DefaultValue + "' onkeyup='ObjectTypeEditor.ChangeParam(" + i + ",\"DefaultValue\");'></td>";
            html += "<td><div class='button' onclick='ObjectTypeEditor.RemoveParameter(" + i + ");'>Remove</div></td>";
            html += "</tr>";
        }
        html += "<tr><td>Action Name:</td><td><input type='text' id='obj_action' value='" + (objectType.Action ? objectType.Action : "").htmlEntities() + "' onkeyup='ObjectTypeEditor.Change(\"Action\")'></td></tr>";

        if (world.SimplifiedObjectLogic)
        {
            var conditions = [];
            for (var item in dialogCondition.code)
                conditions.push(item);
            conditions.sort();

            var actions = [];
            for (var item in dialogAction.code)
                actions.push(item);
            actions.sort();

            //---------------------- WEAR CONDITION
            html += "<tr><td>Wear Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < objectType.WearConditions.length; i++)
            {
                var cond: DialogCondition = objectType.WearConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectTypeEditor.DeleteWearCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeWearCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_wear_condition' onchange='ObjectTypeEditor.AddWearCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- UNWEAR CONDITION
            html += "<tr><td>Unwear Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < objectType.UnwearConditions.length; i++)
            {
                var cond: DialogCondition = objectType.UnwearConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectTypeEditor.DeleteUnwearCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeUnwearCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_unwear_condition' onchange='ObjectTypeEditor.AddUnwearCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- DROP CONDITION
            html += "<tr><td>Drop Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < objectType.DropConditions.length; i++)
            {
                var cond: DialogCondition = objectType.DropConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectTypeEditor.DeleteDropCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeDropCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_drop_condition' onchange='ObjectTypeEditor.AddDropCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- USAGE CONDITION
            html += "<tr><td>Usage Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < objectType.UsageConditions.length; i++)
            {
                var cond: DialogCondition = objectType.UsageConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectTypeEditor.DeleteUsageCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeUsageCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_usage_condition' onchange='ObjectTypeEditor.AddUsageCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- USAGE ACTION
            html += "<tr><td>Usage Action:</td><td>&nbsp;</td>";
            for (var i = 0; i < objectType.UsageActions.length; i++)
            {
                var action: DialogAction = objectType.UsageActions[i];
                html += "<tr><td>" + action.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectTypeEditor.DeleteUsageAction(" + i + ")'>X</span></td>";
                html += "<td>" + dialogAction.code[action.Name].Display(i, action.Values, "ChangeUsageAction") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_usage_action' onchange='ObjectTypeEditor.AddUsageAction()'>";
            html += "<option value=''>- Add new action --</option>";
            for (var i = 0; i < actions.length; i++)
                html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
            html += "</select></td></tr>";

        }
        else
            html += "<tr><td>Action Code:</td><td><div id='obj_codecontainer'><textarea type='text' id='obj_actioncode' rows='10' onkeyup='ObjectTypeEditor.Change(\"ActionCode\")'>" + (objectType.ActionCode ? objectType.ActionCode : "").htmlEntities() + "</textarea></div></td></tr>";
        html += "</table>";
        $("#objectTypeDetails").html(html);

        if (!world.SimplifiedObjectLogic)
        {
            objectEditor.editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$("#obj_actioncode").first(),
                {
                    lineNumbers: true,
                    matchBrackets: true,
                    continueComments: "Enter",
                    tabSize: 4,
                    indentUnit: 4,
                    extraKeys: { "Ctrl-Q": "toggleComment" }
                });

            objectEditor.editor.on('change', ObjectTypeEditor.ChangeCode);
        }

        $("#obj_codecontainer").width($("#objectTypeDetails table tr > td:nth-child(2)").width() - 3);
    }

    static ChangeWearCondition(id: number, pos: number)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].WearConditions[id].Values[pos] = $("#ChangeWearCondition_" + id + "_" + pos).val();
    }

    static DeleteWearCondition(rowId)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].WearConditions.splice(rowId, 1);
        ObjectTypeEditor.Display();
    }

    static AddWearCondition()
    {
        var condition = $("#add_wear_condition").val();
        (<HTMLSelectElement>$("#add_wear_condition").first()).selectedIndex = 0;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.WearConditions.push({ Name: condition, Values: [] });
        ObjectTypeEditor.Display();
    }

    static ChangeUnwearCondition(id: number, pos: number)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UnwearConditions[id].Values[pos] = $("#ChangeUnwearCondition_" + id + "_" + pos).val();
    }

    static DeleteUnwearCondition(rowId)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UnwearConditions.splice(rowId, 1);
        ObjectTypeEditor.Display();
    }

    static AddUnwearCondition()
    {
        var condition = $("#add_unwear_condition").val();
        (<HTMLSelectElement>$("#add_unwear_condition").first()).selectedIndex = 0;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.UnwearConditions.push({ Name: condition, Values: [] });
        ObjectTypeEditor.Display();
    }

    static ChangeDropCondition(id: number, pos: number)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].DropConditions[id].Values[pos] = $("#ChangeDropCondition_" + id + "_" + pos).val();
    }

    static DeleteDropCondition(rowId)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].DropConditions.splice(rowId, 1);
        ObjectTypeEditor.Display();
    }

    static AddDropCondition()
    {
        var condition = $("#add_drop_condition").val();
        (<HTMLSelectElement>$("#add_drop_condition").first()).selectedIndex = 0;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.DropConditions.push({ Name: condition, Values: [] });
        ObjectTypeEditor.Display();
    }

    static ChangeUsageAction(id: number, pos: number)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UsageActions[id].Values[pos] = $("#ChangeUsageAction_" + id + "_" + pos).val();
    }

    static DeleteUsageAction(rowId)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UsageActions.splice(rowId, 1);
        ObjectTypeEditor.Display();
    }

    static AddUsageAction()
    {
        var condition = $("#add_usage_action").val();
        (<HTMLSelectElement>$("#add_usage_action").first()).selectedIndex = 0;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.UsageActions.push({ Name: condition, Values: [] });
        ObjectTypeEditor.Display();
    }

    static ChangeUsageCondition(id: number, pos: number)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UsageConditions[id].Values[pos] = $("#ChangeUsageCondition_" + id + "_" + pos).val();
    }

    static DeleteUsageCondition(rowId)
    {
        world.InventoryObjectTypes[objectTypeEditor.selected].UsageConditions.splice(rowId, 1);
        ObjectTypeEditor.Display();
    }

    static AddUsageCondition()
    {
        var condition = $("#add_usage_condition").val();
        (<HTMLSelectElement>$("#add_usage_condition").first()).selectedIndex = 0;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.UsageConditions.push({ Name: condition, Values: [] });
        ObjectTypeEditor.Display();
    }

    static AddParameter()
    {
        if (!objectTypeEditor.selected)
            return;
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.Parameters.push(new ObjectDefinedParameter("Param" + (objectType.Parameters.length + 1), "1"));
        ObjectTypeEditor.Display();
    }

    static RemoveParameter(id: number)
    {
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.Parameters.splice(id, 1);
        ObjectTypeEditor.Display();
    }

    static ChangeCode()
    {
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.ActionCode = objectEditor.editor.getValue();
    }

    static ChangeParam(id: number, param: string)
    {
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        objectType.Parameters[id][param] = $("#param_" + param.toLowerCase() + "_" + id).val();
    }

    static Change(param: string)
    {
        var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];
        var oldName = objectType.Name;

        if (param == 'Name')
        {
            var newName = $("#obj_" + param.toLowerCase()).val();

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetInventoryObjectType(newName) && world.GetInventoryObjectType(newName) != world.InventoryObjectTypes[objectTypeEditor.selected]))
            {
                $("#obj_" + param.toLowerCase()).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#obj_" + param.toLowerCase()).css('backgroundColor', '');
        }

        objectType[param] = $("#obj_" + param.toLowerCase()).val();

        if (param == "Name")
        {
            objectTypeEditor.listObjectType.UpdateList();
            for (var i = 0; i < world.InventoryObjects.length; i++)
                if (world.InventoryObjects[i].ObjectType == oldName)
                    world.InventoryObjects[i].ObjectType = objectType.Name;
            SearchPanel.Update();
        }
    }

    static New()
    {
        var newObjectType = new ObjectType("ObjType " + world.InventoryObjectTypes.length, "Group", null, null, []);
        newObjectType.ActionCode = "// Uncomment the functions you want to define.\n\
\n\
// Checks if the player can unwear the item\n\
// function CanUnwear(itemName)\n\
// {\n\
//      return true;\n\
// }\n\
\n\
// Checks if the player can wear the item\n\
// function CanWear(itemName)\n\
// {\n\
//      return true;\n\
// }\n\
\n\
// Checks if the player can use the item\n\
// function CanUse(itemName)\n\
// {\n\
//      return true;\n\
// }\n\
\n\
// Checks if the player can drop the item\n\
// function CanDrop(itemName)\n\
// {\n\
//      return true;\n\
// }\n\
\n\
// Executed when the player uses the item\n\
// function Use(itemName)\n\
// {\n\
// }\n\
";

        world.InventoryObjectTypes.push(newObjectType);
        objectTypeEditor.listObjectType.UpdateList();
        objectTypeEditor.listObjectType.Select(world.InventoryObjectTypes.length - 1);
        SearchPanel.Update();
    }

    static Delete()
    {
        if (objectTypeEditor.selected == null)
            return;
        Framework.Confirm("Are you sure you want to delete this object type and all the objects using it?", () =>
        {
            var objectType = world.InventoryObjectTypes[objectTypeEditor.selected];

            for (var i = 0; i < world.InventoryObjects.length;)
            {
                if (world.InventoryObjects[i].ObjectType == objectType.Name)
                    world.InventoryObjects.splice(i, 1);
                else
                    i++;
            }

            world.InventoryObjectTypes.splice(objectTypeEditor.selected, 1);
            objectTypeEditor.listObjectType.UpdateList();
            objectTypeEditor.listObjectType.Select(-1);
            SearchPanel.Update();
        });
    }
}