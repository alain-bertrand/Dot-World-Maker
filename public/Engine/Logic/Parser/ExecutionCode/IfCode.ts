/// <reference path="ExecutionCode.ts" />

class IfCode implements ExecutionCode
{
    public TrueJump: number;
    public FalseJump: number;

    constructor(trueJump:number,falseJump:number)
    {
        this.TrueJump = trueJump;
        this.FalseJump = falseJump;
    }

    public Execute(env: CodeEnvironement)
    {
        var a = env.Pop();
        if (a.GetBoolean() === true)
            env.CodeLine = this.TrueJump;
        else
            env.CodeLine = this.FalseJump;
    }
}