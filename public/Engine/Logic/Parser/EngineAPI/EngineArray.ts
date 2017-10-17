/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineArray
{
    @ApiMethod([{ name: "variable", description: "The variable to check." }], "Checks if a variable is an array.")
    IsArray(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0].Type == ValueType.Array)
            return new VariableValue(true);
        return new VariableValue(false);
    }

    @ApiMethod([{ name: "variable", description: "The variable to check." }], "Returns the number of elements of an array.")
    Count(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0].Type != ValueType.Array)
            return new VariableValue(0);
        return new VariableValue(values[0].Value.length);
    }

    @ApiMethod([{ name: "variable", description: "The variable to modify." },{name:"index",description:"The position of the array to remove."}], "Removes an element from the array.")
    Remove(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0].Type != ValueType.Array)
            return null;
        values[0].Value.splice(values[1].GetNumber(), 1);
        return null;
    }
}