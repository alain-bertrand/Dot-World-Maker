var inventoryMenu = new (class
{
    public inventoryDisplayed: boolean = false;
});

class InventoryMenu
{
    public static AdditionalCSS(): string
    {
        return "#inventoryIcon\n\
{\n\
    position: absolute;\n\
    left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 80px;\n\
}\n\
#inventoryIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
#inventoryObjectDetails\n\
{\n\
    position: absolute;\n\
    left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
    bottom: "+ parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
    overflow: hidden;\n\
    height: 150px;\n\
    padding: 7px;\n\
    box-sizing: border-box;\n\
}\n\
\n\
#inventoryObjectList\n\
{\n\
    position: absolute;\n\
    left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
    top: "+ parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
    bottom: "+ (parseInt("" + world.art.panelStyle.bottomBorder) + 150) + "px;\n\
    overflow-y: scroll;\n\
}\n\
\n\
#inventoryObjectList h1\n\
{\n\
    border-bottom: solid 1px "+ Main.EnsureColor(world.art.panelStyle.contentColor) +";\n\
    margin-bottom: 5px;\n\
}\n\
";
    }

    public static Init(position: number): number
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW())|| (world && world.ShowInventory === false)))
        {
            $("#inventoryIcon").hide();
            return position;
        }

        $("#inventoryIcon").css("top", position + "px");
        if (game)
            $("#inventoryIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/inventory_icon.png'>");
        else
            $("#inventoryIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/inventory_icon.png'>");
        return position + 64 + world.art.panelStyle.topBorder;
    }

    static Toggle()
    {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowInventory === false)))
            return;

        $("#profileIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;

        if (inventoryMenu.inventoryDisplayed)
        {
            $("#gameMenuPanel").hide();
            $("#inventoryIcon").removeClass("openPanelIcon");
            inventoryMenu.inventoryDisplayed = false;
        }
        else
        {
            inventoryMenu.inventoryDisplayed = true;
            $("#gameMenuPanel").show();
            $("#inventoryIcon").addClass("openPanelIcon");
            InventoryMenu.Update();
        }
    }

    public static Update()
    {
        if (!inventoryMenu.inventoryDisplayed)
            return;

        var html = "";

        var wearSomething = false;
        for (var slot in world.Player.EquipedObjects)
        {
            wearSomething = true;
            break;
        }

        html += "<div id='inventoryObjectList'>";
        if (wearSomething)
        {
            html += "<h1>Wearing</h1>";
            html += "<table class='inventoryList'>";
            for (var slot in world.Player.EquipedObjects)
            {
                html += "<tr>";
                var wearedItem = world.Player.EquipedObjects[slot];
                var details = world.GetInventoryObject(wearedItem.Name);
                if (!details)
                    continue;
                if (details.CanUnwear())
                    html += "<td><div class='gameButton' onclick='InventoryMenu.Unwear(\"" + slot.htmlEntities() + "\");'>Unwear</div></td>";
                else
                    html += "<td>&nbsp;</td>";
                html += "<td>" + (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32'>" : "") + "</td>";
                html += "<td>" + world.Player.EquipedObjects[slot].Name.htmlEntities() + "</td>";
                html += "<td>" + slot.title().htmlEntities() + "</td>";
                html += "</tr>";
            }
            html += "</table>";
        }

        html += "<h1>Inventory</h1>";
        if (!world.Player.Inventory || !world.Player.Inventory.length)
        {
            $("#gameMenuPanelContent").html(html);
            return;
        }
        world.Player.Inventory.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        world.Player.StoredCompare = world.Player.JSON();
        html += "<table class='inventoryList'>";
        html += "<thead>";
        html += "<tr><td>&nbsp;</td><td>&nbsp;</td><td>Item</td><td>Quantity</td></tr>";
        html += "</thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Inventory.length; i++)
        {
            var details = world.Player.Inventory[i].GetDetails();
            if (details == null)
            {
                world.Player.Inventory.splice(i, 1);
                i--;
                world.Player.StoredCompare = world.Player.JSON();
                continue;
            }

            html += "<tr onmouseover='InventoryMenu.ShowDetails(" + i + ");' onmouseout='InventoryMenu.HideDetails();'>";
            html += "<td>";

            if (details.CanWear())
                html += "<div class='gameButton' onclick='InventoryMenu.Wear(" + i + ");'>Equip</div>";
            if (details.ActionLabel() && details.CanUse())
                html += "<div class='gameButton' onclick='InventoryMenu.Use(" + i + ");'>" + details.ActionLabel().htmlEntities() + "</div>";
            if (details.CanDrop())
                html += "<div class='gameButton' onclick='InventoryMenu.Drop(" + i + ");'>Drop</div>";
            if (details.CanWear() || (details.ActionLabel() && details.CanUse()))
                html += "<div class='gameButton' onclick='InventoryMenu.Quickslot(" + i + ");'>Quickslot</div>";

            html += "</td>";
            html += "<td>" + (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32'>" : "") + "</td>";
            html += "<td><div>" + world.Player.Inventory[i].Name.htmlEntities() + "</div></td>";
            html += "<td>" + ("" + world.Player.Inventory[i].Count).htmlEntities() + "</td>";
            html += "</tr>";
        }
        html += "</tbody></table></div>";
        html += "<div id='inventoryObjectDetails'></div>";
        $("#gameMenuPanelContent").html(html);
    }

    public static ShowDetails(rowId: number)
    {
        var details = world.Player.Inventory[rowId].GetDetails();
        var html = "";
        html += (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32' style='vertical-align: middle;'>" : "")
        html += "<b>" + details.Name.htmlEntities() + ":</b><br>";
        html += Main.TextTransform(details.Description, true);
        $("#inventoryObjectDetails").html(html);
    }

    public static HideDetails()
    {
        $("#inventoryObjectDetails").html("");
    }

    public static Wear(rowId: number)
    {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanWear())
            world.Player.Wear(world.Player.Inventory[rowId].Name);
    }

    public static Unwear(slotName: string)
    {
        var wearedItem = world.Player.EquipedObjects[slotName];
        var details = world.GetInventoryObject(wearedItem.Name);

        if (details.CanUnwear())
            world.Player.Unwear(slotName);
    }

    public static Drop(rowId: number)
    {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanDrop())
            world.Player.RemoveItem(world.Player.Inventory[rowId].Name);
    }

    public static Use(rowId: number)
    {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanUse())
            details.Use();
    }

    public static Quickslot(rowId: number)
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
                html += "<div class='gameButton' onclick='InventoryMenu.SetQuickslot(" + rowId + "," + i + ");'>Slot " + (i + 1) + "</div>" + q + "<br>";
        }
        html += "<center><div class='gameButton' onclick='InventoryMenu.Update();'>Cancel</div></center>";
        $("#gameMenuPanelContent").html(html);
    }

    public static SetQuickslot(rowId: number, slotId: number)
    {
        var details = world.Player.Inventory[rowId].GetDetails();
        var itemName = details.Name;

        for (var i = 0; i < 10; i++)
            if (world.Player.QuickSlot[i] == "I/" + itemName)
                world.Player.QuickSlot[i] = null;

        world.Player.QuickSlot[slotId] = "I/" + itemName;
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        InventoryMenu.Update();
    }
}