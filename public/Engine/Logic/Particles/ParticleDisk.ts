var disks: BlobCache = {};

class ParticleDisk
{

    public static GetDisk(color: string)
    {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (disks[cs])
            return disks[cs];
        disks[cs] = ParticleDisk.CreateDisk(20, 20, c.r, c.g, c.b);
        return disks[cs];
    }

    private static CreateDisk(width: number, height: number, r: number, g: number, b: number): HTMLImageElement
    {
        var c = <HTMLCanvasElement>document.createElement("canvas");
        var ctx = c.getContext("2d");
        ctx.fillStyle = ParticleBlob.GetColorString({ r: r, g: g, b: b });
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
        ctx.fill();

        var image = new Image();
        image.src = c.toDataURL("image/png");
        return image;
    }
}