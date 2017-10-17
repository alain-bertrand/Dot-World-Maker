class InventoryObject
{
    public Name: string;
    public Count: number;
    public UsageLevel: number;

    public constructor(name: string, count: number = 1, usage: number = null)
    {
        this.Name = name;
        this.Count = count;
        this.UsageLevel = usage;
    }

    public GetDetails(): KnownObject
    {
        for (var i = 0; i < world.InventoryObjects.length; i++)
            if (world.InventoryObjects[i].Name == this.Name)
                return world.InventoryObjects[i];
        return null;
    }

    public GetObjectType(): ObjectType
    {
        return this.GetDetails().GetType();
    }
}