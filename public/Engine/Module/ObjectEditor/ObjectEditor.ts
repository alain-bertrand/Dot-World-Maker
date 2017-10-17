var objectEditor = new (class
{
    public listObject: ListSelector;
    public selected: number;
    editor: CodeMirror.EditorFromTextArea = null;
});

class ObjectEditor
{
    public static Dispose()
    {
        if (objectEditor.listObject)
            objectEditor.listObject.Dispose();
        objectEditor.listObject = null;
        objectEditor.editor = null;
        $(window).unbind("resize", ObjectEditor.Resize);
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
            $("#listObject").css("top", "5px");
            $("#objectDetails").css("top", "5px");
        }

        objectEditor.listObject = new ListSelector("listObject", world.InventoryObjects, "Name");
        objectEditor.listObject.OnSelect = ObjectEditor.Select;
        $(window).bind("resize", ObjectEditor.Resize);

        dialogCondition.currentEditor = "ObjectEditor";
        dialogAction.currentEditor = "ObjectEditor";

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.InventoryObjects.length; i++)
            {
                if (world.InventoryObjects[i].Name == framework.CurrentUrl.id)
                {
                    objectEditor.listObject.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "ObjectEditor"
                });
                objectEditor.listObject.Select(null);
                return;
            }
        }
        else
            objectEditor.listObject.Select(null);
    }

    static Resize()
    {
        try
        {
            $("#obj_codecontainer").width($("#objectDetails table tr > td:nth-child(2)").width() - 3);
        }
        catch (ex)
        {
        }
    }

    static Select(rowId: number)
    {
        Framework.SetLocation({
            action: "ObjectEditor", id: rowId === null ? null : world.InventoryObjects[rowId].Name
        });
        if (rowId < 0 || rowId === null)
        {
            objectEditor.selected = null;
            $("#objectDetails").html("");
            return;
        }

        objectEditor.selected = rowId;
        ObjectEditor.Display();
    }

    static Display()
    {
        var object = world.InventoryObjects[objectEditor.selected];
        if (!object.Slots)
            object.Slots = [];

        var html = "";
        html = "<h1>" + object.Name + "</h1>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='obj_name' value='" + object.Name.htmlEntities() + "' onkeyup='ObjectEditor.Change(\"Name\")'></td></tr>";
        html += "<tr><td>Type:</td><td><select id='obj_objecttype' onchange='ObjectEditor.Change(\"ObjectType\");'>";
        var names: string[] = [];
        for (var i = 0; i < world.InventoryObjectTypes.length; i++)
            names.push(world.InventoryObjectTypes[i].Name);
        names.sort();
        for (var i = 0; i < names.length; i++)
            html += "<option value='" + names[i] + "'" + (names[i] == object.ObjectType ? " selected" : "") + ">" + names[i] + "</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Slots:</td><td><select id='obj_slots' onchange='ObjectEditor.Change(\"Slots\");' size='5' multiple>";
        world.InventorySlots.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        for (var i = 0; i < world.InventorySlots.length; i++)
            html += "<option" + (object.Slots.indexOf(world.InventorySlots[i].Name) != -1 ? " selected" : "") + ">" + world.InventorySlots[i].Name + "</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Image:</td><td>" + (object.Image ? "<img src='" + object.Image + "' width='32' height='32' style='vertical-align: middle;'>" : "<img src='/art/tileset2/inventory_object.png' width='32' height='32' style='vertical-align: middle;'>") + "<span class='button' onclick='ObjectEditor.ShowUpload()'>" + (Main.CheckNW() ? "Set" : "Upload") + "</span><span class='button' onclick='ObjectEditor.EditImage()'>Edit Image</span></td></tr>";
        html += "<tr><td>Weight:</td><td><input type='text' id='obj_weight' value='" + object.Weight + "' onkeyup='ObjectEditor.Change(\"Weight\")'></td></tr>";
        html += "<tr><td>Description:</td><td><input type='text' id='obj_description' value='" + object.Description.htmlEntities() + "' onkeyup='ObjectEditor.Change(\"Description\")'></td></tr>";
        html += "<tr><td>MaxStack:</td><td><input type='text' id='obj_maxstack' value='" + (object.MaxStack ? object.MaxStack : 1) + "' onkeyup='ObjectEditor.Change(\"MaxStack\")'></td></tr>";
        for (var i = 0; i < object.Parameters.length; i++)
        {
            html += "<tr><td>" + object.Parameters[i].Name + ":</td>";
            html += "<td><input  id='param_value_" + i + "' type='text' value='" + object.Parameters[i].Value + "' onkeyup='ObjectEditor.ChangeParam(" + i + ",\"Value\");'></td>";
            html += "</tr>";
        }
        html += "<tr><td>Action Name:</td><td><input type='text' id='obj_action' value='" + (object.Action ? object.Action : "").htmlEntities() + "' onkeyup='ObjectEditor.Change(\"Action\")'></td></tr>";

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
            for (var i = 0; i < object.WearConditions.length; i++)
            {
                var cond: DialogCondition = object.WearConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectEditor.DeleteWearCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeWearCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_wear_condition' onchange='ObjectEditor.AddWearCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- UNWEAR CONDITION
            if (!object.UnwearConditions)
                object.UnwearConditions = [];
            html += "<tr><td>Unwear Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < object.UnwearConditions.length; i++)
            {
                var cond: DialogCondition = object.UnwearConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectEditor.DeleteUnwearCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeUnwearCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_unwear_condition' onchange='ObjectEditor.AddUnwearCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- DROP CONDITION
            html += "<tr><td>Drop Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < object.DropConditions.length; i++)
            {
                var cond: DialogCondition = object.DropConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectEditor.DeleteDropCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeDropCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_drop_condition' onchange='ObjectEditor.AddDropCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- USAGE CONDITION
            html += "<tr><td>Usage Conditions:</td><td>&nbsp;</td>";
            for (var i = 0; i < object.UsageConditions.length; i++)
            {
                var cond: DialogCondition = object.UsageConditions[i];
                html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectEditor.DeleteUsageCondition(" + i + ")'>X</span></td>";
                html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeUsageCondition") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_usage_condition' onchange='ObjectEditor.AddUsageCondition()'>";
            html += "<option value=''>- Add new condition --</option>";
            for (var i = 0; i < conditions.length; i++)
                html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
            html += "</select></td></tr>";

            //---------------------- USAGE ACTION
            html += "<tr><td>Usage Action:</td><td>&nbsp;</td>";
            for (var i = 0; i < object.UsageActions.length; i++)
            {
                var action: DialogAction = object.UsageActions[i];
                html += "<tr><td>" + action.Name.title() + ": <span class='dialogBlockDelete' onclick='ObjectEditor.DeleteUsageAction(" + i + ")'>X</span></td>";
                html += "<td>" + dialogAction.code[action.Name].Display(i, action.Values, "ChangeUsageAction") + "</td></tr>";

            }
            html += "<tr><td colspan='2'><select id='add_usage_action' onchange='ObjectEditor.AddUsageAction()'>";
            html += "<option value=''>- Add new action --</option>";
            for (var i = 0; i < actions.length; i++)
                html += "<option value='" + actions[i] + "'>" + actions[i].title() + "</option>";
            html += "</select></td></tr>";

        }
        else
            html += "<tr><td>Action Code:</td><td><div id='obj_codecontainer'><textarea type='text' id='obj_actioncode' rows='10' onkeyup='ObjectEditor.Change(\"ActionCode\")'>" + (object.ActionCode ? object.ActionCode : "").htmlEntities() + "</textarea></div></td></tr>";
        html += "</table>";
        $("#objectDetails").html(html);

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

            objectEditor.editor.on('change', ObjectEditor.ChangeCode);
        }

        $("#obj_codecontainer").width($("#objectDetails table tr > td:nth-child(2)").width() - 3);
    }

    static ChangeWearCondition(id: number, pos: number)
    {
        world.InventoryObjects[objectEditor.selected].WearConditions[id].Values[pos] = $("#ChangeWearCondition_" + id + "_" + pos).val();
    }

    static DeleteWearCondition(rowId)
    {
        world.InventoryObjects[objectEditor.selected].WearConditions.splice(rowId, 1);
        ObjectEditor.Display();
    }

    static AddWearCondition()
    {
        var condition = $("#add_wear_condition").val();
        (<HTMLSelectElement>$("#add_wear_condition").first()).selectedIndex = 0;
        var object = world.InventoryObjects[objectEditor.selected];
        object.WearConditions.push({ Name: condition, Values: [] });
        ObjectEditor.Display();
    }

    static ChangeUnwearCondition(id: number, pos: number)
    {
        world.InventoryObjects[objectEditor.selected].UnwearConditions[id].Values[pos] = $("#ChangeUnwearCondition_" + id + "_" + pos).val();
    }

    static DeleteUnwearCondition(rowId)
    {
        world.InventoryObjects[objectEditor.selected].UnwearConditions.splice(rowId, 1);
        ObjectEditor.Display();
    }

    static AddUnwearCondition()
    {
        var condition = $("#add_unwear_condition").val();
        (<HTMLSelectElement>$("#add_unwear_condition").first()).selectedIndex = 0;
        var object = world.InventoryObjects[objectEditor.selected];
        object.UnwearConditions.push({ Name: condition, Values: [] });
        ObjectEditor.Display();
    }

    static ChangeDropCondition(id: number, pos: number)
    {
        world.InventoryObjects[objectEditor.selected].DropConditions[id].Values[pos] = $("#ChangeDropCondition_" + id + "_" + pos).val();
    }

    static DeleteDropCondition(rowId)
    {
        world.InventoryObjects[objectEditor.selected].DropConditions.splice(rowId, 1);
        ObjectEditor.Display();
    }

    static AddDropCondition()
    {
        var condition = $("#add_drop_condition").val();
        (<HTMLSelectElement>$("#add_drop_condition").first()).selectedIndex = 0;
        var object = world.InventoryObjects[objectEditor.selected];
        object.DropConditions.push({ Name: condition, Values: [] });
        ObjectEditor.Display();
    }

    static ChangeUsageAction(id: number, pos: number)
    {
        world.InventoryObjects[objectEditor.selected].UsageActions[id].Values[pos] = $("#ChangeUsageAction_" + id + "_" + pos).val();
    }

    static DeleteUsageAction(rowId)
    {
        world.InventoryObjects[objectEditor.selected].UsageActions.splice(rowId, 1);
        ObjectEditor.Display();
    }

    static AddUsageAction()
    {
        var condition = $("#add_usage_action").val();
        (<HTMLSelectElement>$("#add_usage_action").first()).selectedIndex = 0;
        var object = world.InventoryObjects[objectEditor.selected];
        object.UsageActions.push({ Name: condition, Values: [] });
        ObjectEditor.Display();
    }

    static ChangeUsageCondition(id: number, pos: number)
    {
        world.InventoryObjects[objectEditor.selected].UsageConditions[id].Values[pos] = $("#ChangeUsageCondition_" + id + "_" + pos).val();
    }

    static DeleteUsageCondition(rowId)
    {
        world.InventoryObjects[objectEditor.selected].UsageConditions.splice(rowId, 1);
        ObjectEditor.Display();
    }

    static AddUsageCondition()
    {
        var condition = $("#add_usage_condition").val();
        (<HTMLSelectElement>$("#add_usage_condition").first()).selectedIndex = 0;
        var object = world.InventoryObjects[objectEditor.selected];
        object.UsageConditions.push({ Name: condition, Values: [] });
        ObjectEditor.Display();
    }

    static ChangeCode()
    {
        var object = world.InventoryObjects[objectEditor.selected];
        object.ActionCode = objectEditor.editor.getValue();
    }

    static ChangeParam(id: number, param: string)
    {
        var object = world.InventoryObjects[objectEditor.selected];
        object.Parameters[id][param] = $("#param_" + param.toLowerCase() + "_" + id).val();
    }

    static Change(param: string)
    {
        var object = world.InventoryObjects[objectEditor.selected];
        var oldName = object.Name;

        if (param == 'Name')
        {
            var newName = $("#obj_" + param.toLowerCase()).val();

            if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.GetInventoryObject(newName) && world.GetInventoryObject(newName) != world.InventoryObjects[objectEditor.selected]))
            {
                $("#obj_" + param.toLowerCase()).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#obj_" + param.toLowerCase()).css('backgroundColor', '');
        }

        if (typeof object[param] == 'number')
            object[param] = parseFloat($("#obj_" + param.toLowerCase()).val());
        else
            object[param] = $("#obj_" + param.toLowerCase()).val();

        switch (param)
        {
            case "ObjectType":
                var oldParams = object.Parameters.slice();
                var objType: ObjectType = null;
                for (var i = 0; i < world.InventoryObjectTypes.length; i++)
                {
                    if (world.InventoryObjectTypes[i].Name == object.ObjectType)
                    {
                        objType = world.InventoryObjectTypes[i];
                        break;
                    }
                }
                if (objType)
                {
                    var newParams: ObjectParameter[] = [];
                    for (var i = 0; i < objType.Parameters.length; i++)
                    {
                        var found = false;
                        for (var j = 0; j < oldParams.length; j++)
                        {
                            if (oldParams[j].Name == objType.Parameters[i].Name)
                            {
                                newParams.push(oldParams[j]);
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            newParams.push(new ObjectParameter(objType.Parameters[i].Name, objType.Parameters[i].DefaultValue));
                    }
                    object.Parameters = newParams;
                    ObjectEditor.Display();
                }
                break;
            case "Price":
                object.Weight = Math.max(0, (isNaN(object.Price) ? 0 : object.Price));
                break;
            case "Weight":
                object.Weight = Math.max(0, (isNaN(object.Weight) ? 0 : object.Weight));
                break;
            case "MaxStack":
                object.MaxStack = Math.max(1, Math.round(isNaN(object.MaxStack) ? 1 : object.MaxStack));
                break;
            case "Name":
                objectEditor.listObject.UpdateList();
                $("#objectDetails > h1").html(object.Name);
                SearchPanel.Update();
                break;
            default:
                break;
        }
    }

    static New()
    {
        var firstType = world.InventoryObjectTypes[0];
        var parameters: ObjectParameter[] = [];
        for (var i = 0; i < firstType.Parameters.length; i++)
            parameters.push(new ObjectParameter(firstType.Parameters[i].Name, firstType.Parameters[i].DefaultValue));

        var newObject = new KnownObject("Object " + world.InventoryObjects.length, firstType.Name, [], 0, 0, "", 1, null, null, parameters);
        newObject.ActionCode = "// Uncomment the functions you want to define.\n\
// This functions will overwrite the object type functions if they exist.\n\
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
        world.InventoryObjects.push(newObject);
        objectEditor.listObject.UpdateList();
        objectEditor.listObject.Select(world.InventoryObjects.length - 1);
        SearchPanel.Update();
    }

    static Delete()
    {
        if (objectEditor.selected == null)
            return;
        Framework.Confirm("Are you sure you want to delete this object?", () =>
        {
            world.InventoryObjects.splice(objectEditor.selected, 1);
            objectEditor.listObject.UpdateList();
            objectEditor.listObject.Select(-1);
            SearchPanel.Update();
        });
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ObjectEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        world.InventoryObjects[objectEditor.selected].Image = $("#fileOpenDialog").val() + "?v=" + Math.round((new Date()).getTime() / 1000);
        ObjectEditor.Display();
        $("#fileOpenDialog").unbind("change", ObjectEditor.ImportFileImage).val("");
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
            world.InventoryObjects[objectEditor.selected].Image = data.new_file + "?v=" + Math.round((new Date()).getTime() / 1000);
            ObjectEditor.Display();
        }
    }

    static EditImage()
    {
        Framework.SetLocation({
            action: "PixelEditor",
            file: world.InventoryObjects[objectEditor.selected].Image ? world.InventoryObjects[objectEditor.selected].Image : '/art/tileset2/inventory_object.png',
            type: "inventory",
            object: world.InventoryObjects[objectEditor.selected].Name
        }, false);
    }
}