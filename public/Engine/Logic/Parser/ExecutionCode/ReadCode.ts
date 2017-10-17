/// <reference path="ExecutionCode.ts" />

class ReadCode implements ExecutionCode
{
    public Name: string;
    public Index: boolean = false;

    constructor(name: string, index: boolean = false)
    {
        this.Name = name;
        this.Index = index;
    }

    public Execute(env: CodeEnvironement)
    {
        if (this.Index == false)
            env.Push(env.GetVariable(this.Name));
        else
        {
            var idx = env.Pop().GetNumber();
            var v = env.GetVariable(this.Name);
            env.Push(v.Value[idx]);
        }
        env.CodeLine++;
    }
}