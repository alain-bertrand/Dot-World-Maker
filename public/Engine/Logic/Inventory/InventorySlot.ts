interface EquipedObject
{
    [s: string]: InventoryObject;
}

class InventorySlot implements InventorySlotInterface
{
    public Name: string;

    public constructor(name: string)
    {
        this.Name = name;
    }

    public static DefaultSlots(): InventorySlot[]
    {
        return [
            new InventorySlot('Head'),
            new InventorySlot('Body'),
            new InventorySlot('LeftHand'),
            new InventorySlot('RightHand'),
            new InventorySlot('Legs'),
            new InventorySlot('Feet'),
            new InventorySlot('Neck'),
            new InventorySlot('LeftHandFinger'),
            new InventorySlot('RightHandFinger')
        ];
    }
}