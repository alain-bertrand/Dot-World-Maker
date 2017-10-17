/// <reference path="ExecutionCode.ts" />

class AddCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        var a = env.Pop();
        var b = env.Pop();

        if (a === null && b === null)
        {
            env.Push(new VariableValue(null));
            return;
        }
        if (a === null || a === undefined)
            a = new VariableValue("(null)");
        if (b === null || b === undefined)
            b = new VariableValue("(null)");

        var aType = a.Type;
        var bType = b.Type;

        if (aType == ValueType.String)
        {
            var aValue = a.GetString();
            if (!isNaN(parseFloat(aValue)) && ("" + parseFloat(aValue)) == aValue)
                aType = ValueType.Number;
        }

        if (bType == ValueType.String)
        {
            var bValue = b.GetString();
            if (!isNaN(parseFloat(bValue)) && ("" + parseFloat(bValue)) == bValue)
                bType = ValueType.Number;
        }

        if (aType == ValueType.String || bType == ValueType.String)
            env.Push(new VariableValue(a.GetString() + b.GetString()));
        else
            env.Push(new VariableValue(a.GetNumber() + b.GetNumber()));
        env.CodeLine++;
    }
}