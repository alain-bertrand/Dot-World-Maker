class ObjectType implements ObjectTypeInterface
{
    public Name: string;
    public Group: string;
    public Action: string;
    public ActionCode: string;
    public Parameters: ObjectDefinedParameter[];
    public UsageConditions: DialogCondition[] = [];
    public WearConditions: DialogCondition[] = [];
    public UnwearConditions: DialogCondition[] = [];
    public DropConditions: DialogCondition[] = [];
    public UsageActions: DialogAction[] = [];

    public constructor(name?: string, group?: string, action?: string, actionCode?: string, parameters?: ObjectDefinedParameter[])
    {
        this.Name = name;
        this.Group = group;
        this.Action = action;
        this.ActionCode = actionCode;
        this.Parameters = parameters ? parameters : [];
    }

    public static DefaultObjectType(): ObjectType[]
    {
        var result: ObjectType[] = [
            new ObjectType("Head Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Body Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Leg Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Feet Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Hand Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Weapon", "Weapon", null, null, [new ObjectDefinedParameter("Base Damage", "1"), new ObjectDefinedParameter("Attack Speed", "1")]),
            new ObjectType("Potion", "Aid", "Drink", "function Use(currentItem)\n{\n\tInventory.RemoveItem(currentItem);\n\tif(Inventory.ObjectParameterExists(currentItem,'Life Recover'))\n\t\tPlayer.IncreaseStat('Life',Inventory.ObjectParameter(currentItem,'Life Recover'));\n}", [new ObjectDefinedParameter("Life Recover", "1")]),
            new ObjectType("Food", "Aid", "Eat", "function Use(currentItem)\n{\n\tInventory.RemoveItem(currentItem);\n\tif(Inventory.ObjectParameterExists(currentItem,'Life Recover'))\n\t\tPlayer.IncreaseStat('Life',Inventory.ObjectParameter(currentItem,'Life Recover'));\n}", [new ObjectDefinedParameter("Life Recover", "0")])];

        result[6].UsageActions = [{ "Name": "IncreaseStat", "Values": ["Life", "Inventory.ObjectParameter(currentItem, 'Life Recover')"] }, { "Name": "RemoveCurrentItem", "Values": ["1"] }];
        result[7].UsageActions = [{ "Name": "IncreaseStat", "Values": ["Life", "Inventory.ObjectParameter(currentItem, 'Life Recover')"] }, { "Name": "RemoveCurrentItem", "Values": ["1"] }];
        return result;
    }
}