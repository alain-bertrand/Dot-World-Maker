/// <reference path="ExecutionCode.ts" />

class CompareCode implements ExecutionCode
{
    public Operation: string;
    constructor(operation:string)
    {
        this.Operation = operation;
    }

    public Execute(env: CodeEnvironement)
    {
        var a = env.Pop();
        var b = env.Pop();

        if (!a)
            a = new VariableValue(null);
        if (!b)
            b = new VariableValue(null);

        switch (this.Operation)
        {
            case "==":
                if (a.Type == ValueType.Null || b.Type == ValueType.Null)
                    env.Push(new VariableValue(a.Value === b.Value));
                else
                    env.Push(new VariableValue(a.Value == b.Value));
                break;
            case "!=":
                if (a.Type == ValueType.Null || b.Type == ValueType.Null)
                    env.Push(new VariableValue(a.Value !== b.Value));
                else
                    env.Push(new VariableValue(a.Value != b.Value));
                break;
            case "<=":
                env.Push(new VariableValue(a.Value <= b.Value));
                break;
            case "<":
                env.Push(new VariableValue(a.Value < b.Value));
                break;
            case ">=":
                env.Push(new VariableValue(a.Value >= b.Value));
                break;
            case ">":
                env.Push(new VariableValue(a.Value > b.Value));
                break;
            default:
                throw "Unknown operator " + this.Operation;
        }
        env.CodeLine++;
    }
}