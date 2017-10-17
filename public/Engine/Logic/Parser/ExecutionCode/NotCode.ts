/// <reference path="ExecutionCode.ts" />

class NotCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        env.Push(new VariableValue(!(env.Pop().GetBoolean())));
        env.CodeLine++;
    }
}