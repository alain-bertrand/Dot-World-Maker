class NPCShopEditor
{
    static ShowEditor()
    {
        $("#npcDialogSection").hide();
        $("#npcShopSection").show();

        var options = "";
        options += "<option value=''>-- Add an item to the shop --</option>";
        world.InventoryObjects.sort((a, b) =>
        {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        for (var i = 0; i < world.InventoryObjects.length; i++)
            options += "<option value='" + world.InventoryObjects[i].Name.htmlEntities() + "'>" + world.InventoryObjects[i].Name + "</option>";
        $("#npcAddShopItem").find("option").remove().end().append(options);

        framework.Preferences["NPCEditor"] = "shop";
        Framework.SavePreferences();

        NPCShopEditor.UpdateShop();
    }

    static UpdateShop()
    {
        if (!npcEditor.currentNPC)
        {
            $("#npcShopList").html("");
            return;
        }

        if (!npcEditor.currentNPC.ShopItems)
            npcEditor.currentNPC.ShopItems = [];

        var html = "";
        html += "<table>";
        //html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Buy Price:</td><td>Sell Price:</td><td>Quantity In Stock</td></tr></thead>";
        html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Buy Price:</td><td>Sell Price:</td><td>Premium</td></tr></thead>";
        //html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Sell Price:</td><td>Premium</td></tr></thead>";
        html += "<tbody>";
        for (var i = 0; i < npcEditor.currentNPC.ShopItems.length; i++)
        {
            html += "<tr>";
            html += "<td><div class='button' onclick='NPCShopEditor.RemoveItem(" + i + ")'>Remove</div></td>";
            html += "<td>" + npcEditor.currentNPC.ShopItems[i].Name + "</td>";
            html += "<td><input type='text' id='buy_" + i + "' value='" + npcEditor.currentNPC.ShopItems[i].BuyPrice + "' onkeyup='NPCShopEditor.ChangeValue(" + i + ",\"buy\",\"BuyPrice\")'></td>";
            html += "<td><input type='text' id='sell_" + i + "' value='" + npcEditor.currentNPC.ShopItems[i].SellPrice + "' onkeyup='NPCShopEditor.ChangeValue(" + i + ",\"sell\",\"SellPrice\")'></td>";
            //html += "<td><input type='text' id='qt_" + i + "' value='" + npcEditor.currentNPC.ShopItems[i].QuantityAvailable + "' onkeyup='NPCShopEditor.ChangeValue(" + i + ",\"qt\",\"QuantityAvailable\")'></td>";
            html += "<td><select id='premium_" + i + "' onchange='NPCShopEditor.ChangeValue(" + i + ",\"premium\",\"PremiumShop\");'>";
            html += "<option value='yes'" + (npcEditor.currentNPC.ShopItems[i].PremiumShop === true ? " selected" : "") + ">Yes</option>";
            html += "<option value='no'" + (npcEditor.currentNPC.ShopItems[i].PremiumShop !== true ? " selected" : "") + ">No</option></select></td>";
            html += "</tr>";
        }
        html += "</tbody></table>";
        $("#npcShopList").html(html);
    }

    static RemoveItem(rowId: number)
    {
        npcEditor.currentNPC.ShopItems.splice(rowId, 1);
        NPCShopEditor.UpdateShop();
    }

    static ChangeValue(rowId: number, inputName: string, fieldName: string)
    {
        if (fieldName == "PremiumShop")
        {
            npcEditor.currentNPC.ShopItems[rowId][fieldName] = ($("#" + inputName + "_" + rowId).val() == "yes");
        }
        else
        {
            var val = parseInt($("#" + inputName + "_" + rowId).val());
            if (isNaN(val) || val < 0)
                return;
            npcEditor.currentNPC.ShopItems[rowId][fieldName] = val;
        }
    }

    static AddItem()
    {
        if (!$("#npcAddShopItem").val() || $("#npcAddShopItem").val() == "")
            return;

        if (!npcEditor.currentNPC)
        {
            $("#npcAddShopItem").val("");
            return;
        }

        if (!npcEditor.currentNPC.ShopItems)
            npcEditor.currentNPC.ShopItems = [];

        var found = false;
        for (var i = 0; i < npcEditor.currentNPC.ShopItems.length; i++)
        {
            if (npcEditor.currentNPC.ShopItems[i].Name == $("#npcAddShopItem").val())
            {
                found = true;
                break;
            }
        }

        if (!found)
        {
            npcEditor.currentNPC.ShopItems.push({ Name: $("#npcAddShopItem").val(), BuyPrice: 0, SellPrice: 0, QuantityAvailable: 0 });
            NPCShopEditor.UpdateShop();
        }

        $("#npcAddShopItem").val("");
    }
}