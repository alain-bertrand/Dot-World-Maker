/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineMath
{
    @ApiMethod([], "Returns the mathematical constant PI which is 3.141592653589793 .")
    PI(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(Math.PI);
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the sinusoidal of the given value.")
    Sin(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.sin(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc sinusoidal of the given value.")
    ASin(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.asin(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the cosinusoidal of the given value.")
    Cos(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.cos(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc cosinusoidal of the given value.")
    ACos(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.acos(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the tangent of the given value.")
    Tan(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.tan(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc tangent of the given value.")
    ATan(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.atan(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "base", description: "Base number to calculate." }, { name: "exponent", description: "Exponent number to calculate." }], "Returns the base number power exponent.")
    Pow(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.pow(values[0].GetNumber(), values[1].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the rounded value (< 0.5 will be 0, >= 0.5 will be 1).")
    Round(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.round(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the floored value (< 1 will be 0).")
    Floor(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.floor(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the ceiled value (> 0 will be 1).")
    Ceil(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.ceil(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "var1", description: "The value to divide." }, { name: "var2", description: "The value to divide width." }], "Returns the remainder operator value when deviding the first variable with the second.")
    Mod(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue((values[0].GetNumber() % values[1].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the square root of the value.")
    Sqrt(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.sqrt(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the natural logarithm (base e) of the value.")
    Log(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.log(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the e power of the value.")
    Exp(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.exp(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the absolute number of the value.")
    Abs(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.abs(values[0].GetNumber()));
    }

    @ApiMethod([{ name: "max", description: "(optional) max value to return (inclusive)." }, { name: "min", description: "(optional) min value to return (inclusive)." }], "Returns a random number. If no min/max is given the value is between 0 and 1.")
    Rnd(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[1])
        {
            var min = values[1].GetNumber();
            var max = values[0].GetNumber();
            return new VariableValue(Math.round(Math.random() * (max - min)) + min);
        }
        else if (values[0])
        {
            var max = values[0].GetNumber();
            return new VariableValue(Math.round(Math.random() * max));
        }
        return new VariableValue(Math.random());
    }

    public static CalculateAngle(ad: number, op: number): number
    {
        var angle = 0.0;
        if (ad == 0.0) // Avoid angles of 0 where it would make a division by 0
            ad = 0.00001;

        // Get the angle formed by the line
        angle = Math.atan(op / ad);
        if (ad < 0.0)
        {
            angle = Math.PI * 2.0 - angle;
            angle = Math.PI - angle;
        }

        while (angle < 0)
            angle += Math.PI * 2.0;
        return angle;
    }
}

