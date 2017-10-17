var blobs: BlobCache = {};
interface BlobCache
{
    [s: string]: HTMLImageElement;
}

interface ColorComponents
{
    r: number;
    g: number;
    b: number;
}

class ParticleBlob
{
    public static GetColorComponents(color: string): ColorComponents
    {
        return {
            r: parseInt(color.substr(1, 2), 16),
            g: parseInt(color.substr(3, 2), 16),
            b: parseInt(color.substr(5, 2), 16)
        };
    }

    public static ColorReduce(c: ColorComponents): ColorComponents
    {
        return {
            r: Math.floor(c.r / 4) * 4,
            g: Math.floor(c.g / 4) * 4,
            b: Math.floor(c.b / 4) * 4
        };
    }

    public static GetColorString(color: ColorComponents): string
    {
        return "#" + ("" + color.r.toString(16)).padLeft("0", 2) + ("" + color.g.toString(16)).padLeft("0", 2) + ("" + color.b.toString(16)).padLeft("0", 2);
    }

    public static GetBlob(color: string)
    {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (blobs[cs])
            return blobs[cs];
        blobs[cs] = ParticleBlob.CreateBlob(20, 20, c.r, c.g, c.b);
        return blobs[cs];
    }

    private static CreateBlob(width: number, height: number, r: number, g: number, b: number): HTMLImageElement
    {
        var c = <HTMLCanvasElement>document.createElement("canvas");
        var ctx = c.getContext("2d");
        var imgData = ctx.createImageData(width, height);

        var side = (width / 2);
        for (var x = 0; x < width; x++)
        {
            for (var y = 0; y < height; y++)
            {
                var op = side - x;
                var ad = side - y;
                var d = (side - Math.sqrt(op * op + ad * ad)) / side;

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