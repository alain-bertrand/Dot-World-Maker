/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineInventory
{
    @ApiMethod([{ name: "itemName", description: "Item to add." }, { name: "quantity", description: "Quantity to add." }], "(optional) Adds an item to the player inventory. If skipped it will remove one.")
    public AddItem(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Inventory'] && this['Inventory'].AddItem && !this['Inventory'].AddItem.caller) || (this.AddItem && !this.AddItem.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.AddItem(values[0].GetString(), values[1] ? values[1].GetNumber() : 1);
        return null;
    }

    Verify_AddItem(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "itemName", description: "Item to add." }, { name: "quantity", description: "(optional) Quantity to remove. If skipped it will remove one." }], "Removes an item from the player inventory.")
    public RemoveItem(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Inventory'] && this['Inventory'].RemoveItem && !this['Inventory'].RemoveItem.caller) || (this.RemoveItem && !this.RemoveItem.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.RemoveItem(values[0].GetString(), values[1] ? values[1].GetNumber() : 1);
        return null;
    }

    Verify_RemoveItem(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "itemName", description: "Item to check." }, { name: "parameterName", description: "Name of the parameter to check." }], "Returns true if the item do have this parameter defined.")
    public ObjectParameterExists(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var objName = values[0].GetString().toLowerCase();

        var object: KnownObject = null;
        for (var i = 0; i < world.InventoryObjects.length; i++)
        {
            if (world.InventoryObjects[i].Name.toLowerCase() == objName)
            {
                object = world.InventoryObjects[i];
                break;
            }
        }
        var paramName = values[1].GetString().toLowerCase();
        for (var i = 0; i < object.Parameters.length; i++)
            if (object.Parameters[i].Name.toLowerCase() == paramName)
                return new VariableValue(true);
        return new VariableValue(false);
    }

    Verify_ObjectParameterExists(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "itemName", description: "Item to check." }, { name: "parameterName", description: "Value to calculate." }], "Returns the value of the item's parameter value.")
    public ObjectParameter(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var objName = values[0].GetString().toLowerCase();

        var object: KnownObject = null;
        for (var i = 0; i < world.InventoryObjects.length; i++)
        {
            if (world.InventoryObjects[i].Name.toLowerCase() == objName)
            {
                object = world.InventoryObjects[i];
                break;
            }
        }
        var paramName = values[1].GetString().toLowerCase();
        for (var i = 0; i < object.Parameters.length; i++)
            if (object.Parameters[i].Name.toLowerCase() == paramName)
                return new VariableValue(parseFloat(object.Parameters[i].Value));
        return new VariableValue(0);
    }

    Verify_ObjectParameter(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The stat to evaluate." }], "Calculates the stat effect of all the items the player is currently wearing.")
    public GetWearedEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var statName = values[0].GetString();

        var result = 0;
        for (var slot in world.Player.EquipedObjects)
        {
            var objectName = world.Player.EquipedObjects[slot].Name;
            var inventObject = world.GetInventoryObject(world.Player.EquipedObjects[slot].Name);
            var stat = parseFloat(inventObject.GetParameter(statName));
            if (stat && !isNaN(stat))
                result += stat;
        }
        if (isNaN(result))
            return new VariableValue(0);
        return new VariableValue(result);
    }

    @ApiMethod([{ name: "itemName", description: "The inventory object to check." }], "Checks if the player is currently wearing the item.")
    public IsWearing(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var itemName = values[0].GetString();

        for (var slot in world.Player.EquipedObjects)
            if (world.Player.EquipedObjects[slot].Name.toLowerCase() == itemName)
                return new VariableValue(true);

        return new VariableValue(false);
    }

    Verify_IsWearing(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Executing all the Use actions of the weared items.")
    public ExecuteWearingUsage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Inventory'] && this['Inventory'].ExecuteWearingUsage && !this['Inventory'].ExecuteWearingUsage.caller) || (this.ExecuteWearingUsage && !this.ExecuteWearingUsage.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        for (var slot in world.Player.EquipedObjects)
        {
            var name = world.Player.EquipedObjects[slot].Name;
            var object = world.GetInventoryObject(name);
            object.Use();
        }
        return null;
    }
}