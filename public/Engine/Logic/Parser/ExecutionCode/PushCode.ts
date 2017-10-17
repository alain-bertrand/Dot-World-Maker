/// <reference path="ExecutionCode.ts" />

class PushCode implements ExecutionCode
{
    public Value: VariableValue;
    constructor(value: VariableValue)
    {
        this.Value = value;
    }

    public Execute(env: CodeEnvironement)
    {
        env.Push(new VariableValue(this.Value));
        env.CodeLine++;
    }
}