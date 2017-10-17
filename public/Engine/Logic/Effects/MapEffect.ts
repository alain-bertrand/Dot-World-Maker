var knownEffects: string[] = [];

// Class decorator which will put all the API inside the api variable.
function MapEffectClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownEffects.push(className.substr(0, className.length - 6));
    knownEffects.sort();
}

abstract class MapEffect
{
    public abstract Render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}