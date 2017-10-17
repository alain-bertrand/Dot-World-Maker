/// <reference path="ExecutionCode.ts" />

class JumpCode implements ExecutionCode
{
    public JumpLine: number;
    constructor(jumpLine: number)
    {
        this.JumpLine = jumpLine;
    }

    public Execute(env: CodeEnvironement)
    {
        env.CodeLine = this.JumpLine;
    }
}