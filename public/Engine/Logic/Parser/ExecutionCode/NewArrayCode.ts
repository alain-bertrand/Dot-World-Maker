/// <reference path="ExecutionCode.ts" />

class NewArrayCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        env.Push(new VariableValue([]));
        env.CodeLine++;
    }
}