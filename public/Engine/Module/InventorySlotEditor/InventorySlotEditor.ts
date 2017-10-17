var inventorySlotEditor = new (class
{
    public listObject: ListSelector;
    public selected: number;
});

class InventorySlotEditor
{
    public static Dispose()
    {
        if (inventorySlotEditor.listObject)
            inventorySlotEditor.listObject.Dispose();
        inventorySlotEditor.listObject = null;
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
            $("#listSlots").css("top", "5px");
            $("#slotDetails").css("top", "5px");
        }

        inventorySlotEditor.listObject = new ListSelector("listSlots", world.InventorySlots, "Name");
        inventorySlotEditor.listObject.OnSelect = InventorySlotEditor.Select;
        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.InventorySlots.length; i++)
            {
                if (world.InventorySlots[i].Name == framework.CurrentUrl.id)
                {
                    inventorySlotEditor.listObject.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "GenericCodeEditor"
                });
                inventorySlotEditor.listObject.Select(null);
                return;
            }
        }
        else
            inventorySlotEditor.listObject.Select(null);
    }

    static Select(rowId: number)
    {
        Framework.SetLocation({
            action: "InventorySlotEditor", id: rowId === null ? null : world.InventorySlots[rowId].Name
        });
        if (rowId < 0 || rowId === null)
        {
            inventorySlotEditor.selected = null;
            $("#slotDetails").html("");
            return;
        }

        inventorySlotEditor.selected = rowId;
        InventorySlotEditor.Display();
    }

    static Display()
    {
        var slot = world.InventorySlots[inventorySlotEditor.selected];

        var html = "";
        html = "<h1>" + slot.Name + "</h1>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='obj_name' value='" + slot.Name.htmlEntities() + "' onkeyup='InventorySlotEditor.Change(\"Name\")'></td></tr>";
        $("#slotDetails").html(html);
    }

    static Change(param: string)
    {
        var slot = world.InventorySlots[inventorySlotEditor.selected];
        var oldName = slot.Name;
        if (typeof slot[param] == 'number')
            slot[param] = parseFloat($("#obj_" + param.toLowerCase()).val());
        else if (param == "Name")
        {
            var val = $("#obj_" + param.toLowerCase()).val();

            if ((val.match(databaseNameRule) || !val || val.length < 1) || (world.GetInventorySlot(val) && world.GetInventorySlot(val) != world.InventorySlots[inventorySlotEditor.selected]))
            {
                $("#obj_" + param.toLowerCase()).css('backgroundColor', '#FFE0E0');
                return;
            }

            $("#obj_" + param.toLowerCase()).css('backgroundColor', '');

            if (!val || val.trim() == "")
                return;
            // Verify that this name is not already used.
            for (var i = 0; i < world.InventorySlots.length; i++)
                if (world.InventorySlots[i].Name.toLowerCase() == val.toLowerCase())
                    return;
            var newName = val;
            slot[param] = val;
            for (var i = 0; i < world.InventoryObjects.length; i++)
            {
                for (var j = 0; j < world.InventoryObjects[i].Slots.length; j++)
                {
                    if (world.InventoryObjects[i].Slots[j] == oldName)
                        world.InventoryObjects[i].Slots[j] = newName;
                }
            }
        }
        else
            slot[param] = $("#obj_" + param.toLowerCase()).val();

        switch (param)
        {
            case "Name":

                inventorySlotEditor.listObject.UpdateList();
                SearchPanel.Update();
                $("#slotDetails > h1").html(slot.Name);

                // Change all the used slot with the new name
                for (var i = 0; i < world.InventoryObjects.length; i++)
                {
                    if (world.InventoryObjects[i].Slots && world.InventoryObjects[i].Slots.indexOf(oldName) != -1)
                        world.InventoryObjects[i].Slots[world.InventoryObjects[i].Slots.indexOf(oldName)] = slot.Name;
                }
                break;
            default:
                break;
        }
    }

    static New()
    {
        world.InventorySlots.push(new InventorySlot("Slot " + world.InventorySlots.length));
        inventorySlotEditor.listObject.UpdateList();
        inventorySlotEditor.listObject.Select(world.InventoryObjects.length - 1);
        SearchPanel.Update();
    }

    static Delete()
    {
        if (inventorySlotEditor.selected == null)
            return;
        Framework.Confirm("Are you sure you want to delete this slot?", () =>
        {
            var oldName = world.InventorySlots[inventorySlotEditor.selected].Name;
            world.InventorySlots.splice(inventorySlotEditor.selected, 1);
            inventorySlotEditor.listObject.UpdateList();
            inventorySlotEditor.listObject.Select(-1);
            SearchPanel.Update();

            for (var i = 0; i < world.InventoryObjects.length; i++)
            {
                for (var j = 0; j < world.InventoryObjects[i].Slots.length;)
                {
                    if (world.InventoryObjects[i].Slots[j] == oldName)
                        world.InventoryObjects[i].Slots.splice(j, 1);
                    else
                        j++;
                }
            }
        });
    }
}