var defaultTilesets: TilesetDefinition = {};

interface TilesetDefinition
{
    [s: string]: TilesetInformation;
}

interface TilesetInformation
{
    background: TilesetMap;
    interfaceArt?: TilesetArt;
    panelStyle: TilesetPanelStyle;
    quickslotStyle: QuickslotStyle;
    statBarStyle: StatBarStyle;
    objects: TilesetObject;
    characters: TilesetCharacter;
    house_parts?: TilesetHousePart;
    houses?: TilesetHouse;
    sounds?: SoundsAndMusics;
    splashImage?: string;
}

interface SoundsAndMusics
{
    [s: string]: SoundDetail
}

interface SoundDetail
{
    mp3: string;
    ogg?: string;
}

interface StatBarStyle
{
    file: string;
    width: number;
    height: number;
    topBorder: number;
    bottomBorder: number;
    barsToDisplay?: number;
}

interface QuickslotStyle
{
    file: string;
    width: number;
    height: number;
    leftBorder: number;
    topBorder: number;
    itemSpacing: number;
    quickslotVisible?: boolean;
    selectedSkillColor?: string;
}

interface TilesetMap
{
    file: string;
    width: number;
    height: number;
    nbColumns: number;
    lastTile: number;
    types: TilesetType;
    mainType: string;
    nonWalkable: number[];
    transitions?: TilesetTransition[];
    paths?: TilesetType;
}

interface TilesetPanelStyle
{
    file: string;
    leftBorder: number;
    rightBorder: number;
    topBorder: number;
    header: number;
    bottomBorder: number;
    headerColor: string;
    contentColor: string;
    contentHeaderBackgroundColor?: string;
    contentHeaderColor?: string;
    contentSelectedColor?: string;
    buttonBorder: string;
    buttonBackground: string;
    buttonBackgroundHover?: string;
    chatPlaceholderColor?: string;
    chatNormalColor?: string;
    chatSeparatorColor?: string;
    chatSystemMessageColor?: string;
}

interface TilesetArt
{
    [s: string]: string;
}

interface TilesetType
{
    [s: string]: number[];
}


interface TilesetTransition
{
    from: string;
    to: string;
    size: number;
    transition: number[];
}

interface TilesetLevels
{
    type: string;
    maxLevel?: number;
}

interface TilesetObject
{
    [s: string]: TilsetObjectDetails;
}

interface TilsetObjectDetails
{
    file: string;
    width: number;
    height: number;
    groundX?: number;
    groundY?: number;
    x: number;
    y: number;
    nbAnimationFrames?: number;
    animationSpeed?: number;
    frameOffset?: number;
    collision?: TilesetObjectCollision;
    disappearOnClick?: boolean;
    clickOnce?: boolean;
    clickActions?: DialogActionInterface[];
    clickConditions?: DialogConditionInterface[];
    particleEffect?: string;
    disappearOnWalk?: boolean;
    walkActions?: DialogActionInterface[];
    walkConditions?: DialogConditionInterface[];
}

interface TilesetObjectCollision
{
    radius?: number;
}

interface TilesetCharacter
{
    [s: string]: TilesetCharacterDetails;
}

interface TilesetCharacterDetails
{
    file: string;
    frames: number;
    directions: number;
    groundX?: number;
    groundY?: number;
    imageFrameDivider?: number;
    directionFrames?: number[];
    animationCycle: string;
    width: number;
    height: number;
    collision?: TilesetObjectCollision;
    canWalkOn?: string[];
}

interface TilesetHousePart
{
    [s: string]: TilsetHousePartDetails;
}

interface TilsetHousePartDetails
{
    file: string;
    width: number;
    height: number;
    x: number;
    y: number;
}

interface TilesetHouse
{
    [s: string]: TilesetHouseDetails;
}

interface TilesetHouseDetails
{
    collisionX: number;
    collisionY: number;
    collisionWidth: number;
    collisionHeight: number;
    parts: TilesetHousePartDetails[];
}

interface TilesetHousePartDetails
{
    part: string;
    x: number;
    y: number;
}