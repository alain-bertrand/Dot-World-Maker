/// <reference path="TilesetInformation.ts" />
/// <reference path="../../Libs/Point.ts" />

interface SerializedGame
{
    gameData: SerializedWorld;
    maps: any[];
}

interface SerializedWorld
{
    Name: string;
    PublicView: boolean;
    Description: string;
    Skills: SerializedSkill[];
    Stats: SerializedStat[];
    Monsters: SerializedMonster[];
    NPCs: NPCInterface[];
    Houses: TilesetHouse;
    Zones: WorldZoneInterface[];
    Tileset: TilesetInformation;
    ShowFPS?: boolean;
    InventoryObjects?: KnownObjectInterface[];
    InventoryObjectTypes?: ObjectTypeInterface[];
    InventorySlots?: InventorySlotInterface[];
    SpawnPoint?: ZonedPoint;
    InitializeSteps?: DialogActionInterface[];
    ChatEnabled?: boolean;
    ChatSmilies?: boolean;
    ChatLink?: boolean;
    StartLook?: string;
    SmallBagObject?: string;
    SimplifiedObjectLogic?: boolean;
    TemporaryEffects?: TemporaryEffectInterface[];
    Quests?: KnownQuestInterface[];
    ShowInventory?: boolean;
    ShowStats?: boolean;
    ShowJournal?: boolean;
    ShowMessage?: boolean;
    ParticleEffects?: ParticleSystemSerialized[];
    SaveId: string;
    Codes?: GenericCodeInterface[];
    ChatBots?: ChatBotInterface[];
}

interface WorldZoneObject
{
    Name: string;
    Frequency: number;
    PlaceOn: string[];
}

interface WorldZoneInterface
{
    Name: string;
    MapEffect: string;
    BaseTileType: string;
    Generator: string;
    GeneratorParameters: any;
    Objects: WorldZoneObject[];
    Monsters: WorldZoneObject[];
    MapMusic: string;
    MapFragments: MapFragmentInterface[];
}

interface MapFragmentInterface
{
    Name: string;
    Conditions: DialogConditionInterface[];
    Modifications: MapModificationInterface[];
}

interface MapModificationInterface
{
    X: number;
    Y: number;
    Action: string;
    Value: any;
}

interface SerializedSkill
{
    Name: string;
    Source: string;
    Auto: boolean;
}

interface SerializedStat
{
    Name: string;
    Source: string;
    DefaultValue: number;
    MonsterStat: boolean;
}

interface SerializedMonster
{
    Name: string;
    Source: string;
    Art: string;
    StatDrop: MonsterDrop[];
    ItemDrop: MonsterDrop[];
}

interface MonsterDrop
{
    Name: string;
    Quantity: number;
    Probability: number;
}

interface ParticleSystemSerialized
{
    Name: string;
    Emitter: any;
    InitialParticles: number;
    MaxParticles: number;
    MaxAge: number;
    MaxSpeed: number;
    Effectors: any;
    ParticleType?: string;
}

interface KnownQuestInterface
{
    Name: string;
    Description: string;
    JournalEntries: JournalEntryInterface[];
}

interface TemporaryEffectInterface
{
    Name: string;
    MultipleInstance: boolean;
    Timer: number;
    StartActions: DialogActionInterface[];
    EndActions: DialogActionInterface[];
    RecurringTimer: number
    RecurringActions: DialogActionInterface[];
}

interface DialogConditionInterface
{
    Name: string;
    Values: string[];
}

interface DialogActionInterface
{
    Name: string;
    Values: string[];
}

interface InventorySlotInterface
{
    Name: string;
}

interface ObjectParameterInterface
{
    Name: string;
    Value: string;
}

interface ObjectDefinedParameterInterface
{
    Name: string;
    DefaultValue: string;
}

interface ObjectTypeInterface
{
    Name: string;
    Group: string;
    Action: string;
    ActionCode: string;
    Parameters: ObjectDefinedParameterInterface[];
    UsageConditions: DialogConditionInterface[];
    WearConditions: DialogConditionInterface[];
    UnwearConditions: DialogConditionInterface[];
    DropConditions: DialogConditionInterface[];
    UsageActions: DialogActionInterface[];
}

interface KnownObjectInterface
{
    Name: string;
    ObjectType: string;
    Slots: string[];
    Parameters: ObjectParameterInterface[];
    Weight: number;
    MaxStack: number;
    Price: number;
    Description: string;
    Action: string;
    ActionCode: string;
    UsageConditions: DialogConditionInterface[];
    UnwearConditions: DialogConditionInterface[];
    WearConditions: DialogConditionInterface[];
    DropConditions: DialogConditionInterface[];
    UsageActions: DialogActionInterface[];
}

interface JournalEntryInterface
{
    Id: number;
    Entry: string;
}

interface ChatBotSentenceInterface
{
    Conditions: DialogConditionInterface[];
    FollowUp?: boolean;
    Trigger: string;
    Answer: string;
    Code: string;
}

interface ChatBotInterface
{
    Name: string;
    Channel: string;
    Sentences: ChatBotSentenceInterface[];
}

interface NPCInterface
{
    Name: string;
    Dialogs: DialogInterface[];
    Look: string;
    ShopItems: ShopItem[];
}

interface DialogInterface
{
    Text: string;
    Answers: AnswerInterface[];
}

interface AnswerInterface
{
    Text: string;
    Actions: DialogActionInterface[];
    Conditions: DialogConditionInterface[];
    JumpTo: number;
}

interface ShopItem
{
    Name: string;
    BuyPrice: number;
    SellPrice: number;
    QuantityAvailable: number;
    PremiumShop?: boolean;
}

interface CodeVariable
{
    name: string;
    value: string;
    type: string;
}

interface CodeVariableContainer
{
    [s: string]: CodeVariable;
}

interface IncludedDefinition
{
    Type: string;
    Name: string;
    Info: any;
    Data?: string;
}

interface GenericCodeInterface
{
    Author: string;
    Name: string;
    Source: string;
    Parameters: CodeVariableContainer;
    Description: string;
    Includes: IncludedDefinition[];
    Enabled: boolean;
    CodeBrowsing: boolean;
    AllowEditing: boolean;
    Price: number;
    Version: string;
}