/// <reference path="MapEffect.ts" />

@MapEffectClass
class SightEffect extends MapEffect
{
    private sightImage: HTMLImageElement = null;

    public Render(ctx: CanvasRenderingContext2D, width: number, height: number): void
    {
        if (!this.sightImage)
        {
            this.sightImage = new Image();
            this.sightImage.src = "/Effects/sight_1.png";
        }

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, Math.floor(width / 2) - 256, height);
        ctx.fillRect(Math.floor(width / 2) + 256, 0, width, height);

        ctx.fillRect(0, 0, width, Math.floor(height / 2) - 256);
        ctx.fillRect(0, Math.floor(height / 2) + 256, width, height);

        ctx.drawImage(this.sightImage, Math.floor(width / 2) - 256, Math.floor(height / 2) - 256);
    }
}