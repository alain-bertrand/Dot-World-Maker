var pixelEditor = new (class
{
    public colorPickerItem: string = null;
    public colorPositionX: number = 1;
    public colorPositionY: number = 0;
    public huePosition: number = 0;
    public currentButton: number = 0;

    public currentImage: GameImage
    public currentSprite: ImageSprite;
    public currentLayer: SpriteLayer;
    public zoomFactor = 9;
    public brushSize = 4;
    public currentAction = "BlockPaint";
    public selection: boolean[][] = null;
    public selectionActive: boolean = false;
    public selectionBlink = false;
    public repaintInterval: number = 0;
    public lastX: number = null;
    public lastY: number = null;
    public keys: boolean[] = [];

    public currentLayerOriginal: SpriteLayer;
    public currentLayerSelection: SpriteLayer;

    public smoothedActions: string[] = ["BlockPaint", "Eraser"];
    public noActionSteps: string[] = ["MagicWand", "Picker", "Selection"];

    public packingSpace: number = 4;

    public actionSteps: PixelEditorStep[] = [];
    public redoSteps: PixelEditorStep[] = [];

    public lastStep: PixelEditorStep = null;

    public clipboard: SpriteLayer;

    public startSelection: Point = null;
    public inPanel: boolean = false;
});

interface PixelEditorStep
{
    before?: HTMLImageElement;
    after?: HTMLImageElement;
    spriteId: number;
    layerId: number;
    specialAction?: (step:PixelEditorStep, redo: boolean) => void;
    specialActionData?: any;
}

interface Pixel
{
    r: number;
    g: number;
    b: number;
    a: number;
}

interface SpriteLayer
{
    pixels?: Pixel[][];
    png?: string;
    name: string;
    hide?: boolean;
}

interface ImageSprite
{
    x: number;
    y: number;
    width: number;
    height: number;
    layers: SpriteLayer[];
}

interface GameImage
{
    file: string;
    sprites: ImageSprite[];
    type: string;
}
