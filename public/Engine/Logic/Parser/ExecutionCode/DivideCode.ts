/// <reference path="ExecutionCode.ts" />

class DivideCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        var a = env.Pop();
        var b = env.Pop();
        if (a === null || b === null)
            env.Push(new VariableValue(null));
        else
            env.Push(new VariableValue(a.GetNumber() / b.GetNumber()));
        env.CodeLine++;
    }
}