var sparcles: BlobCache = {};

class ParticleSparkle
{
    public static GetSparkle(color: string)
    {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (sparcles[cs])
            return sparcles[cs];
        sparcles[cs] = ParticleSparkle.CreateSparkle(20, 20, c.r, c.g, c.b);
        return sparcles[cs];
    }

    private static CreateSparkle(width: number, height: number, r: number, g: number, b: number): HTMLImageElement
    {
        var c = <HTMLCanvasElement>document.createElement("canvas");
        var ctx = c.getContext("2d");
        var imgData = ctx.createImageData(width, height);

        var side = (width / 2);
        for (var x = 0; x < width; x++)
        {
            for (var y = 0; y < height; y++)
            {
                var op = Math.abs(side - x);
                var ad = Math.abs(side - y);
                var d = (side - Math.sqrt(op * op + ad * ad)) / side;
                d *= (ad * ad <= side * 0.01 || op * op <= side * 0.01 || (op - ad) * (op - ad) <= side * 0.01 ? 1 : 0);

                var p = (x + y * width) * 4;

                if (d <= 0)
                    d = 0;
                else
                    d = Math.max(0, Math.min(255, Math.floor(255 * d)));
                imgData.data[p + 0] = r;
                imgData.data[p + 1] = g;
                imgData.data[p + 2] = b;
                imgData.data[p + 3] = d;
            }
        }
        ctx.putImageData(imgData, 0, 0);

        var image = new Image();
        image.src = c.toDataURL("image/png");
        return image;
    }
}