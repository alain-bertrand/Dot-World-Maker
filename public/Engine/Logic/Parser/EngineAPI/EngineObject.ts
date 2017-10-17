/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineObject
{
    @ApiMethod([{ name: "name", description: "The name to check." }], "Returns true if the object is defined in the object database.")
    ObjectExists(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (world.GetInventoryObject(values[0].GetString()))
            return new VariableValue(true);
        return new VariableValue(false);
    }

    @ApiMethod([{ name: "name", description: "The name to create." }, { name: "typeName", description: "The name of the object type." }], "Returns the name of the created object or the existing object.")
    CreateObject(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        world.InventoryObjects.push(new KnownObject(values[0].GetString(), values[1].GetString()));
        return new VariableValue(values[0].GetString());
    }

    @ApiMethod([{ name: "name", description: "The name to check." }], "Returns true if the object type is defined in the object database.")
    TypeExists(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (world.GetInventoryObjectType(values[0].GetString()))
            return new VariableValue(true);
        return new VariableValue(false);
    }

    @ApiMethod([{ name: "name", description: "The name to create." }, { name: "group", description: "(optional) The name of the object type." }], "Returns the name of the created object or the existing object.")
    CreateType(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        world.InventoryObjectTypes.push(new ObjectType(values[0].GetString(), values[1] ? values[1].GetString() : values[0].GetString()));
        return new VariableValue(values[0].GetString());
    }

    @ApiMethod([{ name: "name", description: "The name of the object." }, { name: "actionText", description: "Name of the action to show" }, { name: "actionCode", description: "Script code to execute" }], "Set an action to an object.")
    SetObjectUseAction(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var obj = world.GetInventoryObject(values[0].GetString());
        if (!obj)
            return null;
        obj.Action = values[1].GetString();
        obj.UsageActions = [{ Name: "ExecuteCodeFunction", Values: [values[2].GetString()] }];
        return null;
    }
}