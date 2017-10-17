var numberCompressionPossibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

class NumberCompression
{
    public static StringToNumber(source: string, position: number, nbChar: number): number
    {
        var result = 0;
        for (var i = 0; i < nbChar; i++)
        {
            var c = source.charAt(i + position);
            result += numberCompressionPossibleChars.indexOf(c) * Math.pow(numberCompressionPossibleChars.length, i);
        }
        return result;
    }

    public static StringToArray(source: string): number[]
    {
        var result: number[] = [];

        var strNb = "";
        var i = 0;
        for (; i < source.length; i++)
        {
            var c = source.charAt(i);
            if (c == "-")
                break;
            strNb += c;
        }
        i++;
        var nbChar = parseInt(strNb);
        strNb = "";
        for (; i < source.length; i++)
        {
            var k = source.charCodeAt(i);
            if (k >= 48 && k <= 57)
                strNb += source.charAt(i);
            else
            {
                var nb = NumberCompression.StringToNumber(source, i, nbChar);
                i += nbChar - 1;
                if (strNb == "")
                    result.push(nb);
                else
                {
                    var n = parseInt(strNb);
                    for (var j = 0; j < n; j++)
                        result.push(nb);
                    strNb = "";
                }
            }
        }
        return result;
    }

    // Numbers must be positive!
    public static NumberToString(source: number, nbChar: number): string
    {
        var result = "";
        var rest = source;
        for (var i = 0; i < nbChar; i++)
        {
            result += numberCompressionPossibleChars.charAt(rest % numberCompressionPossibleChars.length);
            rest = Math.floor(rest / numberCompressionPossibleChars.length);
        }
        return result;
    }

    // Numbers must be positive!
    public static ArrayToString(source: number[]): string
    {
        var result = "";
        var m = Math.max.apply(null, source);
        // Calculate how many characters we need to encode the numbers
        var nbChar = Math.max(1,Math.ceil(Math.log(Math.max.apply(null, source)) / Math.log(numberCompressionPossibleChars.length - 1)));

        result += "" + nbChar + "-";

        var last: string = null;
        var count: number = 0;
        for (var i = 0; i < source.length; i++)
        {
            var n = NumberCompression.NumberToString(source[i], nbChar);
            if (n == last)
                count++;
            else
            {
                if (last != null)
                {
                    if (count > 1)
                        result += "" + count + last;
                    else
                        result += last;
                }
                last = n;
                count = 1;
            }
        }
        if (count > 1)
            result += "" + count + last;
        else
            result += last;

        return result;
    }
}