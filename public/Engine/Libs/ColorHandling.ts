class ColorHandling
{
    public static RgbToHex(r: number, g: number, b: number): string
    {
        return "#" + Math.round(r).toString(16).padLeft("0", 2) + Math.round(g).toString(16).padLeft("0", 2) + Math.round(b).toString(16).padLeft("0", 2);
    }

    public static HexToRgb(str: string): { r: number, g: number, b: number }
    {
        if (str.length != 7)
            return null;
        var r = parseInt(str.substr(1, 2), 16);
        var g = parseInt(str.substr(3, 2), 16);
        var b = parseInt(str.substr(5, 2), 16);
        return { r: r, g: g, b: b };
    }

    public static HSVtoRGB(h, s, v): { Red: number, Green: number, Blue: number }
    {
        if (s == 0)
            return { Red: v, Green: v, Blue: v };
        h /= 60;
        var i = Math.floor(h);
        var f = h - i;			// factorial part of h
        var p = v * (1 - s);
        var q = v * (1 - s * f);
        var t = v * (1 - s * (1 - f));
        switch (i)
        {
            case 0:
                return { Red: v, Green: t, Blue: p };
            case 1:
                return { Red: q, Green: v, Blue: p };
            case 2:
                return { Red: p, Green: v, Blue: t };
            case 3:
                return { Red: p, Green: q, Blue: v };
            case 4:
                return { Red: t, Green: p, Blue: v };
            default:		// case 5:
                return { Red: v, Green: p, Blue: q };
        }
    }

    public static RGBtoHSV(r, g, b): { h: number, s: number, v: number }
    {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var v = max;				// v
        var s = 0;
        var h = 0;
        var delta = max - min;
        if (max != 0)
            s = delta / max;		// s
        else
        {
            // r = g = b = 0		// s = 0, v is undefined
            s = 0;
            h = -1;
            return { h: h, s: s, v: v };
        }
        if (r == max)
            h = (g - b) / delta;		// between yellow & magenta
        else if (g == max)
            h = 2 + (b - r) / delta;	// between cyan & yellow
        else
            h = 4 + (r - g) / delta;	// between magenta & cyan
        h *= 60;				// degrees
        if (h < 0)
            h += 360;
        if (isNaN(h))
            h = 0;
        return { h: h, s: s, v: v };
    }
}