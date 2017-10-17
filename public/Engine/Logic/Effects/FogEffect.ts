/// <reference path="MapEffect.ts" />

@MapEffectClass
class FogEffect extends MapEffect
{
    private gofImage: HTMLImageElement = null;

    public Render(ctx: CanvasRenderingContext2D, width: number, height: number): void
    {
        if (!this.gofImage)
        {
            this.gofImage = new Image();
            this.gofImage.src = "/Effects/fog.png";
        }

        ctx.fillStyle = "#dcdbeb";
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, 0, Math.floor(width / 2) - 256, height);
        ctx.fillRect(Math.floor(width / 2) + 256, 0, width, height);

        ctx.fillRect(Math.floor(width / 2) - 256, 0, 512, Math.floor(height / 2) - 256);
        ctx.fillRect(Math.floor(width / 2) - 256, Math.floor(height / 2) + 256, 512, height);

        ctx.drawImage(this.gofImage, Math.floor(width / 2) - 256, Math.floor(height / 2) - 256);
        ctx.globalAlpha = 1;
    }
}